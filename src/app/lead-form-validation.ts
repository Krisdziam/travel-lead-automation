export const CONTACT_METHODS = [
  "telegram",
  "whatsapp",
  "viber",
  "phone",
  "email",
] as const;

export const BUDGET_VALUES = [
  "under1500",
  "from1500To3000",
  "from3000To5000",
  "from5000To8000",
  "over8000",
  "unsure",
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number];
export type DestinationChoice = "chosen" | "help";
export type CommunicationLanguage = "uk" | "en";
export type ChildAgeField = `childAge-${number}`;

export type ValidationField =
  | "form"
  | "departure"
  | "destinationChoice"
  | "destination"
  | "dates"
  | "dateFrom"
  | "dateTo"
  | "adults"
  | "children"
  | ChildAgeField
  | "budget"
  | "comment"
  | "firstName"
  | "lastName"
  | "contactMethod"
  | "contactDetail"
  | "communicationLanguage"
  | "consent";

export type ValidationErrorCode =
  | "spam"
  | "departureInvalid"
  | "destinationChoiceRequired"
  | "destinationInvalid"
  | "datesRequired"
  | "dateFromRequired"
  | "dateToRequired"
  | "dateInvalid"
  | "datePast"
  | "dateTooLate"
  | "dateOrder"
  | "adultsInvalid"
  | "childrenInvalid"
  | "childAgeInvalid"
  | "budgetInvalid"
  | "commentTooLong"
  | "firstNameInvalid"
  | "lastNameInvalid"
  | "contactMethodRequired"
  | "telegramInvalid"
  | "whatsappInvalid"
  | "viberInvalid"
  | "phoneInvalid"
  | "emailInvalid"
  | "languageRequired"
  | "consentRequired";

export type ValidationErrors = Partial<Record<ValidationField, ValidationErrorCode>>;

export type LeadFormValues = {
  departure: string;
  destinationChoice: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
  flexibleDates: boolean;
  adults: string;
  children: string;
  childAges: string[];
  budget: string;
  comment: string;
  firstName: string;
  lastName: string;
  contactMethod: string;
  contactDetail: string;
  communicationLanguage: string;
  consent: boolean;
  website: string;
};

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateLimits(today = new Date()) {
  const latest = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
  return {
    earliest: toLocalDateString(today),
    latest: toLocalDateString(latest),
  };
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isIntegerInRange(value: string, minimum: number, maximum: number) {
  if (!/^\d+$/.test(value)) return false;
  const number = Number(value);
  return Number.isInteger(number) && number >= minimum && number <= maximum;
}

function isValidTelegram(value: string) {
  const trimmed = value.trim();
  const usernameMatch = trimmed.match(/^@?([A-Za-z][A-Za-z0-9_]{4,31})$/);
  const linkMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?t\.me\/([A-Za-z][A-Za-z0-9_]{4,31})\/?$/i);
  return Boolean(usernameMatch || linkMatch);
}

function isValidInternationalPhone(value: string) {
  const normalized = value.replace(/[\s().-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}

function isValidEmail(value: string) {
  const trimmed = value.trim();
  return trimmed.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function validateLeadForm(values: LeadFormValues, today = new Date()): ValidationErrors {
  if (values.website.trim()) return { form: "spam" };

  const errors: ValidationErrors = {};
  const departure = values.departure.trim();
  const destination = values.destination.trim();
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const { earliest, latest } = getDateLimits(today);

  if (departure.length < 2 || departure.length > 80) {
    errors.departure = "departureInvalid";
  }

  if (values.destinationChoice !== "chosen" && values.destinationChoice !== "help") {
    errors.destinationChoice = "destinationChoiceRequired";
  } else if (values.destinationChoice === "chosen" && (destination.length < 2 || destination.length > 100)) {
    errors.destination = "destinationInvalid";
  }

  const hasAnyDate = Boolean(values.dateFrom || values.dateTo);
  if (!values.flexibleDates && !hasAnyDate) {
    errors.dates = "datesRequired";
  } else if (hasAnyDate) {
    if (!values.dateFrom) errors.dateFrom = "dateFromRequired";
    if (!values.dateTo) errors.dateTo = "dateToRequired";
  }

  if (values.dateFrom) {
    if (!isValidDateString(values.dateFrom)) errors.dateFrom = "dateInvalid";
    else if (values.dateFrom < earliest) errors.dateFrom = "datePast";
    else if (values.dateFrom > latest) errors.dateFrom = "dateTooLate";
  }

  if (values.dateTo) {
    if (!isValidDateString(values.dateTo)) errors.dateTo = "dateInvalid";
    else if (values.dateTo < earliest) errors.dateTo = "datePast";
    else if (values.dateTo > latest) errors.dateTo = "dateTooLate";
    else if (values.dateFrom && isValidDateString(values.dateFrom) && values.dateTo < values.dateFrom) {
      errors.dateTo = "dateOrder";
    }
  }

  if (!isIntegerInRange(values.adults, 1, 12)) errors.adults = "adultsInvalid";
  if (!isIntegerInRange(values.children, 0, 8)) errors.children = "childrenInvalid";

  if (isIntegerInRange(values.children, 1, 8)) {
    const childCount = Number(values.children);
    for (let index = 0; index < childCount; index += 1) {
      if (!isIntegerInRange(values.childAges[index] ?? "", 0, 17)) {
        errors[`childAge-${index}`] = "childAgeInvalid";
      }
    }
  }

  if (values.budget && !BUDGET_VALUES.includes(values.budget as (typeof BUDGET_VALUES)[number])) {
    errors.budget = "budgetInvalid";
  }
  if (values.comment.length > 600) errors.comment = "commentTooLong";
  if (firstName.length < 2 || firstName.length > 50) errors.firstName = "firstNameInvalid";
  if (lastName.length < 2 || lastName.length > 50) errors.lastName = "lastNameInvalid";

  if (!CONTACT_METHODS.includes(values.contactMethod as ContactMethod)) {
    errors.contactMethod = "contactMethodRequired";
  } else {
    const contactMethod = values.contactMethod as ContactMethod;
    const contactDetail = values.contactDetail.trim();
    const contactIsValid = {
      telegram: isValidTelegram(contactDetail),
      whatsapp: isValidInternationalPhone(contactDetail),
      viber: isValidInternationalPhone(contactDetail),
      phone: isValidInternationalPhone(contactDetail),
      email: isValidEmail(contactDetail),
    }[contactMethod];

    if (!contactIsValid) {
      errors.contactDetail = `${contactMethod}Invalid` as ValidationErrorCode;
    }
  }

  if (values.communicationLanguage !== "uk" && values.communicationLanguage !== "en") {
    errors.communicationLanguage = "languageRequired";
  }
  if (!values.consent) errors.consent = "consentRequired";

  return errors;
}
