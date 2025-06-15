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

# Configure MySQL connection
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='hrms',
    cursorclass=pymysql.cursors.DictCursor
)

class RegisterRequest(BaseModel):
    username: str
    image: str  # data URI base64

class AttendanceRequest(BaseModel):
    image: str  # data URI base64


def decode_image(data_uri: str) -> np.ndarray:
    # Supports both full data URI or raw base64 string
    if "," in data_uri:
        _, data = data_uri.split(",", 1)
    else:
        data = data_uri
    img = Image.open(io.BytesIO(base64.b64decode(data)))
    return np.array(img)

@app.post("/api/register")
def register(req: RegisterRequest):
    # 1) Lookup fullName
    with connection.cursor() as cur:
        cur.execute("SELECT fullName FROM account WHERE username=%s", (req.username,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        full_name = row["fullName"]

    # 2) Face encoding
    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        raise HTTPException(status_code=400, detail="No face detected")
    encoding = encs[0]
    blob = pickle.dumps(encoding)

    # 3) Upsert into face_data
    with connection.cursor() as cur:
        cur.execute(
            """
            REPLACE INTO face_data (username, fullName, encoding)
            VALUES (%s, %s, %s)
            """, (req.username, full_name, blob)
        )
    connection.commit()

    return {"status": "registered", "username": req.username, "fullName": full_name}

@app.post("/api/attendance")
def mark_attendance(req: AttendanceRequest, request: Request):
    # 1) Decode & encode incoming image
    img = decode_image(req.image)
    encs = face_recognition.face_encodings(img)
    if not encs:
        raise HTTPException(status_code=400, detail="No face detected")
    face_encoding = encs[0]

    # 2) Load known encodings from DB
    with connection.cursor() as cur:
        cur.execute("SELECT username, encoding FROM face_data")
        rows = cur.fetchall()

    usernames = [r["username"] for r in rows]
    encodings = [pickle.loads(r["encoding"]) for r in rows]

    # 3) Find best match
    dists = face_recognition.face_distance(encodings, face_encoding)
    best_idx = np.argmin(dists)
    if dists[best_idx] < 0.6:
        user = usernames[best_idx]
    else:
        raise HTTPException(status_code=401, detail="Unknown face")

    # 4) Record attendance
    ip = request.client.host
    now = datetime.utcnow()
    with connection.cursor() as cur:
        cur.execute(
            "INSERT INTO attendance (username, attendance_time, ip_location) VALUES (%s, %s, %s)",
            (user, now, ip)
        )
    connection.commit()

    return {"status": "present", "username": user, "time": now.isoformat(), "ip": ip}
