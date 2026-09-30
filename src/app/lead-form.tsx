"use client";

import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from "react";

import {
  CONTACT_METHODS,
  getDateLimits,
  validateLeadForm,
  type ChildAgeField,
  type ContactMethod,
  type LeadFormValues,
  type ValidationErrorCode,
  type ValidationErrors,
  type ValidationField,
} from "./lead-form-validation";
import {
  createSubmissionExecutor,
  formSubmissionReducer,
  initialFormSubmissionState,
  type DemoScenario,
} from "./lead-form-submission";
import type { Locale } from "./locale";

type DestinationChoice = "chosen" | "help";
type LeadFormProps = { locale: Locale };
type DemoMode = "off" | DemoScenario;
type SubmissionExecutor = ReturnType<typeof createSubmissionExecutor>;

const SUBMISSION_DEMO_ENABLED = process.env.NODE_ENV === "development";

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
      childAges: "Вік дітей",
      childAge: "Вік дитини",
      childAgeHint: "0 означає, що дитині ще немає одного року.",
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
      methods: { telegram: "Telegram", whatsapp: "WhatsApp", viber: "Viber", phone: "Телефон", email: "Email" },
      details: {
        telegram: {
          label: "Ім’я користувача або посилання Telegram",
          placeholder: "@username або https://t.me/username",
          hint: "Username має містити 5–32 латинські літери, цифри або знак підкреслення.",
        },
        whatsapp: {
          label: "Номер у WhatsApp",
          placeholder: "+380 00 000 00 00",
          hint: "Вкажіть номер із кодом країни, починаючи з +.",
        },
        viber: {
          label: "Номер у Viber",
          placeholder: "+380 00 000 00 00",
          hint: "Вкажіть номер із кодом країни, починаючи з +.",
        },
        phone: {
          label: "Номер телефону",
          placeholder: "+380 00 000 00 00",
          hint: "Вкажіть номер із кодом країни, починаючи з +.",
        },
        email: {
          label: "Email",
          placeholder: "name@example.com",
          hint: "На цю адресу ми зможемо надіслати відповідь після підключення сервера.",
        },
      },
      language: "Мова спілкування",
      languages: { uk: "Українська", en: "English" },
    },
    confirmation: {
      legend: "Підтвердження",
      description: "Ми використаємо надану інформацію лише для підготовки персональної пропозиції та зв’язку з вами.",
      consent: "Погоджуюся на обробку наданої інформації для підготовки пропозиції та зв’язку зі мною.",
      button: "Перевірити дані",
      note: "Зараз форма нічого не надсилає і не зберігає на сервері.",
      ready: "Усі поля заповнені коректно. Дані не надіслано — надсилання буде підключене на наступному етапі.",
      validating: "Перевіряємо введені дані…",
    },
    validation: {
      summaryTitle: "Перевірте форму",
      summaryText: "У формі є помилки. Виправте позначені поля:",
      errors: {
        spam: "Не вдалося перевірити форму. Оновіть сторінку та спробуйте ще раз.",
        departureInvalid: "Вкажіть місто або країну відправлення — від 2 до 80 символів.",
        destinationChoiceRequired: "Оберіть один із варіантів напрямку.",
        destinationInvalid: "Вкажіть напрямок — від 2 до 100 символів — або оберіть «Допоможіть обрати».",
        datesRequired: "Вкажіть обидві дати або позначте «Дати гнучкі».",
        dateFromRequired: "Вкажіть дату початку.",
        dateToRequired: "Вкажіть дату завершення.",
        dateInvalid: "Вкажіть коректну дату.",
        datePast: "Дата не може бути в минулому.",
        dateTooLate: "Дата має бути не пізніше ніж через 3 роки.",
        dateOrder: "Дата завершення не може бути раніше дати початку.",
        adultsInvalid: "Вкажіть кількість дорослих від 1 до 12.",
        childrenInvalid: "Вкажіть кількість дітей від 0 до 8.",
        childAgeInvalid: "Вкажіть вік дитини від 0 до 17 років.",
        budgetInvalid: "Оберіть доступний бюджетний діапазон.",
        commentTooLong: "Коментар не може перевищувати 600 символів.",
        firstNameInvalid: "Вкажіть ім’я — від 2 до 50 символів.",
        lastNameInvalid: "Вкажіть прізвище — від 2 до 50 символів.",
        contactMethodRequired: "Оберіть спосіб зв’язку.",
        telegramInvalid: "Вкажіть коректний Telegram username або посилання.",
        whatsappInvalid: "Вкажіть номер WhatsApp із кодом країни.",
        viberInvalid: "Вкажіть номер Viber із кодом країни.",
        phoneInvalid: "Вкажіть номер телефону з кодом країни.",
        emailInvalid: "Вкажіть коректну email-адресу.",
        languageRequired: "Оберіть мову спілкування.",
        consentRequired: "Підтвердьте згоду на обробку інформації.",
      },
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
      childAges: "Children’s ages",
      childAge: "Age of child",
      childAgeHint: "Use 0 when the child is under one year old.",
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
      methods: { telegram: "Telegram", whatsapp: "WhatsApp", viber: "Viber", phone: "Phone", email: "Email" },
      details: {
        telegram: {
          label: "Telegram username or link",
          placeholder: "@username or https://t.me/username",
          hint: "The username must contain 5–32 Latin letters, numbers, or underscores.",
        },
        whatsapp: { label: "WhatsApp number", placeholder: "+380 00 000 00 00", hint: "Include the country code and start with +." },
        viber: { label: "Viber number", placeholder: "+380 00 000 00 00", hint: "Include the country code and start with +." },
        phone: { label: "Phone number", placeholder: "+380 00 000 00 00", hint: "Include the country code and start with +." },
        email: { label: "Email", placeholder: "name@example.com", hint: "We’ll be able to reply here after the server is connected." },
      },
      language: "Communication language",
      languages: { uk: "Українська", en: "English" },
    },
    confirmation: {
      legend: "Confirmation",
      description: "We’ll use the information you provide only to prepare a personal proposal and contact you.",
      consent: "I agree to the processing of the information provided to prepare a proposal and contact me.",
      button: "Check details",
      note: "The form does not send or store anything on a server yet.",
      ready: "All fields are valid. Nothing was sent — submission will be connected in the next stage.",
      validating: "Checking the information you entered…",
    },
    validation: {
      summaryTitle: "Check the form",
      summaryText: "There are errors in the form. Correct the highlighted fields:",
      errors: {
        spam: "We could not check the form. Refresh the page and try again.",
        departureInvalid: "Enter a departure city or country between 2 and 80 characters.",
        destinationChoiceRequired: "Choose one of the destination options.",
        destinationInvalid: "Enter a destination between 2 and 100 characters or choose ‘Help me choose’.",
        datesRequired: "Enter both dates or select ‘My dates are flexible’.",
        dateFromRequired: "Enter a start date.",
        dateToRequired: "Enter an end date.",
        dateInvalid: "Enter a valid date.",
        datePast: "The date cannot be in the past.",
        dateTooLate: "The date must be no more than 3 years from today.",
        dateOrder: "The end date cannot be earlier than the start date.",
        adultsInvalid: "Enter between 1 and 12 adults.",
        childrenInvalid: "Enter between 0 and 8 children.",
        childAgeInvalid: "Enter the child’s age from 0 to 17.",
        budgetInvalid: "Choose one of the available budget ranges.",
        commentTooLong: "The comment cannot exceed 600 characters.",
        firstNameInvalid: "Enter a first name between 2 and 50 characters.",
        lastNameInvalid: "Enter a last name between 2 and 50 characters.",
        contactMethodRequired: "Choose a contact method.",
        telegramInvalid: "Enter a valid Telegram username or link.",
        whatsappInvalid: "Enter a WhatsApp number with the country code.",
        viberInvalid: "Enter a Viber number with the country code.",
        phoneInvalid: "Enter a phone number with the country code.",
        emailInvalid: "Enter a valid email address.",
        languageRequired: "Choose a communication language.",
        consentRequired: "Confirm your consent to process the information.",
      },
    },
  },
} as const;

