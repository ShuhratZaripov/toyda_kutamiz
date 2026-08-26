import { Buffer } from "node:buffer";
import {
  expect,
  test,
  type Locator,
  type Page,
} from "@playwright/test";

import { wedding } from "../config/wedding";

const guests = {
  singular: "Sinov Mehmoni O‘ktamjon",
  plural: "Sinov Oilasi va ularning aziz farzandlari",
} as const;

const invitationSentence = {
  singular:
    "sizni nikoh to‘yimiz munosabati bilan bo‘lib o‘tadigan tantanali oqshomimizga taklif qilamiz.",
  plural:
    "sizlarni nikoh to‘yimiz munosabati bilan bo‘lib o‘tadigan tantanali oqshomimizga taklif qilamiz.",
} as const;

const russianGuests = {
  singular: "Евгений Белов",
  plural: "Семья Каримовых",
} as const;

const russianInvitationSentence = {
  singular:
    "приглашаем Вас на торжественный вечер по случаю нашей свадьбы.",
  plural:
    "приглашаем вас на торжественный вечер по случаю нашей свадьбы.",
} as const;

const uzbekCyrillicGuest = "Олимжон";
const englishGuest = "The Karimov Family";

const compatibilityTokens = [
  {
    token: "8QMAAABWZXJzaW9uIEJpcg",
    displayName: "Version Bir",
    language: "uz-Latn",
    buttonName: "Taklifnomani ochish",
    grammar: "sizni",
  },
  {
    token: "8QMCAYDQmtC40YDQuNC70Lsg0JzQtdKz0LzQvtC9",
    displayName: "Кирилл Меҳмон",
    language: "uz-Cyrl",
    buttonName: "Таклифномани очиш",
    grammar: "сизни",
  },
  {
    token: "8gQHAAB_RnV0dXJlIEZhbWlseQ",
    displayName: "Future Family",
    language: "en",
    buttonName: "Open the invitation",
    grammar: "Dear guests",
  },
  {
    token: "8QMOAABGYWxsYmFjayBHdWVzdA",
    displayName: "Fallback Guest",
    language: "uz-Latn",
    buttonName: "Taklifnomani ochish",
    grammar: "sizni",
  },
  {
    token: "8QMRAABRaXpsYXIgTWVobW9ubGFyaQ",
    displayName: "Qizlar Mehmonlari",
    language: "uz-Latn",
    buttonName: "Taklifnomani ochish",
    grammar: "qizlar bazmiga",
  },
] as const;

type AddressForm = keyof typeof guests;
type Language = "uz" | "uz-cyrl" | "ru" | "en";
type InvitationEvent = "wedding" | "qizlar-bazmi";

type MotionState = {
  opacity: number;
  translateY: number;
  scale: number;
  blur: number;
  filter: string;
  duration: number;
  delay: number;
};

function encodeToken(mode: number, displayName: string) {
  return Buffer.concat([
    Buffer.from([0xf1, 3, mode, 0, 0]),
    Buffer.from(displayName.trim(), "utf8"),
  ]).toString("base64url");
}

function invitationUrl(baseURL: string, form: AddressForm, name = guests[form]) {
  const mode = form === "singular" ? 0 : 1;
  return `${new URL("/", baseURL).href}#${encodeToken(mode, name)}`;
}

async function outputValue(output: Locator) {
  return output.evaluate((element) => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      return element.value.trim();
    }

    return element.textContent?.trim() ?? "";
  });
}

async function motionState(locator: Locator): Promise<MotionState> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const matrix =
      style.transform === "none"
        ? new DOMMatrix()
        : new DOMMatrix(style.transform);
    const blur = style.filter.match(/blur\(([\d.]+)px\)/)?.[1];
    const milliseconds = (value: string) =>
      Math.max(
        0,
        ...value.split(",").map((part) => {
          const duration = part.trim();
          return duration.endsWith("ms")
            ? Number.parseFloat(duration)
            : Number.parseFloat(duration) * 1_000;
        }),
      );

    return {
      opacity: Number.parseFloat(style.opacity),
      translateY: matrix.m42,
      scale: Math.hypot(matrix.a, matrix.b),
      blur: blur ? Number.parseFloat(blur) : 0,
      filter: style.filter,
      duration: Math.max(
        milliseconds(style.transitionDuration),
        milliseconds(style.animationDuration),
      ),
      delay: Math.max(
        milliseconds(style.transitionDelay),
        milliseconds(style.animationDelay),
      ),
    };
  });
}

async function expectSettledReveal(locator: Locator) {
  await expect
    .poll(async () => {
      const state = await motionState(locator);

      return (
        state.opacity > 0.98 &&
        Math.abs(state.translateY) <= 1 &&
        state.scale >= 0.995 &&
        state.scale <= 1.005 &&
        state.blur <= 0.1
      );
    })
    .toBe(true);
  const state = await motionState(locator);

  expect(Math.abs(state.translateY)).toBeLessThanOrEqual(1);
  expect(state.scale).toBeGreaterThanOrEqual(0.995);
  expect(state.scale).toBeLessThanOrEqual(1.005);
  expect(state.blur).toBeLessThanOrEqual(0.1);
}

async function readGeneratedUrl(page: Page) {
  const output = page.getByTestId("generated-url");
  await expect(output).toBeVisible();
  await expect.poll(() => outputValue(output)).toMatch(/^https?:\/\//);
  return outputValue(output);
}

async function generateInvitation(
  page: Page,
  form: AddressForm,
  displayName: string = guests[form],
  language: Language = "uz",
  invitationEvent: InvitationEvent = "wedding",
) {
  await page.goto("/invite/");
  await expect(page.getByTestId("generator-page")).toBeVisible();
  await expect(page.locator(".preview-signature")).toHaveCount(0);
  await page.getByTestId(`event-${invitationEvent}`).click();
  await page.getByTestId(`language-${language}`).click();
  await page
    .getByTestId(form === "singular" ? "mode-singular" : "mode-plural")
    .click();
  await page.getByTestId("guest-name-input").fill(displayName);
  await expect(page.getByTestId("live-preview")).toContainText(displayName);

  const url = await readGeneratedUrl(page);
  const parsed = new URL(url);
  expect(parsed.pathname).toBe("/");
  expect(parsed.search).toBe("");
  expect(parsed.hash.slice(1)).toMatch(/^[A-Za-z0-9_-]+$/);

  return url;
}

async function openInvitation(
  page: Page,
  url: string,
  buttonName = "Taklifnomani ochish",
) {
  const response = await page.goto(url);
  expect(response?.status()).toBe(200);

  const gate = page.getByTestId("opening-gate");
  await expect(gate).toBeVisible();
  await gate
    .getByRole("button", { name: buttonName })
    .click();
  await expect(gate).toBeHidden();
  await expect(page.getByTestId("invitation-page")).toBeVisible();
}

async function tabTo(page: Page, testId: string, key = "Tab") {
  for (let index = 0; index < 20; index += 1) {
    await page.keyboard.press(key);
    if (
      (await page.evaluate(() =>
        document.activeElement?.getAttribute("data-testid"),
      )) === testId
    ) {
      return;
    }
  }

  throw new Error(`Keyboard focus did not reach ${testId}`);
}

async function tabToLocator(page: Page, locator: Locator) {
  for (let index = 0; index < 10; index += 1) {
    if (await locator.evaluate((element) => element === document.activeElement)) {
      return;
    }
    await page.keyboard.press("Tab");
  }

  throw new Error("Keyboard focus did not reach the expected control");
}

async function expectVisibleFocus(locator: Locator) {
  await expect(locator).toBeFocused();
  const style = await locator.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      outline:
        computed.outlineStyle !== "none" &&
        Number.parseFloat(computed.outlineWidth) >= 1 &&
        computed.outlineColor !== "transparent",
      shadow: computed.boxShadow !== "none",
    };
  });

  expect(
    style.outline || style.shadow,
    "Focused control needs a visible outline or focus ring",
  ).toBe(true);
}

