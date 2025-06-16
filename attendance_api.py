from fastapi import FastAPI, Request, HTTPException
import pickle
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import base64
import io
from PIL import Image
import numpy as np
import pymysql.cursors
from datetime import datetime

app = FastAPI()

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

class RegisterRequest(BaseModel):
    username: str
    image: str  # base64 image

class AttendanceRequest(BaseModel):
    image: str
    action: str  # "clock_in" or "clock_out"

def decode_image(data_uri: str) -> np.ndarray:
    _, data = data_uri.split(",", 1)
    img = Image.open(io.BytesIO(base64.b64decode(data)))
    return np.array(img)

@app.post("/api/register")
def register(req: RegisterRequest):
    with connection.cursor() as cur:
        cur.execute("SELECT fullName FROM account WHERE username=%s", (req.username,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "User not found")
        full_name = row["fullName"]

    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        raise HTTPException(400, "No face detected")

    encoding = encs[0]
    blob = pickle.dumps(encoding)

    with connection.cursor() as cur:
        cur.execute("""
            REPLACE INTO face_data (username, fullName, encoding)
            VALUES (%s, %s, %s)
        """, (req.username, full_name, blob))
    connection.commit()

    return {"status": "registered", "username": req.username, "fullName": full_name}

@app.post("/api/attendance")
def mark_attendance(req: AttendanceRequest, request: Request):
    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        raise HTTPException(400, "No face detected")

    face_encoding = encs[0]

    with connection.cursor() as cur:
        cur.execute("SELECT username, encoding FROM face_data")
        rows = cur.fetchall()

    usernames, encodings = [], []
    for r in rows:
        usernames.append(r["username"])
        encodings.append(pickle.loads(r["encoding"]))

    dists = face_recognition.face_distance(encodings, face_encoding)
    best_idx = np.argmin(dists)
    if dists[best_idx] >= 0.6:
        raise HTTPException(401, "Unknown face")

    user = usernames[best_idx]
    now = datetime.utcnow()
    ip = request.client.host

    with connection.cursor() as cur:
        if req.action == 'clock_in':
            # Insert attendance row
            cur.execute("""
                INSERT INTO attendance (username, clocked_in_time, ip_location)
                VALUES (%s, %s, %s)
            """, (user, now, ip))

            # ✅ Ensure the user exists in employeeperf table
            cur.execute("SELECT 1 FROM employeeperf WHERE username = %s", (user,))
            if not cur.fetchone():
                cur.execute("""
                    INSERT INTO employeeperf (username, fullName, Attendance, WorkCompletion, LateCompletion, satisfaction_score)
                    SELECT username, fullName, 0, 0.0, 0, 0.0 FROM account WHERE username = %s
                """, (user,))

            # ✅ Then increment attendance
            cur.execute("""
                UPDATE employeeperf
                SET Attendance = Attendance + 1
                WHERE username = %s
            """, (user,))

            connection.commit()
            return {"status": "clocked_in", "username": user, "time": now.isoformat(), "ip": ip}

        elif req.action == 'clock_out':
            cur.execute("""
                UPDATE attendance
                SET clocked_out_time = %s
                WHERE username = %s AND clocked_out_time IS NULL
                ORDER BY clocked_in_time DESC
                LIMIT 1
            """, (now, user))

            connection.commit()
            if cur.rowcount == 0:
                raise HTTPException(404, "No matching clock-in found to clock out")

            return {"status": "clocked_out", "username": user, "time": now.isoformat(), "ip": ip}

        else:
            raise HTTPException(400, "Invalid action. Use 'clock_in' or 'clock_out'")