/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import Avatar from "../src/components/Avatar.vue";
import AvatarGroup from "../src/components/AvatarGroup.vue";

// Runs without jsdom on purpose: anything reaching for `window` or `document`
// at render time throws here rather than in a user's Nuxt build.
const render = (component: any, props?: any, children?: any) =>
  renderToString(
    createSSRApp({ render: () => h(component, props, children) })
  );

describe("Server rendering", () => {
  it("renders initials without touching the DOM", async () => {
    const html = await render(Avatar, { name: "John Doe" });
    expect(html).toContain("JD");
  });

  it("renders an image avatar with the status and badge markup", async () => {
    const html = await render(Avatar, {
      name: "John Doe",
      imageSrc: "https://example.com/a.png",
      status: "online",
      badge: 3,
    });
    expect(html).toContain("status-indicator");
    expect(html).toContain("avatar-badge");
  });

  it("emits no skeleton on the server, so hydration has nothing to correct", async () => {
    const html = await render(Avatar, {
      name: "John Doe",
      imageSrc: "https://example.com/a.png",
    });
    expect(html).not.toContain("avatar-skeleton");
  });

  it("emits no tooltip on the server", async () => {
    const html = await render(Avatar, { name: "John Doe" });
    expect(html).not.toContain('role="tooltip"');
  });

  it("renders a group with an overflow badge", async () => {
    const html = await render(AvatarGroup, { max: 1 }, {
      default: () => [
        h(Avatar, { name: "Ada Lovelace" }),
        h(Avatar, { name: "Grace Hopper" }),
      ],
    });
    expect(html).toContain("+1");
  });

  it("renders alternative root elements", async () => {
    const button = await render(Avatar, { name: "John Doe", as: "button" });
    expect(button).toContain("<button");

    const link = await render(Avatar, { name: "John Doe", as: "a", href: "/x" });
    expect(link).toContain('href="/x"');
  });
});
