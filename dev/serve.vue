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
    return { handleAvatarClick };
  },
});
</script>

<template>
  <div id="app">
    <div class="gallery-container">
      <!-- Section 1: Singles -->
      <div class="section-block">
        <h2 class="section-title">Single Avatars</h2>
        <div class="row">
          <div class="item">
            <avatar name="Jane Doe" />
            <span>Default</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" :dark="true" />
            <span>Dark</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" :gradient="true" color="white" />
            <span>Gradient</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" shape="squircle" />
            <span>Squircle</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" shape="hexagon" />
            <span>Hexagon</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" :size="40" :rounded="false" />
            <span>Square</span>
          </div>
        </div>
        <div class="row">
          <div class="item">
            <avatar
              name="Jane Doe"
              imageSrc="https://img.freepik.com/vektoren-kostenlos/geschaeftsmann-charakter-avatar-isoliert_24877-60111.jpg"
            />
            <span>Image</span>
          </div>
          <div class="item">
            <avatar name="John Doe Watsit" />
            <span>3 Initials</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" borderColor="black" />
            <span>Border</span>
          </div>
          <div class="item">
            <avatar name="Jane Doe" status="online" />
            <span>Online</span>
          </div>
          <div class="item">
            <avatar name="Hover Me" :pointer="true" />
            <span>Pointer</span>
          </div>
          <div class="item">
            <avatar name="Click Me" :onClick="handleAvatarClick" />
            <span>Callback</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Section 2: Groups -->
      <div class="section-block">
        <h2 class="section-title">Avatar Groups</h2>

        <!-- Stack Sub-row -->
        <h3 class="subsection-title">Stack Layout</h3>
        <div class="row">
          <div class="item group-item">
            <avatar-group>
              <avatar name="Jane Doe" />
              <avatar name="John Smith" />
              <avatar name="Peter Jones" />
            </avatar-group>
            <span>Stack</span>
          </div>

          <div class="item group-item">
            <avatar-group :max="2">
              <avatar name="Jane Doe" />
              <avatar name="John Smith" />
              <avatar name="Peter Jones" />
              <avatar name="Pete Carlton" />
            </avatar-group>
            <span>Stack Max</span>
          </div>
        </div>

        <!-- Triangle Sub-row -->
        <h3 class="subsection-title">Triangle Layout</h3>
        <div class="row">
          <div class="item group-item">
            <avatar-group layout="triangle">
              <avatar name="Jane Doe" />
              <avatar name="John Smith" />
              <avatar name="Peter Jones" />
            </avatar-group>
            <span>Triangle</span>
          </div>

          <div class="item group-item">
            <avatar-group
              layout="triangle"
              :size="50"
              :onClick="handleAvatarClick"
            >
              <avatar
                name="Jane Doe"
                imageSrc="https://img.freepik.com/vektoren-kostenlos/geschaeftsmann-charakter-avatar-isoliert_24877-60111.jpg"
              />
              <avatar name="Jane Doe" status="online" />
              <avatar name="Jane Doe" background="#007bff" />
              <avatar name="Jane Doe" background="#007bff" />
            </avatar-group>
            <span>Tri-Mix (Clickable)</span>
          </div>

          <div class="item group-item">
            <avatar-group layout="triangle">
              <avatar name="Jane Doe" status="online" />
              <avatar name="John Smith" status="busy" />
              <avatar name="Peter Jones" status="offline" />
            </avatar-group>
            <span>Tri-Stat</span>
          </div>

          <div class="item group-item">
            <avatar-group layout="triangle" :size="60">
              <avatar name="Jane Doe" />
              <avatar name="John Smith" />
              <avatar name="Peter Jones" />
            </avatar-group>
            <span>Large</span>
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
  max-width: 1200px;
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
