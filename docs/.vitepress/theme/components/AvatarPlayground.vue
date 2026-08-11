<template>
  <section class="playground-container" aria-labelledby="playground-title">
    <div class="section-heading">
      <p class="eyebrow">Try it yourself</p>
      <h2 id="playground-title">Build an avatar</h2>
      <p>Change the controls and copy a snippet that exactly matches the preview.</p>
    </div>

    <div class="tabs" role="tablist" aria-label="Playground component">
      <button
        role="tab"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'avatar' }"
        :aria-selected="activeTab === 'avatar'"
        @click="activeTab = 'avatar'"
      >
        Avatar
      </button>
      <button
        role="tab"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'group' }"
        :aria-selected="activeTab === 'group'"
        @click="activeTab = 'group'"
      >
        AvatarGroup
      </button>
    </div>

    <div v-if="activeTab === 'avatar'" class="playground-body">
      <div class="playground-controls">
        <div class="control-group control-group--wide">
          <label for="avatar-name">Name <span aria-hidden="true">*</span></label>
          <input id="avatar-name" v-model="form.name" type="text" autocomplete="name" placeholder="e.g. Tony Stark" />
        </div>

        <div class="control-group control-group--wide">
          <label for="avatar-image">Image URL <span class="optional">Optional</span></label>
          <input id="avatar-image" v-model="form.imageSrc" type="url" inputmode="url" placeholder="https://example.com/avatar.jpg" />
          <span class="help-text">If the image cannot load, the avatar falls back to initials or pixel art.</span>
        </div>

        <div class="control-grid">
          <div class="control-group">
            <label for="avatar-variant">Variant</label>
            <select id="avatar-variant" v-model="form.variant">
              <option value="initials">Initials</option>
              <option value="pixel">Pixel art</option>
            </select>
          </div>

          <div v-if="form.variant === 'pixel'" class="control-group">
            <label for="pixel-theme">Pixel theme</label>
            <select id="pixel-theme" v-model="form.pixelTheme">
              <option v-for="theme in pixelThemes" :key="theme" :value="theme">{{ theme }}</option>
            </select>
          </div>

          <div class="control-group">
            <label for="avatar-shape">Shape</label>
            <select id="avatar-shape" v-model="form.shape">
              <option v-for="shape in shapes" :key="shape" :value="shape">{{ shape }}</option>
            </select>
          </div>

          <div class="control-group">
            <label for="avatar-status">Status</label>
            <select id="avatar-status" v-model="form.status">
              <option value="">None</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div v-if="form.status" class="control-group">
            <label for="status-position">Status position</label>
            <select id="status-position" v-model="form.statusPosition">
              <option v-for="position in statusPositions" :key="position" :value="position">{{ position }}</option>
            </select>
          </div>
        </div>

        <div class="control-group control-group--wide">
          <label for="avatar-size">Size <output>{{ form.size }}px</output></label>
          <input id="avatar-size" v-model.number="form.size" type="range" min="24" max="160" step="4" />
        </div>

        <div class="checkbox-grid">
          <label class="checkbox-label"><input v-model="form.autoContrast" type="checkbox" /> Auto-contrast text</label>
          <label class="checkbox-label"><input v-model="form.dark" type="checkbox" /> Dark palette</label>
          <label class="checkbox-label"><input v-model="form.gradient" type="checkbox" /> Gradient background</label>
          <label class="checkbox-label"><input v-model="form.interactive" type="checkbox" /> Interactive (click / keyboard)</label>
          <label v-if="hasImage" class="checkbox-label"><input v-model="form.border" type="checkbox" /> Image border</label>
        </div>
      </div>

      <div class="playground-preview">
        <div class="preview-header">
          <p class="eyebrow">Live preview</p>
          <button class="reset-btn" type="button" @click="reset">Reset</button>
        </div>
        <div class="preview-stage" :class="{ 'dark-mode': form.dark }">
          <Avatar
            :name="form.name || 'Avatar'"
            :image-src="form.imageSrc || undefined"
            :variant="form.variant"
            :pixel-theme="form.pixelTheme"
            :size="form.size"
            :shape="form.shape"
            :status="form.status || undefined"
            :status-position="form.statusPosition"
            :auto-contrast="form.autoContrast"
            :dark="form.dark"
            :gradient="form.gradient"
            :interactive="form.interactive"
            :border="hasImage ? form.border : true"
            @activate="activateCount++"
          />
        </div>
        <p v-if="form.interactive" class="interaction-hint">
          Click or focus + press Enter/Space — activated {{ activateCount }} time{{ activateCount === 1 ? '' : 's' }}.
        </p>

        <div class="code-output">
          <div class="code-header">
            <div>
              <span class="code-title">Vue template</span>
              <span class="code-hint">{{ codeProps.length }} prop{{ codeProps.length === 1 ? '' : 's' }}</span>
            </div>
            <button class="copy-btn" type="button" @click="copyCode(generatedCode)">{{ copied ? 'Copied!' : 'Copy code' }}</button>
          </div>
          <pre><code>{{ generatedCode }}</code></pre>
        </div>
      </div>
    </div>

    <div v-else class="playground-body">
      <div class="playground-controls">
        <div class="control-group control-group--wide">
          <label for="group-max">Max visible <output>{{ groupForm.max }}</output></label>
          <input id="group-max" v-model.number="groupForm.max" type="range" min="1" :max="roster.length" step="1" />
        </div>

        <div class="control-grid">
          <div class="control-group">
            <label for="group-layout">Layout</label>
            <select id="group-layout" v-model="groupForm.layout">
              <option value="stack">Stack</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          <div v-if="groupForm.layout === 'stack'" class="control-group">
            <label for="group-overlap">Overlap <output>{{ groupForm.overlap }}px</output></label>
            <input id="group-overlap" v-model.number="groupForm.overlap" type="range" min="0" max="30" step="2" />
          </div>
        </div>

        <p class="help-text">Showing {{ roster.length }}-person roster. Click the +N badge in the preview to see the overflow payload.</p>
      </div>

      <div class="playground-preview">
        <div class="preview-header">
          <p class="eyebrow">Live preview</p>
          <button class="reset-btn" type="button" @click="resetGroup">Reset</button>
        </div>
        <div class="preview-stage">
          <AvatarGroup
            :max="groupForm.max"
            :layout="groupForm.layout"
            :overlap="groupForm.overlap"
            @overflow-click="onOverflowClick"
          >
            <Avatar v-for="person in roster" :key="person.name" :name="person.name" :status="person.status" />
          </AvatarGroup>
        </div>
        <p v-if="overflowMessage" class="interaction-hint">{{ overflowMessage }}</p>

        <div class="code-output">
          <div class="code-header">
            <div>
              <span class="code-title">Vue template</span>
            </div>
            <button class="copy-btn" type="button" @click="copyCode(generatedGroupCode)">{{ copied ? 'Copied!' : 'Copy code' }}</button>
          </div>
          <pre><code>{{ generatedGroupCode }}</code></pre>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { Avatar, AvatarGroup } from 'vue3-avatar';

