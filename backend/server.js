const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');


const http = require("http"); // 1. Import http
const { Server } = require("socket.io");



const cors = require("cors");
require("dotenv").config();

const faceRoutes = require("./routes/faceVerification");
const aiChatRoutes = require("./routes/aiChat"); // ✅ ADD
const adminRoutes = require("./routes/admin");
const socketHandler = require("./socket/socketHandler");
const checkAndNotifyElections = require("./jobs/electionNotifier");
const authRoutes = require("./routes/auth");
const voterRoutes = require("./routes/voter");
const votesRoutes = require("./routes/votes");
const electionRoutes = require("./routes/elections");
const candidateRoutes = require("./routes/candidates"); 
const electionVoterRoutes = require("./routes/electionVoterRoutes");
const profileRoutes = require("./routes/profile");


const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  // Optional: Configure CORS for cross-origin requests from your frontend
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

// ✅ Make io available globally
global.io = io; 

// ✅ Attach socket handler
socketHandler(io);

// ✅ Start background job (every 5 seconds)
setInterval(() => {
  checkAndNotifyElections(); // using global.io
}, 5000);

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/votes", votesRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes); 
app.use("/api/election-voters", electionVoterRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai-chat", aiChatRoutes); // ✅ ADD
app.use("/api/face", faceRoutes);


// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);
// });

server.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});

