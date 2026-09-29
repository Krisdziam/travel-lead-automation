"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { Locale } from "./locale";

type ContactMethod = "telegram" | "whatsapp" | "viber" | "phone" | "email";
type DestinationChoice = "chosen" | "help";

type LeadFormProps = {
  locale: Locale;
};

const contactMethods: ContactMethod[] = [
  "telegram",
  "whatsapp",
  "viber",
  "phone",
  "email",
];

const copy = {
  uk: {
    optional: "необов’язково",
    required: "обов’язково",
    travel: {
      legend: "Про подорож",
      description: "Орієнтовної інформації достатньо — усі деталі зможемо уточнити разом.",
      departure: "Місто або країна відправлення",
      departurePlaceholder: "Наприклад, Київ або Польща",
      destinationChoice: "Чи маєте бажаний напрямок?",
      destinationChosen: "Так, маю ідею",
      destinationHelp: "Допоможіть обрати",
      destination: "Бажаний напрямок",
      destinationPlaceholder: "Наприклад, Португалія або відпочинок біля моря",
      dates: "Приблизні дати",
      dateFrom: "Від",
      dateTo: "До",
      flexibleDates: "Дати гнучкі",
      adults: "Кількість дорослих",
      children: "Кількість дітей",
      budget: "Загальний бюджет на всю подорож",
      budgetPlaceholder: "Оберіть приблизний діапазон",
      budgets: {
        under1500: "До €1 500",
        from1500To3000: "€1 500–3 000",
        from3000To5000: "€3 000–5 000",
        from5000To8000: "€5 000–8 000",
        over8000: "Понад €8 000",
        unsure: "Ще не визначилися",
      },
      comment: "Короткий коментар або побажання",
      commentPlaceholder: "Розкажіть, що для вас важливо у цій подорожі",
    },
    contact: {
      legend: "Як із вами зв’язатися",
      description: "Оберіть зручний канал — поле нижче зміниться відповідно до вашого вибору.",
      firstName: "Ім’я",
      firstNamePlaceholder: "Ваше ім’я",
      lastName: "Прізвище",
      lastNamePlaceholder: "Ваше прізвище",
      method: "Бажаний спосіб зв’язку",
      methods: {
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        viber: "Viber",
        phone: "Телефон",
        email: "Email",
      },
      details: {
        telegram: {
          label: "Ім’я користувача або посилання Telegram",
          placeholder: "@username або https://t.me/username",
          hint: "Можна вказати @username або повне посилання на профіль.",
        },
        whatsapp: {
          label: "Номер у WhatsApp",
          placeholder: "+380 00 000 00 00",
          hint: "Вкажіть номер із кодом країни.",
        },
        viber: {
          label: "Номер у Viber",
          placeholder: "+380 00 000 00 00",
          hint: "Вкажіть номер із кодом країни.",
        },
        phone: {
          label: "Номер телефону",
          placeholder: "+380 00 000 00 00",
          hint: "Вкажіть номер із кодом країни.",
        },
        email: {
          label: "Email",
          placeholder: "name@example.com",
          hint: "На цю адресу ми надішлемо відповідь.",
        },
      },
      language: "Мова спілкування",
      languages: { uk: "Українська", en: "English" },
    },
    confirmation: {
      legend: "Підтвердження",
      description:
        "Ми використаємо надану інформацію лише для підготовки персональної пропозиції та зв’язку з вами.",
      consent:
        "Погоджуюся на обробку наданої інформації для підготовки пропозиції та зв’язку зі мною.",
      button: "Надсилання буде підключене на наступному етапі",
      note: "Зараз форма нічого не надсилає і не зберігає на сервері.",
      status: "Дані не надіслано. Підключення надсилання заплановане на наступний етап.",
    },
  },
  en: {
    optional: "optional",
    required: "required",
    travel: {
      legend: "About your trip",
      description: "Approximate information is enough — we can refine every detail together.",
      departure: "Departure city or country",
      departurePlaceholder: "For example, Kyiv or Poland",
      destinationChoice: "Do you have a destination in mind?",
      destinationChosen: "Yes, I have an idea",
      destinationHelp: "Help me choose",
      destination: "Preferred destination",
      destinationPlaceholder: "For example, Portugal or a seaside break",
      dates: "Approximate dates",
      dateFrom: "From",
      dateTo: "To",
      flexibleDates: "My dates are flexible",
      adults: "Number of adults",
      children: "Number of children",
      budget: "Total budget for the whole trip",
      budgetPlaceholder: "Choose an approximate range",
      budgets: {
        under1500: "Up to €1,500",
        from1500To3000: "€1,500–3,000",
        from3000To5000: "€3,000–5,000",
        from5000To8000: "€5,000–8,000",
        over8000: "Over €8,000",
        unsure: "Not sure yet",
      },
      comment: "Short comment or wishes",
      commentPlaceholder: "Tell us what matters most to you on this trip",
    },
    contact: {
      legend: "How to contact you",
      description: "Choose the channel you prefer — the field below will adapt to your selection.",
      firstName: "First name",
      firstNamePlaceholder: "Your first name",
      lastName: "Last name",
      lastNamePlaceholder: "Your last name",
      method: "Preferred contact method",
      methods: {
        telegram: "Telegram",
        whatsapp: "WhatsApp",
        viber: "Viber",
        phone: "Phone",
        email: "Email",
      },
      details: {
        telegram: {
          label: "Telegram username or link",
          placeholder: "@username or https://t.me/username",
          hint: "Enter an @username or a full profile link.",
        },
        whatsapp: {
          label: "WhatsApp number",
          placeholder: "+380 00 000 00 00",
          hint: "Include the country code.",
        },
        viber: {
          label: "Viber number",
          placeholder: "+380 00 000 00 00",
          hint: "Include the country code.",
        },
        phone: {
          label: "Phone number",
          placeholder: "+380 00 000 00 00",
          hint: "Include the country code.",
        },
        email: {
          label: "Email",
          placeholder: "name@example.com",
          hint: "We’ll send our reply to this address.",
        },
      },
      language: "Communication language",
      languages: { uk: "Українська", en: "English" },
    },
    confirmation: {
      legend: "Confirmation",
      description:
        "We’ll use the information you provide only to prepare a personal proposal and contact you.",
      consent:
        "I agree to the processing of the information provided to prepare a proposal and contact me.",
      button: "Submission will be connected in the next stage",
      note: "The form does not send or store anything on a server yet.",
      status: "Nothing was sent. Form submission is planned for the next stage.",
    },
  },
} as const;

