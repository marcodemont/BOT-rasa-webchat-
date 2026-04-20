import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import aurumApp from "./aurum-api.tsx";
import argentumApp from "./argentum-api.tsx";
import chatApp from "./chat-api.tsx";
import authApp from "./auth-api.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e27c6bd5/health", (c) => {
  return c.json({ status: "ok" });
});

// Mount Auth API routes (IP-based email storage)
app.route("/make-server-e27c6bd5/auth", authApp);

// Mount AURUM API routes
app.route("/make-server-e27c6bd5/aurum", aurumApp);

// Mount ARGENTUM API routes
app.route("/make-server-e27c6bd5/argentum", argentumApp);

// Mount Chat API routes (LYNA, JOI, AURA)
app.route("/make-server-e27c6bd5/chat", chatApp);

Deno.serve(app.fetch);