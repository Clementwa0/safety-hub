"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCog,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { userService } from "@/services/sentinel/user.service";
import type { AdminUser } from "@/types/sentinel/user";
import UserForm from "./components/UserForm";
import StaffForm from "./components/StaffForm";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminFormOpen, setAdminFormOpen] = useState(false);

  const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);
  const [staffFormOpen, setStaffFormOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await userService.list());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const admin = useMemo(() => users.find((user) => user.role === "admin") ?? null, [users]);
  const staff = useMemo(() => users.filter((user) => user.role === "staff"), [users]);

  const openEditAdmin = (user: AdminUser) => {
    setEditingAdmin(user);
    setAdminFormOpen(true);
  };

  const openAddStaff = () => {
    setEditingStaff(null);
    setStaffFormOpen(true);
  };

  const openEditStaff = (user: AdminUser) => {
    setEditingStaff(user);
    setStaffFormOpen(true);
  };

  const toggleStaffStatus = async (user: AdminUser) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    try {
      await userService.update(user.id, { status: nextStatus });
      toast.success(nextStatus === "active" ? "Staff account activated" : "Staff account suspended");
      void load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update the account");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userService.remove(deleteTarget.id);
      toast.success("Staff account deleted");
      setDeleteTarget(null);
      void load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete the account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage the Sentinel administrator and staff accounts."
        breadcrumbs={[{ label: "Admin", href: "/sentinel/dashboard" }, { label: "Users" }]}
      />

      {loading ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2" aria-hidden>
              <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ADMINISTRATOR */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Administrator</h3>
            <Card>
              <CardContent className="p-0">
                {admin ? (
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{admin.name}</p>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {admin.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditAdmin(admin)}
                      aria-label={`Edit ${admin.name}`}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="p-4">
                    <EmptyState
                      title="No admin account found"
                      description="This shouldn't normally happen - the first admin is provisioned outside of Sentinel. Contact whoever set up this deployment."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* STAFF */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Staff</h3>
              <Button size="sm" onClick={openAddStaff}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add staff
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {staff.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      title="No staff accounts yet"
                      description="Staff can access most of Sentinel, except Users, Settings, and Reports."
                      action={
                        <Button variant="outline" onClick={openAddStaff}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add staff
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border/70">
                    {staff.map((user) => (
                      <div key={user.id} className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <UserCog className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{user.name}</p>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {user.role}
                              </Badge>
                              <Badge
                                variant={user.status === "active" ? "outline" : "destructive"}
                                className="text-xs capitalize"
                              >
                                {user.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="outline" size="icon" aria-label={`Actions for ${user.name}`} />
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditStaff(user)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void toggleStaffStatus(user)}>
                              {user.status === "active" ? (
                                <>
                                  <UserX className="mr-2 h-3.5 w-3.5" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-3.5 w-3.5" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(user)}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <UserForm
        open={adminFormOpen}
        onOpenChange={setAdminFormOpen}
        user={editingAdmin}
        onSaved={() => void load()}
      />

      <StaffForm
        open={staffFormOpen}
        onOpenChange={setStaffFormOpen}
        staff={editingStaff}
        onSaved={() => void load()}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete staff account?"
        description={
          deleteTarget
            ? `${deleteTarget.name} (${deleteTarget.email}) will lose access to Sentinel immediately. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
