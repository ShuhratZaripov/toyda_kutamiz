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
>;

export type ResolvedInvitationContent = WeddingLocaleContent & {
  singleName: boolean;
};

const uz = {
  htmlLang: "uz-Latn",
  couple: {
    firstName: "Usmon",
    secondName: "Zulayho",
    connector: "va",
    displayName: "Usmon va Zulayho",
  },
  browserTitle: "Usmon va Zulayho | Nikoh to‘yi",
  displayDate: "14-sentabr, 2026-yil",
  detailsDisplayDate: "2026-yil 14-sentabr",
  venueName: "Oq qasr to'yxonasi",
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
    firstName: "Усмон",
    secondName: "Зулайхо",
    connector: "и",
    displayName: "Усмон и Зулайхо",
  },
  browserTitle: "Усмон и Зулайхо | Свадьба",
  displayDate: "14 сентября 2026 года",
  detailsDisplayDate: "14 сентября 2026 года",
  venueName: "Тойхона «Oq qasr»",
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
    firstName: "Usmon",
    secondName: "Zulayho",
    connector: "and",
    displayName: "Usmon and Zulayho",
  },
  browserTitle: "Usmon and Zulayho | Wedding",
  displayDate: "September 14, 2026",
  detailsDisplayDate: "September 14, 2026",
  venueName: "Oq qasr Wedding Hall",
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
      firstName: "Zulayho",
      secondName: "",
      connector: "",
      displayName: "Zulayho",
    },
    browserTitle: "Zulayho | Qizlar bazmi",
    displayDate: "13-sentabr, 2026-yil",
    detailsDisplayDate: "2026-yil 13-sentabr",
    openingMessage: "Bu nafis oqshom siz bilan yanada go‘zal bo‘ladi.",
    openingLabel: "Qizlar bazmi",
    heroLabel: "Qizlar bazmi",
    invitationSentences: {
      singular: "sizni qizlar bazmiga taklif qilamiz.",
      plural: "sizlarni qizlar bazmiga taklif qilamiz.",
    },
    detailsTitle: "Qizlar bazmi tafsilotlari",
    closingMessage: "Tashrifingiz men uchun katta quvonch bo‘ladi",
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
    openingMessage: "Бу нафис оқшом сиз билан янада гўзал бўлади.",
    openingLabel: "Қизлар базми",
    heroLabel: "Қизлар базми",
    invitationSentences: {
      singular: "сизни қизлар базмига таклиф қиламиз.",
      plural: "сизларни қизлар базмига таклиф қиламиз.",
    },
    detailsTitle: "Қизлар базми тафсилотлари",
    closingMessage: "Ташрифингиз мен учун катта қувонч бўлади",
  },
  ru: {
    couple: {
      firstName: "Зулайхо",
      secondName: "",
      connector: "",
      displayName: "Зулайхо",
    },
    browserTitle: "Зулайхо | Кызлар базми",
    displayDate: "13 сентября 2026 года",
    detailsDisplayDate: "13 сентября 2026 года",
    openingMessage: "Этот особенный вечер станет ещё прекраснее вместе с вами.",
    openingLabel: "Кызлар базми",
    heroLabel: "Кызлар базми",
    invitationSentences: {
      singular: "приглашаем Вас на кызлар базми.",
      plural: "приглашаем вас на кызлар базми.",
    },
    detailsTitle: "Детали кызлар базми",
    closingMessage: "Ваше присутствие станет для меня большой радостью",
  },
  en: {
    couple: {
      firstName: "Zulayho",
      secondName: "",
      connector: "",
      displayName: "Zulayho",
    },
    browserTitle: "Zulayho | Qizlar bazmi",
    displayDate: "September 13, 2026",
    detailsDisplayDate: "September 13, 2026",
    openingMessage: "This special evening will be even more beautiful with you.",
    openingLabel: "Qizlar bazmi",
    heroLabel: "Qizlar bazmi",
    invitationSentences: {
      singular: "We invite you to join us for qizlar bazmi.",
      plural: "We invite you to join us for qizlar bazmi.",
    },
    detailsTitle: "Qizlar bazmi details",
    closingMessage: "Your presence will bring me great joy",
  },
} satisfies Record<Language, InvitationEventContent>;

export const wedding = {
  couple: uz.couple,
  browserTitle: uz.browserTitle,
  date: "2026-09-14",
  qizlarBazmiDate: "2026-09-13",
  displayDate: uz.displayDate,
  startTime: "18:00",
  timeZone: "Asia/Tashkent",
  venueName: uz.venueName,
  fullAddress: uz.fullAddress,
  googleMapsUrl:
    "https://www.google.com/maps/place/Oq+Qasr/@41.6692168,60.7734755,17z/data=!3m1!4b1!4m6!3m5!1s0x41dfd50031175a7f:0x13cbd0bddb172134!8m2!3d41.6692168!4d60.7734755!16s%2Fg%2F11ywmzkpkf?entry=ttu&g_ep=EgoyMDI2MDgyMy4wIKXMDSoASAFQAw%3D%3D",
  yandexMapsUrl:
    "https://yandex.uz/maps/org/oq_qasr_toyxonasi/18398642973/?ll=60.774465%2C41.668580&z=17.7",
  openingMessage: uz.openingMessage,
  brokenLinkContact: null,
  usesSampleData: false,
  localized: { uz, "uz-cyrl": uzCyrl, ru, en },
} satisfies WeddingConfig;

export const weddingDateTime = `${wedding.date}T${wedding.startTime}:00+05:00`;

export const invitationDateTimes: Record<InvitationEvent, string> = {
  wedding: weddingDateTime,
  "qizlar-bazmi": `${wedding.qizlarBazmiDate}T${wedding.startTime}:00+05:00`,
};

export function getInvitationContent(
  language: Language,
  invitationEvent: InvitationEvent,
): ResolvedInvitationContent {
  const content = wedding.localized[language];

  return invitationEvent === "qizlar-bazmi"
    ? { ...content, ...qizlarBazmi[language], singleName: true }
    : { ...content, singleName: false };
}
