import http from "node:http";
import crypto from "node:crypto";

const AUTH_PORT = Number(process.env.AUTH_PORT ?? "8090");
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME ?? "";
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD ?? "";
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "incus_ui_auth";
const AUTH_COOKIE_VALUE = process.env.AUTH_COOKIE_VALUE ?? "";

const json = (res, status, payload, headers = {}) => {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(payload));
};

const parseBody = async (req) => {
  return await new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
      if (body.length > 8192) {
        reject(new Error("Request entity too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
};

const safeEquals = (a, b) => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
};

if (!BASIC_AUTH_USERNAME || !BASIC_AUTH_PASSWORD || !AUTH_COOKIE_VALUE) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing required env for auth server: BASIC_AUTH_USERNAME/BASIC_AUTH_PASSWORD/AUTH_COOKIE_VALUE",
  );
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const method = req.method ?? "";
  const url = req.url ?? "";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    res.end();
    return;
  }

  if (method === "GET" && url === "/auth/health") {
    json(res, 200, { ok: true });
    return;
  }

  if (method === "GET" && url.startsWith("/1.0")) {
    json(res, 200, {
      type: "sync",
      status: "Success",
      status_code: 200,
      metadata: {
        auth: "untrusted",
        auth_methods: ["tls"],
      },
    });
    return;
  }

  if (method === "GET" && url.startsWith("/os/1.0")) {
    json(res, 200, {
      type: "sync",
      status: "Success",
      status_code: 200,
      error_code: 1,
      metadata: null,
    });
    return;
  }

  if (method === "POST" && url === "/auth/login") {
    try {
      const raw = await parseBody(req);
      const body = JSON.parse(raw || "{}");
      const username = String(body.username ?? "");
      const password = String(body.password ?? "");

      const usernameOk = safeEquals(username, BASIC_AUTH_USERNAME);
      const passwordOk = safeEquals(password, BASIC_AUTH_PASSWORD);

      if (!usernameOk || !passwordOk) {
        json(res, 401, { ok: false, message: "Invalid username or password" });
        return;
      }

      json(
        res,
        200,
        { ok: true },
        {
          "set-cookie": `${AUTH_COOKIE_NAME}=${AUTH_COOKIE_VALUE}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,
        },
      );
      return;
    } catch (_error) {
      json(res, 400, { ok: false, message: "Invalid request payload" });
      return;
    }
  }

  if (method === "POST" && url === "/auth/logout") {
    json(
      res,
      200,
      { ok: true },
      {
        "set-cookie": `${AUTH_COOKIE_NAME}=deleted; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      },
    );
    return;
  }

  json(res, 404, { ok: false, message: "Not found" });
});

server.listen(AUTH_PORT, "127.0.0.1");
