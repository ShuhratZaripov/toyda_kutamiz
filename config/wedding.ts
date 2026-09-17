import type {
  AddressForm,
  InvitationEvent,
  Language,
} from "@/lib/personalization";

export type WeddingLocaleContent = {
  htmlLang: string;
  couple: {
    firstName: string;
    secondName: string;
    connector: string;
    displayName: string;
  };
  browserTitle: string;
  displayDate: string;
  detailsDisplayDate: string;
  venueName: string;
  fullAddress: string;
  openingMessage: string;
  openingLabel: string;
  openingButton: string;
  heroLabel: string;
  personalLabel: string;
  invitationTitle: string;
  honorifics: Record<AddressForm, string>;
  invitationSentences: Record<AddressForm, string>;
  pendingTitle: string;
  pendingMessage: string;
  notFoundTitle: string;
  notFoundMessage: string;
  detailsLabel: string;
  detailsTitle: string;
  dateTimeLabel: string;
  startTimeLabel: string;
  venueLabel: string;
  mapLabel: string;
  mapTitle: string;
  mapAriaLabel: string;
  closingMessage: string;
};

export type WeddingConfig = {
  couple: WeddingLocaleContent["couple"];
  browserTitle: string;
  date: `${number}-${number}-${number}`;
  qizlarBazmiDate: `${number}-${number}-${number}`;
  displayDate: string;
  startTime: `${number}:${number}`;
  timeZone: "Asia/Tashkent";
  venueName: string;
  fullAddress: string;
  googleMapsUrl: string;
  yandexMapsUrl: string;
  qizlarBazmiGoogleMapsUrl: string;
  qizlarBazmiYandexMapsUrl: string;
  openingMessage: string;
  brokenLinkContact: string | null;
  usesSampleData: boolean;
  localized: Record<Language, WeddingLocaleContent>;
};

type InvitationEventContent = Pick<
  WeddingLocaleContent,
  | "couple"
  | "browserTitle"
  | "displayDate"
  | "detailsDisplayDate"
  | "openingMessage"
  | "openingLabel"
  | "heroLabel"
  | "invitationSentences"
  | "detailsTitle"
  | "closingMessage"
> &
  Partial<Pick<WeddingLocaleContent, "venueName" | "fullAddress">>;

export type ResolvedInvitationContent = WeddingLocaleContent & {
  singleName: boolean;
};

export type InvitationScheduleItem = {
  event: Exclude<InvitationEvent, "both">;
  label: string;
  displayDate: string;
  dateTime: string;
  venueName: string;
  fullAddress: string;
  googleMapsUrl: string;
  yandexMapsUrl: string;
};

const uz = {
  htmlLang: "uz-Latn",
  couple: {
    firstName: "Shuxrat",
    secondName: "Muhayyo",
    connector: "va",
    displayName: "Shuxrat va Muhayyo",
  },
  browserTitle: "Shuxrat va Muhayyo | Nikoh to‘yi",
  displayDate: "29-Sentabr, 2026-yil",
  detailsDisplayDate: "2026-yil 29-sentabr",
  venueName: "Orzu to'yxonasi",
  fullAddress:
    "Qoraqalpogʻiston Respublikasi, Beruniy tumani",
  openingMessage:
    "Biz uchun aziz bo‘lgan bu oqshom siz bilan yanada go‘zal bo‘ladi.",
  openingLabel: "Nikoh to‘yimiz",
  openingButton: "Taklifnomani ochish",
  heroLabel: "Nikoh to‘yimiz",
  personalLabel: "Shaxsiy",
  invitationTitle: "Taklifnoma",
  honorifics: {
    singular: "Hurmatli",
    plural: "Hurmatli",
  },
  invitationSentences: {
    singular:
      "sizni nikoh to‘yimiz munosabati bilan bo‘lib o‘tadigan tantanali oqshomimizga taklif qilamiz.",
    plural:
      "sizlarni nikoh to‘yimiz munosabati bilan bo‘lib o‘tadigan tantanali oqshomimizga taklif qilamiz.",
  },
  pendingTitle: "Shaxsiy taklifnoma",
  pendingMessage: "Salomlashuv taklif havolasi ochilgach shu yerda ko‘rinadi.",
  notFoundTitle: "Taklifnoma topilmadi",
  notFoundMessage: "Havola to‘liq va to‘g‘ri ekanini tekshiring.",
  detailsLabel: "Tafsilotlar",
  detailsTitle: "To‘y tafsilotlari",
  dateTimeLabel: "Vaqt",
  startTimeLabel: "Soat",
  venueLabel: "Manzil",
  mapLabel: "Yo‘l",
  mapTitle: "Manzilni xaritada oching",
  mapAriaLabel: "Xarita havolalari",
  closingMessage: "Tashrifingiz biz uchun katta quvonch bo‘ladi",
} satisfies WeddingLocaleContent;

