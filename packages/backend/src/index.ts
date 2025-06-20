import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import { connectDatabase } from "./utils/database";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "Daon API Server", version: "1.0.0" });
});

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  await connectDatabase();
});

export default app;
