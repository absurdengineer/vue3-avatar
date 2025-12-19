<script>
import Avatar from "@/components/Avatar.vue";
import AvatarGroup from "@/components/AvatarGroup.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ServeDev",
  components: {
    Avatar,
    AvatarGroup,
  },
  setup() {
    const handleAvatarClick = (event) => {
      console.log("Avatar clicked!", event);
      alert("Avatar clicked callback working!");
    };
    const handleOverflowClick = (hidden, all) => {
      console.log("Overflow clicked!", { hidden, all });
      alert(
        `Hidden users: ${hidden.length}\nTotal users: ${
          all.length
        }\nNames: ${hidden.map((u) => u.name).join(", ")}`
      );
    };
    return { handleAvatarClick, handleOverflowClick };
  },
});
</script>

<template>
  <div id="app">
    <div class="gallery-container">
      <!-- Section 1: Shapes & Base Styles (v4.0 Core) -->
      <div class="section-block">
        <h2 class="section-title">Shapes & Base Styles</h2>
        <div class="row">
          <div class="item"><avatar name="Jane Doe" /><span>Default</span></div>
          <div class="item">
            <avatar name="Jane Doe" :dark="true" /><span>Dark</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" :gradient="true" color="white" /><span
              >Gradient</span
            >
          </div>
          <div class="item">
            <avatar name="Jane Doe" :rounded="false" /><span>Square</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" background="#007bff" /><span
              >Custom BG</span
            >
          </div>
          <div class="item">
            <avatar name="John Doe Watsit" /><span>3 Initials</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" shape="squircle" /><span>Squircle</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" shape="hexagon" /><span>Hexagon</span>
          </div>
        </div>
        <div class="row">
          <div class="item">
            <avatar name="Jane Doe" :border="true" borderColor="#2ecc71" /><span
              >Custom Border</span
            >
          </div>
          <div class="item">
            <avatar name="Hover Me" :pointer="true" /><span>Pointer</span>
          </div>
          <div class="item">
            <avatar name="Click Me" :onClick="handleAvatarClick" /><span
              >Interactive</span
            >
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Section 2: Status & Presence -->
      <div class="section-block">
        <h2 class="section-title">Status & Presence (New Positions in v4.1)</h2>
        <div class="row">
          <div class="item">
            <avatar name="John" status="online" /><span>Online</span>
          </div>
          <div class="item">
            <avatar name="John" status="away" /><span>Away</span>
          </div>
          <div class="item">
            <avatar name="John" status="busy" /><span>Busy</span>
          </div>
          <div class="item">
            <avatar name="John" status="offline" /><span>Offline</span>
          </div>
          <div class="item">
            <avatar
              name="John"
              status="online"
              status-position="top-right"
            /><span>Top-Right</span>
          </div>
          <div class="item">
            <avatar
              name="John"
              status="online"
              status-position="top-left"
            /><span>Top-Left</span>
          </div>
          <div class="item">
            <avatar
              name="John"
              status="online"
              status-position="bottom-left"
            /><span>Bottom-Left</span>
          </div>
          <div class="item">
            <avatar name="John" status="online">
              <template #status
                ><div
                  style="
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: blue;
                  "
                ></div
              ></template>
            </avatar>
            <span>Status Slot</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Section 3: PixelGen Themes (v4.1) -->
      <div class="section-block">
        <h2 class="section-title">✨ PixelGen Themes</h2>
        <div class="row">
          <div class="item">
            <avatar
              name="Alice"
              variant="pixel"
              pixel-theme="earth"
              :dark="true"
            /><span>Earth</span>
          </div>
          <div class="item">
            <avatar name="Bob" variant="pixel" pixel-theme="neon" /><span
              >Neon</span
            >
          </div>
          <div class="item">
            <avatar name="Charlie" variant="pixel" pixel-theme="ocean" /><span
              >Ocean</span
            >
          </div>
          <div class="item">
            <avatar name="David" variant="pixel" pixel-theme="forest" /><span
              >Forest</span
            >
          </div>
          <div class="item">
            <avatar name="Eve" variant="pixel" pixel-theme="sunset" /><span
              >Sunset</span
            >
          </div>
          <div class="item">
            <avatar name="Frank" variant="pixel" pixel-theme="midnight" /><span
              >Midnight</span
            >
          </div>
          <div class="item">
            <avatar name="Grace" variant="pixel" pixel-theme="candy" /><span
              >Candy</span
            >
          </div>
          <div class="item">
            <avatar name="Heidi" variant="pixel" pixel-theme="retro" /><span
              >Retro</span
            >
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Section 4: Auto-Contrast & Images -->
      <div class="section-block">
        <h2 class="section-title">Auto-Contrast & Images</h2>
        <div class="row">
          <div class="item">
            <avatar
              name="Light"
              background="#f1c40f"
              :auto-contrast="true"
            /><span>Auto Black</span>
          </div>
          <div class="item">
            <avatar
              name="Dark"
              background="#2c3e50"
              :auto-contrast="true"
            /><span>Auto White</span>
          </div>
          <div class="item">
            <avatar
              name="User"
              imageSrc="https://img.freepik.com/vektoren-kostenlos/geschaeftsmann-charakter-avatar-isoliert_24877-60111.jpg"
            />
            <span>Standard Image</span>
          </div>
          <div class="item">
            <avatar
              name="User"
              imageSrc="https://img.freepik.com/vektoren-kostenlos/geschaeftsmann-charakter-avatar-isoliert_24877-60111.jpg"
              :transition="true"
            />
            <span>Image Fade-in</span>
          </div>
          <div class="item">
            <avatar name="" :size="40">
              <template #placeholder="{ style }"
                ><div
                  :style="{
                    ...style,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }"
                >
                  👤
                </div></template
              >
            </avatar>
            <span>Placeholder Slot</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Section 5: Avatar Groups -->
      <div class="section-block">
        <h2 class="section-title">Interactive Avatar Groups</h2>
        <div class="row">
          <div class="item group-item">
            <avatar-group :max="3">
              <avatar name="Alice" /><avatar name="Bob" /><avatar
                name="Charlie"
              /><avatar name="David" />
            </avatar-group>
            <span>Stack (Max 3)</span>
          </div>
          <div class="item group-item">
            <avatar-group @overflow-click="handleOverflowClick" :max="2">
              <avatar name="Alice" variant="pixel" /><avatar
                name="Bob"
                variant="pixel"
              /><avatar name="Charlie" variant="pixel" />
            </avatar-group>
            <span>Interactive +N</span>
          </div>
          <div class="item group-item">
            <avatar-group layout="triangle">
              <avatar name="Alice" /><avatar name="Bob" /><avatar
                name="Charlie"
              />
            </avatar-group>
            <span>Triangle</span>
          </div>
          <div class="item group-item">
            <avatar-group layout="triangle" :size="50">
              <avatar name="Alice" variant="pixel" pixel-theme="neon" />
              <avatar name="Bob" variant="pixel" pixel-theme="ocean" />
              <avatar name="Charlie" variant="pixel" pixel-theme="sunset" />
            </avatar-group>
            <span>Triangle Pixel</span>
          </div>
          <div class="item group-item">
            <avatar-group>
              <avatar name="S" status="online" /><avatar
                name="B"
                status="busy"
              /><avatar name="O" status="offline" />
            </avatar-group>
            <span>Status Stack</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: white;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  display: flex;
  justify-content: center;
  min-height: 100vh;
}
#app {
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}
.gallery-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.section-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: flex-end;
}
.divider {
  height: 1px;
  background-color: #eee;
  width: 100%;
  margin: 1rem 0;
}
.section-title {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  font-weight: 600;
  opacity: 0.7;
  align-self: flex-start;
  width: 100%;
  text-align: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}
.subsection-title {
  font-size: 0.9rem;
  color: #888;
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-width: 80px;
}
.group-item {
  min-width: 120px;
  margin-left: 1rem;
  margin-right: 1rem;
}
.item span {
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
}
</style>