const uzCyrl = {
  htmlLang: "uz-Cyrl",
  couple: {
    firstName: "Усмон",
    secondName: "Зулайхо",
    connector: "ва",
    displayName: "Усмон ва Зулайхо",
  },
  browserTitle: "Усмон ва Зулайхо | Никоҳ тўйи",
  displayDate: "14-сентябрь, 2026-йил",
  detailsDisplayDate: "2026-йил 14-сентябрь",
  venueName: "Оқ қаср тўйхонаси",
  fullAddress:
    "Қорақалпоғистон Республикаси, Беруний тумани",
  openingMessage:
    "Биз учун азиз бўлган бу оқшом сиз билан янада гўзал бўлади.",
  openingLabel: "Никоҳ тўйимиз",
  openingButton: "Таклифномани очиш",
  heroLabel: "Никоҳ тўйимиз",
  personalLabel: "Шахсий",
  invitationTitle: "Таклифнома",
  honorifics: {
    singular: "Ҳурматли",
    plural: "Ҳурматли",
  },
  invitationSentences: {
    singular:
      "сизни никоҳ тўйимиз муносабати билан бўлиб ўтадиган тантанали оқшомимизга таклиф қиламиз.",
    plural:
      "сизларни никоҳ тўйимиз муносабати билан бўлиб ўтадиган тантанали оқшомимизга таклиф қиламиз.",
  },
  pendingTitle: "Шахсий таклифнома",
  pendingMessage: "Саломлашув таклиф ҳаволаси очилгач шу ерда кўринади.",
  notFoundTitle: "Таклифнома топилмади",
  notFoundMessage: "Ҳавола тўлиқ ва тўғри эканини текширинг.",
  detailsLabel: "Тафсилотлар",
  detailsTitle: "Тўй тафсилотлари",
  dateTimeLabel: "Вақт",
  startTimeLabel: "Соат",
  venueLabel: "Манзил",
  mapLabel: "Йўл",
  mapTitle: "Манзилни харитада очинг",
  mapAriaLabel: "Харита ҳаволалари",
  closingMessage: "Ташрифингиз биз учун катта қувонч бўлади",
} satisfies WeddingLocaleContent;

const ru = {
  htmlLang: "ru",
  couple: {
    firstName: "Шухрат",
    secondName: "Мухайё",
    connector: "и",
    displayName: "Шухрат и Мухайё",
  },
  browserTitle: "Шухрат и Мухайё | Свадьба",
  displayDate: "29 сентября 2026 года",
  detailsDisplayDate: "29 сентября 2026 года",
  venueName: "Тойхона «Orzu»",
  fullAddress:
    "Республика Каракалпакстан, Берунийский район",
  openingMessage:
    "Этот дорогой для нас вечер станет ещё прекраснее вместе с вами.",
  openingLabel: "Наша свадьба",
  openingButton: "Открыть приглашение",
  heroLabel: "Наша свадьба",
  personalLabel: "Для вас",
  invitationTitle: "Приглашение",
  honorifics: {
    singular: "Дорогой гость",
    plural: "Дорогие гости",
  },
  invitationSentences: {
    singular:
      "приглашаем Вас на торжественный вечер по случаю нашей свадьбы.",
    plural:
      "приглашаем вас на торжественный вечер по случаю нашей свадьбы.",
  },
  pendingTitle: "Персональное приглашение",
  pendingMessage: "Обращение появится здесь после открытия личной ссылки.",
  notFoundTitle: "Приглашение не найдено",
  notFoundMessage: "Проверьте, что ссылка указана полностью и без ошибок.",
  detailsLabel: "Детали",
  detailsTitle: "Детали свадьбы",
  dateTimeLabel: "Время",
  startTimeLabel: "В",
  venueLabel: "Место",
  mapLabel: "Маршрут",
  mapTitle: "Открыть место на карте",
  mapAriaLabel: "Ссылки на карты",
  closingMessage: "Ваше присутствие станет для нас большой радостью",
} satisfies WeddingLocaleContent;

