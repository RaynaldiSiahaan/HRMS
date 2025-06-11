import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import axios from 'axios'

export default function Attendance() {
  const webcamRef = useRef(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [box, setBox]         = useState(null)
  const [msg, setMsg]         = useState(null)

  const captureAndSend = async () => {
    const src = webcamRef.current.getScreenshot()
    setImageSrc(src)
    try {
      const { data } = await axios.post('http://localhost:8000/api/attendance', { image: src })
      setMsg(`${data.username} is ${data.status}`)
      setBox(data.box)
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error')
      setBox(null)
    }
  }

  return (
    <div>
      <div style={{ position: 'relative', width: 320, height: 240 }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={320}
          height={240}
        />
        {imageSrc && box && (
          <img
            src={imageSrc}
            alt="snapshot"
            style={{ position: 'absolute', top: 0, left: 0 }}
            width={320}
            height={240}
          />
        )}
        {box && (
          <div
            style={{
              position: 'absolute',
              top:      box.top,
              left:     box.left,
              width:    box.right - box.left,
              height:   box.bottom - box.top,
              border:  '2px solid red',
              boxSizing: 'border-box'
            }}
          />
        )}
      </div>

      <button onClick={captureAndSend}>Mark Attendance</button>
      {msg && <p>{msg}</p>}
    </div>
  )
}
