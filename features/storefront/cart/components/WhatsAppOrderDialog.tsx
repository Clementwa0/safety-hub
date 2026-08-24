"use client";

import { useEffect, useState } from "react";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart } from "@/hooks/useCart";
import { addressService } from "@/services/storefront/address.service";
import {
  buildWhatsAppOrderMessage,
  generateWhatsAppReference,
  openWhatsAppCheckout,
  type WhatsAppPreferredPayment,
} from "@/lib/storefront/whatsapp";

interface GuestInfoForm {
  name: string;
  phone: string;
  address: string;
}

const EMPTY_FORM: GuestInfoForm = { name: "", phone: "", address: "" };

export function WhatsAppOrderDialog() {
  const { data: session } = useCustomerSession();
  const { items, itemCount, subtotal, shippingFee, tax, taxRatePercent, total } = useCart();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GuestInfoForm>(EMPTY_FORM);
  const [preferredPayment, setPreferredPayment] = useState<WhatsAppPreferredPayment>("cod");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [sending, setSending] = useState(false);

  const email = session?.user?.email ?? undefined;

  useEffect(() => {
    if (!open || !session?.user?.id || form.name || form.phone || form.address) return;

    let cancelled = false;
    setLoadingProfile(true);

    addressService
      .list()
      .then((addresses) => {
        if (cancelled) return;
        const preferred = addresses.find((address) => address.isDefault) ?? addresses[0];
        if (preferred) {
          setForm({
            name: preferred.fullName,
            phone: preferred.phone,
            address: [preferred.address, preferred.city, preferred.country].filter(Boolean).join(", "),
          });
        } else if (session.user?.name) {
          setForm((prev) => ({ ...prev, name: session.user?.name || "" }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, session, form.name, form.phone, form.address]);

  const update = (field: keyof GuestInfoForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSend = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Please fill in your name, phone, and delivery address.");
      return;
    }

    setSending(true);
    try {
      const message = buildWhatsAppOrderMessage({
        customer: { name: form.name.trim(), phone: form.phone.trim(), email, address: form.address.trim() },
        items: items.map((item) => ({
          name: item.size ? `${item.name} (${item.size})` : item.name,
          quantity: item.quantity,
          lineTotal: item.price * item.quantity,
        })),
        totals: { subtotal, shippingFee, tax, taxRatePercent, total },
        preferredPayment,
        reference: generateWhatsAppReference(),
      });

      const result = openWhatsAppCheckout(message);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setOpen(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-green-600/40 text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/30"
            disabled={itemCount === 0}
          />
        }
      >
        <FaWhatsapp className="h-4 w-4" />
        Order via WhatsApp
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaWhatsapp className="h-4 w-4 text-green-600" />
            Order via WhatsApp
          </DialogTitle>
          <DialogDescription>
            We&apos;ll open WhatsApp with your order pre-filled — a member of our team will confirm availability and
            payment with you there. Your cart stays saved here either way.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="wa-name">Full name</Label>
            <Input
              id="wa-name"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="John Doe"
              disabled={loadingProfile}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wa-phone">Phone number</Label>
            <Input
              id="wa-phone"
              required
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="07XX XXX XXX"
              disabled={loadingProfile}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wa-address">Delivery address</Label>
            <Input
              id="wa-address"
              required
              value={form.address}
              onChange={update("address")}
              placeholder="Westlands, Nairobi"
              disabled={loadingProfile}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Preferred payment</Label>
            <RadioGroup
              value={preferredPayment}
              onValueChange={(value) => setPreferredPayment(value as WhatsAppPreferredPayment)}
              className="flex gap-4"
            >
              <Label htmlFor="wa-pay-cod" className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="cod" id="wa-pay-cod" />
                Cash on Delivery
              </Label>
              <Label htmlFor="wa-pay-mpesa" className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="mpesa" id="wa-pay-mpesa" />
                M-Pesa
              </Label>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            onClick={handleSend}
            disabled={sending || loadingProfile}
          >
            <FaWhatsapp className="h-4 w-4" />
            {sending ? "Opening WhatsApp..." : "Continue on WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WhatsAppOrderDialog;