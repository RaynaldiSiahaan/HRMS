from fastapi import FastAPI, Request, HTTPException, Query, Body
import pickle
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import base64
import io
from PIL import Image
import numpy as np
import pymysql.cursors
import pandas as pd
import joblib
from datetime import datetime
from transformers import BertForSequenceClassification, BertTokenizerFast
import torch


app = FastAPI()

# Allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL connection
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='hrms',
    cursorclass=pymysql.cursors.DictCursor
)

class MatchCVRequest(BaseModel):
    position: str
    min_age: int
    max_age: int
    gender: str
    education: str
    
# Pydantic models for incoming requests
class RegisterRequest(BaseModel):
    username: str
    image: str  # base64 image

class AttendanceRequest(BaseModel):
    username: str
    image: str
    action: str  # "clock_in" or "clock_out"

# Helper to decode base64 image
def decode_image(data_uri: str) -> np.ndarray:
    _, data = data_uri.split(",", 1)
    img = Image.open(io.BytesIO(base64.b64decode(data)))
    return np.array(img)

@app.post("/api/register")
def register(req: RegisterRequest):
    # Check if username exists and retrieve full name
    with connection.cursor() as cur:
        cur.execute("SELECT fullName FROM account WHERE username=%s", (req.username,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found in account table")
        full_name = row["fullName"]

    # Decode and process image
    img_array = decode_image(req.image)
    face_encodings = face_recognition.face_encodings(img_array)
    if not face_encodings:
        raise HTTPException(status_code=400, detail="No face detected in image")

    face_encoding = face_encodings[0]
    encoded_blob = pickle.dumps(face_encoding)

    # Store in face_data
    with connection.cursor() as cur:
        cur.execute("""
            REPLACE INTO face_data (username, fullName, encoding)
            VALUES (%s, %s, %s)
        """, (req.username, full_name, encoded_blob))
    connection.commit()

    return {
        "status": "registered",
        "username": req.username,
        "fullName": full_name,
        "message": f"Face registered successfully for user '{req.username}'"
    }
    
@app.post("/api/attendance")
def mark_attendance(req: AttendanceRequest, request: Request):
    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        raise HTTPException(400, "No face detected")

    face_encoding = encs[0]

    # Only load the face encoding for this username
    with connection.cursor() as cur:
        cur.execute("SELECT encoding FROM face_data WHERE username = %s", (req.username,))
        row = cur.fetchone()

    if not row:
        raise HTTPException(404, "Face data not found for this username")

    stored_encoding = pickle.loads(row["encoding"])

    # Compare input face with user's stored face
    dist = face_recognition.face_distance([stored_encoding], face_encoding)[0]
    if dist >= 0.6:
        raise HTTPException(401, "Face does not match for user")

    username = req.username
    now = datetime.utcnow()
    ip = request.client.host

    # Get user role and full name from account table
    with connection.cursor() as cur:
        cur.execute("SELECT role, fullName FROM account WHERE username = %s", (username,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "User account not found")
        role = row["role"]
        full_name = row["fullName"]

        if req.action == 'clock_in':
            # Insert clock-in record
            cur.execute("""
                INSERT INTO attendance (username, clocked_in_time, ip_location)
                VALUES (%s, %s, %s)
            """, (username, now, ip))

            # Ensure the user exists in the performance table
            cur.execute("SELECT 1 FROM employeeperf WHERE username = %s", (username,))
            if not cur.fetchone():
                cur.execute("""
                    INSERT INTO employeeperf (username, fullName, Attendance, WorkCompletion, LateCompletion, satisfaction_score)
                    VALUES (%s, %s, 0, 0.0, 0, 0.0)
                """, (username, full_name))

            # Update attendance count
            cur.execute("""
                UPDATE employeeperf
                SET Attendance = Attendance + 1
                WHERE username = %s
            """, (username,))

            connection.commit()

            return {
                "status": "clocked_in",
                "username": username,
                "role": role,
                "message": f"{role} clocked in successfully at {now.isoformat()}",
                "time": now.isoformat(),
                "ip": ip
            }

        elif req.action == 'clock_out':
            cur.execute("""
                UPDATE attendance
                SET clocked_out_time = %s
                WHERE username = %s AND clocked_out_time IS NULL
                ORDER BY clocked_in_time DESC
                LIMIT 1
            """, (now, username))

            connection.commit()
            if cur.rowcount == 0:
                raise HTTPException(404, "No matching clock-in found to clock out")

            return {
                "status": "clocked_out",
                "username": username,
                "role": role,
                "message": f"{role} clocked out successfully at {now.isoformat()}",
                "time": now.isoformat(),
                "ip": ip
            }

        else:
            raise HTTPException(400, "Invalid action. Use 'clock_in' or 'clock_out'")

        

@app.get("/api/employee/performance")
def predict_promotions(days: int = Query(7)):
    try:
        model_path = f"./models/lgbm_model_{days}days.joblib"
        encoder_path = f"./models/label_encoder_{days}days.joblib"

        model = joblib.load(model_path)
        encoder = joblib.load(encoder_path)

        with connection.cursor() as cur:
            cur.execute("SELECT username, fullName, Attendance, WorkCompletion, LateCompletion, satisfaction_score FROM employeeperf")
            rows = cur.fetchall()

        df = pd.DataFrame(rows)
        if df.empty:
            return []

        # 🛠 Fix dtypes
        df['Attendance'] = pd.to_numeric(df['Attendance'], errors='coerce')
        df['WorkCompletion'] = pd.to_numeric(df['WorkCompletion'], errors='coerce')
        df['LateCompletion'] = pd.to_numeric(df['LateCompletion'], errors='coerce')
        df['satisfaction_score'] = pd.to_numeric(df['satisfaction_score'], errors='coerce')

        df = df.dropna(subset=['Attendance', 'WorkCompletion', 'LateCompletion', 'satisfaction_score'])

        X = df[['Attendance', 'WorkCompletion', 'LateCompletion', 'satisfaction_score']]
        predictions = model.predict(X)
        labels = encoder.inverse_transform(predictions)

        df['recommendation'] = labels

        return df.to_dict(orient="records")

    except Exception as e:
        import traceback
        print("❌ Error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

def infer_education_level(text):
    if not isinstance(text, str):
        return None

    text = text.lower()

    if any(k in text for k in ["phd", "doctor", "doctoral", "dr.", "d.phil", "ed.d", "sc.d"]):
        return "Doctoral"
    elif any(k in text for k in ["master", "m.sc", "msc", "mba", "magister"]):
        return "Master"
    elif any(k in text for k in ["bachelor", "b.sc", "bsc", "undergraduate"]):
        return "Bachelor"
    elif any(k in text for k in ["high school", "secondary school", "gcse", "sma"]):
        return "HighSchool"
    return None

@app.post("/api/match-cvs")
def match_cvs(req: MatchCVRequest
):
    position = req.position
    min_age = req.min_age
    max_age = req.max_age
    gender = req.gender
    education = req.education

    # Load models and encoders
    job_model = BertForSequenceClassification.from_pretrained(
    "job_classifier_bert",)


    tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased")

    with open("label_encoder.pkl", "rb") as f:
        job_encoder = pickle.load(f)


    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    job_model.to(device).eval()

    def predict(model, text, encoder):
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        with torch.no_grad():
            logits = model(**inputs).logits
            pred = logits.argmax(-1).item()
        return encoder.inverse_transform([pred])[0]

    def calculate_age(birth_date):
        birth = datetime.strptime(str(birth_date), "%Y-%m-%d")
        today = datetime.today()
        return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))

    with connection.cursor() as cur:
        cur.execute("SELECT * FROM cv")
        rows = cur.fetchall()

    matches = []
    for row in rows:
        if not row["birth_date"]:
            continue

        age = calculate_age(row["birth_date"])
        if not (min_age <= age <= max_age):
            continue
        if row["gender"].lower() != gender.lower():
            continue

        # Build CV text
        full_text = " ".join([
            row.get("work_experience_file", ""),
            row.get("school_experience_file", ""),
            row.get("org_experience_file", ""),
            row.get("profile_description_file", ""),
            row.get("other_experience_file", "")
        ])

        predicted_job = predict(job_model, full_text, job_encoder)
        predicted_edu = infer_education_level(row.get("school_experience_file", ""))


        if predicted_job == position and predicted_edu == education:
            matches.append({
                "full_name": row["full_name"],
                "gender": row["gender"],
                "birth_date": row["birth_date"],
                "predicted_job": predicted_job,
                "predicted_education": predicted_edu
            })

    return matches[:10]
