import { createApp, h } from "vue";
import type { App, Component } from "vue";
import { Avatar, AvatarGroup, AvatarConfigKey } from "../../src/entry.esm";
import type { AvatarPluginOptions } from "../../src/types";

type MountRequest = {
  component?: "Avatar" | "AvatarGroup";
  props?: Record<string, unknown>;
  /** Child avatars, for AvatarGroup cases. */
  children?: Record<string, unknown>[];
  /** App-wide defaults, to exercise the provide/inject path. */
  defaults?: AvatarPluginOptions["defaults"];
};

declare global {
  interface Window {
    __mount: (request: MountRequest) => Promise<void>;
    __unmount: () => void;
    /** Set once fonts are ready, so captures never race the font loader. */
    __ready: boolean;
  }
}

const COMPONENTS: Record<string, Component> = { Avatar, AvatarGroup };

let app: App | null = null;

function unmount() {
  if (app) {
    app.unmount();
    app = null;
  }
  const stage = document.querySelector("#stage");
  if (stage) stage.innerHTML = "";
}

window.__unmount = unmount;

window.__mount = async ({
  component = "Avatar",
  props = {},
  children,
  defaults,
}: MountRequest) => {
  unmount();

  const target = COMPONENTS[component];
  if (!target) throw new Error(`Unknown component "${component}".`);

  app = createApp({
    render() {
      if (component === "AvatarGroup" && children) {
        return h(target, props, {
          default: () => children.map((child) => h(Avatar as Component, child)),
        });
      }
      return h(target, props);
    },
  });

  app.provide(AvatarConfigKey, defaults || {});
  app.mount("#stage");

  // Two frames: one for Vue to flush, one for the browser to lay out and paint.
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
};

document.fonts.ready.then(() => {
  window.__ready = true;
});