async function expectViewportCenteredNames(
  names: Locator,
  viewportWidth: number,
) {
  const firstName = names.locator(":scope > span").nth(0);
  const connector = names.locator(":scope > i");
  const secondName = names.locator(":scope > span").nth(1);

  await expect(firstName).toBeVisible();
  await expect(connector).toBeVisible();
  await expect(secondName).toBeVisible();

  const [firstBox, connectorBox, secondBox] = await Promise.all([
    firstName.boundingBox(),
    connector.boundingBox(),
    secondName.boundingBox(),
  ]);

  expect(firstBox).not.toBeNull();
  expect(connectorBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect.soft(
    Math.abs(connectorBox!.x + connectorBox!.width / 2 - viewportWidth / 2),
  ).toBeLessThanOrEqual(1);
  expect(firstBox!.x + firstBox!.width).toBeLessThanOrEqual(connectorBox!.x);
  expect(secondBox!.x).toBeGreaterThanOrEqual(
    connectorBox!.x + connectorBox!.width,
  );
}

test("generator starts empty, previews safely, and is noindex", async ({
  page,
}) => {
  const response = await page.goto("/invite/");

  expect(response?.status()).toBe(200);
  await expect(page.getByTestId("generator-page")).toBeVisible();
  await expect(page.getByTestId("guest-name-input")).toHaveValue("");
  await expect(page.getByTestId("live-preview")).toBeVisible();
  await expect(page.getByTestId("live-preview")).not.toContainText(
    guests.singular,
  );
  await expect(page.getByTestId("generated-url")).toHaveText(
    "Mehmon nomini kiriting",
  );
  await expect(page.getByTestId("generated-url")).not.toHaveAttribute("href");
  await expect(page.getByTestId("copy-link")).toBeDisabled();

  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/i);
  await expect(robots).toHaveAttribute("content", /nofollow/i);
});

test("generator creates and opens an exact singular invitation", async ({
  page,
}) => {
  const url = await generateInvitation(page, "singular");
  expect([
    ...Buffer.from(new URL(url).hash.slice(1), "base64url").subarray(0, 5),
  ]).toEqual([0xf1, 3, 0, 0, 0]);
  await openInvitation(page, url);

  await expect(page.getByTestId("recipient-name")).toHaveText(guests.singular);
  await expect(page.getByTestId("invitation-copy")).toContainText(
    invitationSentence.singular,
  );
  await expect(page.getByTestId("invitation-copy")).toContainText(/\bsizni\b/);
  await expect(page.getByTestId("invitation-copy")).not.toContainText(
    /\bsizlarni\b/,
  );

  const dateBlock = page.locator(".detail-block:not(.venue-block)");
  await expect(dateBlock.locator(":scope > *")).toHaveCount(3);
  await expect(dateBlock.locator(".detail-kicker")).toHaveText("Vaqt");
  await expect(dateBlock.locator("time")).toHaveText("2026-yil 14-sentabr");
  await expect(dateBlock.locator(".detail-value")).toHaveText("Soat 18:00");

  const heroDateStyle = await page.locator(".date-lockup time").evaluate((time) => {
    const style = getComputedStyle(time);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      fontWeight: Number.parseInt(style.fontWeight, 10),
    };
  });
  expect(heroDateStyle.fontSize).toBeGreaterThanOrEqual(13.5);
  expect(heroDateStyle.fontWeight).toBeGreaterThanOrEqual(600);
});

test("generator creates and opens an exact plural invitation", async ({
  page,
}) => {
  const url = await generateInvitation(page, "plural");
  await openInvitation(page, url);

  await expect(page.getByTestId("recipient-name")).toHaveText(guests.plural);
  await expect(page.getByTestId("invitation-copy")).toContainText(
    invitationSentence.plural,
  );
  await expect(page.getByTestId("invitation-copy")).toContainText(
    /\bsizlarni\b/,
  );
  await expect(page.getByTestId("invitation-copy")).not.toContainText(
    /\bsizni\b/,
  );
  await expect(page.locator("body")).not.toContainText(guests.singular);
});

test("generator creates a qizlar bazmi invitation for Zulayho alone", async ({
  page,
}) => {
  const qizlarGuests = "Qadrli dugonalar";
  const url = await generateInvitation(
    page,
    "plural",
    qizlarGuests,
    "uz",
    "qizlar-bazmi",
  );
  expect([
    ...Buffer.from(new URL(url).hash.slice(1), "base64url").subarray(0, 5),
  ]).toEqual([0xf1, 3, 0x11, 0, 0]);

  await page.goto(url);
  const gate = page.getByTestId("opening-gate");
  await expect(gate).toContainText("Qizlar bazmi");
  await expect(gate).toContainText("Zulayho");
  await expect(gate).not.toContainText("Usmon");
  await expect(gate).toContainText("13-sentabr, 2026-yil");
  await gate.getByRole("button", { name: "Taklifnomani ochish" }).click();
  await expect(gate).toBeHidden();

  await expect(page).toHaveTitle("Zulayho | Qizlar bazmi");
  await expect(page.getByTestId("hero")).toContainText("Zulayho");
  await expect(page.getByTestId("hero")).not.toContainText("Usmon");
  await expect(page.getByTestId("hero").locator("time")).toHaveAttribute(
    "datetime",
    /^2026-09-13T/,
  );
  await expect(page.getByTestId("recipient-name")).toHaveText(qizlarGuests);
  await expect(page.getByTestId("invitation-copy")).toContainText(
    "sizlarni qizlar bazmiga taklif qilamiz.",
  );
});

