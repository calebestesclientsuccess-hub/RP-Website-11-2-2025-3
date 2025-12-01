import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { RequestHandler } from "express";
import { sessionPool } from "../db";
import { env, isProduction } from "../config/env";

const PgSessionStore = connectPgSimple(session);
const EIGHT_HOURS_MS = 1000 * 60 * 60 * 8;

let store;
try {
  store = new PgSessionStore({
    pool: sessionPool,
    tableName: "user_sessions",
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 60,
    ttl: Math.floor(EIGHT_HOURS_MS / 1000),
  });
} catch (err) {
  console.error("[session] Failed to initialize PgSessionStore, falling back to MemoryStore:", err);
  store = undefined;
}

export const sessionMiddleware: RequestHandler = session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  name: "revparty.sid",
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: EIGHT_HOURS_MS,
  },
  store: store,
});


