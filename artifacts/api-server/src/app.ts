import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your API router goes first
app.use("/api", router);

// Serve static frontend assets in production
if (process.env.NODE_ENV === "production") {
  // Path points to your built dashlink folder: artifacts/dashlink/dist/public
  const frontendPath = path.resolve(__dirname, "../../dashlink/dist/public");
  
  app.use(express.static(frontendPath));

  // Express v5 safe catch-all middleware (bypasses path-to-regexp string syntax entirely)
  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

export default app;
