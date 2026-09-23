import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import Avatar from "../../src/components/Avatar.vue";
import { VisualContext } from "./support/visual";

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#2563eb"/></svg>';

describe("Browser: image loading", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  it("loads a fallback after the primary srcset fails", async () => {
    await visual.page.route("**/__image-loading__/*", (route) =>
      route.fulfill(
        route.request().url().endsWith("/fallback.svg")
          ? { contentType: "image/svg+xml", body: SVG }
          : { status: 404, body: "Missing image" }
      )
    );

    await visual.page.evaluate(() =>
      window.__mount({
        props: {
          name: "Ada Lovelace",
          imageSrc: "/__image-loading__/primary.svg",
          srcset: "/__image-loading__/missing.svg 1x",
          fallbackSrc: "/__image-loading__/fallback.svg",
          loading: "eager",
        },
      })
    );

    await visual.page.waitForFunction(() => {
      const img = document.querySelector("#stage img");
      return !img || img.classList.contains("image-loaded");
    });

    expect(
      await visual.page.evaluate(() => {
        const img = document.querySelector<HTMLImageElement>("#stage img");
        return {
          src: img?.getAttribute("src"),
          width: img?.naturalWidth,
          skeleton: !!document.querySelector("#stage .avatar-skeleton"),
        };
      })
    ).toEqual({
      src: "/__image-loading__/fallback.svg",
      width: 64,
      skeleton: false,
    });
  });

  it("recognizes an SSR image that finished loading before hydration", async () => {
    const props = {
      name: "Ada Lovelace",
      imageSrc: `data:image/svg+xml,${encodeURIComponent(SVG)}`,
      loading: "eager" as const,
    };
    const html = await renderToString(
      createSSRApp({ render: () => h(Avatar, props) })
    );

    const state = await visual.page.evaluate(
      async ({ html, props }) => {
        const stage = document.querySelector("#stage")!;
        stage.innerHTML = html;
        const originalImage = stage.querySelector("img")!;
        await originalImage.decode();
        await window.__hydrate(props);
        const img = stage.querySelector("img")!;
        return {
          reusedServerImage: img === originalImage,
          complete: img.complete && img.naturalWidth === 64,
          loaded: img.classList.contains("image-loaded"),
          skeleton: !!stage.querySelector(".avatar-skeleton"),
        };
      },
      { html, props }
    );

    expect(state).toEqual({
      reusedServerImage: true,
      complete: true,
      loaded: true,
      skeleton: false,
    });
  });
});
