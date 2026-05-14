export type TopicKey = "style" | "photo" | "makeup";

export type TopicContent = {
  key: TopicKey;
  label: string;
  person: string;
  personUrl: string;
  description: string[];
  ctaLabel: string;
  ctaUrl: string;
};

export type SiteContent = {
  seo: {
    title: string;
    description: string;
  };
  projectTitle: string;
  location: string;
  date: string;
  /** Short price for the header meta strip (keep in sync with signup pricing). */
  priceLabel: string;
  registerLabel: string;
  introText: string[];
  infoLines: string[];
  signup: {
    title: string;
    /** Shown under the price title, lighter weight (e.g. prepayment terms). */
    titleSubline: string;
    /**
     * Optional urgency line: landing CTA hint + signup actions row. Implementation stays in
     * `blooming-diva-experience` / `booking-form`; leave `""` to hide, or set non-empty copy to show.
     */
    spotsLeftText: string;
    intro: string[];
    fields: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      instagramLabel: string;
      instagramPlaceholder: string;
    };
    button: string;
    helperText: string;
  };
  topics: TopicContent[];
};

export const siteContent: SiteContent = {
  seo: {
    title: "BLOOMING DIVA",
    description:
      "BLOOMING DIVA is a one-day photo experience in Warsaw with styling, makeup, and editorial photography for a vivid feminine visual story built for personal branding and social media.",
  },
  projectTitle: "BLOOMING DIVA",
  location: "WARSAW",
  date: "COMING SOON",
  priceLabel: "950 PLN",
  registerLabel: "ЗАРЕГИСТРИРОВАТЬСЯ",
  introText: [
    "Новая дата скоро. STUDIO ISKRA, Czechowicka 4, 04-218 Warszawa.",
    "Blooming Diva — фотодень про цвет, женственность и ощущение себя в полном расцвете. Сочные акценты, мягкий свет и образы, в которых ты чувствуешь себя заметной, живой и красивой.",
    "С тобой работает команда стилиста, визажиста и фотографа. Два образа, собранных индивидуально, макияж, и кадры, к которым захочется возвращаться.",
    "Это день, в котором ты раскрываешь свою внутреннюю диву.",
    "Стоимость 950 zł",
    "Предоплата 50% для бронирования места. Количество мест строго ограничено.",
  ],
  infoLines: [
    "PHOTO DAY BY",
    "@liza_karasiova",
    "@lina_tsapova",
    "@takonik.visage",
  ],
  signup: {
    title: "Стоимость — 950 PLN",
    titleSubline: "Предоплата — 50%",
    spotsLeftText: "",
    intro: [
      "В стоимость входит съемка, макияж, стайлинг и готовая\u00A0визуальная\u00A0история\u00A0в\u00A0эстетике\u00A0Blooming\u00A0Diva.",
      "Оставьте заявку, чтобы попасть в список участниц. После обработки мы свяжемся с вами в Instagram, отправим детали и подскажем следующий шаг.",
    ],
    fields: {
      nameLabel: "Name",
      namePlaceholder: "Name",
      emailLabel: "Email",
      emailPlaceholder: "Email",
      instagramLabel: "Instagram handle",
      instagramPlaceholder: "@yourinstagramhandle",
    },
    button: "ОСТАВИТЬ ЗАЯВКУ",
    helperText: "После заявки мы свяжемся с вами в Instagram.",
  },
  topics: [
    {
      key: "style",
      label: "STYLE",
      person: "@liza_karasiova",
      personUrl: "https://www.instagram.com/liza_karasiova/",
      description: [
        "Это съёмка про цвет, женственность и состояние расцвета. Про образ, который подчёркивает, раскрывает и делает тебя ещё ярче.",
        "У каждой девушки будет два образа, собранных индивидуально, с учётом внешности, настроения и ощущений.",
        "Вещи подбираются под каждую участницу, при желании можно добавить что-то из своего гардероба и сочетать с новыми элементами.",
        "Ниже можно посмотреть примеры, чтобы почувствовать стилистику съёмки.",
        "Все детали обсуждаются лично, чтобы в итоге получилось по\u2011настоящему\u00A0твоё.",
      ],
      ctaLabel: "view stylist",
      ctaUrl: "https://www.instagram.com/liza_karasiova/",
    },
    {
      key: "photo",
      label: "PHOTO",
      person: "@lina_tsapova",
      personUrl: "https://www.instagram.com/lina_tsapova/",
      description: [
        "Для меня фотография — это не про сантиметры, формы или \"идеальность\". Это про энергию, ощущение. Про то, что невозможно сыграть.",
        "Тебе не нужно быть худой, \"правильной\" или соответствовать каким-то стандартам, чтобы почувствовать себя главной героиней своей истории. Я вижу глубже — и стараюсь уловить именно твою суть, чтобы передать её через призму камеры.",
        "В плёночной фотографии нет бесконечных дублей. Ограниченное число кадров делает процесс честным, живым, настоящим. В результате ты получаешь 15–20 готовых кадров, которые будут напоминать не только о том, как ты выглядишь, но и о том, как ты себя чувствуешь.",
      ],
      ctaLabel: "view photographer",
      ctaUrl: "https://www.instagram.com/lina_tsapova/",
    },
    {
      key: "makeup",
      label: "MAKEUP",
      person: "@takonik.visage",
      personUrl: "https://www.instagram.com/takonik.visage/",
      description: [
        "Вдохновение для макияжа в стилистике Blooming Diva: сияющая кожа, выразительные акценты и детали, которые красиво читаются в кадре.",
        "Задача не в тяжелой трансформации, а в собранной, уверенной версии образа, которая поддерживает цвет и настроение всей истории.",
      ],
      ctaLabel: "view makeup artist",
      ctaUrl: "https://www.instagram.com/takonik.visage/",
    },
  ],
};