test("generator creates a Russian singular invitation with Cyrillic couple names", async ({
  page,
}) => {
  const url = await generateInvitation(
    page,
    "singular",
    russianGuests.singular,
    "ru",
  );
  expect([
    ...Buffer.from(new URL(url).hash.slice(1), "base64url").subarray(0, 5),
  ]).toEqual([0xf1, 3, 4, 0, 0]);

  await page.goto(url);
  const gate = page.getByTestId("opening-gate");
  await expect(gate).toContainText("Усмон");
  await expect(gate).toContainText("Зулайхо");
  await expect(gate.locator(".gate-names > i")).toHaveText("и");
  await expect(gate).not.toContainText("Usmon");
  await gate.getByRole("button", { name: "Открыть приглашение" }).click();
  await expect(gate).toBeHidden();

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page).toHaveTitle("Усмон и Зулайхо | Свадьба");
  await expect(page.getByTestId("hero")).toContainText("Усмон");
  await expect(page.getByTestId("hero")).toContainText("Зулайхо");
  await expect(page.getByTestId("recipient-name")).toHaveText(
    russianGuests.singular,
  );
  await expect(page.getByTestId("invitation-copy")).toContainText(
    "Дорогой гость",
  );
  await expect(page.getByTestId("invitation-copy")).toContainText(
    russianInvitationSentence.singular,
  );
  await expect(page.locator("body")).toContainText("Дата и время");
  await expect(page.locator("body")).toContainText("Открыть место на карте");
  await expect(page.locator("body")).toContainText("Тойхона «Oq qasr»");
  await expect(page.locator("body")).toContainText(
    "Республика Каракалпакстан, Берунийский район",
  );
});

test("generator creates a Russian plural invitation with explicit plural grammar", async ({
  page,
}) => {
  const url = await generateInvitation(
    page,
    "plural",
    russianGuests.plural,
    "ru",
  );
  expect([
    ...Buffer.from(new URL(url).hash.slice(1), "base64url").subarray(0, 5),
  ]).toEqual([0xf1, 3, 5, 0, 0]);
  await openInvitation(page, url, "Открыть приглашение");

  const copy = page.getByTestId("invitation-copy");
  await expect(page.getByTestId("recipient-name")).toHaveText(
    russianGuests.plural,
  );
  await expect(copy).toContainText("Дорогие гости");
  await expect(copy).toContainText(russianInvitationSentence.plural);
  await expect(copy).not.toContainText(russianInvitationSentence.singular);
  await expect(page.getByTestId("hero")).not.toContainText("Usmon");
  await expect(page.getByTestId("hero")).not.toContainText("Zulayho");
});

test("generator creates an Uzbek Cyrillic invitation", async ({ page }) => {
  const url = await generateInvitation(
    page,
    "singular",
    uzbekCyrillicGuest,
    "uz-cyrl",
  );
  expect([
    ...Buffer.from(new URL(url).hash.slice(1), "base64url").subarray(0, 5),
  ]).toEqual([0xf1, 3, 2, 0, 0]);
  await openInvitation(page, url, "Таклифномани очиш");

  await expect(page.locator("html")).toHaveAttribute("lang", "uz-Cyrl");
  await expect(page).toHaveTitle("Усмон ва Зулайхо | Никоҳ тўйи");
  await expect(page.locator("#couple-names")).toHaveAttribute(
    "aria-label",
    "Усмон ва Зулайхо",
  );
  await expect(page.getByTestId("recipient-name")).toHaveText(
    uzbekCyrillicGuest,
  );
  await expect(page.getByTestId("invitation-copy")).toContainText("сизни");
  await expect(page.getByTestId("invitation-copy")).not.toContainText(
    "сизларни",
  );
  await expect(page.locator("body")).toContainText("Сана ва вақт");
  await expect(page.locator("body")).toContainText("Оқ қаср тўйхонаси");
  await expect(page.locator("body")).toContainText(
    "Қорақалпоғистон Республикаси, Беруний тумани",
  );
});

test("generator creates an English invitation", async ({ page }) => {
  const url = await generateInvitation(page, "plural", englishGuest, "en");
  expect([
    ...Buffer.from(new URL(url).hash.slice(1), "base64url").subarray(0, 5),
  ]).toEqual([0xf1, 3, 7, 0, 0]);
  await openInvitation(page, url, "Open the invitation");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Usmon and Zulayho | Wedding");
  await expect(page.locator("#couple-names")).toHaveAttribute(
    "aria-label",
    "Usmon and Zulayho",
  );
  await expect(page.getByTestId("recipient-name")).toHaveText(englishGuest);
  await expect(page.getByTestId("invitation-copy")).toContainText(
    "Dear guests",
  );
  await expect(page.locator("body")).toContainText("Date and time");
  await expect(page.locator("body")).toContainText("Open the venue on a map");
  await expect(page.locator("body")).toContainText("Oq qasr Wedding Hall");
  await expect(page.locator("body")).toContainText(
    "Republic of Karakalpakstan, Beruniy District",
  );
});

test("keeps literal v1 tokens stable and tolerates future fields", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  for (const vector of compatibilityTokens) {
    const url = `${new URL("/", baseURL).href}#${vector.token}`;
    await page.goto("about:blank");
    await openInvitation(page, url, vector.buttonName);
    await expect(page.locator("html")).toHaveAttribute("lang", vector.language);
    await expect(page.getByTestId("recipient-name")).toHaveText(
      vector.displayName,
    );
    await expect(page.getByTestId("invitation-copy")).toContainText(
      vector.grammar,
    );
  }
});

test("keeps the recipient out of the path, query, metadata, and assets", async ({
  context,
  page,
}) => {
  const url = await generateInvitation(page, "singular");
  const response = await page.goto(url);
  const parsed = new URL(page.url());
  const staticHtml = await response!.text();
  const normalizedName = guests.singular
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const nameRepresentations = [
    guests.singular,
    encodeURIComponent(guests.singular),
    normalizedName,
    Buffer.from(guests.singular, "utf8").toString("base64"),
    Buffer.from(guests.singular, "utf8").toString("base64url"),
  ].filter(Boolean);

  expect(parsed.pathname).toBe("/");
  expect(parsed.search).toBe("");
  expect(staticHtml).not.toContain(guests.singular);
  const publicLocation = `${parsed.pathname}${parsed.search}`.toLowerCase();
  const head = await page.locator("head").innerHTML();

  expect(head).not.toMatch(/<meta[^>]+(?:property|name)=["'](?:og:|twitter:)/i);
  expect(head).not.toMatch(/<meta[^>]+name=["']description["']/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /nosnippet/i,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noimageindex/i,
  );

  for (const representation of nameRepresentations) {
    expect(publicLocation).not.toContain(representation.toLowerCase());
    expect(head).not.toContain(representation);
  }

  const assets = await page
    .locator('script[src], link[rel="stylesheet"][href]')
    .evaluateAll((elements) =>
      elements.map((element) =>
        element instanceof HTMLScriptElement
          ? element.src
          : (element as HTMLLinkElement).href,
      ),
    );
  expect(assets.length).toBeGreaterThan(0);

  for (const assetUrl of assets) {
    const asset = await context.request.get(assetUrl);
    const source = await asset.text();

    expect(asset.ok(), assetUrl).toBe(true);
    expect(new URL(assetUrl).pathname).not.toContain(guests.singular);
    expect(source, assetUrl).not.toContain(guests.singular);
    expect(source, assetUrl).not.toContain(guests.plural);
  }
});

test("generator is unlinked and copies the complete invitation URL", async ({
  context,
  page,
}) => {
  await page.goto("/");
  const generatorLinks = await page.locator("a[href]").evaluateAll((links) =>
    links.filter(
      (link) => new URL((link as HTMLAnchorElement).href).pathname === "/invite/",
    ).length,
  );
  expect(generatorLinks).toBe(0);

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { __copiedText?: string }).__copiedText = text;
        },
      },
    });
  });

  const url = await generateInvitation(page, "plural");
  const generatedLink = page.getByTestId("generated-url");
  await expect(generatedLink).toHaveJSProperty("tagName", "A");
  await expect(generatedLink).toHaveAttribute("href", url);
  await expect(generatedLink).toHaveAttribute("target", "_blank");
  await expect(generatedLink).toHaveAttribute(
    "rel",
    /\bnoopener\b.*\bnoreferrer\b/,
  );

  const openedPagePromise = context.waitForEvent("page");
  await generatedLink.click();
  const openedPage = await openedPagePromise;
  await openedPage.waitForLoadState("load");
  expect(openedPage.url()).toBe(url);
  await openedPage.close();

  await page.getByTestId("copy-link").click();
  await expect(page.getByRole("status")).toHaveText("Havola nusxalandi");
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __copiedText?: string }).__copiedText,
      ),
    )
    .toBe(url);
});

