import postgres from "@prisma/orm-postgres/runtime";

import "temporal-polyfill/global";

import service from "../../service.ts";
import { perRequest } from "../lib/per-request";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

// The one database client for the whole app. When deployed with Prisma
// Composer the service binding provides it; locally it connects with the
// DATABASE_URL from .env. The Next app connects on its first query; standalone
// scripts (like the seed) call connectDatabase() themselves.
function loadComposerDatabase() {
  try {
    return service.load().database.client;
  } catch {
    return undefined;
  }
}

function createDatabase() {
  return (
    loadComposerDatabase() ??
    (process.env.DATABASE_URL
      ? postgres<Contract>({ contractJson, url: process.env.DATABASE_URL, poolOptions: { idleTimeoutMillis: 10_000 } })
      : postgres<Contract>({ contractJson }))
  );
}

type Database = ReturnType<typeof createDatabase>;

// Next bundles this file more than once (pages, server actions, /api routes). perRequest keeps the
// client on globalThis so there is one connection pool per server process instead of one per copy
// (that exhausted the database: "EMAXCONN max client connections reached"), and one client per
// request on Cloudflare, where a pool can't be shared between requests (see lib/per-request.ts).
const currentDatabase = perRequest("database", createDatabase);

export const db: Database = new Proxy({} as Database, {
  get(_target, property) {
    const client = currentDatabase();
    const value: unknown = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

let connection: Promise<void> | undefined;

export function connectDatabase(): Promise<void> {
  connection ??= db.connect().then(() => undefined).catch((error: unknown) => {
    connection = undefined;
    throw error;
  });
  return connection;
}
