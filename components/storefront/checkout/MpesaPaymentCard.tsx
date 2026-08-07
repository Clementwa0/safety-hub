"use client";

import { useState } from "react";
import { FaCheck, FaCircleInfo, FaCopy, FaMobileScreenButton } from "react-icons/fa6";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatKES } from "@/lib/format";
import { getMpesaNumberLabel, getMpesaTypeLabel, type MpesaPaymentType } from "@/lib/config/mpesa";

export interface MpesaPaymentCardProps {
  /** Order total in KES — rendered as the amount the customer must pay. */
  total: number;
  /** Paybill or Till, drives copy and step-by-step instructions. */
  paymentType: MpesaPaymentType;
  /** Order number once generated, otherwise a temporary reference/placeholder. */
  accountReference: string;
  /** The Paybill or Till number to pay to. */
  businessNumber: string;
  /** Optional business/shop name shown next to the number. */
  businessName?: string;
  className?: string;
}

type CopyField = "business" | "account" | "all";

const STEP_COPY: Record<MpesaPaymentType, { menu: string; number: string }> = {
  paybill: { menu: "Choose Paybill.", number: "Enter the Business Number." },
  till: { menu: "Choose Buy Goods and Services.", number: "Enter the Till Number." },
};

function buildInstructions(type: MpesaPaymentType): string[] {
  const copy = STEP_COPY[type];
  return [
    "Open M-Pesa on your phone.",
    "Select Lipa na M-Pesa.",
    copy.menu,
    copy.number,
    "Enter the Account Number shown below.",
    "Enter the exact amount displayed.",
    "Complete the payment with your M-Pesa PIN.",
    "Click Place Order.",
  ];
}

/**
 * Copies text to the clipboard using the async Clipboard API where
 * available, falling back to a hidden textarea + execCommand for
 * non-secure contexts or older browsers.
 */
async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to the legacy fallback below
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  } catch {
    return false;
  }
}

/**
 * Read-only field with a label and a one-click copy button — used for the
 * Business Number and Account Number rows.
 */
function CopyField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  fieldKey: CopyField;
  copiedField: CopyField | null;
  onCopy: (value: string, label: string, field: CopyField) => void;
}) {
  const justCopied = copiedField === fieldKey;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={`mpesa-${fieldKey}`}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id={`mpesa-${fieldKey}`}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          className="font-mono text-sm tracking-wide"
          aria-label={label}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onCopy(value, label, fieldKey)}
          aria-label={`Copy ${label.toLowerCase()}`}
          className={cn("shrink-0", justCopied && "border-success text-success")}
        >
          {justCopied ? <FaCheck className="h-3.5 w-3.5" /> : <FaCopy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

export function MpesaPaymentCard({
  total,
  paymentType,
  accountReference,
  businessNumber,
  businessName,
  className,
}: MpesaPaymentCardProps) {
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const formattedAmount = formatKES(total);
  const typeLabel = getMpesaTypeLabel(paymentType);
  const numberLabel = getMpesaNumberLabel(paymentType);
  const instructions = buildInstructions(paymentType);

  const handleCopy = async (value: string, label: string, field: CopyField) => {
    const succeeded = await copyToClipboard(value);
    if (succeeded) {
      setCopiedField(field);
      toast.success(`${label} copied`);
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 2000);
    } else {
      toast.error(`Couldn't copy ${label.toLowerCase()}. Please copy it manually.`);
    }
  };

  const handleCopyAll = () => {
    const lines = [
      "Pay with M-Pesa",
      `${typeLabel}: ${businessNumber}${businessName ? ` (${businessName})` : ""}`,
      `Account Number: ${accountReference}`,
      `Amount: ${formattedAmount}`,
    ];
    void handleCopy(lines.join("\n"), "Payment details", "all");
  };

  return (
    <Card
      role="group"
      aria-label="M-Pesa payment details"
      className={cn("gap-4 border-success/20 bg-success/[0.03] py-4", className)}
    >
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground"
          >
            <FaMobileScreenButton className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-semibold text-foreground">Pay with M-Pesa</h3>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <FaCircleInfo className="mt-0.5 h-3 w-3 shrink-0 text-success" aria-hidden="true" />
              <span>
                Complete this payment on your phone before you place the order — we&apos;ll match it to your order
                using the account number below.
              </span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <CopyField
              label={numberLabel}
              value={businessNumber}
              fieldKey="business"
              copiedField={copiedField}
              onCopy={(value, label, field) => void handleCopy(value, label, field)}
            />
            <CopyField
              label="Account Number"
              value={accountReference}
              fieldKey="account"
              copiedField={copiedField}
              onCopy={(value, label, field) => void handleCopy(value, label, field)}
            />
          </div>

          <Separator className="my-3" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Amount to pay</p>
              <p className="text-xl font-bold text-success">{formattedAmount}</p>
            </div>
            {businessName && (
              <p className="text-xs text-muted-foreground">
                {typeLabel} · {businessName}
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyAll}
          className={cn("w-full gap-2 sm:w-auto", copiedField === "all" && "border-success text-success")}
        >
          {copiedField === "all" ? <FaCheck className="h-3.5 w-3.5" /> : <FaCopy className="h-3.5 w-3.5" />}
          Copy All Payment Details
        </Button>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">How to pay</p>
          <ol className="space-y-1.5 text-xs text-muted-foreground">
            {instructions.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-success/10 text-[10px] font-semibold text-success"
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

export default MpesaPaymentCard;