const demoCopy = process.env.NODE_ENV === "development" ? {
  uk: {
    submitting: "Демонстраційне надсилання… Жодного мережевого запиту не виконується.",
    success: "Демонстраційну заявку створено локально. Тестовий номер заявки:",
    error: "У демонстраційному режимі сталася технічна помилка. Усі введені дані збережено.",
    retry: "Спробувати ще раз",
    submit: "Запустити демонстраційне надсилання",
    eyebrow: "Лише для локальної розробки",
    title: "Демонстрація станів форми",
    description: "Цей блок не виконує мережевих запитів і не з’явиться на production-сайті.",
    scenario: "Сценарій",
    off: "Звичайний режим — лише перевірка",
    demoSuccess: "Демо — успішний результат",
    errorOnce: "Демо — помилка, потім успіх",
    currentState: "Поточний стан",
  },
  en: {
    submitting: "Demonstration submission in progress… No network request is being made.",
    success: "The demonstration request was created locally. Test request number:",
    error: "A technical error occurred in demonstration mode. All entered information has been preserved.",
    retry: "Try again",
    submit: "Run demonstration submission",
    eyebrow: "Local development only",
    title: "Form state demonstration",
    description: "This panel makes no network requests and will not appear on the production site.",
    scenario: "Scenario",
    off: "Normal mode — validation only",
    demoSuccess: "Demo — successful result",
    errorOnce: "Demo — error, then success",
    currentState: "Current state",
  },
} as const : null;