test("rejects malformed, unsafe, oversized, and obsolete-format fragments", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const invalidFragments = [
    "not*base64",
    Buffer.from([0, 0xc3, 0x28]).toString("base64url"),
    encodeToken(0, "Sinov\nMehmoni"),
    encodeToken(0, "Sinov\u202eMehmoni"),
    encodeToken(0, "N".repeat(2_000)),
    "AExlZ2FjeSBCaXI",
    "AQLQodC10LzRjNGPINCi0LXRgdGC0L7QstGL0YU",
    "8AMAAABJbnZhbGlk",
    "8QIAAA",
  ];

  for (const fragment of invalidFragments) {
    await page.goto(`/#${fragment}`);
    const response = await page.reload();
    expect(response?.status()).toBe(200);

    const gate = page.getByTestId("opening-gate");
    await expect(gate).toBeVisible();
    await gate
      .getByRole("button", { name: "Taklifnomani ochish" })
      .click();
    await expect(gate).toBeHidden();

    const error = page.getByTestId("personalization-error");
    await expect(error).toBeVisible();
    await expect(
      error.getByText("Taklifnoma topilmadi", { exact: true }),
    ).toBeVisible();
    await expect(error.locator("p")).not.toBeEmpty();
    await expect(page.locator("body")).not.toContainText(guests.singular);
    await expect(page.locator("body")).not.toContainText(guests.plural);
  }

  const missingResponse = await page.goto("/mavjud-emas");
  expect(missingResponse?.status()).toBe(404);
  await expect(page.getByTestId("not-found-state")).toContainText(
    "Taklifnoma topilmadi",
  );
  await expect(page.getByTestId("not-found-state")).toContainText(
    "Havola to‘liq va to‘g‘ri ekanini tekshiring.",
  );
});

test("map destinations are exact safe anchors", async ({ page, baseURL }) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await openInvitation(page, invitationUrl(baseURL, "singular"));
  const maps = [
    ["map-google", wedding.googleMapsUrl],
    ["map-yandex", wedding.yandexMapsUrl],
  ] as const;

  for (const [testId, expectedUrl] of maps) {
    const link = page.getByTestId(testId);
    await expect(link).toHaveJSProperty("tagName", "A");
    await expect(link).toHaveAttribute("href", expectedUrl);
    await expect(link).toHaveAttribute("target", "_blank");

    const rel = (await link.getAttribute("rel"))?.split(/\s+/) ?? [];
    expect(rel).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  }
});

test("desktop name connectors stay centered between asymmetric names", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  const viewport = { width: 1440, height: 900 };
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(viewport);
  await page.goto(invitationUrl(baseURL, "singular"));
  await page.evaluate(() => document.fonts.ready);

  const gate = page.getByTestId("opening-gate");
  await expect(gate).toBeVisible();
  await expect(gate.locator(".gate-monogram")).toHaveCount(0);
  await expectViewportCenteredNames(gate.locator(".gate-names"), viewport.width);

  await gate
    .getByRole("button", { name: "Taklifnomani ochish" })
    .click();
  await expect(gate).toBeHidden();
  await expectViewportCenteredNames(
    page.getByTestId("hero").locator(".couple-names"),
    viewport.width,
  );
  await expect(page.locator(".closing-monogram")).toHaveCount(0);
});

test("opening botanicals reveal without a delayed rotation snap", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(invitationUrl(baseURL, "singular"));

  const plants = page.locator(".gate-botanical");
  await expect(plants).toHaveCount(2);

  const animationState = await plants.evaluateAll((elements) =>
    elements.map((element) => {
      const animations = element.getAnimations() as CSSAnimation[];
      const motion = animations.find(({ animationName }) =>
        animationName.startsWith("gate-plant-"),
      );
      const reveal = animations.find(
        ({ animationName }) => animationName === "gate-plant-reveal",
      );

      if (!motion) {
        return null;
      }

      motion.pause();
      const delay = Number(motion.effect?.getTiming().delay ?? 0);
      motion.currentTime = Math.max(0, delay - 1);
      const beforeDelay = Number.parseFloat(getComputedStyle(element).rotate);
      motion.currentTime = delay + 1;
      const afterDelay = Number.parseFloat(getComputedStyle(element).rotate);

      let revealStartOpacity: number | null = null;
      let revealEndOpacity: number | null = null;

      if (reveal) {
        reveal.pause();
        const timing = reveal.effect?.getTiming();
        const revealDelay = Number(timing?.delay ?? 0);
        const revealDuration = Number(timing?.duration ?? 0);
        reveal.currentTime = revealDelay;
        revealStartOpacity = Number.parseFloat(getComputedStyle(element).opacity);
        reveal.currentTime = revealDelay + revealDuration;
        revealEndOpacity = Number.parseFloat(getComputedStyle(element).opacity);
      }

      return {
        beforeDelay,
        afterDelay,
        fill: motion.effect?.getTiming().fill,
        revealStartOpacity,
        revealEndOpacity,
      };
    }),
  );

  for (const state of animationState) {
    expect(state).not.toBeNull();
    expect(state!.fill).toBe("both");
    expect(Math.abs(state!.afterDelay - state!.beforeDelay)).toBeLessThan(0.1);
    expect(state!.revealStartOpacity).toBeLessThanOrEqual(0.02);
    expect(state!.revealEndOpacity).toBeGreaterThanOrEqual(0.4);
  }
});

test("one Back action leaves the invitation instead of dismissing its gate", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.goto("/invite/");
  await page.goto(invitationUrl(baseURL, "singular"));

  const gate = page.getByTestId("opening-gate");
  const invitation = page.getByTestId("invitation-page");
  await expect(gate).toBeVisible();
  await expect(invitation).toHaveAttribute("inert", "");
  expect(
    await gate.evaluate((element) => element.matches(":modal")),
  ).toBe(false);

  await page.keyboard.press("Escape");
  await expect(gate).toBeVisible();
  await expect(page).toHaveURL(invitationUrl(baseURL, "singular"));

  await page.goBack();
  await expect(page).toHaveURL(
    new URL("/invite/", baseURL).toString(),
  );
});

