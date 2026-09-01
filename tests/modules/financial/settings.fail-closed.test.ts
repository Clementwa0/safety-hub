import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { resolveFinancialSettingsForMutation } from "@/modules/settings/financial-settings";

describe("financial settings fail closed", () => {
  it("throws when required settings are missing", () => {
    assert.throws(
      () => resolveFinancialSettingsForMutation({} as Record<string, unknown>),
      /Required financial settings are missing/i,
    );
  });

  it("accepts the configured settings payload", () => {
    const settings = resolveFinancialSettingsForMutation({
      currency: "KES",
      taxRate: 16,
      paymentGatewayEnabled: true,
    });

    assert.equal(settings.currency, "KES");
    assert.equal(settings.taxRate, 16);
  });
});
