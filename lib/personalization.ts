export const ADDRESS_FORMS = ["singular", "plural"] as const;
export const LANGUAGES = ["uz", "uz-cyrl", "ru", "en"] as const;
export const INVITATION_EVENTS = ["wedding", "qizlar-bazmi"] as const;

export type AddressForm = (typeof ADDRESS_FORMS)[number];
export type Language = (typeof LANGUAGES)[number];
export type InvitationEvent = (typeof INVITATION_EVENTS)[number];

export const MAX_NAME_LENGTH = 120;

export type Personalization = Readonly<{
  displayName: string;
  addressForm: AddressForm;
  language: Language;
  invitationEvent: InvitationEvent;
}>;

const MODE_BY_ADDRESS_FORM: Readonly<Record<AddressForm, number>> = {
  singular: 0,
  plural: 1,
};

const MODE_BY_LANGUAGE: Readonly<Record<Language, number>> = {
  uz: 0,
  "uz-cyrl": 1,
  ru: 2,
  en: 3,
};

const MODE_BY_INVITATION_EVENT: Readonly<Record<InvitationEvent, number>> = {
  wedding: 0,
  "qizlar-bazmi": 1,
};

const FORMAT_FAMILY = 0xf0;
const FORMAT_FAMILY_MASK = 0xf0;
const FORMAT_VERSION_MASK = 0x0f;
const CURRENT_FORMAT_VERSION = 1;
const CURRENT_FORMAT_BYTE = FORMAT_FAMILY | CURRENT_FORMAT_VERSION;
const CURRENT_HEADER_LENGTH = 3;
const MIN_HEADER_LENGTH = 3;
const MAX_HEADER_LENGTH = 32;
const LANGUAGE_SHIFT = 1;
const LANGUAGE_MASK = 0b111;
const INVITATION_EVENT_SHIFT = 4;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const UNSAFE_NAME_CHARACTERS =
  /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u2028-\u202e\u2066-\u2069]/u;
const MAX_PAYLOAD_BYTES = 2 + MAX_HEADER_LENGTH + MAX_NAME_LENGTH * 4;
const MAX_CODE_LENGTH = Math.ceil((MAX_PAYLOAD_BYTES * 4) / 3);
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

function isAddressForm(value: unknown): value is AddressForm {
  return value === "singular" || value === "plural";
}

function isLanguage(value: unknown): value is Language {
  return (
    value === "uz" ||
    value === "uz-cyrl" ||
    value === "ru" ||
    value === "en"
  );
}

function isInvitationEvent(value: unknown): value is InvitationEvent {
  return value === "wedding" || value === "qizlar-bazmi";
}

function isValidName(value: string): boolean {
  return (
    value.length > 0 &&
    value.trim() === value &&
    [...value].length <= MAX_NAME_LENGTH &&
    !UNSAFE_NAME_CHARACTERS.test(value)
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  if (
    value.length === 0 ||
    value.length > MAX_CODE_LENGTH ||
    value.length % 4 === 1 ||
    !BASE64URL_PATTERN.test(value)
  ) {
    return null;
  }

  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  try {
    const binary = atob(paddedBase64);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );

    return bytesToBase64Url(bytes) === value ? bytes : null;
  } catch {
    return null;
  }
}

export function encodePersonalization(
  value: Personalization,
): string | null {
  if (
    value === null ||
    typeof value !== "object" ||
    typeof value.displayName !== "string" ||
    !isAddressForm(value.addressForm) ||
    !isLanguage(value.language) ||
    !isInvitationEvent(value.invitationEvent)
  ) {
    return null;
  }

  const displayName = value.displayName.trim();

  if (!isValidName(displayName)) {
    return null;
  }

  const nameBytes = utf8Encoder.encode(displayName);

  try {
    if (utf8Decoder.decode(nameBytes) !== displayName) {
      return null;
    }
  } catch {
    return null;
  }

  const payload = new Uint8Array(
    2 + CURRENT_HEADER_LENGTH + nameBytes.length,
  );
  payload[0] = CURRENT_FORMAT_BYTE;
  payload[1] = CURRENT_HEADER_LENGTH;
  payload[2] =
    (MODE_BY_INVITATION_EVENT[value.invitationEvent] <<
      INVITATION_EVENT_SHIFT) |
    (MODE_BY_LANGUAGE[value.language] << LANGUAGE_SHIFT) |
    MODE_BY_ADDRESS_FORM[value.addressForm];
  payload.set(nameBytes, 2 + CURRENT_HEADER_LENGTH);

  return bytesToBase64Url(payload);
}

export function decodePersonalization(value: unknown): Personalization | null {
  if (typeof value !== "string") {
    return null;
  }

  const payload = base64UrlToBytes(value);

  if (payload === null || payload.length < 2) {
    return null;
  }

  const firstByte = payload[0];

  if ((firstByte & FORMAT_FAMILY_MASK) !== FORMAT_FAMILY) {
    return null;
  }

  const version = firstByte & FORMAT_VERSION_MASK;
  const headerLength = payload[1];

  if (
    version === 0 ||
    headerLength < MIN_HEADER_LENGTH ||
    headerLength > MAX_HEADER_LENGTH
  ) {
    return null;
  }

  const nameOffset = 2 + headerLength;

  if (nameOffset >= payload.length) {
    return null;
  }

  const coreOptions = payload[2];
  const addressForm = ADDRESS_FORMS[coreOptions & 1];
  const languageCode =
    (coreOptions >> LANGUAGE_SHIFT) & LANGUAGE_MASK;
  const language = LANGUAGES[languageCode] ?? "uz";
  const invitationEvent =
    INVITATION_EVENTS[(coreOptions >> INVITATION_EVENT_SHIFT) & 1];

  try {
    const displayName = utf8Decoder.decode(payload.subarray(nameOffset)).trim();

    if (!isValidName(displayName)) {
      return null;
    }

    return { displayName, addressForm, language, invitationEvent };
  } catch {
    return null;
  }
}
