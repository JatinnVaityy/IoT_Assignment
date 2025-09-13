# 📡 IoT Device Management Platform – Assignment 

## 📌 Overview
This project implements a **mini IoT platform simulation** for device telemetry ingestion, decoding, storage, and visualization.  
Devices publish telemetry via **MQTT** which is processed by the backend, saved in **MongoDB**, and streamed to the frontend in **real-time** via **Socket.io**.  
The frontend allows authentication, device listing, and real-time telemetry updates.


## 🛠 Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), MQTT.js, JWT, Socket.io  
- **Frontend:** React + Vite, TailwindCSS, Axios, Socket.io 
- **Realtime:** WebSocket (Socket.io)    
- **Deployment:** Render (backend) + Vercel (frontend)  


## 🌍 Live URLs
- **Backend API:** [https://iot-assignment-qg11.onrender.com](https://iot-assignment-qg11.onrender.com)  
- **Frontend App:** [https://iot-assignment-iota.vercel.app](https://iot-assignment-iota.vercel.app)  


## 🔑 Test Login Credentials
Use the following credentials to log in and explore the system:
- **Username:** `testuser`  
- **Password:** `testuser`  


## 🚀 Features
✅ **Authentication** (JWT)  
✅ **Device APIs**
- `GET /devices` → List all devices with latest reading
- `GET /devices/:id/data` → Fetch last 10 readings  

✅ **MQTT Worker**
- Subscribes to `/application/out/+`
- Decodes **little-endian float payloads**
- Saves telemetry in MongoDB
- Emits real-time updates via Socket.io  

✅ **Frontend**
- Login page  
- Devices list with latest telemetry  
- Modal view for details  
- Real-time updates (no refresh needed)  
- Historical readings (last 10)  


## 🧪 Test Publisher
A **test publisher** is included that generates random telemetry every **5 seconds** and to see readings click on start mqtt test button on top right corner after login:
- Temperature: 20–30 °C  
- Humidity: 40–60 %  
- PM2.5: 5–55 µg/m³  


## ⚙️ Setup Instructions (Local)

### 1️⃣ Clone the repository

git clone https://github.com/JatinnVaityy/IoT_Assignment.git
cd IoT_Assignment

### 2️⃣ Backend Setup

cd backend
npm install

Create .env file:

MONGO_URI=mongodb://localhost:27017/iot
JWT_SECRET=your_jwt_secret
PORT=5000
MQTT_BROKER_URL=mqtt://test.mosquitto.org:1883

Run backend:

node server.js

Backend runs at: http://localhost:5000

### 3️⃣ Frontend Setup

cd frontend

npm install

npm run dev

Frontend runs at: http://localhost:5173



### 📦 Deployment

Backend (Render): https://iot-assignment-qg11.onrender.com

Frontend (Vercel): https://iot-assignment-iota.vercel.app
