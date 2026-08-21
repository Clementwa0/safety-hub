"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { userService } from "@/services/sentinel/user.service";
import type { AdminUser } from "@/types/sentinel/user";
import { cn } from "@/lib/utils";

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null means "create a new staff account". */
  staff: AdminUser | null;
  onSaved?: () => void;
}

export default function StaffForm({ open, onOpenChange, staff, onSaved }: StaffFormProps) {
  const isNew = staff === null;

  const [name, setName] = useState(staff?.name ?? "");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(staff?.status !== "suspended");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formKey = `${open ? "open" : "closed"}:${staff?.id ?? "new"}`;
  const [lastFormKey, setLastFormKey] = useState(formKey);

  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setName(open && staff ? staff.name : "");
    setEmail(open && staff ? staff.email : "");
    setPassword("");
    setActive(open && staff ? staff.status !== "suspended" : true);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    if (!name.trim()) {
      setNameError("Name is required");
      hasError = true;
    }
    if (isNew && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address");
      hasError = true;
    }
    if (isNew && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    } else if (!isNew && password && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }
    if (hasError) return;

    setSaving(true);
    try {
      if (isNew) {
        await userService.create({
          name: name.trim(),
          email: email.trim(),
          password,
          role: "staff",
        });
        toast.success("Staff account created");
      } else {
        await userService.update(staff.id, {
          name: name.trim(),
          status: active ? "active" : "suspended",
          ...(password ? { password } : {}),
        });
        toast.success("Staff account updated");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Could not ${isNew ? "create" : "update"} the staff account`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-semibold">
            {isNew ? "Add staff account" : "Edit staff account"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isNew
              ? "Staff can access most of Sentinel, except Users, Settings, and Reports."
              : "Update the account name or status, or set a new password. Leave the password blank to keep it unchanged."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="staff-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              className={cn("h-10", nameError && "border-destructive focus-visible:ring-destructive")}
              disabled={saving}
              autoFocus
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-email" className="text-sm font-medium">
              Email {isNew && <span className="text-destructive">*</span>}
            </Label>
            {isNew ? (
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                className={cn(
                  "h-10",
                  emailError && "border-destructive focus-visible:ring-destructive",
                )}
                disabled={saving}
              />
            ) : (
              <>
                <Input id="staff-email" value={email} disabled className="h-10" />
                <p className="text-[11px] text-muted-foreground">
                  Email can&apos;t be changed here — contact support if it needs to change.
                </p>
              </>
            )}
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-password" className="text-sm font-medium">
              {isNew ? (
                <>
                  Password <span className="text-destructive">*</span>
                </>
              ) : (
                "New password"
              )}
            </Label>
            <Input
              id="staff-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder={isNew ? undefined : "Leave blank to keep current password"}
              className={cn(
                "h-10",
                passwordError && "border-destructive focus-visible:ring-destructive",
              )}
              disabled={saving}
            />
            {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
          </div>

          {!isNew && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div className="space-y-0.5">
                <Label htmlFor="staff-active" className="text-sm font-medium">
                  Active
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Suspended staff can&apos;t sign in to Sentinel.
                </p>
              </div>
              <Switch
                id="staff-active"
                checked={active}
                onCheckedChange={(checked) => setActive(Boolean(checked))}
                disabled={saving}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isNew ? "Create account" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
