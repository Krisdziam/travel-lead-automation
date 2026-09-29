"use client";

import Image from "next/image";
import { useEffect, useSyncExternalStore } from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  readStoredLocale,
  type Locale,
} from "./locale";

const LOCALE_CHANGE_EVENT = "mandra-locale-change";
const imageBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const translations = {
  uk: {
    pageTitle: "Mandra Travel — персональні подорожі",
    pageDescription:
      "Персональне планування подорожей із людською підтримкою до, під час і після поїздки.",
    skipLink: "Перейти до основного вмісту",
    homeLabel: "Mandra Travel — на початок сторінки",
    mainNavLabel: "Основна навігація",
    footerNavLabel: "Навігація у футері",
    languageLabel: "Мова сайту",
    ukrainianLabel: "Українська",
    englishLabel: "English",
    nav: {
      how: "Як це працює",
      journeys: "Подорожі",
      support: "Підтримка",
      faq: "FAQ",
    },
    planTrip: "Підібрати подорож",
    hero: {
      eyebrow: "Персональне планування подорожей",
      titleStart: "Ваша наступна подорож —",
      titleAccent: "продумана нами.",
      description:
        "Розкажіть, куди й як хочете подорожувати. Ми підготуємо персональну пропозицію та залишатимемося на зв’язку до, під час і після подорожі.",
      note: "Заявка не зобов’язує до бронювання.",
      imageAlt:
        "Краєвид морського узбережжя з вікна потяга та карта в руках мандрівника",
      imageCaption: "Подорож починається з відчуття",
      imageDetail: "Маршрут у вашому ритмі",
    },
    how: {
      eyebrow: "Просто й без зайвих кроків",
      title: "Як це працює",
      description:
        "Від першої розмови до повернення додому — ви знаєте, що відбувається далі і до кого звернутися.",
      steps: [
        {
          id: "share",
          title: "Розкажіть про подорож",
          description:
            "Поділіться ідеєю, приблизними датами й побажаннями. Точний напрямок можна ще не знати.",
        },
        {
          id: "proposal",
          title: "Отримайте персональну пропозицію",
          description:
            "Ми доберемо варіанти під ваш ритм, склад подорожі та орієнтовний бюджет.",
        },
        {
          id: "details",
          title: "Погодьте деталі",
          description:
            "Разом уточнимо маршрут і умови. Бронювання відбувається лише після вашої згоди.",
        },
        {
          id: "connected",
          title: "Залишайтеся на зв’язку",
          description:
            "Під час подорожі у вас буде один зрозумілий контакт для запитань і координації.",
        },
      ],
    },
    journeys: {
      eyebrow: "Не каталог, а початок розмови",
      title: "Яку подорож ви уявляєте?",
      items: [
        {
          id: "sea",
          title: "Біля моря",
          description:
            "Спокійний відпочинок на узбережжі — з ритмом, який підходить саме вам.",
        },
        {
          id: "city",
          title: "У новому місті",
          description:
            "Вулиці, локальні місця й достатньо часу, щоб відчути місто без поспіху.",
        },
        {
          id: "couple",
          title: "Удвох",
          description:
            "Романтична подорож, у якій продумані і важливі моменти, і час для спонтанності.",
        },
        {
          id: "family",
          title: "Усією родиною",
          description:
            "Зручний маршрут для дорослих і дітей — без зайвих переїздів та перевантаження.",
        },
        {
          id: "unsure",
          title: "Ще не вирішили?",
          description:
            "Розкажіть про настрій і бюджет — допоможемо обрати напрямок.",
        },
      ],
    },
    why: {
      eyebrow: "Уважність у деталях",
      title: "Чому Mandra",
      quote: "«Поруч не лише до бронювання. Поруч у подорожі»",
      reasons: [
        {
          id: "personal",
          title: "Не готовий пакет, а ваша подорож",
          description:
            "Починаємо з ваших побажань, темпу, складу подорожі та того, що для вас справді важливо.",
        },
        {
          id: "budget",
          title: "Планування в межах бюджету",
          description:
            "Відверто говоримо про варіанти й компроміси, щоб пропозиція залишалася реалістичною.",
        },
        {
          id: "contact",
          title: "Один зрозумілий контакт",
          description:
            "Вам не доведеться щоразу пояснювати запит заново різним людям.",
        },
        {
          id: "after-booking",
          title: "Поруч і після бронювання",
          description:
            "Допомагаємо зорієнтуватися в документах і наступних діях під час подорожі.",
        },
      ],
    },
    support: {
      eyebrow: "Один контакт упродовж усієї подорожі",
      title: "Поруч, якщо щось пішло не за планом",
      description:
        "Підтримка Mandra не закінчується після оплати. Під час подорожі у вас залишається один зрозумілий контакт у Telegram. Ми допоможемо знайти потрібні документи, зв’язатися зі страховою або туроператором і зрозуміти, що робити далі.",
      schedule: "Планові питання: щодня, 09:00–19:00",
      note:
        "За київським часом. Якщо під час подорожі виникла термінова проблема поза цим графіком, напишіть нам у Telegram — терміновий канал залишається відкритим. У ситуаціях, що загрожують життю або здоров’ю, насамперед зверніться до місцевої екстреної служби.",
    },
    request: {
      eyebrow: "Почнімо з вашої ідеї",
      title: "Розкажіть про майбутню подорож",
      description:
        "Тут з’явиться коротка форма заявки. Ви зможете вказати побажання, орієнтовні дати та зручний спосіб зв’язку.",
      assurance: "Точний напрямок і дати не будуть обов’язковими.",
      placeholderLabel: "Місце майбутньої форми заявки",
      placeholder: "Форма заявки з’явиться на наступному етапі",
      milestone: "Milestone 2",
    },
    faq: {
      eyebrow: "Коротко про важливе",
      title: "Часті запитання",
      items: [
        {
          id: "commitment",
          question: "Чи зобов’язує заявка до бронювання?",
          answer:
            "Ні. Заявка допоможе нам зрозуміти ваш запит і підготувати пропозицію. Рішення про бронювання ви приймаєте після обговорення деталей.",
        },
        {
          id: "response-time",
          question: "Коли зі мною зв’яжуться?",
          answer:
            "Точний час першої відповіді ми зафіксуємо перед запуском форми. У пропозиції буде чесно вказано, коли очікувати на зв’язок.",
        },
        {
          id: "no-destination",
          question: "Чи можна звернутися без обраного напрямку?",
          answer:
            "Так. Достатньо розповісти про бажаний формат відпочинку, приблизні дати та бюджет — ми допоможемо звузити вибір.",
        },
        {
          id: "trip-support",
          question: "Як працює підтримка під час подорожі?",
          answer:
            "Планові питання вирішуємо щодня з 09:00 до 19:00 за київським часом. Якщо проблема термінова й виникла пізніше, напишіть у Telegram — терміновий канал під час подорожі залишається відкритим.",
        },
        {
          id: "emergency",
          question: "Що робити в екстреній ситуації?",
          answer:
            "Якщо є загроза життю або здоров’ю, насамперед зверніться до місцевої екстреної служби. Mandra не замінює лікаря, страхову компанію чи екстрені служби.",
        },
      ],
    },
    closing: "Нехай складне планування стане легкою частиною подорожі.",
    footer: {
      description:
        "Персональні подорожі з людською підтримкою до, під час і після поїздки.",
      status: "Українська версія · дизайн для рев’ю",
    },
  },
  en: {
    pageTitle: "Mandra Travel — personal journeys",
    pageDescription:
      "Personal travel planning with human support before, during, and after your journey.",
    skipLink: "Skip to main content",
    homeLabel: "Mandra Travel — back to the top",
    mainNavLabel: "Main navigation",
    footerNavLabel: "Footer navigation",
    languageLabel: "Website language",
    ukrainianLabel: "Українська",
    englishLabel: "English",
    nav: {
      how: "How it works",
      journeys: "Journeys",
      support: "Support",
      faq: "FAQ",
    },
    planTrip: "Plan my trip",
    hero: {
      eyebrow: "Personal travel planning",
      titleStart: "Your next journey,",
      titleAccent: "shaped around you.",
      description:
        "Tell us where and how you would like to travel. We’ll prepare a personal proposal and stay connected before, during, and after your journey.",
      note: "Sending a request does not commit you to a booking.",
      imageAlt:
        "Sea coast viewed from a train window, with a travel map in the passenger’s hands",
      imageCaption: "A journey begins with a feeling",
      imageDetail: "A route at your pace",
    },
    how: {
      eyebrow: "Simple, with no unnecessary steps",
      title: "How it works",
      description:
        "From our first conversation until you are home, you’ll know what happens next and who to contact.",
      steps: [
        {
          id: "share",
          title: "Tell us about your trip",
          description:
            "Share your idea, approximate dates, and wishes. You don’t need to have a destination yet.",
        },
        {
          id: "proposal",
          title: "Receive a personal proposal",
          description:
            "We’ll select options around your pace, travel party, and approximate budget.",
        },
        {
          id: "details",
          title: "Confirm the details",
          description:
            "Together, we’ll refine the route and terms. Nothing is booked until you agree.",
        },
        {
          id: "connected",
          title: "Stay connected",
          description:
            "Throughout your journey, you’ll have one clear contact for questions and coordination.",
        },
      ],
    },
    journeys: {
      eyebrow: "Not a catalogue, but a conversation starter",
      title: "What kind of journey are you imagining?",
      items: [
        {
          id: "sea",
          title: "By the sea",
          description:
            "A calm coastal escape, with a pace that feels right for you.",
        },
        {
          id: "city",
          title: "In a new city",
          description:
            "Streets, local places, and enough time to experience the city without rushing.",
        },
        {
          id: "couple",
          title: "Just the two of you",
          description:
            "A romantic journey with thoughtful moments and room for spontaneity.",
        },
        {
          id: "family",
          title: "With the whole family",
          description:
            "A comfortable route for adults and children, without exhausting transfers or packed days.",
        },
        {
          id: "unsure",
          title: "Not sure yet?",
          description:
            "Tell us about the mood and budget, and we’ll help you choose a destination.",
        },
      ],
    },
    why: {
      eyebrow: "Thoughtful down to the details",
      title: "Why Mandra",
      quote: "“Here for you beyond the booking.”",
      reasons: [
        {
          id: "personal",
          title: "Not a package, but your journey",
          description:
            "We start with your wishes, pace, travel party, and what truly matters to you.",
        },
        {
          id: "budget",
          title: "Planning around your budget",
          description:
            "We talk openly about options and trade-offs so the proposal stays realistic.",
        },
        {
          id: "contact",
          title: "One clear point of contact",
          description:
            "You won’t need to explain your request again to a different person each time.",
        },
        {
          id: "after-booking",
          title: "Here after the booking",
          description:
            "We help you find the right documents and understand the next steps during your trip.",
        },
      ],
    },
    support: {
      eyebrow: "One contact throughout your journey",
      title: "Here when things don’t go to plan",
      description:
        "Mandra’s support does not end after payment. During your journey, you keep one clear contact in Telegram. We’ll help you find the right documents, contact your insurer or tour operator, and understand what to do next.",
      schedule: "Routine questions: daily, 09:00–19:00",
      note:
        "Kyiv time. If an urgent problem comes up outside these hours during your trip, message us on Telegram — the urgent channel remains open. If there is a threat to life or health, contact the local emergency service first.",
    },
    request: {
      eyebrow: "Let’s start with your idea",
      title: "Tell us about your next journey",
      description:
        "A short request form will appear here. You’ll be able to share your wishes, approximate dates, and preferred way to stay in touch.",
      assurance: "An exact destination and dates will not be required.",
      placeholderLabel: "Placeholder for the future trip request form",
      placeholder: "The request form will arrive in the next milestone",
      milestone: "Milestone 2",
    },
    faq: {
      eyebrow: "A few important answers",
      title: "Frequently asked questions",
      items: [
        {
          id: "commitment",
          question: "Does submitting a request commit me to a booking?",
          answer:
            "No. Your request helps us understand what you need and prepare a proposal. You decide whether to book after we discuss the details.",
        },
        {
          id: "response-time",
          question: "When will you contact me?",
          answer:
            "We’ll confirm the exact first-response time before the form goes live. The proposal will state clearly when you can expect to hear from us.",
        },
        {
          id: "no-destination",
          question: "Can I contact you without choosing a destination?",
          answer:
            "Yes. Tell us about the kind of break you want, your approximate dates, and budget, and we’ll help narrow down the options.",
        },
        {
          id: "trip-support",
          question: "How does support work during my trip?",
          answer:
            "We handle routine questions daily from 09:00 to 19:00 Kyiv time. If an urgent problem comes up later, message us on Telegram — the urgent channel remains open during your journey.",
        },
        {
          id: "emergency",
          question: "What should I do in an emergency?",
          answer:
            "If there is a threat to life or health, contact the local emergency service first. Mandra does not replace a doctor, insurer, or emergency service.",
        },
      ],
    },
    closing: "Let the complicated planning become the easy part of your journey.",
    footer: {
      description:
        "Personal journeys with human support before, during, and after your trip.",
      status: "English version · design review",
    },
  },
} as const;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function RouteMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 72 32" className="route-mark">
      <path d="M5 23c10-20 23 8 34-9 7-10 16 4 28-8" />
      <circle cx="5" cy="23" r="3" />
      <circle cx="67" cy="6" r="3" />
    </svg>
  );
}

