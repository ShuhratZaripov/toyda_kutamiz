"use client";

import { useEffect } from "react";

import { gentleVibrateOnce } from "@/lib/haptics";

const REVEAL_ITEM_SELECTOR = [
  "[data-reveal-item]",
  ".section-number",
  ".eyebrow",
  ".fine-ornament",
  ".honorific",
  ".recipient-line",
  ".invitation-sentence",
  ".personalization-message",
  ".detail-kicker",
  "h2:not(.visually-hidden)",
  "h3",
  ".detail-value",
  "address",
  ".map-actions > a",
  ".closing-inner > p",
  ".closing-date",
].join(",");

const variants = [
  "recipient",
  "heading",
  "copy",
  "action",
  "ornament",
  "label",
] as const;

type RevealVariant = (typeof variants)[number];
type HapticMilestone = "recipient" | "details" | "closing";

const hapticDurations: Readonly<Record<HapticMilestone, number>> = {
  recipient: 8,
  details: 7,
  closing: 9,
};

function isRevealVariant(value: string | undefined): value is RevealVariant {
  return variants.some((variant) => variant === value);
}

function revealVariant(element: HTMLElement): RevealVariant {
  const declaredVariant = element.dataset.revealVariant;

  if (isRevealVariant(declaredVariant)) {
    return declaredVariant;
  }

  if (element.matches(".recipient-line")) {
    return "recipient";
  }

  if (element.matches(".map-actions > a")) {
    return "action";
  }

  if (element.matches(".section-number, .fine-ornament")) {
    return "ornament";
  }

  if (element.matches(".eyebrow, .detail-kicker")) {
    return "label";
  }

  if (element.matches("h2, h3")) {
    return "heading";
  }

  return "copy";
}

function inferredMilestone(element: HTMLElement): HapticMilestone | null {
  const declaredMilestone = element.dataset.revealMilestone;

  if (
    declaredMilestone === "recipient" ||
    declaredMilestone === "details" ||
    declaredMilestone === "closing"
  ) {
    return declaredMilestone;
  }

  if (element.matches(".invitation-inner")) {
    return "recipient";
  }

  if (element.matches(".detail-block:not(.venue-block)")) {
    return "details";
  }

  if (element.matches(".closing-inner")) {
    return "closing";
  }

  return null;
}

