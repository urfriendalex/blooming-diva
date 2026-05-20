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
  overlineLabel: string;
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
      "BLOOMING DIVA is a one-day photo experience in Warsaw about femininity, sensuality, soft light, flowers, styling, makeup, and the beauty of being yourself.",
  },
  projectTitle: "blooming diva",
  overlineLabel: "photo day",
  location: "WARSAW",
  date: "30-31 МАЯ",
  priceLabel: "1250 PLN",
  registerLabel: "ЗАРЕГИСТРИРОВАТЬСЯ",
  introText: [
    "30-31 мая, STUDIO ISKRA, Czechowicka 4, 04-218 Warszawa.",
    "Фотодень в эстетике BLOOMING DIVA — про женственность, сексуальность и красоту быть собой. Пленочная фотография, цветы, мягкий свет и образы, в которых ты чувствуешь себя по-настоящему чувственной и аутентичной.",
    "С тобой работает команда стилиста, визажиста и фотографа. Два образа, собранных индивидуально, макияж под настроение съемки и бережная работа в кадре, чтобы раскрыть тебя естественно и свободно.",
    "Это день, в котором ты становишься своей собственной музой.",
    "Стоимость 1250 zł",
    "Предоплата 50% для бронирования места. Количество мест строго ограничено.",
  ],
  infoLines: [
    "PHOTO DAY BY",
    "@liza_karasiova",
    "@lina_tsapova",
    "@zlata.kami",
  ],
  signup: {
    title: "Стоимость — 1250 PLN",
    titleSubline: "Предоплата — 50%",
    spotsLeftText: "",
    intro: [
      "Вас ждут 40 минут съемки, 2 персонально подобранных образа, макияж в соответствии с концепцией, сопровождение команды, backstage-фотографии, полароидные снимки и 15–20 пленочных кадров.",
      "Оставьте заявку, чтобы забронировать место на 30-31 мая. После обработки мы свяжемся с вами в Instagram, отправим детали и подскажем следующий шаг по предоплате.",
    ],
    fields: {
      nameLabel: "Имя",
      namePlaceholder: "Имя",
      emailLabel: "Email",
      emailPlaceholder: "Email",
      instagramLabel: "Instagram",
      instagramPlaceholder: "@instagram",
    },
    button: "ОСТАВИТЬ ЗАЯВКУ",
    helperText:
      "Количество мест строго ограничено. После заявки мы свяжемся с вами в Instagram.",
  },
  topics: [
    {
      key: "style",
      label: "STYLE",
      person: "@liza_karasiova",
      personUrl: "https://www.instagram.com/liza_karasiova/",
      description: [
        "Каждый образ создается индивидуально. Накануне съемки мы согласовываем стилистику, настроение и референсы, чтобы вы чувствовали себя органично и уверенно.",
        "Лиза подбирает два образа, подчеркивающие именно вашу энергетику: мягкость, женскую силу, цветение и эстетику момента.",
        "При желании можно добавить вещи из своего гардероба и соединить их с новыми элементами, чтобы образ ощущался по-настоящему вашим.",
        "Все детали обсуждаются лично, без навязанных ролей и жестких рамок.",
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
        "Фотодень о женственности, которую не нужно играть. О сексуальности, рождающейся из ощущения себя — мягкой, естественной и живой.",
        "Во время съемки фотограф мягко направляет вас в кадре, помогает расслабиться и почувствовать себя собой. Без сложного позирования и давления — только внимательное наблюдение за вами настоящей.",
        "Пленка хранит момент особенно тонко. Она передает рассеянный свет, движение ткани, теплый оттенок кожи и взгляд между кадрами.",
        "Как импрессионисты пытались поймать закат или рассвет — мы стремимся сохранить то самое неуловимое ощущение живой красоты.",
        "В результате вас ждут 15–20 пленочных кадров, backstage-фотографии и полароидные снимки.",
      ],
      ctaLabel: "view photographer",
      ctaUrl: "https://www.instagram.com/lina_tsapova/",
    },
    {
      key: "makeup",
      label: "MAKEUP",
      person: "@zlata.kami",
      personUrl: "https://www.instagram.com/zlata.kami/",
      description: [
        "Макияж создается под настроение съемки и становится продолжением выбранного состояния и визуального языка BLOOMING DIVA.",
        "Задача не в тяжелой трансформации, а в бережном раскрытии вашей чувственности: сияющая кожа, выразительные акценты и детали, которые красиво читаются на пленке.",
        "На площадке команда сопровождает вас на всех этапах, чтобы образ, макияж и кадр работали как единая история.",
      ],
      ctaLabel: "view makeup artist",
      ctaUrl: "https://www.instagram.com/zlata.kami/",
    },
  ],
};
