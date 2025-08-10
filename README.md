# 📱 WhatsApp Web Clone

A **full-stack WhatsApp Web clone** built with **Node.js**, **Express**, **MongoDB**, and **React**.  
Includes real-time messaging via **Socket.IO** and a responsive UI similar to WhatsApp Web.  
Designed for learning purposes and demonstrating scalable architecture.

---

## 📸 Screenshots

![Screenshot 1](https://github.com/mrityu12/WhatsApp-Web/blob/main/Screenshot%202025-08-10%20135408.png?raw=true)
![Screenshot 2](https://github.com/mrityu12/WhatsApp-Web/blob/main/Screenshot%202025-08-10%20135419.png?raw=true)

---

## 📂 Project Structure

whatsapp-web-clone/
├── backend/
│ ├── src/
│ │ ├── config/ # Database & WebSocket config
│ │ ├── models/ # Mongoose models
│ │ ├── routes/ # Express routes
│ │ ├── controllers/ # Controller logic
│ │ ├── middleware/ # Middleware (e.g. CORS)
│ │ ├── utils/ # Helper functions
│ │ └── app.js
│ ├── sample-payloads/ # Sample webhook payloads
│ ├── scripts/ # Utility scripts
│ ├── package.json
│ ├── .env
│ └── server.js
├── frontend/
│ ├── public/ # Static assets
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── hooks/ # Custom hooks
│ │ ├── services/ # API services
│ │ ├── styles/ # CSS/Tailwind styles
│ │ ├── utils/ # Utility functions
│ │ ├── App.jsx
│ │ └── index.js
│ ├── package.json
│ └── .env
├── .gitignore
├── README.md
└── docker-compose.yml

yaml
Copy
Edit

---

## 🚀 Features

- **Real-time messaging** via Socket.IO
- Backend REST API with **Express**
- MongoDB database for message storage
- Webhooks handling for external integrations
- Responsive UI styled with **Tailwind CSS**
- Modular frontend with **React**
- Docker-ready setup for deployment

---

## 🛠️ Tech Stack

**Frontend**  
- React  
- Tailwind CSS  
- Axios  
- React Router DOM  

**Backend**  
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Socket.IO  
- JWT Authentication  

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/mrityu12/WhatsApp-Web.git
cd WhatsApp-Web
2️⃣ Backend Setup
bash
Copy
Edit
cd backend
npm install
cp .env.example .env   # Set environment variables
npm run dev
3️⃣ Frontend Setup
bash
Copy
Edit
cd ../frontend
npm install
cp .env.example .env   # Set API URLs
npm start 2️⃣ Backend Setup
bash
Copy
Edit
cd backend
npm install
cp .env.example .env   # Set environment variables
npm run dev
3️⃣ Frontend Setup
bash
Copy
Edit
cd ../frontend
npm install
cp .env.example .env   # Set API URLs
npm start
🌐 Environment Variables
Backend (backend/.env)

env
Copy
Edit
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
Frontend (frontend/.env)

env
Copy
Edit
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
🐳 Docker Setup (Optional)
bash
Copy
Edit
docker-compose up --build
🧪 Testing
Test Backend API
bash
Copy
Edit
curl -X GET http://localhost:5000/api/messages
Run Frontend Tests
bash
Copy
Edit
cd frontend
npm test
💻 Development Workflow
Start Backend

bash
Copy
Edit
cd backend
npm run dev
Start Frontend

bash
Copy
Edit
cd frontend
npm start
Process Webhook Payloads

bash
Copy
Edit
cd backend
npm run process-webhooks
Build for Production

bash
Copy
Edit
cd frontend
npm run build
cd ../backend
npm start
📦 Deployment
Frontend → Vercel, Netlify
Backend → Heroku, Render, Railway
Docker → Any cloud provider with container support

📝 License
MIT License – feel free to use and modify for learning purposes.
💖 Made by Mrityunjay Kumar
