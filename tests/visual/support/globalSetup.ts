import { chromium } from "playwright";
import type { BrowserServer } from "playwright";
import { startHarnessServer, stopHarnessServer } from "./server";

/**
 * One browser server and one Vite server for the whole visual run. Test files
 * connect to the browser over its websocket endpoint rather than launching
 * their own — starting Chromium per file would dominate the runtime.
 */
let browserServer: BrowserServer | null = null;

export async function setup({
  provide,
}: {
  provide: (key: string, value: unknown) => void;
}) {
  const baseUrl = await startHarnessServer();

  browserServer = await chromium.launchServer({
    // VISUAL_HEADED=1 opens a real window, which is the fastest way to see why
    // a capture looks wrong. Captures taken headed are not byte-identical to
    // headless ones, so never re-record goldens in this mode.
    headless: process.env.VISUAL_HEADED !== "1",
    args: [
      // Pin rendering so screenshots are reproducible across machines with
      // different GPUs — software rasterisation is slower but deterministic.
      "--disable-lcd-text",
      "--force-color-profile=srgb",
      "--disable-gpu",
      "--hide-scrollbars",
      "--font-render-hinting=none",
    ],
  });

  provide("harnessBaseUrl", baseUrl);
  provide("browserWSEndpoint", browserServer.wsEndpoint());

  return async () => {
    await browserServer?.close();
    browserServer = null;
    await stopHarnessServer();
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    harnessBaseUrl: string;
    browserWSEndpoint: string;
  }
}