const en = {
  htmlLang: "en",
  couple: {
    firstName: "Shuxrat",
    secondName: "Muhayyo",
    connector: "and",
    displayName: "Shuxrat and Muhayyo",
  },
  browserTitle: "Shuxrat and Muhayyo | Wedding",
  displayDate: "September 29, 2026",
  detailsDisplayDate: "September 29, 2026",
  venueName: "Orzu Wedding Hall",
  fullAddress:
    "Republic of Karakalpakstan, Beruniy District",
  openingMessage:
    "This evening means so much to us, and it will be even more beautiful with you.",
  openingLabel: "Our wedding",
  openingButton: "Open the invitation",
  heroLabel: "Our wedding",
  personalLabel: "For you",
  invitationTitle: "Invitation",
  honorifics: {
    singular: "Dear guest",
    plural: "Dear guests",
  },
  invitationSentences: {
    singular:
      "we invite you to join us for a celebratory evening on the occasion of our wedding.",
    plural:
      "we invite you to join us for a celebratory evening on the occasion of our wedding.",
  },
  pendingTitle: "Personal invitation",
  pendingMessage: "Your greeting will appear here when your personal link opens.",
  notFoundTitle: "Invitation not found",
  notFoundMessage: "Please check that the link is complete and correct.",
  detailsLabel: "Details",
  detailsTitle: "Wedding details",
  dateTimeLabel: "Time",
  startTimeLabel: "At",
  venueLabel: "Venue",
  mapLabel: "Directions",
  mapTitle: "Open the venue on a map",
  mapAriaLabel: "Map links",
  closingMessage: "Your presence will bring us great joy",
} satisfies WeddingLocaleContent;

const qizlarBazmi = {
  uz: {
    couple: {
      firstName: "Muhayyo",
      secondName: "",
      connector: "",
      displayName: "Muhayyo",
    },
    browserTitle: "Muhayyo | Qizlar bazmi",
    displayDate: "28-sentabr, 2026-yil",
    detailsDisplayDate: "2026-yil 28-sentabr",
    venueName: "Anor to'yxonasi",
    openingMessage:
      "Biz uchun alohida ahamiyatga ega bo‘lgan bu nafis oqshom siz bilan yanada go‘zal bo‘ladi.",
    openingLabel: "Qizlar bazmi",
    heroLabel: "Qizlar bazmi",
    invitationSentences: {
      singular:
        "sizni qizlar bazmi munosabati bilan bo‘lib o‘tadigan nafis oqshomimizga taklif qilamiz.",
      plural:
        "sizlarni qizlar bazmi munosabati bilan bo‘lib o‘tadigan nafis oqshomimizga taklif qilamiz.",
    },
    detailsTitle: "Qizlar bazmi tafsilotlari",
    closingMessage: "Tashrifingiz biz uchun katta quvonch bo‘ladi",
  },
  "uz-cyrl": {
    couple: {
      firstName: "Зулайхо",
      secondName: "",
      connector: "",
      displayName: "Зулайхо",
    },
    browserTitle: "Зулайхо | Қизлар базми",
    displayDate: "13-сентябрь, 2026-йил",
    detailsDisplayDate: "2026-йил 13-сентябрь",
    openingMessage:
      "Биз учун алоҳида аҳамиятга эга бўлган бу нафис оқшом сиз билан янада гўзал бўлади.",
    openingLabel: "Қизлар базми",
    heroLabel: "Қизлар базми",
    invitationSentences: {
      singular:
        "сизни қизлар базми муносабати билан бўлиб ўтадиган нафис оқшомимизга таклиф қиламиз.",
      plural:
        "сизларни қизлар базми муносабати билан бўлиб ўтадиган нафис оқшомимизга таклиф қиламиз.",
    },
    detailsTitle: "Қизлар базми тафсилотлари",
    closingMessage: "Ташрифингиз биз учун катта қувонч бўлади",
  },
  ru: {
    couple: {
      firstName: "Мухайё",
      secondName: "",
      connector: "",
      displayName: "Мухайё",
    },
    browserTitle: "Мухайё | Кызлар базми",
    displayDate: "28 сентября 2026 года",
    detailsDisplayDate: "28 сентября 2026 года",
    venueName: "Тойхона «Anor»",
    openingMessage:
      "Этот особенный и дорогой для нас вечер станет ещё прекраснее вместе с вами.",
    openingLabel: "Кызлар базми",
    heroLabel: "Кызлар базми",
    invitationSentences: {
      singular:
        "приглашаем Вас на торжественный вечер по случаю кызлар базми.",
      plural:
        "приглашаем вас на торжественный вечер по случаю кызлар базми.",
    },
    detailsTitle: "Детали кызлар базми",
    closingMessage: "Ваше присутствие станет для нас большой радостью",
  },
  en: {
    couple: {
      firstName: "Muhayyo",
      secondName: "",
      connector: "",
      displayName: "Muhayyo",
    },
    browserTitle: "Muhayyo | Qizlar bazmi",
    displayDate: "September 28, 2026",
    detailsDisplayDate: "September 28, 2026",
    venueName: "Anor Wedding Hall",
    openingMessage:
      "This special evening means so much to us, and it will be even more beautiful with you.",
    openingLabel: "Qizlar bazmi",
    heroLabel: "Qizlar bazmi",
    invitationSentences: {
      singular:
        "we invite you to join us for a special evening celebrating qizlar bazmi.",
      plural:
        "we invite you to join us for a special evening celebrating qizlar bazmi.",
    },
    detailsTitle: "Qizlar bazmi details",
    closingMessage: "Your presence will bring us great joy",
  },
} satisfies Record<Language, InvitationEventContent>;

