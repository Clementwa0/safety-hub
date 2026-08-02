import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Keep your contact details and account preferences up to date."
        breadcrumbs={[{ label: "Sentinel", href: "/sentinel/dashboard" }, { label: "Profile" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Account overview</CardTitle>
          <CardDescription>Your profile information will appear here as the portal evolves.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The account shell is now ready for profile editing, security preferences, and activity details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}