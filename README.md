frontend + backend setup 👇

🗳️ Secure Digital Voting System
A full-stack web application for secure online voting with face verification, authentication, and real-time updates.

🚀 Tech Stack
🎨 Frontend (Next.js)


Next.js 14


React 18


Bootstrap & Bootstrap Icons


Axios


Framer Motion


Face API.js (Face Recognition)


React Webcam


Socket.io Client


SweetAlert2


XLSX (Excel export)



⚙️ Backend (Node.js)


Node.js + Express.js


MySQL (mysql2)


JWT Authentication


Google OAuth


Socket.io (Real-time communication)


Multer (File Upload)


OpenAI API (AI Chat Feature)



📂 Project Structure
project-root/│├── frontend/              # Next.js App│   ├── public/│   ├── src/│   ├── package.json│├── backend/               # Express Server│   ├── routes/│   ├── controllers/│   ├── services/│   ├── server.js│   ├── package.json│└── README.md

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/secure-voting-system.gitcd secure-voting-system

🖥️ Frontend Setup
cd frontendnpm install
▶️ Run Frontend
npm run dev
App will run on:
http://localhost:3000

🔙 Backend Setup
cd backendnpm install

🔐 Create .env File in Backend
PORT=5000# DatabaseDB_HOST=localhostDB_USER=rootDB_PASSWORD=your_passwordDB_NAME=voting_system# AuthJWT_SECRET=your_secret_keyGOOGLE_CLIENT_ID=your_google_client_id# OpenAIOPENAI_API_KEY=your_openai_api_key

▶️ Run Backend
npx nodemon server.js
OR (if script added):
npm run dev
Backend runs on:
http://localhost:5000

🗄️ Database Setup (MySQL)


Open MySQL


Create database:


CREATE DATABASE voting_system;


Create required tables (example):


CREATE TABLE users (  id INT AUTO_INCREMENT PRIMARY KEY,  name VARCHAR(100),  email VARCHAR(100),  password VARCHAR(255),  face_data LONGTEXT);CREATE TABLE votes (  id INT AUTO_INCREMENT PRIMARY KEY,  user_id INT,  candidate VARCHAR(100),  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

🔥 Key Features


🔐 JWT Authentication & Google Login


👤 Face Verification (face-api.js)


🗳️ Secure Voting Mechanism


⚡ Real-time updates using Socket.io


🤖 AI Chat Integration (OpenAI)


📁 File Upload with Multer


🎉 Interactive UI (animations, alerts, confetti)



🔄 Face Verification Flow


User opens webcam


Face is captured using react-webcam


Compared with stored face data using face-api.js


If matched → Voting allowed



🔌 API Endpoints (Sample)
MethodEndpointDescriptionPOST/api/auth/loginLogin userPOST/api/auth/googleGoogle loginPOST/api/face-verifyVerify facePOST/api/voteSubmit voteGET/api/resultsGet voting results

🛠️ Available Scripts
Frontend
npm run dev     # Start developmentnpm run build   # Build productionnpm start       # Start production servernpm run lint    # Run ESLint

Backend
npx nodemon server.js   # Development

⚠️ Common Errors & Fixes
❌ Module not found (image issue)
✔ Fix:
import img from "/sampleImg.jpg";

❌ CORS Error
✔ Fix in backend:
app.use(cors());

❌ Face API Models Not Loading
✔ Ensure models are inside:
/public/models

❌ Database Connection Error


Check .env


Ensure MySQL is running



🚀 Future Enhancements


🔗 Blockchain-based voting system


📊 Admin dashboard with analytics


🔐 Multi-factor authentication


☁️ Cloud deployment (AWS / Vercel / Railway)



🤝 Contributing
git checkout -b feature-namegit commit -m "Added new feature"git push origin feature-name

📜 License
MIT License

👨‍💻 Author
Vicky Gupta
Full Stack Developer