test("main botanicals keep a slow subtle breeze after settling", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.setViewportSize({ width: 384, height: 824 });
  await openInvitation(page, invitationUrl(baseURL, "singular"));

  const plants = [
    page.locator(".hero-botanical-front"),
    page.locator(".personal-botanical-front"),
  ];
  await plants[1].scrollIntoViewIfNeeded();
  await expect(plants[1]).toHaveClass(/botanical-active/);
  await expect(plants[1]).toHaveClass(/reveal-visible/);

  for (const plant of plants) {
    const motion = await plant.evaluate((element) => {
      const style = getComputedStyle(element);
      const breezeIndex = style.animationName
        .split(", ")
        .findIndex((name) => name === "botanical-breeze");
      const durations = style.animationDuration.split(", ");
      const iterations = style.animationIterationCount.split(", ");

      return {
        arc: Number.parseFloat(style.getPropertyValue("--breeze-arc")),
        breezeDuration: Number.parseFloat(durations[breezeIndex] ?? "0"),
        breezeIterations: iterations[breezeIndex] ?? "0",
      };
    });

    expect(motion.breezeDuration).toBeGreaterThanOrEqual(11);
    expect(motion.breezeDuration).toBeLessThanOrEqual(15);
    expect(motion.breezeIterations).toBe("infinite");
    expect(motion.arc).toBeGreaterThanOrEqual(1.05);
    expect(motion.arc).toBeLessThanOrEqual(1.4);
  }
});

test("desktop map controls are opaque and stay above botanicals", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openInvitation(page, invitationUrl(baseURL, "singular"));

  const mapActions = page.getByTestId("map-actions");
  await mapActions.scrollIntoViewIfNeeded();
  await expect(mapActions).toBeVisible();

  const layers = await page.evaluate(() => {
    const actionLayer = document.querySelector<HTMLElement>(".map-inner");
    const botanicals = [
      ...document.querySelectorAll<HTMLElement>(".map-botanical"),
    ];

    return {
      actionZIndex: Number.parseInt(
        actionLayer ? getComputedStyle(actionLayer).zIndex : "",
        10,
      ),
      botanicalLayers: botanicals.map((botanical) => ({
        pointerEvents: getComputedStyle(botanical).pointerEvents,
        zIndex: Number.parseInt(getComputedStyle(botanical).zIndex, 10),
      })),
    };
  });

  expect(layers.botanicalLayers).toHaveLength(2);
  for (const botanical of layers.botanicalLayers) {
    expect(botanical.pointerEvents).toBe("none");
    expect(layers.actionZIndex).toBeGreaterThan(botanical.zIndex);
  }

  for (const link of [
    page.getByTestId("map-google"),
    page.getByTestId("map-yandex"),
  ]) {
    const visual = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      const parts = style.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
      const box = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      );

      return {
        backgroundColor: style.backgroundColor,
        backgroundAlpha: parts.length === 4 ? parts[3] : 1,
        receivesPointer: hit === element || element.contains(hit),
      };
    });

    expect(visual.backgroundColor).not.toBe("transparent");
    expect(visual.backgroundAlpha).toBe(1);
    expect(visual.receivesPointer).toBe(true);
  }

  const [actionsBox, closingBotanicalBox] = await Promise.all([
    mapActions.boundingBox(),
    page.locator(".closing-botanical-edge-left").boundingBox(),
  ]);
  expect(actionsBox).not.toBeNull();
  expect(closingBotanicalBox).not.toBeNull();
  expect(closingBotanicalBox!.y).toBeGreaterThanOrEqual(
    actionsBox!.y + actionsBox!.height + 24,
  );
});

test("desktop closing botanical stays inside its dark section", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openInvitation(page, invitationUrl(baseURL, "singular"));

  const closing = page.locator(".closing");
  const botanicals = [
    page.locator(".closing-botanical-edge-left"),
    page.locator(".closing-botanical-edge-right"),
  ];
  await closing.scrollIntoViewIfNeeded();
  for (const botanical of botanicals) {
    await expect(botanical).toBeVisible();
  }

  const [closingBox, botanicalBoxes, overflow] = await Promise.all([
    closing.boundingBox(),
    Promise.all(botanicals.map((botanical) => botanical.boundingBox())),
    closing.evaluate((element) => getComputedStyle(element).overflowY),
  ]);

  expect(closingBox).not.toBeNull();
  const clipsAtClosingBorder = overflow === "hidden" || overflow === "clip";
  for (const botanicalBox of botanicalBoxes) {
    expect(botanicalBox).not.toBeNull();
    expect(botanicalBox!.width).toBeGreaterThan(0);
    expect(botanicalBox!.height).toBeGreaterThan(0);
    expect(botanicalBox!.y).toBeLessThan(
      closingBox!.y + closingBox!.height,
    );

    const startsInsideClosing = botanicalBox!.y >= closingBox!.y - 1;
    expect(
      startsInsideClosing || clipsAtClosingBorder,
      "Closing botanical must start below the dark section border or be clipped there",
    ).toBe(true);
  }
});

