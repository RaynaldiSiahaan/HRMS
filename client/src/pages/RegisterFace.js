import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function RegisterFace() {
  const webcamRef = useRef(null);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState(null);

  const handleRegister = async () => {
    const imageSrc = webcamRef.current.getScreenshot(); 
    const username = localStorage.getItem("username");
        if (!username) {
      setMsg('❌ No username found. Please log in.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8000/api/register', {
        username,
        image: imageSrc
      });
      setMsg(res.data.error || `✅ Registered ${res.data.name}`);
    } catch (err) {
  // 1) try your custom `error` field
  if (err.response?.data?.error) {
    setMsg(`❌ ${err.response.data.error}`);
  }
  // 2) if Pydantic sent a `detail` array, join the .msg entries
  else if (Array.isArray(err.response?.data?.detail)) {
    const messages = err.response.data.detail.map(e => e.msg).join(', ');
    setMsg(`❌ ${messages}`);
  }
  // 3) otherwise fallback to the raw detail or generic text
  else {
    const raw = err.response?.data?.detail || err.message;
    setMsg(`❌ ${typeof raw === 'string' ? raw : JSON.stringify(raw)}`);
  }

  console.error('Register error →', err.response || err);
    }
  };

    return (
    <div style={{ padding: 20 }}>
      <h2>Register Your Face</h2>

      {/* no more username input */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
      /><br/>

      <button onClick={handleRegister}>Register Face</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
