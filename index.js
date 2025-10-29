const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth"); // Import auth middleware
const telegramBot = require("./config/telegramBot"); // Import telegramBot
// const { connectDB } = require("./config/database");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "https://0.0.0.0:$1",
        methods: ["GET", "POST"],
    },
});


// Connect to Database
const { connectDB } = require("./config/database");
connectDB();

// Middleware
app.use(
    cors({
        origin: [
            "https://paper-dashboard-react.onrender.com",
            "http://localhost:3000",
        ], // Allows all origins
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// health check
app.get("/health", (req, res) => {
    res.status(200).send({ message: "OK" });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// API Documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Course Manager API Documentation",
    }),
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", auth, require("./routes/courses")); // Protect with auth middleware
app.use("/api/scraper", auth, require("./routes/scraper")); // Protect with auth middleware
app.use("/api/telegram", require("./routes/telegram")); // Add Telegram bot routes
app.use("/api/dashboard", auth, require("./routes/dashboard")); // Add Dashboard routes, protected by auth middleware
app.use("/api/user", auth, require("./routes/user")); // Add User routes, protected by auth middleware
app.use("/api/schedule", auth, require("./routes/schedule")); // Add Schedule routes, protected by auth middleware
app.use("/api/integrations", auth, require("./routes/integrations")); // Add Integrations routes, protected by auth middleware
app.use("/api/assistant", auth, require("./routes/assistant")); // Add Assistant routes, protected by auth middleware

// WebSocket connection
io.on("connection", (socket) => {
    // // // console.log('New client connected');

    socket.on("disconnect", () => {
        // // // console.log('Client disconnected');
    });

    // Handle course updates
    socket.on("courseUpdate", (data) => {
        io.emit("courseUpdated", data);
    });
});

// Start Telegram Bot
telegramBot.launch(()=>(console.info(`Bot:${telegramBot.botInfo.id} started!`)));

telegramBot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot and see the main menu' },
  { command: 'help', description: 'Get help with using the bot' },
  { command: 'register', description: 'Start the registration process to get service access' },
  { command: 'dashboard', description: 'Access your personalized dashboard' },
  { command: 'get_token', description: 'Get your access token if registered and approved' },
]);

// Enable graceful stop
process.once("SIGINT", () => telegramBot.stop("SIGINT"));
process.once("SIGTERM", () => telegramBot.stop("SIGTERM"));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    // // // console.log(`Server running on port ${PORT}`);
    // // // console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default { ...app, ...server, ...io, ...telegramBot };