test("desktop closing botanicals frame the viewport edges and leave the copy clear", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  const viewport = { width: 1440, height: 900 };
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(viewport);
  await openInvitation(page, invitationUrl(baseURL, "singular"));

  const closing = page.locator(".closing");
  const leftBotanical = closing.locator(".closing-botanical-edge-left");
  const rightBotanical = closing.locator(".closing-botanical-edge-right");
  const centeredBotanical = closing.locator(".closing-botanical-embrace");
  const closingCopy = closing.locator(".closing-inner > p");
  const closingDate = closing.locator(".closing-date");
  await closing.scrollIntoViewIfNeeded();

  await expect(centeredBotanical).toHaveCount(0);
  await expect(leftBotanical).toBeVisible();
  await expect(rightBotanical).toBeVisible();
  await expect(closingCopy).toBeVisible();
  await expect(closingDate).toBeVisible();

  const layout = await page.evaluate(() => {
    const closingElement = document.querySelector<HTMLElement>(".closing");
    const copy = document.querySelector<HTMLElement>(".closing-inner > p");
    const date = document.querySelector<HTMLElement>(".closing-date");
    const left = document.querySelector<HTMLElement>(
      ".closing-botanical-edge-left",
    );
    const right = document.querySelector<HTMLElement>(
      ".closing-botanical-edge-right",
    );

    if (!closingElement || !copy || !date || !left || !right) {
      throw new Error("Desktop closing composition is incomplete");
    }

    const bounds = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();

      return {
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        top: box.top,
      };
    };
    const innerZIndex = Number.parseInt(
      getComputedStyle(copy.parentElement!).zIndex,
      10,
    );

    return {
      closing: bounds(closingElement),
      copy: bounds(copy),
      date: bounds(date),
      left: bounds(left),
      right: bounds(right),
      clipPaths: [left, right].map(
        (element) => getComputedStyle(element).clipPath,
      ),
      innerZIndex,
      botanicalZIndexes: [left, right].map((element) =>
        Number.parseInt(getComputedStyle(element).zIndex, 10),
      ),
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(layout.left.left).toBeLessThanOrEqual(viewport.width * 0.05);
  expect((layout.left.left + layout.left.right) / 2).toBeLessThan(
    viewport.width * 0.34,
  );
  expect(layout.right.right).toBeGreaterThanOrEqual(viewport.width * 0.95);
  expect((layout.right.left + layout.right.right) / 2).toBeGreaterThan(
    viewport.width * 0.66,
  );
  for (const clipPath of layout.clipPaths) {
    expect(clipPath).not.toBe("none");
  }

  for (const text of [layout.copy, layout.date]) {
    expect(text.left).toBeGreaterThanOrEqual(viewport.width * 0.2);
    expect(text.right).toBeLessThanOrEqual(viewport.width * 0.8);
    expect(text.top).toBeGreaterThanOrEqual(layout.closing.top);
    expect(text.bottom).toBeLessThanOrEqual(layout.closing.bottom);
  }

  for (const botanicalZIndex of layout.botanicalZIndexes) {
    expect(layout.innerZIndex).toBeGreaterThan(botanicalZIndex);
  }
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
});

test("Samsung S24 closing stays proportional and feathers its final canvas edge", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  const viewport = { width: 384, height: 824 };
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(viewport);
  await openInvitation(page, invitationUrl(baseURL, "singular"));
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );

  const closing = page.locator(".closing");
  const leftBotanical = page.locator(".closing-botanical-edge-left");
  const rightBotanical = page.locator(".closing-botanical-edge-right");
  const closingCopy = page.locator(".closing-inner > p");
  const closingDate = page.locator(".closing-date");
  await expect(page.locator(".closing-botanical-embrace")).toHaveCount(0);
  await expect(leftBotanical).toBeVisible();
  await expect(rightBotanical).toBeVisible();
  await expect(closingCopy).toBeVisible();
  await expect(closingDate).toBeVisible();

  const [
    closingBox,
    botanicalBoxes,
    copyBox,
    dateBox,
    botanicalStyles,
    readabilityVeil,
    layout,
  ] = await Promise.all([
    closing.boundingBox(),
    Promise.all([
      leftBotanical.boundingBox(),
      rightBotanical.boundingBox(),
    ]),
    closingCopy.boundingBox(),
    closingDate.boundingBox(),
    Promise.all(
      [leftBotanical, rightBotanical].map((botanical) =>
        botanical.evaluate((element) => {
          const style = getComputedStyle(element);

          return {
            clipPath: style.clipPath,
            masks: [style.maskImage, style.webkitMaskImage],
          };
        }),
      ),
    ),
    closing.locator(".closing-inner").evaluate((element) => {
      const style = getComputedStyle(element, "::before");

      return {
        backgroundImage: style.backgroundImage,
        content: style.content,
        inset: style.inset,
      };
    }),
    page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    })),
  ]);

  expect(closingBox).not.toBeNull();
  for (const botanicalBox of botanicalBoxes) {
    expect(botanicalBox).not.toBeNull();
  }
  expect(copyBox).not.toBeNull();
  expect(dateBox).not.toBeNull();
  expect(closingBox!.height).toBeGreaterThanOrEqual(viewport.height * 0.98);
  expect(closingBox!.height).toBeLessThanOrEqual(viewport.height * 1.02);
  expect(closingBox!.y + closingBox!.height).toBeCloseTo(viewport.height, 0);
  expect(botanicalStyles[0].clipPath).not.toBe("none");
  expect(botanicalStyles[1].clipPath).not.toBe("none");
  expect(botanicalStyles[0].clipPath).not.toBe(botanicalStyles[1].clipPath);
  expect(botanicalBoxes[0]!.x).toBeLessThan(
    botanicalBoxes[1]!.x - viewport.width * 0.6,
  );
  for (const botanicalStyle of botanicalStyles) {
    for (const mask of botanicalStyle.masks) {
      expect(mask).not.toBe("none");
      expect(mask).toContain("gradient(");
      expect(mask).toMatch(/rgba\(0, 0, 0, 0\) 100%\)\s*$/);
    }
  }
  for (const textBox of [copyBox!, dateBox!]) {
    expect(textBox.y).toBeGreaterThanOrEqual(0);
    expect(textBox.y + textBox.height).toBeLessThanOrEqual(viewport.height);
    expect(textBox.x).toBeGreaterThanOrEqual(0);
    expect(textBox.x + textBox.width).toBeLessThanOrEqual(viewport.width);
  }

  expect(readabilityVeil.content).not.toBe("none");
  expect(readabilityVeil.backgroundImage).toContain("radial-gradient(");
  expect(readabilityVeil.inset).not.toBe("auto");

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
});

test("mobile detail botanical feathers its canvas edge", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 740 });
  await openInvitation(page, invitationUrl(baseURL, "singular"));

  const botanical = page.locator(".detail-botanical-top");
  await botanical.scrollIntoViewIfNeeded();
  await expect(botanical).toBeVisible();

  const mask = await botanical.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      standard: style.maskImage,
      webkit: style.webkitMaskImage,
    };
  });

  expect(mask.standard).not.toBe("none");
  expect(mask.webkit).not.toBe("none");
});

test("all required viewports avoid overflow and keep controls readable", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  const viewports = [
    { width: 320, height: 568 },
    { width: 360, height: 780 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(invitationUrl(baseURL, "plural"));
    await page.reload();

    const gate = page.getByTestId("opening-gate");
    await expect(gate).toBeVisible();
    const openButton = gate.getByRole("button", {
      name: "Taklifnomani ochish",
    });
    const gateHeading = gate.getByRole("heading");
    for (const element of [gateHeading, openButton]) {
      const box = await element.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(-1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    const openButtonBox = await openButton.boundingBox();
    expect(openButtonBox!.height).toBeGreaterThanOrEqual(44);

    const gateScrollBefore = await page.evaluate(() => {
      const dialog = document.querySelector<HTMLDialogElement>(
        '[data-testid="opening-gate"]',
      );

      return {
        dialog: dialog?.scrollTop ?? -1,
        overflow: dialog ? getComputedStyle(dialog).overflowY : "missing",
        page: window.scrollY,
        touchAction: dialog ? getComputedStyle(dialog).touchAction : "missing",
      };
    });
    expect(gateScrollBefore.overflow).toBe("hidden");
    expect(gateScrollBefore.touchAction).toBe("pinch-zoom");
    const hasCoarsePointer = await page.evaluate(() =>
      window.matchMedia("(pointer: coarse)").matches,
    );
    if (!hasCoarsePointer) {
      await page.mouse.wheel(0, 900);
    }
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(80);
    expect(
      await page.evaluate(() => ({
        dialog:
          document.querySelector<HTMLDialogElement>(
            '[data-testid="opening-gate"]',
          )?.scrollTop ?? -1,
        page: window.scrollY,
      })),
    ).toEqual({ dialog: gateScrollBefore.dialog, page: gateScrollBefore.page });

    await openButton.click();
    await expect(gate).toBeHidden();

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);

    const recipient = page.getByTestId("recipient-name");
    await recipient.scrollIntoViewIfNeeded();
    await expect(recipient).toBeVisible();
    const recipientBox = await recipient.boundingBox();
    const recipientFontSize = await recipient.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    );
    expect(recipientBox).not.toBeNull();
    expect(recipientBox!.x).toBeGreaterThanOrEqual(-1);
    expect(recipientBox!.x + recipientBox!.width).toBeLessThanOrEqual(
      viewport.width + 1,
    );
    expect(recipientFontSize).toBeGreaterThanOrEqual(28);

    for (const testId of ["map-google", "map-yandex"]) {
      const link = page.getByTestId(testId);
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    }
  }
});

