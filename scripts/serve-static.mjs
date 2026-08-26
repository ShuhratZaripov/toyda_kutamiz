import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = Number(portIndex === -1 ? process.env.PORT ?? 3000 : args[portIndex + 1]);
const root = resolve("out");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};
const safeHeaders = {
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

if (!Number.isInteger(port) || port < 1 || port > 65535 || !existsSync(root)) {
  console.error("Avval `npm run build` buyrug‘ini bajaring va to‘g‘ri port kiriting.");
  process.exit(1);
}

createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? "/", "http://local").pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  const relativePath = pathname.endsWith("/")
    ? `${pathname}index.html`
    : extname(pathname)
      ? pathname
      : `${pathname}/index.html`;
  const filePath = resolve(root, `.${relativePath}`);

  if (!filePath.startsWith(`${root}${sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    const notFoundPath = resolve(root, "404.html");
    response.writeHead(404, {
      ...safeHeaders,
      "Content-Type": "text/html; charset=utf-8",
    });
    if (request.method === "GET" && existsSync(notFoundPath)) {
      createReadStream(notFoundPath).pipe(response);
    } else {
      response.end();
    }
    return;
  }

  response.writeHead(200, {
    ...safeHeaders,
    "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
  });
  if (request.method === "GET") {
    createReadStream(filePath).pipe(response);
  } else {
    response.end();
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static invitation ready at http://127.0.0.1:${port}`);
});
