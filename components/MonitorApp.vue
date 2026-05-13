<template>
  <PokoWindow
    ref="windowRef"
    :model-value="modelValue"
    title="System Monitor"
    subtitle="page CPU and JS heap metrics"
    icon="MON"
    :z-index="zIndex"
    :active="active"
    :initial-bounds="{ top: 468, left: 764, width: 460, height: 286 }"
    @update:model-value="$emit('update:modelValue', $event)"
    @focus="$emit('focus')"
  >
    <div class="h-full overflow-y-auto p-4">
      <div class="mb-4 grid grid-cols-2 gap-3">
        <div class="monitor-card">
          <div class="label">Page CPU</div>
          <div class="value">{{ cpuLoad }}%</div>
          <div class="bar"><span :style="{ width: `${cpuLoad}%` }" /></div>
          <div class="hint">main-thread load, {{ cores }} logical cores</div>
        </div>

        <div class="monitor-card">
          <div class="label">Page RAM</div>
          <div class="value">{{ memoryLabel }}</div>
          <div class="bar"><span :style="{ width: `${memoryPercent}%` }" /></div>
          <div class="hint">{{ memoryHint }}</div>
        </div>
      </div>

      <div class="monitor-card">
        <div class="mb-2 flex items-center justify-between">
          <span class="label">process list</span>
          <span class="text-xs text-current/55">uptime {{ uptime }}s</span>
        </div>
        <div class="process-row header">
          <span>PID</span>
          <span>APP</span>
          <span>CPU</span>
          <span>MEM</span>
        </div>
        <div v-for="process in processes" :key="process.pid" class="process-row">
          <span>{{ process.pid }}</span>
          <span>{{ process.name }}</span>
          <span>{{ process.cpu }}%</span>
          <span>{{ process.mem }}MB</span>
        </div>
      </div>
    </div>
  </PokoWindow>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  zIndex: number;
  active: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
  focus: [];
}>();

const windowRef = ref<{ restore: () => void } | null>(null);
const { cpuLoad, cores, uptime, memoryPercent, memoryLabel, memoryHint, processes } = useClientMetrics();

defineExpose({
  restore: () => windowRef.value?.restore()
});
</script>

<style scoped>
.monitor-card {
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.9rem;
}

.label {
  color: currentColor;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.58;
}

.value {
  margin: 0.3rem 0;
  font-size: 1.7rem;
  font-weight: 800;
}

.hint {
  margin-top: 0.4rem;
  color: currentColor;
  font-size: 0.72rem;
  opacity: 0.55;
}

.bar {
  height: 0.55rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
}

.bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), rgba(255, 255, 255, 0.86));
  transition: width 400ms ease;
}

.process-row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) 4rem 4rem;
  gap: 0.75rem;
  border-top: 1px solid var(--glass-border);
  padding: 0.55rem 0;
  font-family: "Courier New", monospace;
  font-size: 0.78rem;
}

.process-row.header {
  color: var(--accent);
  font-weight: 800;
}

@media (max-width: 520px) {
  .mb-4.grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .monitor-card {
    border-radius: 0.8rem;
    padding: 0.75rem;
  }

  .value {
    font-size: 1.45rem;
  }

  .process-row {
    grid-template-columns: 2.35rem minmax(0, 1fr) 3rem 3.2rem;
    gap: 0.45rem;
    font-size: 0.68rem;
  }
}
</style>
