"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { userService } from "@/services/sentinel/user.service";
import type { AdminUser } from "@/types/sentinel/user";
import UserForm from "./components/UserForm";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await userService.list());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the admin account");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Sentinel is a single-admin system — one administrator account manages the whole portal."
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
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4" aria-hidden>
              <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ) : error ? (
            <div className="p-4">
              <EmptyState
                title="Something went wrong"
                description={error}
                action={
                  <Button variant="outline" onClick={() => void load()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                  </Button>
                }
              />
            </div>
          ) : users.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No admin account found"
                description="This shouldn't normally happen — the first admin is provisioned outside of Sentinel. Contact whoever set up this deployment."
              />
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(user)}
                    aria-label={`Edit ${user.name}`}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UserForm open={formOpen} onOpenChange={setFormOpen} user={editing} onSaved={() => void load()} />
    </div>
  );
}
