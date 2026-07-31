"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsService, type PortalSettings } from "@/services/settings.service";

export default function SettingsPage() {
  const [settings, setSettings] = useState<PortalSettings | null>(null);

  useEffect(() => {
    void settingsService.get().then(setSettings).catch(() => setSettings(null));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure the platform defaults and operational preferences."
        breadcrumbs={[{ label: "Sentinel", href: "/sentinel/dashboard" }, { label: "Settings" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Portal settings</CardTitle>
          <CardDescription>Preferences, integrations, and defaults will be grouped here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {settings ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div><p className="font-medium text-foreground">Company</p><p>{settings.companyName}</p></div>
              <div><p className="font-medium text-foreground">Contact email</p><p>{settings.contactEmail}</p></div>
              <div><p className="font-medium text-foreground">Phone</p><p>{settings.contactPhone}</p></div>
              <div><p className="font-medium text-foreground">WhatsApp</p><p>{settings.whatsapp}</p></div>
              <div><p className="font-medium text-foreground">Address</p><p>{settings.address}</p></div>
              <div><p className="font-medium text-foreground">Currency</p><p>{settings.currency}</p></div>
              <div><p className="font-medium text-foreground">Tax rate</p><p>{settings.taxRate}%</p></div>
              <div><p className="font-medium text-foreground">Shipping policy</p><p>{settings.shippingPolicy}</p></div>
            </div>
          ) : (
            <p>The portal settings could not be loaded. Please verify the backend endpoint.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
