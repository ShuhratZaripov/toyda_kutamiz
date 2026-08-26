"use client";

import { useMemo, useRef, useState } from "react";

import { BotanicalOrnament } from "@/components/BotanicalOrnament";
import { getInvitationContent } from "@/config/wedding";
import { gentleVibrate } from "@/lib/haptics";
import {
  encodePersonalization,
  MAX_NAME_LENGTH,
  type AddressForm,
  type InvitationEvent,
  type Language,
} from "@/lib/personalization";

export function InviteGenerator() {
  const [addressForm, setAddressForm] = useState<AddressForm>("singular");
  const [language, setLanguage] = useState<Language>("uz");
  const [invitationEvent, setInvitationEvent] =
    useState<InvitationEvent>("wedding");
  const [displayName, setDisplayName] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const outputRef = useRef<HTMLInputElement>(null);
  const trimmedName = displayName.trim();
  const nameLength = [...trimmedName].length;
  const token = useMemo(
    () =>
      encodePersonalization({
        displayName,
        addressForm,
        language,
        invitationEvent,
      }),
    [addressForm, displayName, invitationEvent, language],
  );
  const content = getInvitationContent(language, invitationEvent);
  const generatedUrl = token
    ? `${new URL("/", window.location.href).href}#${token}`
    : "";

  function updateMode(value: AddressForm) {
    setAddressForm(value);
    setCopyStatus("");
  }

  function updateLanguage(value: Language) {
    setLanguage(value);
    setCopyStatus("");
  }

  function updateEvent(value: InvitationEvent) {
    setInvitationEvent(value);
    setCopyStatus("");
  }

  function updateName(value: string) {
    setDisplayName(value);
    setCopyStatus("");
  }

  async function copyLink() {
    if (!generatedUrl) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedUrl);
      } else {
        outputRef.current?.select();
        if (!document.execCommand("copy")) {
          throw new Error("copy failed");
        }
      }

      setCopyStatus("Havola nusxalandi");
      gentleVibrate(6);
    } catch {
      setCopyStatus("Havolani nusxalab bo‘lmadi. Uni qo‘lda belgilang.");
    }
  }

  return (
    <main className="generator-page" data-testid="generator-page">
      <BotanicalOrnament className="generator-botanical generator-botanical-left" />
      <BotanicalOrnament className="generator-botanical generator-botanical-right" />
      <header className="generator-heading">
        <p className="eyebrow">Shaxsiy havola</p>
        <h1>Taklifnoma havolasini yarating</h1>
        <p>
          Mehmon nomi faqat yaratilgan havolaning <code>#</code> belgisidan keyingi qismiga yoziladi.
        </p>
      </header>

      <div className="generator-layout">
        <form className="generator-form" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="mode-fieldset">
            <legend>Tadbir</legend>
            <div className="mode-options">
              <label>
                <input
                  data-testid="event-wedding"
                  type="radio"
                  name="invitation-event"
                  value="wedding"
                  checked={invitationEvent === "wedding"}
                  onChange={() => updateEvent("wedding")}
                />
                <span>Nikoh to‘yi - 14-sentabr</span>
              </label>
              <label>
                <input
                  data-testid="event-qizlar-bazmi"
                  type="radio"
                  name="invitation-event"
                  value="qizlar-bazmi"
                  checked={invitationEvent === "qizlar-bazmi"}
                  onChange={() => updateEvent("qizlar-bazmi")}
                />
                <span>Qizlar bazmi - 13-sentabr</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="mode-fieldset">
            <legend>Taklifnoma tili</legend>
            <div className="mode-options">
              <label>
                <input
                  data-testid="language-uz"
                  type="radio"
                  name="language"
                  value="uz"
                  checked={language === "uz"}
                  onChange={() => updateLanguage("uz")}
                />
                <span>O‘zbekcha</span>
              </label>
              <label>
                <input
                  data-testid="language-uz-cyrl"
                  type="radio"
                  name="language"
                  value="uz-cyrl"
                  checked={language === "uz-cyrl"}
                  onChange={() => updateLanguage("uz-cyrl")}
                />
                <span>Ўзбекча</span>
              </label>
              <label>
                <input
                  data-testid="language-ru"
                  type="radio"
                  name="language"
                  value="ru"
                  checked={language === "ru"}
                  onChange={() => updateLanguage("ru")}
                />
                <span>Русский</span>
              </label>
              <label>
                <input
                  data-testid="language-en"
                  type="radio"
                  name="language"
                  value="en"
                  checked={language === "en"}
                  onChange={() => updateLanguage("en")}
                />
                <span>English</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="mode-fieldset">
            <legend>Murojaat shakli</legend>
            <div className="mode-options">
              <label>
                <input
                  data-testid="mode-singular"
                  type="radio"
                  name="address-form"
                  value="singular"
                  checked={addressForm === "singular"}
                  onChange={() => updateMode("singular")}
                />
                <span>Bitta mehmon</span>
              </label>
              <label>
                <input
                  data-testid="mode-plural"
                  type="radio"
                  name="address-form"
                  value="plural"
                  checked={addressForm === "plural"}
                  onChange={() => updateMode("plural")}
                />
                <span>Juftlik yoki guruh</span>
              </label>
            </div>
          </fieldset>

          <div className="generator-field">
            <label htmlFor="guest-name">Mehmon nomi</label>
            <input
              id="guest-name"
              data-testid="guest-name-input"
              type="text"
              value={displayName}
              maxLength={MAX_NAME_LENGTH * 2}
              autoComplete="off"
              spellCheck="false"
              aria-describedby="name-guidance"
              onChange={(event) => updateName(event.currentTarget.value)}
              placeholder={
                language === "uz-cyrl"
                  ? "Масалан, Азизбек ва Малика"
                  : language === "ru"
                    ? "Например, Александр и Мария"
                    : language === "en"
                      ? "For example, Alexander and Maria"
                      : "Masalan, Azizbek va Malika"
              }
            />
            <p id="name-guidance">
              Bo‘sh joylar chetidan olib tashlanadi. Ko‘pi bilan {MAX_NAME_LENGTH} belgi.
            </p>
            {displayName && !token ? (
              <p className="generator-error" role="alert">
                {nameLength > MAX_NAME_LENGTH
                  ? `Mehmon nomi ${MAX_NAME_LENGTH} belgidan oshmasin.`
                  : "Mehmon nomini kiriting."}
              </p>
            ) : null}
          </div>

          <div className="generator-output">
            <span id="generated-link-label" className="generator-output-label">
              Yaratilgan havola
            </span>
            {generatedUrl ? (
              <a
                id="generated-link"
                className="generated-url"
                data-testid="generated-url"
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-labelledby="generated-link-label"
              >
                {generatedUrl}
              </a>
            ) : (
              <span
                id="generated-link"
                className="generated-url generated-url-empty"
                data-testid="generated-url"
                aria-labelledby="generated-link-label"
              >
                Mehmon nomini kiriting
              </span>
            )}
            <input
              ref={outputRef}
              className="visually-hidden"
              type="text"
              value={generatedUrl}
              readOnly
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              data-testid="copy-link"
              type="button"
              disabled={!generatedUrl}
              onClick={copyLink}
            >
              <span>Havolani nusxalash</span>
              <b aria-hidden="true">→</b>
            </button>
            <p className="copy-status" role="status" aria-live="polite">{copyStatus}</p>
          </div>
        </form>

        <aside className="generator-preview" aria-labelledby="preview-heading">
          <p className="eyebrow">Jonli ko‘rinish</p>
          <h2 id="preview-heading">Taklifnoma salomlashuvi</h2>
          <div data-testid="live-preview" aria-live="polite">
            {token ? (
              <p>
                <span>{content.honorifics[addressForm]}</span>
                <strong>{trimmedName},</strong>
                <span>{content.invitationSentences[addressForm]}</span>
              </p>
            ) : (
              <p className="preview-empty">Mehmon nomini kiriting.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
