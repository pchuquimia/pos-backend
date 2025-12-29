const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Render usa process.env.PORT; en local puedes caer a config.port o 8000
const PORT = process.env.PORT || config.port || 8000;

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://pos-frontend-bajm.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requests sin Origin (Postman, curl, health checks)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares
app.use(cors(corsOptions));

// ✅ NO uses app.options("*" | "/*") en tu stack: rompe path-to-regexp.
// Si quieres, puedes dejar un handler genérico de OPTIONS sin rutas:
// (No suele ser necesario si cors() está arriba, pero ayuda en algunos casos.)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Root Endpoint
app.get("/", (req, res) => {
  res.json({ message: "Hello from POS Server!" });
});

// Routes
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));
app.use("/api/menu", require("./routes/menuRoute"));

// Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`☑️ POS Server is listening on port ${PORT}`);
});
