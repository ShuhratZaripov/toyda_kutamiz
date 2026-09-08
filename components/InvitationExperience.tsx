"use client";

import { useEffect, useState } from "react";

import {
  getInvitationContent,
  getInvitationSchedule,
  wedding,
  type WeddingLocaleContent,
} from "@/config/wedding";
import {
  decodePersonalization,
  type Personalization,
} from "@/lib/personalization";

import { BotanicalOrnament } from "./BotanicalOrnament";
import { OpeningGate } from "./OpeningGate";
import { ScrollReveals } from "./ScrollReveals";

type PersonalizationState =
  | { status: "pending" }
  | { status: "ready"; value: Personalization }
  | { status: "invalid" };

export function InvitationExperience() {
  const [personalization, setPersonalization] =
    useState<PersonalizationState>({ status: "pending" });

  useEffect(() => {
    function readFragment() {
      const value = decodePersonalization(window.location.hash.slice(1));

      setPersonalization(value ? { status: "ready", value } : { status: "invalid" });
    }

    readFragment();
    window.addEventListener("hashchange", readFragment);
    return () => window.removeEventListener("hashchange", readFragment);
  }, []);

  const language =
    personalization.status === "ready" ? personalization.value.language : "uz";
  const invitationEvent =
    personalization.status === "ready"
      ? personalization.value.invitationEvent
      : "wedding";
  const content = getInvitationContent(language, invitationEvent);
  const invitationSchedule = getInvitationSchedule(language, invitationEvent);

  useEffect(() => {
    document.documentElement.lang = content.htmlLang;
    document.title = content.browserTitle;
  }, [content.browserTitle, content.htmlLang]);

  return (
    <>
      {personalization.status === "pending" ? null : (
        <OpeningGate
          key={`${language}-${invitationEvent}`}
          firstName={content.couple.firstName}
          secondName={content.couple.secondName}
          connector={content.couple.connector}
          displayDate={content.displayDate}
          message={content.openingMessage}
          label={content.openingLabel}
          buttonLabel={content.openingButton}
        />
      )}
      <main className="invitation-page" data-testid="invitation-page">
        <section className="hero" data-testid="hero" aria-labelledby="couple-names">
          <div className="hero-frame" aria-hidden="true" />
          <div className="hero-light" aria-hidden="true" />
          <div className="hero-garden-shadow" aria-hidden="true" />
          <BotanicalOrnament
            className="hero-botanical hero-botanical-back"
            depth={0.24}
            loading="eager"
            variant="mid"
          />
          <BotanicalOrnament
            className="hero-botanical hero-botanical-front"
            depth={0.56}
            loading="eager"
            variant="foreground"
          />
          <p className="eyebrow hero-item hero-label">{content.heroLabel}</p>
          <h1
            id="couple-names"
            className={`couple-names hero-item hero-names${content.singleName ? " single-name" : ""}`}
            aria-label={content.couple.displayName}
          >
            <span>{content.couple.firstName}</span>
            {content.singleName ? null : (
              <>
                <i>{content.couple.connector}</i>
                <span>{content.couple.secondName}</span>
              </>
            )}
          </h1>
          <div className="date-lockup hero-item hero-date">
            <span aria-hidden="true" />
            {invitationEvent === "both" ? (
              <b className="combined-date">{content.displayDate}</b>
            ) : (
              <time dateTime={invitationSchedule[0].dateTime}>{content.displayDate}</time>
            )}
            <span aria-hidden="true" />
          </div>
          <div className="scroll-cue hero-item hero-cue" aria-hidden="true">
            <span />
          </div>
        </section>

        <section className="personal-section" aria-labelledby="invitation-heading">
          <div className="section-light personal-light" aria-hidden="true" />
          <BotanicalOrnament
            className="section-botanical personal-botanical-back"
            depth={0.28}
            variant="mid"
            reveal
          />
          <BotanicalOrnament
            className="section-botanical personal-botanical-front"
            depth={0.62}
            variant="foreground"
            reveal
          />
          <div
            className="section-inner invitation-inner"
            data-reveal
            data-reveal-milestone="recipient"
          >
            <p className="section-number" aria-hidden="true">01</p>
            <p className="eyebrow">{content.personalLabel}</p>
            <h2 id="invitation-heading">{content.invitationTitle}</h2>
            <div className="fine-ornament" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
            <PersonalizedGreeting
              personalization={personalization}
              content={content}
            />
          </div>
        </section>

        <section className="details-section" aria-labelledby="details-heading">
          <div className="details-garden-shadow" aria-hidden="true" />
          <BotanicalOrnament
            className="detail-botanical detail-botanical-top"
            depth={0.42}
            variant="foreground"
            reveal
          />
          <BotanicalOrnament
            className="detail-botanical detail-botanical-low"
            depth={0.24}
            variant="mid"
            reveal
          />
          <div className="section-inner">
            <p className="section-number section-number-light" aria-hidden="true">02</p>
            <p className="eyebrow eyebrow-light">{content.detailsLabel}</p>
            <h2 id="details-heading" className="visually-hidden">{content.detailsTitle}</h2>
            <div className={`details-grid${invitationEvent === "both" ? " details-grid-both" : ""}`}>
              {invitationSchedule.map((event, index) => (
                <article
                  key={event.event}
                  className="detail-block"
                  data-testid={`event-detail-${event.event}`}
                  data-reveal
                  data-reveal-delay={index > 0 ? "1" : undefined}
                  data-reveal-milestone={index === 0 ? "details" : undefined}
                >
                  <p className="detail-kicker">
                    {invitationEvent === "both" ? event.label : content.dateTimeLabel}
                  </p>
                  <h3>
                    <time dateTime={event.dateTime}>{event.displayDate}</time>
                  </h3>
                  <p className="detail-value">{content.startTimeLabel} {wedding.startTime}</p>
                </article>
              ))}
              <article className="detail-block venue-block" data-reveal data-reveal-delay="1">
                <p className="detail-kicker">{content.venueLabel}</p>
                <h3>{content.venueName}</h3>
                <address>{content.fullAddress}</address>
              </article>
            </div>
          </div>
        </section>

        <section className="map-section" aria-labelledby="map-heading">
          <div className="section-light map-light" aria-hidden="true" />
          <BotanicalOrnament
            className="map-botanical map-botanical-back"
            depth={0.24}
            variant="mid"
            reveal
          />
          <BotanicalOrnament
            className="map-botanical map-botanical-front"
            depth={0.58}
            variant="foreground"
            reveal
          />
          <div className="section-inner map-inner" data-reveal>
            <p className="eyebrow">{content.mapLabel}</p>
            <h2 id="map-heading">{content.mapTitle}</h2>
            <nav className="map-actions" data-testid="map-actions" aria-label={content.mapAriaLabel}>
              <a
                data-testid="map-google"
                href={wedding.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Google Maps</span>
                <b aria-hidden="true">↗</b>
              </a>
              <a
                data-testid="map-yandex"
                href={wedding.yandexMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Yandex Maps</span>
                <b aria-hidden="true">↗</b>
              </a>
            </nav>
          </div>
        </section>

        <footer className="closing">
          <div className="section-light closing-light" aria-hidden="true" />
          <div className="closing-garden-shadow" aria-hidden="true" />
          <BotanicalOrnament
            className="closing-botanical closing-botanical-edge-left"
            depth={0.35}
            variant="foreground"
            reveal
          />
          <BotanicalOrnament
            className="closing-botanical closing-botanical-edge-right"
            depth={0.35}
            variant="mid"
            reveal
          />
          <div
            className="section-inner closing-inner"
            data-reveal
            data-reveal-milestone="closing"
          >
            <p>{content.closingMessage}</p>
            <span className="closing-date">{content.displayDate}</span>
          </div>
        </footer>
      </main>
      {personalization.status === "pending" ? null : <ScrollReveals />}
    </>
  );
}

function PersonalizedGreeting({
  personalization,
  content,
}: {
  personalization: PersonalizationState;
  content: WeddingLocaleContent;
}) {
  if (personalization.status === "ready") {
    const { addressForm, displayName } = personalization.value;

    return (
      <p className="invitation-copy" data-testid="invitation-copy" aria-live="polite">
        <span className="honorific">{content.honorifics[addressForm]}</span>
        <strong className="recipient-line">
          <span data-testid="recipient-name">{displayName}</span>
        </strong>
        <span className="invitation-sentence">{content.invitationSentences[addressForm]}</span>
      </p>
    );
  }

  if (personalization.status === "invalid") {
    return (
      <div className="personalization-message" data-testid="personalization-error" role="status">
        <strong>{content.notFoundTitle}</strong>
        <p>{content.notFoundMessage}</p>
        {wedding.brokenLinkContact ? <p>{wedding.brokenLinkContact}</p> : null}
      </div>
    );
  }

  return (
    <div className="personalization-message personalization-pending" aria-live="polite">
      <strong>{content.pendingTitle}</strong>
      <p>{content.pendingMessage}</p>
    </div>
  );
}
