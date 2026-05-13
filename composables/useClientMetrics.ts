import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const cpuLoad = ref(8);
const memoryPercent = ref(0);
const memoryLabel = ref("sampling");
const memoryHint = ref("page metrics");
const cores = ref(1);
const uptime = ref(0);
const startedAt = ref(0);
let timer: ReturnType<typeof window.setInterval> | undefined;
let lastTick = 0;
let longTaskBudget = 0;
let observer: PerformanceObserver | undefined;
let subscribers = 0;

const processes = computed(() => [
  { pid: 101, name: "poko-terminal", cpu: Math.max(1, Math.round(cpuLoad.value * 0.2)), mem: 42 },
  { pid: 202, name: "vrchat-gallery", cpu: Math.max(1, Math.round(cpuLoad.value * 0.16)), mem: 74 },
  { pid: 303, name: "page-monitor", cpu: Math.max(1, Math.round(cpuLoad.value * 0.1)), mem: Math.max(18, Math.round(memoryPercent.value * 0.8)) },
  { pid: 404, name: "poko-topbar", cpu: 1, mem: 14 }
]);

function updateMemory() {
  const performanceMemory = (performance as Performance & {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }).memory;

  if (performanceMemory) {
    const used = performanceMemory.usedJSHeapSize / 1024 / 1024;
    const limit = performanceMemory.jsHeapSizeLimit / 1024 / 1024;

    memoryPercent.value = Math.min(100, Math.round((used / limit) * 100));
    memoryLabel.value = `${Math.round(used)}MB`;
    memoryHint.value = `${Math.round(limit)}MB JS heap limit`;
    return;
  }

  memoryPercent.value = 28;
  memoryLabel.value = "API off";
  memoryHint.value = "JS heap API unavailable";
}

function sample() {
  const now = performance.now();
  const delay = lastTick ? Math.max(0, now - lastTick - 1000) : 0;
  const eventLoopLoad = Math.min(65, Math.round(delay * 2.5));
  const longTaskLoad = Math.min(80, Math.round(longTaskBudget / 12));
  const idleWave = Math.round(4 + Math.abs(Math.sin(now / 1800)) * 7);

  cpuLoad.value = Math.min(100, Math.max(2, eventLoopLoad + longTaskLoad + idleWave));
  uptime.value = Math.floor((now - startedAt.value) / 1000);
  lastTick = now;
  longTaskBudget = 0;
  updateMemory();
}

function startMetrics() {
  if (timer) {
    return;
  }

  cores.value = navigator.hardwareConcurrency || 1;
  startedAt.value = performance.now();
  lastTick = startedAt.value;

  if ("PerformanceObserver" in window) {
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longTaskBudget += entry.duration;
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      observer = undefined;
    }
  }

  sample();
  timer = window.setInterval(sample, 1000);
}

function stopMetrics() {
  if (timer) {
    window.clearInterval(timer);
    timer = undefined;
  }

  observer?.disconnect();
  observer = undefined;
}

export function useClientMetrics() {
  onMounted(() => {
    subscribers += 1;
    startMetrics();
  });

  onBeforeUnmount(() => {
    subscribers = Math.max(0, subscribers - 1);

    if (subscribers === 0) {
      stopMetrics();
    }
  });

  return {
    cpuLoad,
    memoryPercent,
    memoryLabel,
    memoryHint,
    cores,
    uptime,
    processes
  };
}