const initialContactValues: Record<ContactMethod, string> = {
  telegram: "",
  whatsapp: "",
  viber: "",
  phone: "",
  email: "",
};

export default function LeadForm({ locale }: LeadFormProps) {
  const t = copy[locale];
  const [destinationChoice, setDestinationChoice] = useState<DestinationChoice>("chosen");
  const [destination, setDestination] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("telegram");
  const [contactValues, setContactValues] = useState(initialContactValues);
  const [communicationLanguage, setCommunicationLanguage] = useState<Locale>(locale);
  const [statusVisible, setStatusVisible] = useState(false);
  const communicationLanguageChanged = useRef(false);

  useEffect(() => {
    if (!communicationLanguageChanged.current) {
      setCommunicationLanguage(locale);
    }
  }, [locale]);

  const contactDetail = t.contact.details[contactMethod];
  const contactInputType = contactMethod === "email" ? "email" : contactMethod === "telegram" ? "text" : "tel";
  const contactAutocomplete = contactMethod === "email" ? "email" : contactMethod === "telegram" ? "off" : "tel";

  function showNotConnectedStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusVisible(true);
  }

  return (
    <form className="lead-form" onSubmit={showNotConnectedStatus}>
      <fieldset className="form-section">
        <legend>{t.travel.legend}</legend>
        <p className="form-section-description">{t.travel.description}</p>

        <div className="form-fields form-fields-two-columns">
          <div className="form-field form-field-full">
            <label htmlFor="departure">
              {t.travel.departure}
              <span className="field-requirement">{t.optional}</span>
            </label>
            <input id="departure" name="departure" type="text" autoComplete="address-level2" placeholder={t.travel.departurePlaceholder} />
          </div>

          <fieldset className="choice-group form-field-full">
            <legend>{t.travel.destinationChoice}</legend>
            <div className="segmented-options">
              <label>
                <input type="radio" name="destinationChoice" value="chosen" checked={destinationChoice === "chosen"} onChange={() => setDestinationChoice("chosen")} />
                <span>{t.travel.destinationChosen}</span>
              </label>
              <label>
                <input type="radio" name="destinationChoice" value="help" checked={destinationChoice === "help"} onChange={() => setDestinationChoice("help")} />
                <span>{t.travel.destinationHelp}</span>
              </label>
            </div>
          </fieldset>

          {destinationChoice === "chosen" && (
            <div className="form-field form-field-full">
              <label htmlFor="destination">
                {t.travel.destination}
                <span className="field-requirement">{t.optional}</span>
              </label>
              <input
                id="destination"
                name="destination"
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder={t.travel.destinationPlaceholder}
              />
            </div>
          )}

          <fieldset className="choice-group form-field-full">
            <legend>
              {t.travel.dates}
              <span className="field-requirement">{t.optional}</span>
            </legend>
            <div className="date-fields">
              <div className="form-field">
                <label htmlFor="date-from">{t.travel.dateFrom}</label>
                <input id="date-from" name="dateFrom" type="date" />
              </div>
              <div className="form-field">
                <label htmlFor="date-to">{t.travel.dateTo}</label>
                <input id="date-to" name="dateTo" type="date" />
              </div>
            </div>
            <label className="checkbox-field">
              <input name="flexibleDates" type="checkbox" />
              <span>{t.travel.flexibleDates}</span>
            </label>
          </fieldset>

          <div className="form-field">
            <label htmlFor="adults">{t.travel.adults}</label>
            <input id="adults" name="adults" type="number" inputMode="numeric" min="1" max="20" defaultValue="1" />
          </div>

          <div className="form-field">
            <label htmlFor="children">
              {t.travel.children}
              <span className="field-requirement">{t.optional}</span>
            </label>
            <input id="children" name="children" type="number" inputMode="numeric" min="0" max="20" defaultValue="0" />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="budget">
              {t.travel.budget}
              <span className="field-requirement">{t.optional}</span>
            </label>
            <select id="budget" name="budget" defaultValue="">
              <option value="">{t.travel.budgetPlaceholder}</option>
              {Object.entries(t.travel.budgets).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="comment">
              {t.travel.comment}
              <span className="field-requirement">{t.optional}</span>
            </label>
            <textarea id="comment" name="comment" rows={4} maxLength={600} placeholder={t.travel.commentPlaceholder} />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>{t.contact.legend}</legend>
        <p className="form-section-description">{t.contact.description}</p>

        <div className="form-fields form-fields-two-columns">
          <div className="form-field">
            <label htmlFor="first-name">
              {t.contact.firstName}
              <span className="field-requirement">{t.required}</span>
            </label>
            <input id="first-name" name="firstName" type="text" autoComplete="given-name" required placeholder={t.contact.firstNamePlaceholder} />
          </div>

          <div className="form-field">
            <label htmlFor="last-name">
              {t.contact.lastName}
              <span className="field-requirement">{t.required}</span>
            </label>
            <input id="last-name" name="lastName" type="text" autoComplete="family-name" required placeholder={t.contact.lastNamePlaceholder} />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="contact-method">{t.contact.method}</label>
            <select id="contact-method" name="contactMethod" value={contactMethod} onChange={(event) => setContactMethod(event.target.value as ContactMethod)}>
              {contactMethods.map((method) => (
                <option key={method} value={method}>{t.contact.methods[method]}</option>
              ))}
            </select>
          </div>

          <div className="form-field form-field-full">
            <label htmlFor={`contact-${contactMethod}`}>
              {contactDetail.label}
              <span className="field-requirement">{t.required}</span>
            </label>
            <input
              key={contactMethod}
              id={`contact-${contactMethod}`}
              name="contactDetail"
              type={contactInputType}
              inputMode={contactInputType === "tel" ? "tel" : contactInputType === "email" ? "email" : "text"}
              autoComplete={contactAutocomplete}
              required
              value={contactValues[contactMethod]}
              onChange={(event) => setContactValues((current) => ({ ...current, [contactMethod]: event.target.value }))}
              placeholder={contactDetail.placeholder}
              aria-describedby="contact-detail-hint"
            />
            <p className="field-hint" id="contact-detail-hint">{contactDetail.hint}</p>
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="communication-language">{t.contact.language}</label>
            <select
              id="communication-language"
              name="communicationLanguage"
              value={communicationLanguage}
              onChange={(event) => {
                communicationLanguageChanged.current = true;
                setCommunicationLanguage(event.target.value as Locale);
              }}
            >
              <option value="uk">{t.contact.languages.uk}</option>
              <option value="en">{t.contact.languages.en}</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section form-confirmation">
        <legend>{t.confirmation.legend}</legend>
        <p className="form-section-description">{t.confirmation.description}</p>
        <label className="checkbox-field consent-field">
          <input name="consent" type="checkbox" required />
          <span>
            {t.confirmation.consent}
            <small>{t.required}</small>
          </span>
        </label>
        <button className="form-submit-preview" type="submit">{t.confirmation.button}</button>
        <p className="submission-note">{t.confirmation.note}</p>
        <p className="submission-status" role="status" aria-live="polite">
          {statusVisible ? t.confirmation.status : ""}
        </p>
      </fieldset>
    </form>
  );
}
