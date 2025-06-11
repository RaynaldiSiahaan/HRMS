import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const MODEL_URL = '/models/face-api';

export default function FillAttendance() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]); // [{ employeeId, fullName, descriptors }]

  // 1. Load models and known face descriptors
  useEffect(() => {
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      axios.get('http://localhost:3000/api/attendance/descriptors')
    ])
      .then(([, , , res]) => {
        setLabels(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. Start webcam
  useEffect(() => {
    if (!loading) {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then(stream => { videoRef.current.srcObject = stream; })
        .catch(err => console.error(err));
    }
  }, [loading]);

  // 3. On each video frame, detect and match
  useEffect(() => {
    let intervalId;
    if (!loading) {
      const labeledDescriptors = labels.map(l => 
        new faceapi.LabeledFaceDescriptors(
          l.fullName,
          l.descriptors.map(d => new Float32Array(d))
        )
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

      intervalId = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();
        
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const resized = faceapi.resizeResults(detections, dims);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        resized.forEach(fd => {
          const best = faceMatcher.findBestMatch(fd.descriptor);
          const box = fd.detection.box;
          const text = best.label === 'unknown' 
            ? 'Unknown' 
            : best.label;
          // draw
          const drawBox = new faceapi.draw.DrawBox(box, { label: text });
          drawBox.draw(canvasRef.current);

          // if recognized, auto‐submit attendance
          if (best.label !== 'unknown') {
            axios.post('http://localhost:5005/api/attendance', {
              employeeId: labels.find(l => l.fullName === best.label).employeeId
            }).catch(console.error);
          }
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [loading, labels]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Face Recognition Attendance</h2>
      {loading ? <p>Loading models...</p> : (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="720"
            height="560"
            style={{ borderRadius: 8 }}
          />
          <canvas
            ref={canvasRef}
            width="720"
            height="560"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>
      )}
    </div>
  );
}