const initialContactValues: Record<ContactMethod, string> = {
  telegram: "",
  whatsapp: "",
  viber: "",
  phone: "",
  email: "",
};

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readFormValues(form: HTMLFormElement): LeadFormValues {
  const formData = new FormData(form);
  return {
    departure: readText(formData, "departure"),
    destinationChoice: readText(formData, "destinationChoice"),
    destination: readText(formData, "destination"),
    dateFrom: readText(formData, "dateFrom"),
    dateTo: readText(formData, "dateTo"),
    flexibleDates: formData.has("flexibleDates"),
    adults: readText(formData, "adults"),
    children: readText(formData, "children"),
    childAges: Array.from({ length: 8 }, (_, index) => readText(formData, `childAge-${index}`)),
    budget: readText(formData, "budget"),
    comment: readText(formData, "comment"),
    firstName: readText(formData, "firstName"),
    lastName: readText(formData, "lastName"),
    contactMethod: readText(formData, "contactMethod"),
    contactDetail: readText(formData, "contactDetail"),
    communicationLanguage: readText(formData, "communicationLanguage"),
    consent: formData.has("consent"),
    website: readText(formData, "website"),
  };
}

function isChildAgeField(field: ValidationField): field is ChildAgeField {
  return field.startsWith("childAge-");
}

function fieldId(field: ValidationField) {
  if (isChildAgeField(field)) return field.replace("childAge", "child-age");
  const staticFieldIds: Record<Exclude<ValidationField, ChildAgeField>, string> = {
    form: "form-errors",
    departure: "departure",
    destinationChoice: "destination-choice-chosen",
    destination: "destination",
    dates: "date-from",
    dateFrom: "date-from",
    dateTo: "date-to",
    adults: "adults",
    children: "children",
    budget: "budget",
    comment: "comment",
    firstName: "first-name",
    lastName: "last-name",
    contactMethod: "contact-method",
    contactDetail: "contact-detail",
    communicationLanguage: "communication-language",
    consent: "consent",
  };
  return staticFieldIds[field];
}

function describedBy(...ids: Array<string | false | undefined>) {
  return ids.filter(Boolean).join(" ") || undefined;
}

