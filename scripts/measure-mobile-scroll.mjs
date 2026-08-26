import { Buffer } from "node:buffer";

import { chromium } from "@playwright/test";

const baseURL = process.env.PERF_BASE_URL ?? "http://127.0.0.1:4173";
const cpuRate = Number(process.env.PERF_CPU_RATE ?? 4);
const scrollDurationMs = Number(process.env.PERF_SCROLL_MS ?? 12_000);
const assertPerformance = ["1", "true"].includes(
  (process.env.PERF_ASSERT ?? "").toLowerCase(),
);

if (!Number.isFinite(cpuRate) || cpuRate < 1) {
  throw new Error("PERF_CPU_RATE must be a number greater than or equal to 1");
}

if (!Number.isFinite(scrollDurationMs) || scrollDurationMs < 1_000) {
  throw new Error("PERF_SCROLL_MS must be a number greater than or equal to 1000");
}

const invitationURL = new URL("/", baseURL);
const invitationPayload = Buffer.concat([
  Buffer.from([0]),
  Buffer.from("Scroll Performance Test", "utf8"),
]).toString("base64url");
invitationURL.hash = invitationPayload;

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 3.5,
    hasTouch: true,
    isMobile: true,
    locale: "uz-UZ",
    timezoneId: "Asia/Tashkent",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await page.addInitScript(() => {
    window.__scrollPerfLongTasks = [];

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__scrollPerfLongTasks.push({
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // Long Task Timing is not available in every browser mode.
    }
  });

  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });

  await page.goto(invitationURL.href, { waitUntil: "load" });
  await page.getByRole("button", { name: "Taklifnomani ochish" }).click();
  await page.getByTestId("opening-gate").waitFor({ state: "hidden" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((image) => image.loading !== "lazy" && !image.complete)
        .map(
          (image) =>
            new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            }),
        ),
    );
  });

  const before = await cdp.send("Performance.getMetrics");

  const scroll = await page.evaluate(async (durationMs) => {
    window.__scrollPerfLongTasks.length = 0;
    window.scrollTo({ behavior: "instant", top: 0 });

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const frameDeltas = [];
    const startedAt = await new Promise((resolve) =>
      requestAnimationFrame(resolve),
    );
    let previousFrame = startedAt;

    await new Promise((resolve) => {
      function frame(now) {
        frameDeltas.push(now - previousFrame);
        previousFrame = now;

        const progress = Math.min((now - startedAt) / durationMs, 1);
        window.scrollTo({ behavior: "instant", top: maxScroll * progress });

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          requestAnimationFrame(resolve);
        }
      }

      requestAnimationFrame(frame);
    });

    return {
      actualDurationMs: performance.now() - startedAt,
      finalScrollY: window.scrollY,
      frameDeltas,
      longTasks: window.__scrollPerfLongTasks,
      maxScroll,
    };
  }, scrollDurationMs);

  const after = await cdp.send("Performance.getMetrics");
  const metricsBefore = Object.fromEntries(
    before.metrics.map(({ name, value }) => [name, value]),
  );
  const metricDeltas = Object.fromEntries(
    [
      "TaskDuration",
      "ScriptDuration",
      "LayoutDuration",
      "RecalcStyleDuration",
      "LayoutCount",
      "RecalcStyleCount",
      "JSHeapUsedSize",
    ].map((name) => [
      name,
      (after.metrics.find((metric) => metric.name === name)?.value ?? 0) -
        (metricsBefore[name] ?? 0),
    ]),
  );

  const sortedDeltas = [...scroll.frameDeltas].sort((left, right) => left - right);
  const sum = scroll.frameDeltas.reduce((total, value) => total + value, 0);
  const percentile = (fraction) =>
    sortedDeltas[Math.min(sortedDeltas.length - 1, Math.floor(sortedDeltas.length * fraction))];
  const missedFrames = (budgetMs) =>
    scroll.frameDeltas.reduce(
      (total, delta) => total + Math.max(0, Math.round(delta / budgetMs) - 1),
      0,
    );
  const longTaskDurationMs = scroll.longTasks.reduce(
    (total, task) => total + task.duration,
    0,
  );
  const p50Ms = percentile(0.5);
  const cadenceHz = p50Ms < 12.5 ? 120 : 60;
  const cadenceMisses = missedFrames(1_000 / cadenceHz);
  const frameMissLimit = Math.max(
    12,
    Math.ceil(
      scroll.frameDeltas.length * 0.02 * Math.max(1, cpuRate / 4),
    ),
  );
  const budgets = {
    frameMisses: frameMissLimit,
    longTasks: 0,
    recalcStyleCount: 1_800,
    recalcStyleDurationSeconds: round(0.12 * cpuRate),
    taskDurationSeconds: round(0.4 * cpuRate),
  };
  const failures = [
    Math.abs(scroll.finalScrollY - scroll.maxScroll) <= 1
      ? null
      : `full scroll: expected ${round(scroll.maxScroll)}px, reached ${round(scroll.finalScrollY)}px`,
    scroll.longTasks.length <= budgets.longTasks
      ? null
      : `long tasks: expected ${budgets.longTasks}, got ${scroll.longTasks.length}`,
    metricDeltas.RecalcStyleCount <= budgets.recalcStyleCount
      ? null
      : `RecalcStyleCount: expected <= ${budgets.recalcStyleCount}, got ${round(metricDeltas.RecalcStyleCount)}`,
    metricDeltas.RecalcStyleDuration <= budgets.recalcStyleDurationSeconds
      ? null
      : `RecalcStyleDuration: expected <= ${budgets.recalcStyleDurationSeconds}s, got ${round(metricDeltas.RecalcStyleDuration)}s`,
    metricDeltas.TaskDuration <= budgets.taskDurationSeconds
      ? null
      : `TaskDuration: expected <= ${budgets.taskDurationSeconds}s, got ${round(metricDeltas.TaskDuration)}s`,
    cadenceMisses <= budgets.frameMisses
      ? null
      : `frame misses at measured ${cadenceHz} Hz cadence: expected <= ${budgets.frameMisses}, got ${cadenceMisses}`,
  ].filter(Boolean);

  const report = {
    target: {
      cpuRate,
      device: "Galaxy S24 Ultra-like",
      deviceScaleFactor: 3.5,
      scrollDurationMs,
      viewport: "412x915",
    },
    url: invitationURL.href,
    scroll: {
      actualDurationMs: round(scroll.actualDurationMs),
      distancePx: round(scroll.maxScroll),
      finalScrollY: round(scroll.finalScrollY),
    },
    frames: {
      samples: scroll.frameDeltas.length,
      effectiveFps: round(1_000 / (sum / scroll.frameDeltas.length)),
      averageMs: round(sum / scroll.frameDeltas.length),
      p50Ms: round(p50Ms),
      p95Ms: round(percentile(0.95)),
      p99Ms: round(percentile(0.99)),
      maxMs: round(sortedDeltas.at(-1)),
      measuredCadenceHz: cadenceHz,
      estimatedCadenceMisses: cadenceMisses,
      over8_33ms: scroll.frameDeltas.filter((delta) => delta > 8.33).length,
      over16_67ms: scroll.frameDeltas.filter((delta) => delta > 16.67).length,
      estimatedMissedAt60Hz: missedFrames(1_000 / 60),
      estimatedMissedAt120Hz: missedFrames(1_000 / 120),
    },
    longTasks: {
      count: scroll.longTasks.length,
      totalDurationMs: round(longTaskDurationMs),
      maxDurationMs: round(
        Math.max(0, ...scroll.longTasks.map((task) => task.duration)),
      ),
    },
    performanceMetricDeltas: Object.fromEntries(
      Object.entries(metricDeltas).map(([name, value]) => [name, round(value)]),
    ),
    regressionCheck: {
      asserted: assertPerformance,
      budgets,
      passed: failures.length === 0,
    },
    note:
      "rAF cadence is browser- and host-dependent. The 120 Hz budget estimate does not replace profiling on a physical phone.",
  };

  console.log(JSON.stringify(report, null, 2));

  if (assertPerformance && failures.length > 0) {
    console.error(
      `\nPerformance regression check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
    );
    process.exitCode = 1;
  } else if (assertPerformance) {
    console.log("\nPerformance regression check passed.");
  }

  await context.close();
} finally {
  await browser.close();
}

function round(value) {
  return Number(value.toFixed(3));
}