const activeTab = ref('avatar');
const copied = ref(false);

const defaults = Object.freeze({
  name: 'Tony Stark', imageSrc: '', variant: 'initials', pixelTheme: 'earth', size: 64,
  shape: 'circle', status: 'online', statusPosition: 'bottom-right', autoContrast: true,
  dark: false, gradient: false, interactive: false, border: true
});
const form = reactive({ ...defaults });
const activateCount = ref(0);
const pixelThemes = ['earth', 'neon', 'ocean', 'forest', 'sunset', 'midnight', 'candy', 'retro'];
const shapes = ['circle', 'square', 'squircle', 'hexagon'];
const statusPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
const hasImage = computed(() => Boolean(form.imageSrc));

const roster = [
  { name: 'Tony Stark', status: 'online' },
  { name: 'Bruce Banner', status: 'away' },
  { name: 'Steve Rogers', status: 'offline' },
  { name: 'Natasha Romanoff', status: 'online' },
  { name: 'Peter Parker', status: 'online' },
];
const groupDefaults = Object.freeze({ max: 3, layout: 'stack', overlap: 10 });
const groupForm = reactive({ ...groupDefaults });
const overflowMessage = ref('');

function escaped(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

const codeProps = computed(() => {
  const props = [`name="${escaped(form.name || 'Avatar')}"`];
  if (form.imageSrc) props.push(`image-src="${escaped(form.imageSrc)}"`);
  if (form.variant !== 'initials') props.push(`variant="${form.variant}"`);
  if (form.variant === 'pixel' && form.pixelTheme !== 'earth') props.push(`pixel-theme="${form.pixelTheme}"`);
  if (form.size !== 40) props.push(`:size="${form.size}"`);
  if (form.shape !== 'circle') props.push(`shape="${form.shape}"`);
  if (form.status) props.push(`status="${form.status}"`);
  if (form.status && form.statusPosition !== 'bottom-right') props.push(`status-position="${form.statusPosition}"`);
  if (form.autoContrast) props.push(':auto-contrast="true"');
  if (form.dark) props.push(':dark="true"');
  if (form.gradient) props.push(':gradient="true"');
  if (form.interactive) props.push(':interactive="true"');
  if (hasImage.value && !form.border) props.push(':border="false"');
  return props;
});

const generatedCode = computed(() => {
  const props = codeProps.value;
  return props.length <= 2
    ? `<Avatar ${props.join(' ')} />`
    : `<Avatar\n${props.map((prop) => `  ${prop}`).join('\n')}\n/>`;
});

const generatedGroupCode = computed(() => {
  const groupProps = [];
  if (groupForm.max !== roster.length) groupProps.push(`:max="${groupForm.max}"`);
  if (groupForm.layout !== 'stack') groupProps.push(`layout="${groupForm.layout}"`);
  if (groupForm.layout === 'stack' && groupForm.overlap !== 10) groupProps.push(`:overlap="${groupForm.overlap}"`);
  const openTag = groupProps.length ? `<AvatarGroup ${groupProps.join(' ')}>` : '<AvatarGroup>';
  const children = roster
    .map((person) => `  <Avatar name="${escaped(person.name)}" status="${person.status}" />`)
    .join('\n');
  return `${openTag}\n${children}\n</AvatarGroup>`;
});

async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code);
    copied.value = true;
    window.setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    copied.value = false;
  }
}