const bothEvents = {
  uz: {
    couple: uz.couple,
    browserTitle: "Shuxrat va Muhayyo | Qizlar bazmi va nikoh to‘yi",
    displayDate: "28 va 29-sentabr, 2026-yil",
    detailsDisplayDate: "2026-yil 28 va 29-sentabr",
    openingMessage:
      "Biz uchun aziz bo‘lgan ikki quvonchli kunimiz siz bilan yanada go‘zal bo‘ladi.",
    openingLabel: "Qizlar bazmi va nikoh to‘yimiz",
    heroLabel: "Qizlar bazmi va nikoh to‘yimiz",
    invitationSentences: {
      singular:
        "sizni qizlar bazmi va nikoh to‘yimiz munosabati bilan bo‘lib o‘tadigan tantanali tadbirlarimizga taklif qilamiz.",
      plural:
        "sizlarni qizlar bazmi va nikoh to‘yimiz munosabati bilan bo‘lib o‘tadigan tantanali tadbirlarimizga taklif qilamiz.",
    },
    detailsTitle: "Qizlar bazmi va nikoh to‘yi tafsilotlari",
    closingMessage: uz.closingMessage,
  },
  "uz-cyrl": {
    couple: uzCyrl.couple,
    browserTitle: "Усмон ва Зулайхо | Қизлар базми ва никоҳ тўйи",
    displayDate: "13 ва 14-сентябрь, 2026-йил",
    detailsDisplayDate: "2026-йил 13 ва 14-сентябрь",
    openingMessage:
      "Биз учун азиз бўлган икки қувончли кунимиз сиз билан янада гўзал бўлади.",
    openingLabel: "Қизлар базми ва никоҳ тўйимиз",
    heroLabel: "Қизлар базми ва никоҳ тўйимиз",
    invitationSentences: {
      singular:
        "сизни қизлар базми ва никоҳ тўйимиз муносабати билан бўлиб ўтадиган тантанали тадбирларимизга таклиф қиламиз.",
      plural:
        "сизларни қизлар базми ва никоҳ тўйимиз муносабати билан бўлиб ўтадиган тантанали тадбирларимизга таклиф қиламиз.",
    },
    detailsTitle: "Қизлар базми ва никоҳ тўйи тафсилотлари",
    closingMessage: uzCyrl.closingMessage,
  },
  ru: {
    couple: ru.couple,
    browserTitle: "Шухрат и Мухайё | Кызлар базми и свадьба",
    displayDate: "28 и 29 сентября 2026 года",
    detailsDisplayDate: "28 и 29 сентября 2026 года",
    openingMessage:
      "Два этих дорогих и радостных для нас дня станут ещё прекраснее вместе с вами.",
    openingLabel: "Кызлар базми и наша свадьба",
    heroLabel: "Кызлар базми и наша свадьба",
    invitationSentences: {
      singular:
        "приглашаем Вас на торжественные вечера по случаю кызлар базми и нашей свадьбы.",
      plural:
        "приглашаем вас на торжественные вечера по случаю кызлар базми и нашей свадьбы.",
    },
    detailsTitle: "Детали кызлар базми и свадьбы",
    closingMessage: ru.closingMessage,
  },
  en: {
    couple: en.couple,
    browserTitle: "Shuxrat and Muhayyo | Qizlar bazmi and wedding",
    displayDate: "September 28 and 29, 2026",
    detailsDisplayDate: "September 28 and 29, 2026",
    openingMessage:
      "These two joyful days mean so much to us, and they will be even more beautiful with you.",
    openingLabel: "Qizlar bazmi and our wedding",
    heroLabel: "Qizlar bazmi and our wedding",
    invitationSentences: {
      singular:
        "we invite you to join us for two celebratory evenings marking qizlar bazmi and our wedding.",
      plural:
        "we invite you to join us for two celebratory evenings marking qizlar bazmi and our wedding.",
    },
    detailsTitle: "Qizlar bazmi and wedding details",
    closingMessage: en.closingMessage,
  },
} satisfies Record<Language, InvitationEventContent>;

