export function formatCurrency(amount: number, currency = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatKES(amount: number): string {
  return formatCurrency(amount, "KES");
}

export function formatDate(value: number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(value: number | Date | undefined): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function fromDateInputValue(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}
