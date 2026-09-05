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

        <div class="control-grid">
          <div class="control-group">
            <label for="status-size">Status size</label>
            <select id="status-size" v-model="form.statusSize">
              <option v-for="option in statusSizes" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          <div class="control-group">
            <label for="badge-value">Badge</label>
            <input id="badge-value" v-model="form.badge" type="text" placeholder="e.g. 5 or PRO" />
          </div>
        </div>

        <div class="control-grid">
          <div class="control-group">
            <label for="badge-position">Badge position</label>
            <select id="badge-position" v-model="form.badgePosition">
              <option v-for="position in statusPositions" :key="position" :value="position">{{ position }}</option>
            </select>
          </div>
          <div class="control-group">
            <label for="avatar-as">Root element</label>
            <select id="avatar-as" v-model="form.as">
              <option v-for="tag in rootTags" :key="tag" :value="tag">{{ tag }}</option>
            </select>
          </div>
        </div>

        <div class="control-group control-group--wide">
          <label for="avatar-tooltip">Tooltip <span class="code-hint">empty uses the name</span></label>
          <input id="avatar-tooltip" v-model="form.tooltip" type="text" placeholder="e.g. Chief Engineer" />
        </div>

        <div class="control-grid">
          <div class="control-group">
            <label for="tooltip-placement">Tooltip placement</label>
            <select id="tooltip-placement" v-model="form.tooltipPlacement">
              <option v-for="placement in placements" :key="placement" :value="placement">{{ placement }}</option>
            </select>
          </div>
          <div class="control-group">
            <label for="tooltip-theme">Tooltip theme</label>
            <select id="tooltip-theme" v-model="form.tooltipTheme">
              <option v-for="theme in tooltipThemes" :key="theme" :value="theme">{{ theme }}</option>
            </select>
          </div>
        </div>

        <div class="checkbox-grid">
          <label class="checkbox-label"><input v-model="form.autoContrast" type="checkbox" /> Auto-contrast text</label>
          <label class="checkbox-label"><input v-model="form.dark" type="checkbox" /> Dark palette</label>
          <label class="checkbox-label"><input v-model="form.gradient" type="checkbox" /> Gradient background</label>
          <label class="checkbox-label"><input v-model="form.interactive" type="checkbox" /> Interactive (click / keyboard)</label>
          <label v-if="hasImage" class="checkbox-label"><input v-model="form.border" type="checkbox" /> Image border</label>
          <label class="checkbox-label"><input v-model="form.statusPulse" type="checkbox" /> Status pulse</label>
          <label class="checkbox-label"><input v-model="form.editable" type="checkbox" /> Editable overlay</label>
          <label class="checkbox-label"><input v-model="form.disabled" type="checkbox" /> Disabled</label>
          <label class="checkbox-label"><input v-model="form.tooltipDisabled" type="checkbox" /> No tooltip</label>
        </div>

        <details class="control-section">
          <summary>Appearance</summary>
          <div class="control-grid">
            <div class="control-group">
              <label for="border-color">Border colour</label>
              <input id="border-color" v-model="form.borderColor" type="text" placeholder="white" />
            </div>
            <div class="control-group">
              <label for="avatar-alt">Alt text <span class="optional">Optional</span></label>
              <input id="avatar-alt" v-model="form.alt" type="text" placeholder="Avatar of {name}" />
            </div>
          </div>
          <div class="checkbox-grid">
            <label class="checkbox-label"><input v-model="form.inline" type="checkbox" /> Inline layout</label>
            <label class="checkbox-label"><input v-model="form.rounded" type="checkbox" /> Rounded <span class="code-hint">shape wins when set</span></label>
            <label class="checkbox-label"><input v-model="form.sameBorder" type="checkbox" /> Match dot border to avatar</label>
            <label class="checkbox-label"><input v-model="form.useTextColorForBorder" type="checkbox" /> Border uses text colour</label>
          </div>
        </details>

        <details class="control-section">
          <summary>Status</summary>
          <div class="control-grid">
            <div class="control-group">
              <label for="status-color">Status colour</label>
              <input id="status-color" v-model="form.statusColor" type="text" placeholder="#22c55e" />
            </div>
            <div class="control-group">
              <label for="status-label">Status label <span class="code-hint">read aloud</span></label>
              <input id="status-label" v-model="form.statusLabel" type="text" placeholder="User is online" />
            </div>
          </div>
        </details>

        <details class="control-section">
          <summary>Badge</summary>
          <div class="control-grid">
            <div class="control-group">
              <label for="badge-variant">Variant</label>
              <select id="badge-variant" v-model="form.badgeVariant">
                <option v-for="variant in badgeVariants" :key="variant" :value="variant">{{ variant }}</option>
              </select>
            </div>
            <div class="control-group">
              <label for="badge-max">Max count</label>
              <input id="badge-max" v-model.number="form.badgeMax" type="number" min="1" />
            </div>
            <div class="control-group">
              <label for="badge-max-length">Max letters</label>
              <input id="badge-max-length" v-model.number="form.badgeMaxLength" type="number" min="1" max="6" />
            </div>
            <div class="control-group">
              <label for="badge-color">Background</label>
              <input id="badge-color" v-model="form.badgeColor" type="text" placeholder="#ef4444" />
            </div>
            <div class="control-group">
              <label for="badge-text-color">Text colour</label>
              <input id="badge-text-color" v-model="form.badgeTextColor" type="text" placeholder="auto contrast" />
            </div>
            <div class="control-group">
              <label for="badge-label">Badge label <span class="code-hint">read aloud</span></label>
              <input id="badge-label" v-model="form.badgeLabel" type="text" placeholder="3 unread messages" />
            </div>
          </div>
        </details>

        <details class="control-section">
          <summary>Image</summary>
          <div class="control-group control-group--wide">
            <label for="fallback-src">Fallback URL <span class="code-hint">tried when the image fails</span></label>
            <input id="fallback-src" v-model="form.fallbackSrc" type="url" inputmode="url" placeholder="https://example.com/fallback.jpg" />
          </div>
          <div class="control-grid">
            <div class="control-group">
              <label for="image-srcset">srcset</label>
              <input id="image-srcset" v-model="form.srcset" type="text" placeholder="pic.png 1x, pic@2x.png 2x" />
            </div>
            <div class="control-group">
              <label for="image-sizes">sizes</label>
              <input id="image-sizes" v-model="form.sizes" type="text" placeholder="(max-width: 600px) 40px, 64px" />
            </div>
            <div class="control-group">
              <label for="image-loading">loading</label>
              <select id="image-loading" v-model="form.loading">
                <option value="lazy">lazy</option>
                <option value="eager">eager</option>
              </select>
            </div>
            <div class="control-group">
              <label for="image-decoding">decoding</label>
              <select id="image-decoding" v-model="form.decoding">
                <option value="async">async</option>
                <option value="sync">sync</option>
                <option value="auto">auto</option>
              </select>
            </div>
            <div class="control-group">
              <label for="image-crossorigin">crossorigin</label>
              <select id="image-crossorigin" v-model="form.crossorigin">
                <option value="">unset</option>
                <option value="anonymous">anonymous</option>
                <option value="use-credentials">use-credentials</option>
              </select>
            </div>
            <div class="control-group">
              <label for="image-referrerpolicy">referrerpolicy</label>
              <select id="image-referrerpolicy" v-model="form.referrerpolicy">
                <option value="">unset</option>
                <option v-for="policy in referrerPolicies" :key="policy" :value="policy">{{ policy }}</option>
              </select>
            </div>
          </div>
          <div class="checkbox-grid">
            <label class="checkbox-label"><input v-model="form.retina" type="checkbox" /> Derive an @2x srcset</label>
            <label class="checkbox-label"><input v-model="form.skeleton" type="checkbox" /> Loading skeleton</label>
          </div>
        </details>

        <details class="control-section">
          <summary>Tooltip behaviour</summary>
          <div class="control-grid">
            <div class="control-group">
              <label for="tooltip-trigger">Trigger</label>
              <select id="tooltip-trigger" v-model="form.tooltipTrigger">
                <option v-for="trigger in tooltipTriggers" :key="trigger" :value="trigger">{{ trigger }}</option>
              </select>
            </div>
            <div class="control-group">
              <label for="tooltip-delay">Open delay <output>{{ form.tooltipDelay }}ms</output></label>
              <input id="tooltip-delay" v-model.number="form.tooltipDelay" type="range" min="0" max="1000" step="50" />
            </div>
            <div class="control-group">
              <label for="tooltip-hide-delay">Close delay <output>{{ form.tooltipHideDelay }}ms</output></label>
              <input id="tooltip-hide-delay" v-model.number="form.tooltipHideDelay" type="range" min="0" max="1000" step="50" />
            </div>
            <div class="control-group">
              <label for="tooltip-offset">Offset <output>{{ form.tooltipOffset }}px</output></label>
              <input id="tooltip-offset" v-model.number="form.tooltipOffset" type="range" min="0" max="32" step="1" />
            </div>
          </div>
          <div class="checkbox-grid">
            <label class="checkbox-label"><input v-model="form.tooltipArrow" type="checkbox" /> Arrow</label>
            <label class="checkbox-label"><input v-model="form.tooltipInteractive" type="checkbox" /> Interactive (hoverable)</label>
            <label class="checkbox-label"><input v-model="form.nativeTitle" type="checkbox" /> Native title instead</label>
          </div>
        </details>

        <details class="control-section">
          <summary>Links and editing</summary>
          <div class="control-grid">
            <div class="control-group">
              <label for="link-target">target <span class="code-hint">as="a"</span></label>
              <input id="link-target" v-model="form.target" type="text" placeholder="_blank" :disabled="form.as !== 'a'" />
            </div>
            <div class="control-group">
              <label for="link-rel">rel <span class="code-hint">as="a"</span></label>
              <input id="link-rel" v-model="form.rel" type="text" placeholder="auto for _blank" :disabled="form.as !== 'a'" />
            </div>
            <div class="control-group">
              <label for="edit-accept">accept <span class="code-hint">editable</span></label>
              <input id="edit-accept" v-model="form.accept" type="text" placeholder="image/*" :disabled="!form.editable" />
            </div>
            <div class="control-group">
              <label for="edit-label">Edit label <span class="code-hint">editable</span></label>
              <input id="edit-label" v-model="form.editLabel" type="text" placeholder="Change picture" :disabled="!form.editable" />
            </div>
          </div>
        </details>

        <p class="help-text">
          Six props have no useful control here and are set in code instead:
          <code>customAvatarStyle</code>, <code>customStatusStyle</code> and
          <code>customBadgeStyle</code> take style objects,
          <code>statusColors</code> takes a colour map, <code>onClick</code>
          takes a function (the Interactive checkbox above demonstrates it), and
          <code>useLegacyColors</code> is deprecated.
        </p>
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
            :status-size="form.statusSize"
            :status-pulse="form.statusPulse"
            :badge="form.badge || null"
            :badge-position="form.badgePosition"
            :tooltip="form.tooltip || undefined"
            :tooltip-placement="form.tooltipPlacement"
            :tooltip-theme="form.tooltipTheme"
            :tooltip-disabled="form.tooltipDisabled"
            :as="form.as"
            :href="form.as === 'a' ? '#playground' : undefined"
            :editable="form.editable"
            :disabled="form.disabled"
            :auto-contrast="form.autoContrast"
            :dark="form.dark"
            :gradient="form.gradient"
            :interactive="form.interactive"
            :border="hasImage ? form.border : true"
            :border-color="form.borderColor || undefined"
            :alt="form.alt || undefined"
            :inline="form.inline"
            :rounded="form.rounded"
            :same-border="form.sameBorder"
            :use-text-color-for-border="form.useTextColorForBorder"
            :status-color="form.statusColor || undefined"
            :status-label="form.statusLabel || undefined"
            :badge-variant="form.badgeVariant"
            :badge-max="form.badgeMax"
            :badge-max-length="form.badgeMaxLength"
            :badge-color="form.badgeColor || undefined"
            :badge-text-color="form.badgeTextColor || undefined"
            :badge-label="form.badgeLabel || undefined"
            :fallback-src="form.fallbackSrc || undefined"
            :srcset="form.srcset || undefined"
            :sizes="form.sizes || undefined"
            :loading="form.loading"
            :decoding="form.decoding"
            :crossorigin="form.crossorigin || undefined"
            :referrerpolicy="form.referrerpolicy || undefined"
            :retina="form.retina"
            :skeleton="form.skeleton"
            :tooltip-trigger="form.tooltipTrigger"
            :tooltip-delay="form.tooltipDelay"
            :tooltip-hide-delay="form.tooltipHideDelay"
            :tooltip-offset="form.tooltipOffset"
            :tooltip-arrow="form.tooltipArrow"
            :tooltip-interactive="form.tooltipInteractive"
            :native-title="form.nativeTitle"
            :target="form.as === 'a' && form.target ? form.target : undefined"
            :rel="form.as === 'a' && form.rel ? form.rel : undefined"
            :accept="form.editable && form.accept ? form.accept : undefined"
            :edit-label="form.editLabel || undefined"
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
  dark: false, gradient: false, interactive: false, border: true,
  statusSize: 'md', statusPulse: false, badge: '', badgePosition: 'top-right',
  tooltip: '', tooltipPlacement: 'top', tooltipTheme: 'dark', tooltipDisabled: false,
  as: 'div', editable: false, disabled: false,
  borderColor: '', alt: '', inline: false, rounded: true, sameBorder: false,
  useTextColorForBorder: false, statusColor: '', statusLabel: '',
  badgeVariant: 'count', badgeMax: 999, badgeMaxLength: 3, badgeColor: '',
  badgeTextColor: '', badgeLabel: '',
  fallbackSrc: '', srcset: '', sizes: '', loading: 'lazy', decoding: 'async',
  crossorigin: '', referrerpolicy: '', retina: false, skeleton: true,
  tooltipTrigger: 'hover focus', tooltipDelay: 200, tooltipHideDelay: 100,
  tooltipOffset: 8, tooltipArrow: true, tooltipInteractive: false, nativeTitle: false,
  target: '', rel: '', accept: '', editLabel: ''
});
const form = reactive({ ...defaults });
const activateCount = ref(0);
const pixelThemes = ['earth', 'neon', 'ocean', 'forest', 'sunset', 'midnight', 'candy', 'retro'];
const shapes = ['circle', 'square', 'squircle', 'hexagon'];
const statusPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
const statusSizes = ['sm', 'md', 'lg'];
const tooltipThemes = ['dark', 'light', 'auto'];
const rootTags = ['div', 'button', 'a'];
const badgeVariants = ['count', 'dot', 'icon'];
const tooltipTriggers = ['hover focus', 'hover', 'focus', 'click', 'hover focus click', 'manual'];
const referrerPolicies = ['no-referrer', 'no-referrer-when-downgrade', 'origin',
  'origin-when-cross-origin', 'same-origin', 'strict-origin',
  'strict-origin-when-cross-origin', 'unsafe-url'];
