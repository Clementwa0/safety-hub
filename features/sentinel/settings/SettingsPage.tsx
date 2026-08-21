"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryImageField } from "@/components/shared/CloudinaryImageField";

import { settingsService, type PortalSettings } from "@/services/sentinel/settings.service";
import { useSettings } from "@/components/SettingsProvider";

export default function SettingsPage() {
  const [values, setValues] = useState<PortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { setSettings: setGlobalSettings } = useSettings();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setValues(await settingsService.get());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = <K extends keyof PortalSettings>(key: K, value: PortalSettings[K]) => {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const setSocialField = (key: keyof PortalSettings["social"], value: string) => {
    setValues((prev) => (prev ? { ...prev, social: { ...prev.social, [key]: value } } : prev));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values) return;

    setSaving(true);
    try {
      const updated = await settingsService.update(values);
      setValues(updated);
      // Push the freshly-saved values into the app-wide context immediately,
      // so the header/footer/etc. reflect the change without a reload.
      setGlobalSettings(updated);
      toast.success("Settings saved");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Company details, tax and shipping defaults used across quotations, invoices and the storefront."
        breadcrumbs={[{ label: "Admin", href: "/sentinel/dashboard" }, { label: "Settings" }]}
      />

      {loading ? (
        <Card>
          <CardContent className="space-y-3 p-6" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted" />
            ))}
          </CardContent>
        </Card>
      ) : error || !values ? (
        <Card>
          <CardContent className="p-4">
            <EmptyState
              title="Something went wrong"
              description={error ?? "Could not load settings"}
              action={
                <Button variant="outline" onClick={() => void load()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company details</CardTitle>
              <CardDescription>Shown on quotations, invoices and the public storefront.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-company-name">Company name</Label>
                <Input
                  id="settings-company-name"
                  value={values.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-contact-email">Contact email</Label>
                <Input
                  id="settings-contact-email"
                  type="email"
                  value={values.contactEmail}
                  onChange={(e) => setField("contactEmail", e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-contact-phone">Contact phone</Label>
                <Input
                  id="settings-contact-phone"
                  value={values.contactPhone}
                  onChange={(e) => setField("contactPhone", e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-whatsapp">WhatsApp number</Label>
                <Input
                  id="settings-whatsapp"
                  value={values.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="settings-address">Address</Label>
                <Input
                  id="settings-address"
                  value={values.address}
                  onChange={(e) => setField("address", e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-website">Website</Label>
                <Input
                  id="settings-website"
                  type="url"
                  placeholder="https://example.com"
                  value={values.website}
                  onChange={(e) => setField("website", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-business-hours">Business hours</Label>
                <Input
                  id="settings-business-hours"
                  placeholder="Mon - Fri: 8:00 AM - 5:00 PM"
                  value={values.businessHours}
                  onChange={(e) => setField("businessHours", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <CloudinaryImageField
                  id="settings-logo"
                  label="Company logo"
                  value={values.logoUrl}
                  onChange={(url) => setField("logoUrl", url)}
                  folder="settings"
                  disabled={saving}
                  helperText="Used on quotations, invoices and anywhere else the brand mark appears."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social links</CardTitle>
              <CardDescription>Shown in the storefront footer. Leave blank to hide a link.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="settings-social-facebook">Facebook</Label>
                <Input
                  id="settings-social-facebook"
                  type="url"
                  placeholder="https://facebook.com/your-page"
                  value={values.social.facebook}
                  onChange={(e) => setSocialField("facebook", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-social-instagram">Instagram</Label>
                <Input
                  id="settings-social-instagram"
                  type="url"
                  placeholder="https://instagram.com/your-page"
                  value={values.social.instagram}
                  onChange={(e) => setSocialField("instagram", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-social-linkedin">LinkedIn</Label>
                <Input
                  id="settings-social-linkedin"
                  type="url"
                  placeholder="https://linkedin.com/company/your-company"
                  value={values.social.linkedin}
                  onChange={(e) => setSocialField("linkedin", e.target.value)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commerce defaults</CardTitle>
              <CardDescription>Currency, tax rate and shipping policy used at checkout and on documents.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-currency">Currency</Label>
                <Input
                  id="settings-currency"
                  value={values.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-tax-rate">Tax rate (%)</Label>
                <Input
                  id="settings-tax-rate"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={values.taxRate}
                  onChange={(e) => setField("taxRate", Number(e.target.value))}
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="settings-shipping-policy">Shipping policy</Label>
                <Textarea
                  id="settings-shipping-policy"
                  rows={3}
                  value={values.shippingPolicy}
                  onChange={(e) => setField("shippingPolicy", e.target.value)}
                  disabled={saving}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
