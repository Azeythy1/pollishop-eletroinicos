import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic, setupVite } from "../server/_core/vite";

async function createApp() {
  const app = express();
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // In serverless (Vercel), always serve built static assets.
  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  return app;
}

let appPromise: Promise<express.Express> | null = null;

export default async function handler(req: express.Request, res: express.Response) {
  if (!appPromise) {
    appPromise = createApp();
  }
  const app = await appPromise;
  return app(req, res);
}

if (!process.env.VERCEL) {
  createApp()
    .then(app => {
      const port = parseInt(process.env.PORT || "3000");
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}/`);
      });
    })
    .catch(console.error);
}
