import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "INR"): string => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `Rs ${value.toFixed(2)}`;
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY") : "Not provided";
};

export const formatSubscriptionDateTimeWithTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY hh:mm A") : "Not provided";
};

export const toDateInputValue = (value?: string): string => {
  if (!value) return "";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("YYYY-MM-DD") : "";
};

export const toTimeInputValue = (value?: string): string => {
  if (!value) return "";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("hh:mm") : "";
};

export const toPeriodInputValue = (value?: string): "AM" | "PM" => {
  if (!value) return "AM";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? (parsedDate.format("A") as "AM" | "PM") : "AM";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