test("Samsung-size scrolling reveals distinct emotional beats", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.setViewportSize({ width: 360, height: 780 });
  await openInvitation(page, invitationUrl(baseURL, "singular"));

  const personalGroup = page.locator(".invitation-inner");
  const personalBeats = personalGroup.locator(
    ".eyebrow, h2, .honorific, .recipient-line, .invitation-sentence",
  );
  await expect(personalBeats).toHaveCount(5);
  await expect
    .poll(() =>
      personalBeats.evaluateAll(
        (elements) =>
          elements.filter((element) =>
            element.hasAttribute("data-reveal-variant"),
          ).length,
      ),
    )
    .toBe(5);

  const beats = await personalBeats.all();
  const pendingStates = await Promise.all(beats.map(motionState));

  for (const state of pendingStates) {
    expect(state.opacity).toBeLessThanOrEqual(0.08);
    expect(state.translateY).toBeGreaterThanOrEqual(34);
    expect(state.translateY).toBeLessThanOrEqual(62);
    expect(state.scale).toBeGreaterThanOrEqual(0.92);
    expect(state.scale).toBeLessThan(0.995);
    expect(state.blur).toBe(0);
    expect(state.duration).toBeGreaterThanOrEqual(650);
    expect(state.duration).toBeLessThanOrEqual(1_100);
  }

  const delays = pendingStates.map(({ delay }) => Math.round(delay));
  expect(new Set(delays).size).toBeGreaterThanOrEqual(4);
  expect(Math.max(...delays) - Math.min(...delays)).toBeGreaterThanOrEqual(240);
  expect(
    await personalBeats.evaluateAll((elements) =>
      elements.every(
        (element) => !getComputedStyle(element).transitionProperty.includes("filter"),
      ),
    ),
  ).toBe(true);

  const recipient = page.locator(".recipient-line");
  const supportingCopy = [
    page.locator(".honorific"),
    page.locator(".invitation-sentence"),
  ];
  const recipientPending = await motionState(recipient);
  const supportingPending = await Promise.all(supportingCopy.map(motionState));

  expect(recipientPending.translateY).toBeGreaterThanOrEqual(
    Math.max(...supportingPending.map(({ translateY }) => translateY)) + 6,
  );
  expect(recipientPending.blur).toBe(0);
  expect(recipientPending.scale).toBeLessThanOrEqual(
    Math.min(...supportingPending.map(({ scale }) => scale)) - 0.005,
  );

  const milestoneLocators = [
    page.locator(".detail-block:not(.venue-block) h3"),
    page.locator(".venue-block h3"),
    page.getByTestId("map-google"),
    page.locator(".closing-inner > p"),
  ];

  for (const milestone of milestoneLocators) {
    const state = await motionState(milestone);
    expect(state.opacity).toBeLessThanOrEqual(0.08);
    expect(state.translateY).toBeGreaterThanOrEqual(34);
    expect(state.translateY).toBeLessThanOrEqual(62);
    expect(state.scale).toBeLessThan(0.995);
    expect(state.blur).toBe(0);
  }

  for (const scene of [
    {
      items: page.locator(
        ".detail-block:not(.venue-block) .detail-kicker, .detail-block:not(.venue-block) h3, .detail-block:not(.venue-block) .detail-value",
      ),
      count: 3,
      spread: 140,
    },
    {
      items: page.locator(
        ".venue-block .detail-kicker, .venue-block h3, .venue-block address",
      ),
      count: 3,
      spread: 140,
    },
    {
      items: page.locator(
        ".closing-inner > p, .closing-date",
      ),
      count: 2,
      spread: 70,
    },
  ]) {
    await expect(scene.items).toHaveCount(scene.count);
    const sceneStates = await Promise.all((await scene.items.all()).map(motionState));
    const sceneDelays = sceneStates.map(({ delay }) => Math.round(delay));

    expect(new Set(sceneDelays).size).toBe(scene.count);
    expect(Math.max(...sceneDelays) - Math.min(...sceneDelays)).toBeGreaterThanOrEqual(
      scene.spread,
    );
  }

  await recipient.scrollIntoViewIfNeeded();
  await expect(personalGroup).toHaveAttribute("data-reveal-state", "visible");
  await page.waitForTimeout(160);

  const inFlightOpacities = await Promise.all(
    beats.map(async (beat) => (await motionState(beat)).opacity),
  );
  expect(
    Math.max(...inFlightOpacities) - Math.min(...inFlightOpacities),
    "The recipient scene should visibly stagger instead of fading as one block",
  ).toBeGreaterThan(0.08);

  for (const beat of beats) {
    await expectSettledReveal(beat);
  }

  for (const milestone of milestoneLocators) {
    await milestone.scrollIntoViewIfNeeded();
    await expectSettledReveal(milestone);
  }

  const mapDelays = await Promise.all(
    [page.getByTestId("map-google"), page.getByTestId("map-yandex")].map(
      async (link) => (await motionState(link)).delay,
    ),
  );
  expect(Math.abs(mapDelays[1] - mapDelays[0])).toBeGreaterThanOrEqual(70);
  expect(
    await page.locator("[data-depth]").evaluateAll((elements) =>
      elements.every(
        (element) =>
          !(element as HTMLElement).style.getPropertyValue("--parallax-y"),
      ),
    ),
  ).toBe(true);

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
});