export function ScrollReveals() {
  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const limitContinuousParallax = window.matchMedia(
      "(pointer: coarse), (max-width: 47.99rem)",
    ).matches;

    if (motionPreference.matches || !("IntersectionObserver" in window)) {
      return;
    }

    const groups = [
      ...document.querySelectorAll<HTMLElement>("[data-reveal]"),
    ];
    const parallaxLayers = [
      ...document.querySelectorAll<HTMLElement>("[data-depth]"),
    ].flatMap((element) => {
      const depth = Number.parseFloat(element.dataset.depth ?? "");

      return Number.isFinite(depth) ? [{ depth, element }] : [];
    });
    const itemsByGroup = new Map<HTMLElement, HTMLElement[]>();
    const configuredItems = new Set<HTMLElement>();
    const pendingFrames = new Set<number>();
    const pendingHaptics = new Map<HapticMilestone, number>();
    const visibleMilestones = new Map<
      HapticMilestone,
      { group: HTMLElement; itemCount: number }
    >();
    const completedMilestones = new Set<HapticMilestone>();
    const intersectingMilestoneGroups = new Set<HTMLElement>();
    const gate = document.querySelector<HTMLDialogElement>(".opening-gate");
    const gateButton = gate?.querySelector<HTMLElement>(".gate-button");
    let invitationOpened = false;
    let parallaxFrame: number | null = null;
    const activeParallaxLayers = new Set<(typeof parallaxLayers)[number]>();
    const parallaxLayerByElement = new Map(
      parallaxLayers.map((layer) => [layer.element, layer]),
    );

    function updateParallax() {
      parallaxFrame = null;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const viewportCenter = viewportHeight / 2;

      const measurements = [...activeParallaxLayers].map(
        ({ depth, element }) => ({
          bounds: element.getBoundingClientRect(),
          depth,
          element,
        }),
      );

      for (const { bounds, depth, element } of measurements) {
        const distanceFromCenter =
          (viewportCenter - (bounds.top + bounds.height / 2)) / viewportHeight;
        const offset = Math.max(
          -16,
          Math.min(16, distanceFromCenter * depth * 48),
        );

        element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      }
    }

    function requestParallaxUpdate() {
      if (parallaxFrame === null) {
        parallaxFrame = window.requestAnimationFrame(updateParallax);
      }
    }

    function stopParallax() {
      window.removeEventListener("scroll", requestParallaxUpdate);
      window.removeEventListener("resize", requestParallaxUpdate);

      if (parallaxFrame !== null) {
        window.cancelAnimationFrame(parallaxFrame);
        parallaxFrame = null;
      }

      for (const { element } of parallaxLayers) {
        element.classList.remove("botanical-active");
        element.style.removeProperty("--parallax-y");
      }
    }

    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const layer = parallaxLayerByElement.get(element);

          if (!layer) {
            continue;
          }

          if (entry.isIntersecting) {
            element.classList.add("botanical-active");

            if (!limitContinuousParallax) {
              activeParallaxLayers.add(layer);
            }
          } else {
            activeParallaxLayers.delete(layer);
            element.classList.remove("botanical-active");
          }
        }

        if (!limitContinuousParallax) {
          requestParallaxUpdate();
        }
      },
      { rootMargin: "30% 0px" },
    );

    for (const { element } of parallaxLayers) {
      parallaxObserver.observe(element);
    }

    if (!limitContinuousParallax) {
      window.addEventListener("scroll", requestParallaxUpdate, {
        passive: true,
      });
      window.addEventListener("resize", requestParallaxUpdate, {
        passive: true,
      });
      requestParallaxUpdate();
    }

    function scheduleMilestone(milestone: HapticMilestone) {
      const visibleMilestone = visibleMilestones.get(milestone);

      if (
        !invitationOpened ||
        !visibleMilestone ||
        pendingHaptics.has(milestone) ||
        completedMilestones.has(milestone) ||
        motionPreference.matches ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      const settleDelay =
        1_050 +
        Math.min(Math.max(visibleMilestone.itemCount - 1, 0), 8) * 70;
      const timeout = window.setTimeout(() => {
        pendingHaptics.delete(milestone);
        const currentMilestone = visibleMilestones.get(milestone);

        if (
          invitationOpened &&
          !motionPreference.matches &&
          document.visibilityState === "visible" &&
          currentMilestone?.group === visibleMilestone.group
        ) {
          gentleVibrateOnce(
            `invitation-${milestone}`,
            hapticDurations[milestone],
          );
          completedMilestones.add(milestone);
        }
      }, settleDelay);

      pendingHaptics.set(milestone, timeout);
    }

    function cancelPendingMilestone(milestone: HapticMilestone) {
      const timeout = pendingHaptics.get(milestone);

      if (timeout === undefined) {
        return;
      }

      window.clearTimeout(timeout);
      pendingHaptics.delete(milestone);
    }

    function markMilestoneVisible(
      milestone: HapticMilestone,
      group: HTMLElement,
    ) {
      if (milestone === "recipient" && !group.querySelector(".recipient-line")) {
        return;
      }

      visibleMilestones.set(milestone, {
        group,
        itemCount: itemsByGroup.get(group)?.length ?? 1,
      });
      scheduleMilestone(milestone);
    }

    function markMilestoneHidden(
      milestone: HapticMilestone,
      group: HTMLElement,
    ) {
      if (visibleMilestones.get(milestone)?.group !== group) {
        return;
      }

      visibleMilestones.delete(milestone);
      cancelPendingMilestone(milestone);
    }

    function revealLateItem(item: HTMLElement) {
      const frame = window.requestAnimationFrame(() => {
        pendingFrames.delete(frame);
        item.classList.add("reveal-item-visible");
      });

      pendingFrames.add(frame);
    }

    function configureItems(group: HTMLElement) {
      const items = [
        ...group.querySelectorAll<HTMLElement>(REVEAL_ITEM_SELECTOR),
      ].filter((item) => item.closest<HTMLElement>("[data-reveal]") === group);

      itemsByGroup.set(group, items);

      items.forEach((item, index) => {
        if (configuredItems.has(item)) {
          return;
        }

        configuredItems.add(item);
        const order = item.dataset.revealOrder ?? String(index);
        const variant = revealVariant(item);

        item.dataset.revealOrder = order;
        item.dataset.revealVariant = variant;
        item.style.setProperty("--reveal-order", order);
        item.classList.add(
          "reveal-item",
          "reveal-item-pending",
          `reveal-${variant}`,
        );

        if (group.classList.contains("reveal-visible")) {
          revealLateItem(item);
        }
      });

      const milestone = inferredMilestone(group);

      if (milestone && intersectingMilestoneGroups.has(group)) {
        markMilestoneVisible(milestone, group);
      }
    }

    for (const group of groups) {
      const groupDelay = group.dataset.revealDelay ?? "0";

      group.classList.add("reveal-group", "reveal-pending");
      group.dataset.revealState = "pending";
      group.style.setProperty("--reveal-group-delay", groupDelay);

      if (group.matches("svg, [class*='botanical']")) {
        group.classList.add("reveal-botanical");
      }

      configureItems(group);
    }

    document.documentElement.classList.add("reveal-enhanced");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const group = entry.target as HTMLElement;

          group.classList.add("reveal-visible");
          group.dataset.revealState = "visible";

          for (const item of itemsByGroup.get(group) ?? []) {
            item.classList.add("reveal-item-visible");
          }

          observer.unobserve(group);
        }
      },
      { rootMargin: "0px 0px -12%", threshold: 0.16 },
    );

    for (const group of groups) {
      observer.observe(group);
    }

    const milestoneObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const group = entry.target as HTMLElement;
          const milestone = inferredMilestone(group);

          if (!milestone) {
            continue;
          }

          if (entry.isIntersecting) {
            intersectingMilestoneGroups.add(group);
            markMilestoneVisible(milestone, group);
          } else {
            intersectingMilestoneGroups.delete(group);
            markMilestoneHidden(milestone, group);
          }
        }
      },
      { rootMargin: "0px 0px -12%", threshold: 0.16 },
    );

    for (const group of groups) {
      if (inferredMilestone(group)) {
        milestoneObserver.observe(group);
      }
    }

    const mutationObserver = new MutationObserver((records) => {
      const affectedGroups = new Set<HTMLElement>();

      for (const record of records) {
        const target = record.target;

        if (target instanceof Element) {
          const group = target.closest<HTMLElement>("[data-reveal]");

          if (group) {
            affectedGroups.add(group);
          }
        }
      }

      for (const group of affectedGroups) {
        configureItems(group);
      }
    });

    for (const group of groups) {
      mutationObserver.observe(group, { childList: true, subtree: true });
    }

    function markInvitationOpened() {
      invitationOpened = true;

      for (const milestone of visibleMilestones.keys()) {
        scheduleMilestone(milestone);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") {
        for (const milestone of pendingHaptics.keys()) {
          cancelPendingMilestone(milestone);
        }

        return;
      }

      for (const milestone of visibleMilestones.keys()) {
        scheduleMilestone(milestone);
      }
    }

    gateButton?.addEventListener("click", markInvitationOpened, { once: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function disableMotion() {
      observer.disconnect();
      milestoneObserver.disconnect();
      parallaxObserver.disconnect();
      mutationObserver.disconnect();
      stopParallax();

      for (const timeout of pendingHaptics.values()) {
        window.clearTimeout(timeout);
      }

      pendingHaptics.clear();

      for (const group of groups) {
        group.classList.add("reveal-visible");
        group.dataset.revealState = "visible";
      }

      for (const item of configuredItems) {
        item.classList.add("reveal-item-visible");
      }
    }

    motionPreference.addEventListener("change", disableMotion, { once: true });

    return () => {
      observer.disconnect();
      milestoneObserver.disconnect();
      parallaxObserver.disconnect();
      mutationObserver.disconnect();
      gateButton?.removeEventListener("click", markInvitationOpened);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionPreference.removeEventListener("change", disableMotion);
      document.documentElement.classList.remove("reveal-enhanced");
      stopParallax();

      for (const frame of pendingFrames) {
        window.cancelAnimationFrame(frame);
      }

      for (const timeout of pendingHaptics.values()) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  return null;
}