const placements = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end',
  'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'];
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
  if (form.status && form.statusSize !== 'md') props.push(`status-size="${form.statusSize}"`);
  if (form.status && form.statusPulse) props.push(':status-pulse="true"');
  if (form.badge) props.push(`badge="${escaped(form.badge)}"`);
  if (form.badge && form.badgePosition !== 'top-right') props.push(`badge-position="${form.badgePosition}"`);
  if (form.tooltip) props.push(`tooltip="${escaped(form.tooltip)}"`);
  if (form.tooltipPlacement !== 'top') props.push(`tooltip-placement="${form.tooltipPlacement}"`);
  if (form.tooltipTheme !== 'dark') props.push(`tooltip-theme="${form.tooltipTheme}"`);
  if (form.tooltipDisabled) props.push(':tooltip-disabled="true"');
  if (form.as !== 'div') props.push(`as="${form.as}"`);
  if (form.as === 'a') props.push('href="#"');
  if (form.editable) props.push(':editable="true"');
  if (form.disabled) props.push(':disabled="true"');
  if (form.autoContrast) props.push(':auto-contrast="true"');
  if (form.dark) props.push(':dark="true"');
  if (form.gradient) props.push(':gradient="true"');
  if (form.interactive) props.push(':interactive="true"');
  if (hasImage.value && !form.border) props.push(':border="false"');
  if (form.borderColor) props.push(`border-color="${escaped(form.borderColor)}"`);
  if (form.alt) props.push(`alt="${escaped(form.alt)}"`);
  if (form.inline) props.push(':inline="true"');
  if (!form.rounded) props.push(':rounded="false"');
  if (form.sameBorder) props.push(':same-border="true"');
  if (form.useTextColorForBorder) props.push(':use-text-color-for-border="true"');
  if (form.status && form.statusColor) props.push(`status-color="${escaped(form.statusColor)}"`);
  if (form.status && form.statusLabel) props.push(`status-label="${escaped(form.statusLabel)}"`);
  if (form.badgeVariant !== 'count') props.push(`badge-variant="${form.badgeVariant}"`);
  if (form.badgeMax !== 999) props.push(`:badge-max="${form.badgeMax}"`);
  if (form.badgeMaxLength !== 3) props.push(`:badge-max-length="${form.badgeMaxLength}"`);
  if (form.badgeColor) props.push(`badge-color="${escaped(form.badgeColor)}"`);
  if (form.badgeTextColor) props.push(`badge-text-color="${escaped(form.badgeTextColor)}"`);
  if (form.badgeLabel) props.push(`badge-label="${escaped(form.badgeLabel)}"`);
  if (form.fallbackSrc) props.push(`fallback-src="${escaped(form.fallbackSrc)}"`);
  if (form.srcset) props.push(`srcset="${escaped(form.srcset)}"`);
  if (form.sizes) props.push(`sizes="${escaped(form.sizes)}"`);
  if (form.loading !== 'lazy') props.push(`loading="${form.loading}"`);
  if (form.decoding !== 'async') props.push(`decoding="${form.decoding}"`);
  if (form.crossorigin) props.push(`crossorigin="${form.crossorigin}"`);
  if (form.referrerpolicy) props.push(`referrerpolicy="${form.referrerpolicy}"`);
  if (form.retina) props.push(':retina="true"');
  if (!form.skeleton) props.push(':skeleton="false"');
  if (form.tooltipTrigger !== 'hover focus') props.push(`tooltip-trigger="${form.tooltipTrigger}"`);
  if (form.tooltipDelay !== 200) props.push(`:tooltip-delay="${form.tooltipDelay}"`);
  if (form.tooltipHideDelay !== 100) props.push(`:tooltip-hide-delay="${form.tooltipHideDelay}"`);
  if (form.tooltipOffset !== 8) props.push(`:tooltip-offset="${form.tooltipOffset}"`);
  if (!form.tooltipArrow) props.push(':tooltip-arrow="false"');
  if (form.tooltipInteractive) props.push(':tooltip-interactive="true"');
  if (form.nativeTitle) props.push(':native-title="true"');
  if (form.as === 'a' && form.target) props.push(`target="${escaped(form.target)}"`);
  if (form.as === 'a' && form.rel) props.push(`rel="${escaped(form.rel)}"`);
  if (form.editable && form.accept) props.push(`accept="${escaped(form.accept)}"`);
  if (form.editable && form.editLabel) props.push(`edit-label="${escaped(form.editLabel)}"`);
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
.control-section { width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: .5rem .85rem; }
.control-section summary { cursor: pointer; font-weight: 600; font-size: .9rem; padding: .25rem 0; }
.control-section summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.control-section[open] summary { margin-bottom: .75rem; }
.control-section .control-grid + .checkbox-grid { margin-top: .75rem; }
.control-section input:disabled { opacity: .5; cursor: not-allowed; }
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
