"use client";

import { useEffect, useRef, useState } from "react";

import { gentleVibrate } from "@/lib/haptics";

import { BotanicalOrnament } from "./BotanicalOrnament";

type OpeningGateProps = {
  firstName: string;
  secondName: string;
  connector: string;
  displayDate: string;
  message: string;
  label: string;
  buttonLabel: string;
};

export function OpeningGate({
  firstName,
  secondName,
  connector,
  displayDate,
  message,
  label,
  buttonLabel,
}: OpeningGateProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const invitationPageRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    try {
      dialog.show();
      invitationPageRef.current = document.querySelector<HTMLElement>(
        '[data-testid="invitation-page"]',
      );
      invitationPageRef.current?.setAttribute("inert", "");
      document.documentElement.classList.add("gate-active");
      dialog.querySelector<HTMLButtonElement>("button")?.focus();
    } catch {
      return;
    }

    return () => {
      invitationPageRef.current?.removeAttribute("inert");
      document.documentElement.classList.remove("gate-active");
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  function finishOpening() {
    dialogRef.current?.close();
    invitationPageRef.current?.removeAttribute("inert");
    document.documentElement.classList.remove("gate-active");
  }

  function openInvitation() {
    if (isClosing) {
      return;
    }

    gentleVibrate(8);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishOpening();
      return;
    }

    setIsClosing(true);
    closeTimerRef.current = setTimeout(finishOpening, 620);
  }

  return (
    <dialog
      ref={dialogRef}
      className="opening-gate"
      data-testid="opening-gate"
      data-closing={isClosing || undefined}
      aria-labelledby="opening-title"
      aria-describedby="opening-description"
      aria-modal="true"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="gate-frame" aria-hidden="true" />
      <BotanicalOrnament
        className="gate-botanical gate-botanical-left"
        loading="eager"
        variant="foreground"
      />
      <BotanicalOrnament
        className="gate-botanical gate-botanical-right"
        loading="eager"
        variant="mid"
      />
      <div className="gate-light" aria-hidden="true" />
      <div className="gate-content">
        <p className="gate-label">{label}</p>
        <h1
          id="opening-title"
          className={`gate-names${secondName ? "" : " single-name"}`}
        >
          <span>{firstName}</span>
          {secondName ? (
            <>
              <i>{connector}</i>
              <span>{secondName}</span>
            </>
          ) : null}
        </h1>
        <p id="opening-description" className="gate-message">{message}</p>
        <button type="button" className="gate-button" onClick={openInvitation}>
          <span>{buttonLabel}</span>
          <b aria-hidden="true">→</b>
        </button>
        <p className="gate-date">{displayDate}</p>
      </div>
    </dialog>
  );
}