function subscribeToLocaleChange(onStoreChange: () => void) {
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
}

export default function HomePage() {
  const locale = useSyncExternalStore(
    subscribeToLocaleChange,
    readStoredLocale,
    () => DEFAULT_LOCALE,
  );
  const copy = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = copy.pageTitle;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", copy.pageDescription);
  }, [copy.pageDescription, copy.pageTitle, locale]);

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {copy.skipLink}
      </a>

      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#top" aria-label={copy.homeLabel}>
            <span className="wordmark-mark" aria-hidden="true">M</span>
            <span>Mandra <i>Travel</i></span>
          </a>

          <nav className="desktop-nav" aria-label={copy.mainNavLabel}>
            <a href="#how-it-works">{copy.nav.how}</a>
            <a href="#journeys">{copy.nav.journeys}</a>
            <a href="#support">{copy.nav.support}</a>
            <a href="#faq">{copy.nav.faq}</a>
          </nav>

          <div className="header-actions">
            <div className="language-switcher" role="group" aria-label={copy.languageLabel}>
              <button
                type="button"
                className={locale === "uk" ? "is-active" : undefined}
                aria-pressed={locale === "uk"}
                aria-label={copy.ukrainianLabel}
                onClick={() => changeLocale("uk")}
              >
                UA
              </button>
              <span aria-hidden="true">|</span>
              <button
                type="button"
                className={locale === "en" ? "is-active" : undefined}
                aria-pressed={locale === "en"}
                aria-label={copy.englishLabel}
                onClick={() => changeLocale("en")}
              >
                EN
              </button>
            </div>
            <a className="button button-small" href="#request" aria-label={copy.planTrip}>
              <span className="button-small-label">{copy.planTrip}</span>
              <ArrowIcon />
            </a>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{copy.hero.eyebrow}</p>
              <h1 id="hero-title">{copy.hero.titleStart} <em>{copy.hero.titleAccent}</em></h1>
              <p className="hero-description">{copy.hero.description}</p>
              <div className="hero-actions">
                <a className="button" href="#request">{copy.planTrip}<ArrowIcon /></a>
                <a className="text-link" href="#how-it-works">{copy.nav.how} <span aria-hidden="true">↓</span></a>
              </div>
              <p className="hero-note"><span aria-hidden="true">✓</span>{copy.hero.note}</p>
            </div>

            <div className="hero-visual">
              <div className="hero-image-wrap">
                <Image src={`${imageBasePath}/images/mandra-coastal-train.png`} alt={copy.hero.imageAlt} fill priority sizes="(max-width: 899px) 100vw, 46vw" />
              </div>
              <p className="image-caption"><span>{copy.hero.imageCaption}</span><span>{copy.hero.imageDetail}</span></p>
            </div>
          </div>
        </section>

        <section className="section how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="shell">
            <div className="section-heading split-heading">
              <div><p className="eyebrow">{copy.how.eyebrow}</p><h2 id="how-title">{copy.how.title}</h2></div>
              <p>{copy.how.description}</p>
            </div>
            <ol className="steps-list">
              {copy.how.steps.map((step, index) => (
                <li key={step.id}><span className="step-number">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section journeys-section" id="journeys" aria-labelledby="journeys-title">
          <div className="shell">
            <div className="section-heading"><p className="eyebrow">{copy.journeys.eyebrow}</p><h2 id="journeys-title">{copy.journeys.title}</h2></div>
            <div className="journey-grid">
              {copy.journeys.items.map((journey, index) => (
                <article className="journey-card" key={journey.id}><span>0{index + 1}</span><div><h3>{journey.title}</h3><p>{journey.description}</p></div><RouteMark /></article>
              ))}
            </div>
          </div>
        </section>

        <section className="section why-section" id="why" aria-labelledby="why-title">
          <div className="shell why-grid">
            <div className="why-intro"><p className="eyebrow">{copy.why.eyebrow}</p><h2 id="why-title">{copy.why.title}</h2><blockquote>{copy.why.quote}</blockquote></div>
            <div className="reasons-list">
              {copy.why.reasons.map((reason, index) => (
                <article key={reason.id}><span aria-hidden="true">0{index + 1}</span><div><h3>{reason.title}</h3><p>{reason.description}</p></div></article>
              ))}
            </div>
          </div>
        </section>

        <section className="section support-section" id="support" aria-labelledby="support-title">
          <div className="shell support-card">
            <div className="support-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 42c9-6 15-14 15-23V9l-15-5L9 9v10c0 9 6 17 15 23Z" /><path d="m17 23 5 5 10-11" /></svg></div>
            <div><p className="eyebrow">{copy.support.eyebrow}</p><h2 id="support-title">{copy.support.title}</h2><p className="support-lead">{copy.support.description}</p><div className="support-note"><strong>{copy.support.schedule}</strong><p>{copy.support.note}</p></div></div>
          </div>
        </section>

        <section className="section request-section" id="request" aria-labelledby="request-title">
          <div className="shell request-grid">
            <div><p className="eyebrow">{copy.request.eyebrow}</p><h2 id="request-title">{copy.request.title}</h2><p className="request-copy">{copy.request.description}</p><p className="request-assurance"><span aria-hidden="true">✓</span>{copy.request.assurance}</p></div>
            <div className="form-placeholder" aria-label={copy.request.placeholderLabel}><div className="placeholder-route" aria-hidden="true"><span /><i /><span /></div><p>{copy.request.placeholder}</p><span>{copy.request.milestone}</span></div>
          </div>
        </section>

        <section className="section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="shell faq-grid">
            <div><p className="eyebrow">{copy.faq.eyebrow}</p><h2 id="faq-title">{copy.faq.title}</h2></div>
            <div className="faq-list">
              {copy.faq.items.map((item, index) => (
                <details key={item.id} open={index === 0}><summary><span>{item.question}</span><i aria-hidden="true" /></summary><p>{item.answer}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-cta" aria-labelledby="closing-title">
          <div className="shell closing-inner"><RouteMark /><p className="eyebrow">Mandra Travel</p><h2 id="closing-title">{copy.closing}</h2><a className="button button-light" href="#request">{copy.planTrip}<ArrowIcon /></a></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-main">
          <a className="wordmark wordmark-light" href="#top" aria-label={copy.homeLabel}><span className="wordmark-mark" aria-hidden="true">M</span><span>Mandra <i>Travel</i></span></a>
          <p>{copy.footer.description}</p>
          <nav aria-label={copy.footerNavLabel}><a href="#how-it-works">{copy.nav.how}</a><a href="#journeys">{copy.nav.journeys}</a><a href="#support">{copy.nav.support}</a><a href="#faq">{copy.nav.faq}</a></nav>
        </div>
        <div className="shell footer-bottom"><span>© 2026 Mandra Travel</span><span>{copy.footer.status}</span></div>
      </footer>
    </>
  );
}
