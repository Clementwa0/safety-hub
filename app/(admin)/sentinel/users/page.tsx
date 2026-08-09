"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import UserForm from "@/components/sentinel/UserForm";
import UserTable from "@/components/sentinel/UserTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { userService } from "@/services/sentinel/user.service";
import type { AdminUser } from "@/types/sentinel/user";

export default function UsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await userService.list();
      setUsers(items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await userService.remove(pendingDelete.id);
      toast.success(`${pendingDelete.name} removed`);
      setPendingDelete(null);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not remove the user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage team members, roles, and access to the Sentinel portal."
        breadcrumbs={[{ label: "Sentinel", href: "/sentinel/dashboard" }, { label: "Users" }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : error ? (
            <div className="p-4">
              <EmptyState
                title="Something went wrong"
                description={error}
                action={
                  <Button variant="outline" onClick={() => void load()}>
                    Try again
                  </Button>
                }
              />
            </div>
          ) : users.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No users yet"
                description="Add a team member to give them access to the Sentinel portal."
                action={
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setFormOpen(true);
                    }}
                  >
                    Add user
                  </Button>
                }
              />
            </div>
          ) : (
            <UserTable
              users={users}
              currentUserId={currentUserId}
              onEdit={(user) => {
                setEditing(user);
                setFormOpen(true);
              }}
              onDelete={setPendingDelete}
            />
          )}
        </CardContent>
      </Card>

      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        onSaved={() => void load()}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Remove user?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will lose access to the Sentinel portal immediately.`
            : undefined
        }
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
