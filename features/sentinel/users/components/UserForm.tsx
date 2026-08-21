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

import { userService } from "@/services/sentinel/user.service";
import type { AdminUser } from "@/types/sentinel/user";
import { cn } from "@/lib/utils";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSaved?: () => void;
}

export default function UserForm({ open, onOpenChange, user, onSaved }: UserFormProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formKey = `${open ? "open" : "closed"}:${user?.id ?? "none"}`;
  const [lastFormKey, setLastFormKey] = useState(formKey);

  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setName(open && user ? user.name : "");
    setPassword("");
    setNameError(null);
    setPasswordError(null);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    let hasError = false;
    if (!name.trim()) {
      setNameError("Name is required");
      hasError = true;
    }
    if (password && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }
    if (hasError) return;

    setSaving(true);
    try {
      await userService.update(user.id, {
        name: name.trim(),
        ...(password ? { password } : {}),
      });
      toast.success("Account updated");
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the account");
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
          <DialogTitle className="text-xl font-semibold">Edit admin account</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the account name, or set a new password. Leave the password blank to keep it
            unchanged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="user-name"
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
            <Label htmlFor="user-email" className="text-sm font-medium">
              Email
            </Label>
            <Input id="user-email" value={user?.email ?? ""} disabled className="h-10" />
            <p className="text-[11px] text-muted-foreground">
              Email can't be changed here — contact support if it needs to change.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-password" className="text-sm font-medium">
              New password
            </Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Leave blank to keep current password"
              className={cn(
                "h-10",
                passwordError && "border-destructive focus-visible:ring-destructive",
              )}
              disabled={saving}
            />
            {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
