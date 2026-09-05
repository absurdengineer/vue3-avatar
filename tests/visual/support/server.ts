import path from "node:path";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * Serves the source tree to the browser so visual tests run against `src/`
 * directly — no build step between editing a component and seeing the pixels
 * change. Vite handles the SFC and TypeScript compilation.
 */
let server: ViteDevServer | null = null;

export async function startHarnessServer(): Promise<string> {
  if (server) return baseUrl(server);

  server = await createServer({
    root: process.cwd(),
    configFile: false,
    plugins: [vue()],
    resolve: {
      alias: { "@": path.resolve(process.cwd(), "./src") },
    },
    server: { port: 0, host: "127.0.0.1" },
    optimizeDeps: { include: ["vue"] },
    logLevel: "error",
  });

  await server.listen();
  return baseUrl(server);
}

export async function stopHarnessServer(): Promise<void> {
  if (!server) return;
  await server.close();
  server = null;
}

function baseUrl(instance: ViteDevServer): string {
  const address = instance.httpServer?.address();
  if (!address || typeof address === "string")
    throw new Error("Harness server did not bind to a port.");
  return `http://127.0.0.1:${address.port}`;
}
