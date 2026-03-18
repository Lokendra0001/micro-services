const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 3000;

// CRITICAL FIX: Do not use express.json() or express.urlencoded() in the Gateway!
// If the gateway parses the body, it consumes the incoming data stream.
// As a result, the body becomes empty when forwarded to the Auth or Product services,
// causing 'username', 'email' etc. to be undefined!
// The proxy will natively forward the raw stream directly to the underlying services.

// Proxy all /auth requests to Auth Service (Port 3001)
// We rewrite /auth to / because the auth service doesn't expect the /auth prefix on its routes.
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  }),
);

// Proxy all /products requests to Product Service (Port 3002)
app.use(
  "/products",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: { "^/products": "" },
  }),
);

console.log("HELLO THIS IS FROM MAIN GATEWAY PAGE!");
console.log("HELLO THIS IS FROM MAIN GATEWAY PAGE 2!");

app.listen(PORT, () => {
  console.log(
    `[API Gateway] Main Gateway is running on http://localhost:${PORT}`,
  );
  console.log(
    `[API Gateway] Auth Service is being proxied to http://localhost:3001`,
  );
  console.log(
    `[API Gateway] Product Service is being proxied to http://localhost:3002`,
  );
});