export const wedding = {
  couple: uz.couple,
  browserTitle: uz.browserTitle,
  date: "2026-09-29",
  qizlarBazmiDate: "2026-09-28",
  displayDate: uz.displayDate,
  startTime: "18:00",
  timeZone: "Asia/Tashkent",
  venueName: uz.venueName,
  fullAddress: uz.fullAddress,
  googleMapsUrl: "https://maps.app.goo.gl/fEKBykn7NUmz6gob7",
  yandexMapsUrl:
    "https://yandex.uz/maps/-/CTdCMO-Y",
  qizlarBazmiGoogleMapsUrl: "https://maps.app.goo.gl/uHQ1XQHdu4niftD46",
  qizlarBazmiYandexMapsUrl: "https://yandex.uz/maps/-/CTd1NP-H",
  openingMessage: uz.openingMessage,
  brokenLinkContact: null,
  usesSampleData: false,
  localized: { uz, "uz-cyrl": uzCyrl, ru, en },
} satisfies WeddingConfig;

export const weddingDateTime = `${wedding.date}T${wedding.startTime}:00+05:00`;

export const invitationDateTimes: Record<Exclude<InvitationEvent, "both">, string> = {
  wedding: weddingDateTime,
  "qizlar-bazmi": `${wedding.qizlarBazmiDate}T${wedding.startTime}:00+05:00`,
};

export const invitationMapUrls: Record<
  Exclude<InvitationEvent, "both">,
  { googleMapsUrl: string; yandexMapsUrl: string }
> = {
  wedding: {
    googleMapsUrl: wedding.googleMapsUrl,
    yandexMapsUrl: wedding.yandexMapsUrl,
  },
  "qizlar-bazmi": {
    googleMapsUrl: wedding.qizlarBazmiGoogleMapsUrl,
    yandexMapsUrl: wedding.qizlarBazmiYandexMapsUrl,
  },
};

export function getInvitationContent(
  language: Language,
  invitationEvent: InvitationEvent,
): ResolvedInvitationContent {
  const content = wedding.localized[language];

  if (invitationEvent === "qizlar-bazmi") {
    return { ...content, ...qizlarBazmi[language], singleName: true };
  }

  if (invitationEvent === "both") {
    return { ...content, ...bothEvents[language], singleName: false };
  }

  return { ...content, singleName: false };
}

export function getInvitationSchedule(
  language: Language,
  invitationEvent: InvitationEvent,
): InvitationScheduleItem[] {
  const events: InvitationScheduleItem["event"][] =
    invitationEvent === "both"
      ? ["qizlar-bazmi", "wedding"]
      : [invitationEvent];

  return events.map((event) => {
    const content = getInvitationContent(language, event);

    return {
      event,
      label: content.heroLabel,
      displayDate: content.detailsDisplayDate,
      dateTime: invitationDateTimes[event],
      venueName: content.venueName,
      fullAddress: content.fullAddress,
      googleMapsUrl: invitationMapUrls[event].googleMapsUrl,
      yandexMapsUrl: invitationMapUrls[event].yandexMapsUrl,
    };
  });
}
