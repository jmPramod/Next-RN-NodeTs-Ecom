import express from "express";
import cors, { CorsOptions } from "cors";
import swaggerUI from "swagger-ui-express";
import * as swaggerDocument from "../src/config/swagger.json";
import { connectMongooseDB } from "./config/db.connect";
import { clerkMiddleware } from '@clerk/express'
import {serve} from 'inngest/express'
import { fuuncction, inngest } from "./config/inngest";
import { adminRoutes } from "./routes/admin.routes";
import { userRoutes } from "./routes/user.routes";

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins: string[] = [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.CLIENT_BASE_URL as string
    ];
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

const app = express();

const runserver = () => {
  app.use(clerkMiddleware())
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  app.use('/api/inngest',serve({client:inngest,functions:fuuncction}))
  app.use("/api",adminRoutes)
  app.use("/api",userRoutes)
  
  app.get("/health", (_, res) => {
    res.json({ status: "ok" });
  });
  connectMongooseDB()
  
};
runserver()
export { app, runserver };
