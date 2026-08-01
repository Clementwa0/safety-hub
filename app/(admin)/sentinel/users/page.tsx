import Link from "next/link";
import { UserPlus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage team members, roles, and access to the Sentinel portal."
        breadcrumbs={[{ label: "Sentinel", href: "/sentinel/dashboard" }, { label: "Users" }]}
        actions={
          <Button nativeButton={false} render={<Link href="/sentinel/users" />}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add user
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Team access</CardTitle>
          <CardDescription>Role-based access and account administration will be managed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This section is now structured for future user management workflows without affecting the existing portal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}