test("keyboard navigation has visible focus on opening and map controls", async ({
  page,
  baseURL,
  browserName,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.goto(invitationUrl(baseURL, "singular"));
  const gate = page.getByTestId("opening-gate");
  await expect(gate).toBeVisible();
  const openButton = gate.getByRole("button", {
    name: "Taklifnomani ochish",
  });

  await tabToLocator(page, openButton);
  await expectVisibleFocus(openButton);
  await page.keyboard.press("Enter");
  await expect(gate).toBeHidden();

  const linkNavigationKey = browserName === "webkit" ? "Alt+Tab" : "Tab";
  await tabTo(page, "map-google", linkNavigationKey);
  await expectVisibleFocus(page.getByTestId("map-google"));
  await tabTo(page, "map-yandex", linkNavigationKey);
  await expectVisibleFocus(page.getByTestId("map-yandex"));
});

test("haptics occur only after opening and once per major milestone", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.addInitScript(() => {
    (
      window as Window & {
        __vibrationCalls?: Array<{ duration: number; scrollY: number }>;
      }
    ).__vibrationCalls = [];
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: (milliseconds: number) => {
        const testWindow = window as Window & {
          __vibrationCalls?: Array<{ duration: number; scrollY: number }>;
        };
        testWindow.__vibrationCalls?.push({
          duration: milliseconds,
          scrollY: window.scrollY,
        });
        return true;
      },
    });
  });

  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(invitationUrl(baseURL, "singular"));
  const gate = page.getByTestId("opening-gate");
  await expect(gate).toBeVisible();
  expect(await page.evaluate(() => typeof navigator.vibrate)).toBe("function");
  expect(
    await page.evaluate(
      () =>
        (
          window as Window & {
            __vibrationCalls?: Array<{ duration: number; scrollY: number }>;
          }
        ).__vibrationCalls,
    ),
  ).toEqual([]);

  await gate
    .getByRole("button", { name: "Taklifnomani ochish" })
    .click();
  await expect(gate).toBeHidden();
  const calls = () =>
    page.evaluate(
      () =>
        (
          window as Window & {
            __vibrationCalls?: Array<{ duration: number; scrollY: number }>;
          }
        ).__vibrationCalls ?? [],
    );

  expect(await calls()).toEqual([{ duration: 8, scrollY: 0 }]);

  for (const milestone of [
    page.locator(".recipient-line"),
    page.locator(".detail-block:not(.venue-block) h3"),
    page.locator(".closing-inner > p"),
  ]) {
    const callCountBeforeScroll = (await calls()).length;
    await milestone.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect((await calls()).length).toBe(callCountBeforeScroll);
    await expect
      .poll(async () => (await calls()).length, { timeout: 3_000 })
      .toBe(callCountBeforeScroll + 1);
  }

  const milestoneCalls = await calls();
  expect(milestoneCalls.length).toBeGreaterThanOrEqual(3);
  expect(milestoneCalls.length).toBeLessThanOrEqual(4);

  for (const { duration } of milestoneCalls) {
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThanOrEqual(12);
  }
  expect(milestoneCalls.slice(1).every(({ scrollY }) => scrollY > 0)).toBe(true);

  const callCount = milestoneCalls.length;
  for (const destination of [
    page.locator(".hero"),
    page.locator(".recipient-line"),
    page.locator(".detail-block:not(.venue-block) h3"),
    page.locator(".closing-inner > p"),
  ]) {
    await destination.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(1_500);
  expect((await calls()).length).toBe(callCount);
});

test("reduced motion removes non-essential movement", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    (window as Window & { __reducedVibrations?: number[] }).__reducedVibrations = [];
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: (milliseconds: number) => {
        (
          window as Window & { __reducedVibrations?: number[] }
        ).__reducedVibrations?.push(milliseconds);
        return true;
      },
    });
  });
  await page.goto(invitationUrl(baseURL, "singular"));
  const gate = page.getByTestId("opening-gate");
  await expect(gate).toBeVisible();
  await gate
    .getByRole("button", { name: "Taklifnomani ochish" })
    .click();
  await expect(gate).toBeHidden();

  for (const locator of [
    page.locator(".invitation-inner"),
    page.locator(".recipient-line"),
    page.locator(".detail-block:not(.venue-block) h3"),
    page.locator(".venue-block h3"),
    page.getByTestId("map-google"),
    page.locator(".closing-inner > p"),
  ]) {
    await expect(locator).toBeVisible();
    const state = await motionState(locator);
    expect(state.opacity).toBe(1);
    expect(Math.abs(state.translateY)).toBeLessThanOrEqual(0.1);
    expect(state.scale).toBeGreaterThanOrEqual(0.999);
    expect(state.scale).toBeLessThanOrEqual(1.001);
    expect(state.filter).toBe("none");
    expect(state.duration).toBeLessThanOrEqual(1);
  }

  const motion = await page.evaluate(() => {
    const toMilliseconds = (value: string) =>
      Math.max(
        ...value.split(",").map((part) => {
          const duration = part.trim();
          return duration.endsWith("ms")
            ? Number.parseFloat(duration)
            : Number.parseFloat(duration) * 1_000;
        }),
      );
    const styles = [...document.querySelectorAll("body *")].map((element) =>
      getComputedStyle(element),
    );

    return {
      activeAnimations: document
        .getAnimations()
        .filter((animation) => animation.playState === "running").length,
      longestAnimation: Math.max(
        0,
        ...styles.map((style) => toMilliseconds(style.animationDuration)),
      ),
      longestTransition: Math.max(
        0,
        ...styles.map((style) => toMilliseconds(style.transitionDuration)),
      ),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });

  expect(motion.activeAnimations).toBe(0);
  expect(motion.longestAnimation).toBeLessThanOrEqual(1);
  expect(motion.longestTransition).toBeLessThanOrEqual(1);
  expect(motion.scrollBehavior).not.toBe("smooth");
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __reducedVibrations?: number[] })
          .__reducedVibrations,
    ),
  ).toEqual([]);
});

test("public wedding content works without JavaScript", async ({
  baseURL,
  browser,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    locale: "uz-UZ",
    timezoneId: "Asia/Tashkent",
  });
  const page = await context.newPage();

  try {
    const response = await page.goto(invitationUrl(baseURL, "singular"));
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId("invitation-page")).toBeVisible();
    await expect(page.getByTestId("hero")).toContainText(
      wedding.couple.firstName,
    );
    await expect(page.getByTestId("hero")).toContainText(
      wedding.couple.secondName,
    );
    await expect(page.getByTestId("hero")).toContainText(wedding.displayDate);
    await expect(page.locator("body")).toContainText(wedding.venueName);
    await expect(page.locator("body")).toContainText(wedding.fullAddress);
    await expect(page.getByTestId("map-google")).toHaveAttribute(
      "href",
      wedding.googleMapsUrl,
    );
    await expect(page.getByTestId("map-yandex")).toHaveAttribute(
      "href",
      wedding.yandexMapsUrl,
    );

    for (const locator of [
      page.getByTestId("hero"),
      page.locator(".invitation-inner"),
      page.locator(".detail-block:not(.venue-block)"),
      page.locator(".venue-block"),
      page.locator(".map-inner"),
      page.locator(".closing-inner"),
    ]) {
      await expect(locator).toBeVisible();
      const state = await motionState(locator);
      expect(state.opacity).toBe(1);
      expect(Math.abs(state.translateY)).toBeLessThanOrEqual(0.1);
      expect(state.scale).toBeGreaterThanOrEqual(0.999);
      expect(state.scale).toBeLessThanOrEqual(1.001);
      expect(state.filter).toBe("none");
    }

    await expect(page.locator("body")).not.toContainText(guests.singular);
  } finally {
    await context.close();
  }
});

test("valid generator and invitation flows have no console or network failures", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required");
  }

  const origin = new URL(baseURL).origin;
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const failedAssets: string[] = [];
  const thirdPartyRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== origin) {
      thirdPartyRequests.push(request.url());
    }
  });
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === origin) {
      failedRequests.push(request.url());
    }
  });
  page.on("response", (response) => {
    if (
      new URL(response.url()).origin === origin &&
      response.request().resourceType() !== "document" &&
      response.status() >= 400
    ) {
      failedAssets.push(`${response.status()} ${response.url()}`);
    }
  });

  const url = await generateInvitation(page, "plural");
  await openInvitation(page, url);
  await page.waitForLoadState("networkidle");

  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(failedAssets).toEqual([]);
  expect(thirdPartyRequests).toEqual([]);
});
