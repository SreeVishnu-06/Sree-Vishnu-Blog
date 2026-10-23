import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const base = "/Sree-Vishnu-Blog";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
export function serveSite(directory = "dist", port = 4173) {
  const root = path.resolve(directory);
  return http
    .createServer(async (request, response) => {
      try {
        const url = new URL(request.url, "http://localhost");
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === base) {
          response.writeHead(308, { Location: `${base}/${url.search}` }).end();
          return;
        }
        if (pathname.startsWith(base + "/"))
          pathname = pathname.slice(base.length);
        let file = path.resolve(root, "." + pathname);
        if (file !== root && !file.startsWith(root + path.sep)) {
          response.writeHead(403).end();
          return;
        }
        if ((await stat(file)).isDirectory()) {
          if (!url.pathname.endsWith("/")) {
            response
              .writeHead(308, { Location: `${url.pathname}/${url.search}` })
              .end();
            return;
          }
          file = path.join(file, "index.html");
        }
        const data = await readFile(file);
        response.writeHead(200, {
          "Content-Type":
            mime[path.extname(file)] || "application/octet-stream",
          "X-Content-Type-Options": "nosniff",
        });
        response.end(data);
      } catch {
        response.writeHead(404).end("Not found");
      }
    })
    .listen(port, "127.0.0.1");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const server = serveSite(
    process.argv[2] || ".",
    Number(process.env.PORT || 4173),
  );
  server.on("listening", () =>
    console.log(`Portfolio: http://127.0.0.1:${server.address().port}${base}/`),
  );
}
