<template>
  <PokoWindow
    ref="windowRef"
    :model-value="modelValue"
    title="Poko Terminal"
    subtitle="Linux command line for PokoOS"
    icon=">_"
    :z-index="zIndex"
    :active="active"
    :initial-bounds="{ top: 96, left: 64, width: 540, height: 536 }"
    @update:model-value="$emit('update:modelValue', $event)"
    @focus="$emit('focus')"
  >
    <div class="terminal-app grid h-full grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
      <div
        ref="contentRef"
        class="terminal-output min-h-0 overflow-y-auto px-4 py-3 text-[0.86rem] leading-6"
        @click="focusCommandInput"
      >
        <div
          v-for="(line, index) in terminalLines"
          :key="`${line.kind}-${index}`"
          class="terminal-line"
          :class="line.kind === 'command' ? 'mt-2' : ''"
        >
          <template v-if="line.kind === 'command'">
            <span class="terminal-prompt">{{ prompt }} </span>
            <span>{{ line.command }}</span>
          </template>

          <template v-else-if="line.kind === 'group'">
            <span
              v-for="item in line.lines"
              :key="item"
              class="block whitespace-pre-wrap"
              :class="toneClass(line.tone)"
            >
              {{ item }}
            </span>
          </template>

          <template v-else-if="line.kind === 'link'">
            <a
              class="inline-flex items-center gap-2 rounded-md border border-current/25 px-2 py-0.5 text-[0.82rem] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-current/40"
              :href="line.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{{ line.label }}</span>
              <span class="text-current/45">{{ line.text }}</span>
            </a>
          </template>

          <template v-else-if="line.kind === 'empty'">
            <br />
          </template>

          <template v-else>
            <span :class="toneClass(line.tone)">{{ line.text }}</span>
          </template>
        </div>
      </div>

      <form class="terminal-input-row border-t px-4 py-2" @submit.prevent="runCommand">
        <label class="flex items-center gap-2 text-sm">
          <span class="terminal-prompt shrink-0">{{ prompt }}</span>
          <input
            ref="inputRef"
            v-model="cmdInput"
            class="min-w-0 flex-1 border-0 bg-transparent text-current outline-none placeholder:text-current/32"
            type="text"
            aria-label="Terminal command"
            autocomplete="off"
            spellcheck="false"
            placeholder="try neofetch"
            @keydown.enter.prevent="runCommand"
            @keydown="handleKeydown"
          />
        </label>
      </form>
    </div>
  </PokoWindow>
</template>

<script setup lang="ts">
import type { TerminalTone } from "~/composables/useTerminal";

defineProps<{
  modelValue: boolean;
  zIndex: number;
  active: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
  focus: [];
}>();

const windowRef = ref<{ restore: (focus?: () => void) => void } | null>(null);
const {
  prompt,
  cmdInput,
  inputRef,
  contentRef,
  terminalLines,
  runCommand,
  focusCommandInput,
  scrollToBottom,
  handleKeydown
} = useTerminal();

function toneClass(tone?: TerminalTone) {
  return {
    "text-current/58": tone === "muted",
    "text-[var(--terminal-accent)]": tone === "accent",
    "text-emerald-300": tone === "success",
    "text-amber-300": tone === "warning",
    "text-rose-300": tone === "error"
  };
}

onMounted(() => {
  nextTick(() => {
    focusCommandInput();
    scrollToBottom();
  });
});

defineExpose({
  restore: () => windowRef.value?.restore(focusCommandInput)
});
</script>

<style scoped>
.terminal-app {
  --terminal-accent: var(--accent);
  color: var(--terminal-text);
  background:
    linear-gradient(rgba(255, 255, 255, 0.035) 50%, rgba(0, 0, 0, 0.04) 50%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.32));
  background-size: 100% 4px, 100% 100%;
}

.terminal-output {
  font-family: "Courier New", monospace;
}

.terminal-input-row {
  border-color: var(--glass-border);
  background: rgba(0, 0, 0, 0.16);
}

.terminal-prompt {
  color: var(--terminal-accent);
  font-weight: 800;
}

.terminal-line {
  min-height: 1.5rem;
}

@media (max-width: 520px) {
  .terminal-output {
    padding: 0.7rem 0.85rem;
    font-size: 0.78rem;
    line-height: 1.35rem;
  }

  .terminal-input-row {
    padding: 0.6rem 0.85rem;
  }
}
</style>