function onOverflowClick(hiddenUsers) {
  const names = hiddenUsers.map((user) => user.name).filter(Boolean).join(', ');
  overflowMessage.value = `+${hiddenUsers.length} clicked — hidden: ${names || 'unnamed'}`;
}

function reset() {
  Object.assign(form, defaults);
  activateCount.value = 0;
}

function resetGroup() {
  Object.assign(groupForm, groupDefaults);
  overflowMessage.value = '';
}
</script>

<style scoped>
.playground-container { display: flex; flex-direction: column; width: 100%; gap: 1.25rem; margin: 2rem 0; padding: clamp(1.25rem, 3vw, 2.25rem); border: 1px solid var(--vp-c-divider); border-radius: 16px; background: var(--vp-c-bg-soft); }
.section-heading h2 { margin: .15rem 0 .4rem; font-size: 1.45rem; }
.section-heading p:last-child { margin: 0; color: var(--vp-c-text-2); }
.eyebrow { margin: 0; color: var(--vp-c-brand-1); font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.tabs { display: flex; gap: .4rem; border-bottom: 1px solid var(--vp-c-divider); }
.tab-btn { padding: .5rem .9rem; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--vp-c-text-2); font: inherit; font-size: .875rem; font-weight: 600; cursor: pointer; }
.tab-btn:hover { color: var(--vp-c-text-1); }
.tab-btn.active { color: var(--vp-c-brand-1); border-bottom-color: var(--vp-c-brand-1); }
.playground-body { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr); width: 100%; gap: clamp(1.5rem, 3vw, 3rem); }
.playground-controls { display: flex; flex-wrap: wrap; gap: 1rem; align-content: start; }
.control-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; gap: 1rem; }
.control-group { display: flex; flex: 1; flex-direction: column; gap: .4rem; min-width: 0; }
.control-group--wide { flex: 0 0 100%; width: 100%; }
.control-group label { color: var(--vp-c-text-1); font-size: .875rem; font-weight: 600; }
.optional, .help-text, .code-hint { color: var(--vp-c-text-2); font-size: .78rem; font-weight: 400; }
.help-text { line-height: 1.35; flex: 0 0 100%; margin: 0; }
input[type='text'], input[type='url'], select { box-sizing: border-box; width: 100%; min-height: 2.45rem; padding: .5rem .65rem; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
input:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
input[type='range'] { accent-color: var(--vp-c-brand-1); }
.checkbox-grid { display: flex; flex-wrap: wrap; gap: .75rem 1rem; width: 100%; }
.checkbox-label { display: flex; align-items: center; gap: .45rem; color: var(--vp-c-text-1); font-size: .875rem; cursor: pointer; }
.playground-preview { display: flex; flex-direction: column; gap: .8rem; }
.preview-header { display: flex; align-items: center; justify-content: space-between; }
.reset-btn, .copy-btn { border: 0; border-radius: 6px; font: inherit; font-size: .8rem; font-weight: 600; cursor: pointer; }
.reset-btn { padding: .35rem .6rem; background: transparent; color: var(--vp-c-text-2); }
.reset-btn:hover { background: var(--vp-c-default-soft); color: var(--vp-c-text-1); }
.preview-stage { display: flex; align-items: center; justify-content: center; min-height: 192px; border: 1px dashed var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); transition: background .2s ease; }
.preview-stage.dark-mode { background: #0f172a; }
.interaction-hint { margin: 0; color: var(--vp-c-text-2); font-size: .8rem; }
.code-output { overflow: hidden; border-radius: 10px; background: #1e293b; color: #e2e8f0; }
.code-header { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .7rem .8rem; border-bottom: 1px solid rgba(255,255,255,.12); }
.code-title { display: block; color: #f8fafc; font-family: var(--vp-font-family-mono); font-size: .75rem; font-weight: 600; }
.code-hint { color: #94a3b8; }
.copy-btn { padding: .35rem .6rem; background: #3b82f6; color: white; white-space: nowrap; }
.copy-btn:hover { background: #2563eb; }
pre { overflow-x: auto; margin: 0; padding: 1rem; font-family: var(--vp-font-family-mono); font-size: .82rem; line-height: 1.6; }
@media (max-width: 800px) { .playground-body { grid-template-columns: 1fr; } }
@media (max-width: 460px) { .control-grid { grid-template-columns: 1fr; } }
</style>
