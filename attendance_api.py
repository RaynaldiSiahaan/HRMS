# attendance_api.py
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

# In-memory store for demo:
known_encodings = []
known_names = []

# Configure your MySQL connection
connection = pymysql.connect(
    host='localhost', user='root', password='',
    database='hrms', cursorclass=pymysql.cursors.DictCursor
)

class RegisterRequest(BaseModel):
    username: str
    image: str  # base64 PNG/JPEG

class AttendanceRequest(BaseModel):
    image: str

def decode_image(data_uri: str) -> np.ndarray:
    _, data = data_uri.split(",", 1)
    img = Image.open(io.BytesIO(base64.b64decode(data)))
    return np.array(img)

@app.post("/api/register")
def register(req: RegisterRequest):
    # 1) lookup fullName
    with connection.cursor() as cur:
        cur.execute("SELECT fullName FROM account WHERE username=%s", (req.username,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "User not found")
        full_name = row["fullName"]

    # 2) face encoding
    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        raise HTTPException(400, "No face detected")
    encoding = encs[0]
    blob = pickle.dumps(encoding)

    # 3) upsert into face_data
    with connection.cursor() as cur:
        cur.execute("""
            REPLACE INTO face_data (username, fullName, encoding)
            VALUES (%s, %s, %s)
        """, (req.username, full_name, blob))
    connection.commit()

    return {"status": "registered", "username": req.username, "fullName": full_name}


@app.post("/api/attendance")
def mark_attendance(req: AttendanceRequest, request: Request):
    # 1) decode & encode incoming image
    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        raise HTTPException(400, "No face detected")

    face_encoding = encs[0]

    # 2) load all known encodings
    with connection.cursor() as cur:
        cur.execute("SELECT username, fullName, encoding FROM face_data")
        rows = cur.fetchall()

    usernames, encodings = [], []
    for r in rows:
        usernames.append(r["username"])
        encodings.append(pickle.loads(r["encoding"]))

    # 3) find best match
    dists = face_recognition.face_distance(encodings, face_encoding)
    best_idx = np.argmin(dists)
    if dists[best_idx] < 0.6:
        user = usernames[best_idx]
    else:
        raise HTTPException(401, "Unknown face")

    # 4) record attendance
    ip = request.client.host
    now = datetime.utcnow()
    with connection.cursor() as cur:
        cur.execute("""
          INSERT INTO attendance (username, attendance_time, ip_location)
          VALUES (%s, %s, %s)
        """, (user, now, ip))
    connection.commit()

    return {"status": "present", "username": user, "time": now.isoformat(), "ip": ip}

@app.post("/api/register")
def register_face(req: RegisterRequest):
    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        return {"error": "No face detected"}
    # take first face
    known_encodings.append(encs[0])
    known_names.append(req.name)
    # TODO: persist to disk or database here
    return {"status": "registered", "name": req.name}