export default function LeadForm({ locale }: LeadFormProps) {
  const t = copy[locale];
  const demoT = demoCopy?.[locale];
  const dateLimits = useMemo(() => getDateLimits(), []);
  const [destinationChoice, setDestinationChoice] = useState<DestinationChoice>("chosen");
  const [destination, setDestination] = useState("");
  const [children, setChildren] = useState("0");
  const [childAges, setChildAges] = useState(() => Array<string>(8).fill(""));
  const [contactMethod, setContactMethod] = useState<ContactMethod>("telegram");
  const [contactValues, setContactValues] = useState(initialContactValues);
  const [communicationLanguage, setCommunicationLanguage] = useState<Locale>(locale);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [submissionState, dispatchSubmission] = useReducer(
    formSubmissionReducer,
    initialFormSubmissionState,
  );
  const [demoMode, setDemoMode] = useState<DemoMode>("off");
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const submissionStatusRef = useRef<HTMLParagraphElement>(null);
  const communicationLanguageChanged = useRef(false);
  const submissionGuardRef = useRef(false);
  const demoExecutorRef = useRef<{
    scenario: DemoScenario;
    executor: SubmissionExecutor;
  } | null>(null);

  useEffect(() => {
    if (!communicationLanguageChanged.current) setCommunicationLanguage(locale);
  }, [locale]);

  const contactDetail = t.contact.details[contactMethod];
  const contactInputType = contactMethod === "email" ? "email" : contactMethod === "telegram" ? "text" : "tel";
  const contactAutocomplete = contactMethod === "email" ? "email" : contactMethod === "telegram" ? "off" : "tel";
  const contactMaxLength = contactMethod === "email" ? 254 : contactMethod === "telegram" ? 64 : 24;
  const parsedChildren = /^\d+$/.test(children) ? Number(children) : 0;
  const visibleChildCount = parsedChildren >= 1 && parsedChildren <= 8 ? parsedChildren : 0;
  const errorEntries = Object.entries(errors) as Array<[ValidationField, ValidationErrorCode]>;
  const isBusy = submissionState.status === "validating" || submissionState.status === "submitting";
  const isDemoMode = Boolean(demoT) && demoMode !== "off";

  const submissionMessage = (() => {
    if (submissionState.status === "validating") return t.confirmation.validating;
    if (submissionState.status === "submitting") return demoT?.submitting ?? "";
    if (submissionState.status === "success") {
      return demoT ? `${demoT.success} ${submissionState.leadId}.` : "";
    }
    if (submissionState.status === "error") return demoT?.error ?? "";
    if (submissionState.notice === "validated") return t.confirmation.ready;
    return "";
  })();

  const submitButtonLabel = (() => {
    if (submissionState.status === "validating") return t.confirmation.validating;
    if (submissionState.status === "submitting") return demoT?.submitting ?? t.confirmation.button;
    if (submissionState.status === "error" && isDemoMode) return demoT?.retry ?? t.confirmation.button;
    if (isDemoMode) return demoT?.submit ?? t.confirmation.button;
    return t.confirmation.button;
  })();

  function errorMessage(field: ValidationField) {
    const code = errors[field];
    return code ? t.validation.errors[code] : undefined;
  }

  function summaryFieldName(field: ValidationField) {
    if (isChildAgeField(field)) return `${t.travel.childAge} ${Number(field.split("-")[1]) + 1}`;
    const staticFieldNames: Record<Exclude<ValidationField, ChildAgeField>, string> = {
      form: t.validation.summaryTitle,
      departure: t.travel.departure,
      destinationChoice: t.travel.destinationChoice,
      destination: t.travel.destination,
      dates: t.travel.dates,
      dateFrom: t.travel.dateFrom,
      dateTo: t.travel.dateTo,
      adults: t.travel.adults,
      children: t.travel.children,
      budget: t.travel.budget,
      comment: t.travel.comment,
      firstName: t.contact.firstName,
      lastName: t.contact.lastName,
      contactMethod: t.contact.method,
      contactDetail: contactDetail.label,
      communicationLanguage: t.contact.language,
      consent: t.confirmation.legend,
    };
    return staticFieldNames[field];
  }

  function focusField(field: ValidationField) {
    if (field === "form") errorSummaryRef.current?.focus();
    else document.getElementById(fieldId(field))?.focus();
  }

  function runValidation(form: HTMLFormElement) {
    return validateLeadForm(readFormValues(form));
  }

  function handleFormChange() {
    dispatchSubmission({ type: "formChanged" });
    if (!hasAttemptedValidation) return;
    window.requestAnimationFrame(() => {
      if (formRef.current) setErrors(runValidation(formRef.current));
    });
  }

  async function getDemoExecutor(scenario: DemoScenario) {
    if (demoExecutorRef.current?.scenario === scenario) return demoExecutorRef.current.executor;

    if (process.env.NODE_ENV === "development") {
      const { createDemoSubmitLead } = await import("./lead-form-demo");
      const executor = createSubmissionExecutor(createDemoSubmitLead(scenario));
      demoExecutorRef.current = { scenario, executor };
      return executor;
    }

    throw new Error("The local submission demo is unavailable.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionGuardRef.current || submissionState.status === "submitting") return;

    submissionGuardRef.current = true;
    const values = readFormValues(event.currentTarget);
    dispatchSubmission({ type: "validationStarted" });

    if (isDemoMode) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 300));
    } else {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    }

    const nextErrors = validateLeadForm(values);
    const firstError = Object.keys(nextErrors)[0] as ValidationField | undefined;
    setHasAttemptedValidation(true);
    setErrors(nextErrors);

    if (firstError) {
      dispatchSubmission({ type: "validationFailed" });
      submissionGuardRef.current = false;
      window.requestAnimationFrame(() => focusField(firstError));
      return;
    }

    if (!isDemoMode) {
      dispatchSubmission({ type: "validationPassed" });
      submissionGuardRef.current = false;
      window.requestAnimationFrame(() => submissionStatusRef.current?.focus());
      return;
    }

    dispatchSubmission({ type: "submissionStarted" });
    const executor = await getDemoExecutor(demoMode);
    const attempt = await executor.submit(values);

    if (attempt.kind === "completed") {
      if (attempt.result.ok) {
        dispatchSubmission({ type: "submissionSucceeded", leadId: attempt.result.leadId });
      } else {
        dispatchSubmission({ type: "submissionFailed", errorCode: attempt.result.error.code });
      }
    }

    submissionGuardRef.current = false;
    window.requestAnimationFrame(() => submissionStatusRef.current?.focus());
  }

  return (
    <form
      className="lead-form"
      ref={formRef}
      noValidate
      data-submission-state={submissionState.status}
      onChange={handleFormChange}
      onSubmit={handleSubmit}
    >
      {errorEntries.length > 0 && (
        <div className="error-summary" id="form-errors" ref={errorSummaryRef} role="alert" aria-live="assertive" tabIndex={-1}>
          <h3>{t.validation.summaryTitle}</h3>
          <p>{t.validation.summaryText}</p>
          <ul>
            {errorEntries.map(([field, code]) => (
              <li key={field}>
                {field === "form" ? t.validation.errors[code] : (
                  <a href={`#${fieldId(field)}`} onClick={(event) => { event.preventDefault(); focusField(field); }}>
                    {summaryFieldName(field)}: {t.validation.errors[code]}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {SUBMISSION_DEMO_ENABLED && demoT && (
        <section className="submission-demo" data-local-submission-demo aria-labelledby="submission-demo-title">
          <p className="submission-demo-eyebrow">{demoT.eyebrow}</p>
          <h3 id="submission-demo-title">{demoT.title}</h3>
          <p>{demoT.description}</p>
          <div className="submission-demo-controls">
            <label htmlFor="submission-demo-scenario">{demoT.scenario}</label>
            <select
              id="submission-demo-scenario"
              value={demoMode}
              disabled={isBusy}
              onChange={(event) => {
                const nextMode = event.target.value as DemoMode;
                setDemoMode(nextMode);
                demoExecutorRef.current = null;
              }}
            >
              <option value="off">{demoT.off}</option>
              <option value="success">{demoT.demoSuccess}</option>
              <option value="errorOnce">{demoT.errorOnce}</option>
            </select>
          </div>
          <p className="submission-demo-state">
            {demoT.currentState}: <code>{submissionState.status}</code>
          </p>
        </section>
      )}

      <fieldset className="form-section">
        <legend>{t.travel.legend}</legend>
        <p className="form-section-description">{t.travel.description}</p>
        <div className="form-fields form-fields-two-columns">
          <div className="form-field form-field-full">
            <label htmlFor="departure">{t.travel.departure}<span className="field-requirement">{t.required}</span></label>
            <input id="departure" name="departure" type="text" autoComplete="address-level2" minLength={2} maxLength={80} required placeholder={t.travel.departurePlaceholder} aria-invalid={Boolean(errors.departure)} aria-describedby={describedBy(errors.departure && "departure-error")} />
            {errorMessage("departure") && <p className="field-error" id="departure-error">{errorMessage("departure")}</p>}
          </div>

          <fieldset className={`choice-group form-field-full${errors.destinationChoice ? " has-error" : ""}`} aria-describedby={describedBy(errors.destinationChoice && "destination-choice-error")}>
            <legend>{t.travel.destinationChoice}<span className="field-requirement">{t.required}</span></legend>
            <div className="segmented-options">
              <label>
                <input id="destination-choice-chosen" type="radio" name="destinationChoice" value="chosen" checked={destinationChoice === "chosen"} onChange={() => setDestinationChoice("chosen")} />
                <span>{t.travel.destinationChosen}</span>
              </label>
              <label>
                <input id="destination-choice-help" type="radio" name="destinationChoice" value="help" checked={destinationChoice === "help"} onChange={() => setDestinationChoice("help")} />
                <span>{t.travel.destinationHelp}</span>
              </label>
            </div>
            {errorMessage("destinationChoice") && <p className="field-error" id="destination-choice-error">{errorMessage("destinationChoice")}</p>}
          </fieldset>

          {destinationChoice === "chosen" && (
            <div className="form-field form-field-full">
              <label htmlFor="destination">{t.travel.destination}<span className="field-requirement">{t.required}</span></label>
              <input id="destination" name="destination" type="text" minLength={2} maxLength={100} required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={t.travel.destinationPlaceholder} aria-invalid={Boolean(errors.destination)} aria-describedby={describedBy(errors.destination && "destination-error")} />
              {errorMessage("destination") && <p className="field-error" id="destination-error">{errorMessage("destination")}</p>}
            </div>
          )}

          <fieldset className="choice-group form-field-full" aria-describedby={describedBy(errors.dates && "dates-error")}>
            <legend>{t.travel.dates}<span className="field-requirement">{t.required}</span></legend>
            <div className="date-fields">
              <div className="form-field">
                <label htmlFor="date-from">{t.travel.dateFrom}</label>
                <input id="date-from" name="dateFrom" type="date" min={dateLimits.earliest} max={dateLimits.latest} aria-invalid={Boolean(errors.dates || errors.dateFrom)} aria-describedby={describedBy(errors.dateFrom && "date-from-error", errors.dates && "dates-error")} />
                {errorMessage("dateFrom") && <p className="field-error" id="date-from-error">{errorMessage("dateFrom")}</p>}
              </div>
              <div className="form-field">
                <label htmlFor="date-to">{t.travel.dateTo}</label>
                <input id="date-to" name="dateTo" type="date" min={dateLimits.earliest} max={dateLimits.latest} aria-invalid={Boolean(errors.dates || errors.dateTo)} aria-describedby={describedBy(errors.dateTo && "date-to-error", errors.dates && "dates-error")} />
                {errorMessage("dateTo") && <p className="field-error" id="date-to-error">{errorMessage("dateTo")}</p>}
              </div>
            </div>
            <label className="checkbox-field"><input name="flexibleDates" type="checkbox" /><span>{t.travel.flexibleDates}</span></label>
            {errorMessage("dates") && <p className="field-error" id="dates-error">{errorMessage("dates")}</p>}
          </fieldset>

          <div className="form-field">
            <label htmlFor="adults">{t.travel.adults}<span className="field-requirement">{t.required}</span></label>
            <input id="adults" name="adults" type="number" inputMode="numeric" min="1" max="12" defaultValue="1" required aria-invalid={Boolean(errors.adults)} aria-describedby={describedBy(errors.adults && "adults-error")} />
            {errorMessage("adults") && <p className="field-error" id="adults-error">{errorMessage("adults")}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="children">{t.travel.children}<span className="field-requirement">{t.required}</span></label>
            <input id="children" name="children" type="number" inputMode="numeric" min="0" max="8" value={children} required onChange={(event) => setChildren(event.target.value)} aria-invalid={Boolean(errors.children)} aria-describedby={describedBy(errors.children && "children-error")} />
            {errorMessage("children") && <p className="field-error" id="children-error">{errorMessage("children")}</p>}
          </div>

          {visibleChildCount > 0 && (
            <div className="child-age-group form-field-full" aria-live="polite">
              <p className="child-age-title">{t.travel.childAges}</p>
              <p className="field-hint">{t.travel.childAgeHint}</p>
              <div className="child-age-fields">
                {Array.from({ length: visibleChildCount }, (_, index) => {
                  const field = `childAge-${index}` as const;
                  const inputId = `child-age-${index}`;
                  const errorId = `${inputId}-error`;
                  return (
                    <div className="form-field" key={field}>
                      <label htmlFor={inputId}>{t.travel.childAge} {index + 1}<span className="field-requirement">{t.required}</span></label>
                      <input id={inputId} name={field} type="number" inputMode="numeric" min="0" max="17" required value={childAges[index]} onChange={(event) => { const value = event.target.value; setChildAges((current) => current.map((age, ageIndex) => ageIndex === index ? value : age)); }} aria-invalid={Boolean(errors[field])} aria-describedby={describedBy(errors[field] && errorId)} />
                      {errorMessage(field) && <p className="field-error" id={errorId}>{errorMessage(field)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-field form-field-full">
            <label htmlFor="budget">{t.travel.budget}<span className="field-requirement">{t.optional}</span></label>
            <select id="budget" name="budget" defaultValue="" aria-invalid={Boolean(errors.budget)} aria-describedby={describedBy(errors.budget && "budget-error")}>
              <option value="">{t.travel.budgetPlaceholder}</option>
              {Object.entries(t.travel.budgets).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {errorMessage("budget") && <p className="field-error" id="budget-error">{errorMessage("budget")}</p>}
          </div>
          <div className="form-field form-field-full">
            <label htmlFor="comment">{t.travel.comment}<span className="field-requirement">{t.optional}</span></label>
            <textarea id="comment" name="comment" rows={4} maxLength={600} placeholder={t.travel.commentPlaceholder} aria-invalid={Boolean(errors.comment)} aria-describedby={describedBy(errors.comment && "comment-error")} />
            {errorMessage("comment") && <p className="field-error" id="comment-error">{errorMessage("comment")}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>{t.contact.legend}</legend>
        <p className="form-section-description">{t.contact.description}</p>
        <div className="form-fields form-fields-two-columns">
          <div className="form-field">
            <label htmlFor="first-name">{t.contact.firstName}<span className="field-requirement">{t.required}</span></label>
            <input id="first-name" name="firstName" type="text" autoComplete="given-name" minLength={2} maxLength={50} required placeholder={t.contact.firstNamePlaceholder} aria-invalid={Boolean(errors.firstName)} aria-describedby={describedBy(errors.firstName && "first-name-error")} />
            {errorMessage("firstName") && <p className="field-error" id="first-name-error">{errorMessage("firstName")}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="last-name">{t.contact.lastName}<span className="field-requirement">{t.required}</span></label>
            <input id="last-name" name="lastName" type="text" autoComplete="family-name" minLength={2} maxLength={50} required placeholder={t.contact.lastNamePlaceholder} aria-invalid={Boolean(errors.lastName)} aria-describedby={describedBy(errors.lastName && "last-name-error")} />
            {errorMessage("lastName") && <p className="field-error" id="last-name-error">{errorMessage("lastName")}</p>}
          </div>
          <div className="form-field form-field-full">
            <label htmlFor="contact-method">{t.contact.method}<span className="field-requirement">{t.required}</span></label>
            <select id="contact-method" name="contactMethod" value={contactMethod} required onChange={(event) => setContactMethod(event.target.value as ContactMethod)} aria-invalid={Boolean(errors.contactMethod)} aria-describedby={describedBy(errors.contactMethod && "contact-method-error")}>
              {CONTACT_METHODS.map((method) => <option key={method} value={method}>{t.contact.methods[method]}</option>)}
            </select>
            {errorMessage("contactMethod") && <p className="field-error" id="contact-method-error">{errorMessage("contactMethod")}</p>}
          </div>
          <div className="form-field form-field-full">
            <label htmlFor="contact-detail">{contactDetail.label}<span className="field-requirement">{t.required}</span></label>
            <input key={contactMethod} id="contact-detail" name="contactDetail" type={contactInputType} inputMode={contactInputType === "tel" ? "tel" : contactInputType === "email" ? "email" : "text"} autoComplete={contactAutocomplete} maxLength={contactMaxLength} required value={contactValues[contactMethod]} onChange={(event) => setContactValues((current) => ({ ...current, [contactMethod]: event.target.value }))} placeholder={contactDetail.placeholder} aria-invalid={Boolean(errors.contactDetail)} aria-describedby={describedBy("contact-detail-hint", errors.contactDetail && "contact-detail-error")} />
            <p className="field-hint" id="contact-detail-hint">{contactDetail.hint}</p>
            {errorMessage("contactDetail") && <p className="field-error" id="contact-detail-error">{errorMessage("contactDetail")}</p>}
          </div>
          <div className="form-field form-field-full">
            <label htmlFor="communication-language">{t.contact.language}<span className="field-requirement">{t.required}</span></label>
            <select id="communication-language" name="communicationLanguage" value={communicationLanguage} required onChange={(event) => { communicationLanguageChanged.current = true; setCommunicationLanguage(event.target.value as Locale); }} aria-invalid={Boolean(errors.communicationLanguage)} aria-describedby={describedBy(errors.communicationLanguage && "communication-language-error")}>
              <option value="uk">{t.contact.languages.uk}</option><option value="en">{t.contact.languages.en}</option>
            </select>
            {errorMessage("communicationLanguage") && <p className="field-error" id="communication-language-error">{errorMessage("communicationLanguage")}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section form-confirmation">
        <legend>{t.confirmation.legend}</legend>
        <p className="form-section-description">{t.confirmation.description}</p>
        <label className="checkbox-field consent-field">
          <input id="consent" name="consent" type="checkbox" required aria-invalid={Boolean(errors.consent)} aria-describedby={describedBy(errors.consent && "consent-error")} />
          <span>{t.confirmation.consent}<small>{t.required}</small></span>
        </label>
        {errorMessage("consent") && <p className="field-error consent-error" id="consent-error">{errorMessage("consent")}</p>}
        <button className="form-submit-preview" type="submit" disabled={isBusy} aria-disabled={isBusy}>
          {submitButtonLabel}
        </button>
        <p className="submission-note">{t.confirmation.note}</p>
        <p
          className={`submission-status${submissionMessage ? " is-visible" : ""}${submissionState.status === "error" ? " is-error" : ""}`}
          ref={submissionStatusRef}
          role={submissionState.status === "error" ? "alert" : "status"}
          aria-live={submissionState.status === "error" ? "assertive" : "polite"}
          aria-atomic="true"
          tabIndex={-1}
        >
          {submissionMessage}
        </p>
      </fieldset>
    </form>
  );
}
