export interface FinancialSettingsForMutation {
  currency: string;
  taxRate: number;
  paymentGatewayEnabled?: boolean;
}

export function resolveFinancialSettingsForMutation(
  raw: object | null | undefined,
): FinancialSettingsForMutation {
  if (!raw || typeof raw !== "object") {
    throw new Error("Required financial settings are missing");
  }

  const candidate = raw as {
    currency?: unknown;
    taxRate?: unknown;
    paymentGatewayEnabled?: unknown;
  };

  const currency = typeof candidate.currency === "string" ? candidate.currency.trim() : "";
  const taxRateValue = candidate.taxRate;
  const taxRate =
    typeof taxRateValue === "number"
      ? taxRateValue
      : typeof taxRateValue === "string" && taxRateValue.trim() !== ""
        ? Number(taxRateValue)
        : Number.NaN;

  if (!currency || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new Error("Required financial settings are missing or invalid");
  }

  return {
    currency,
    taxRate,
    paymentGatewayEnabled:
      typeof candidate.paymentGatewayEnabled === "boolean"
        ? candidate.paymentGatewayEnabled
        : undefined,
  };
}
