import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import "dotenv/config";
import searchRoutes from "./routes/searchRoutes.js";


const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Document RAG Chatbot API is running!"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);