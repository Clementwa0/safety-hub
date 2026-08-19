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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/sentinel/user.service";
import { hasErrors, validateUser, type ValidationErrors } from "@/lib/validation";
import type { AdminUser, UserInput } from "@/types/sentinel/user";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
  onSaved?: () => void;
}

const EMPTY: UserInput = { name: "", email: "", password: "", role: "staff" };

export default function UserForm({ open, onOpenChange, user, onSaved }: UserFormProps) {
  const [values, setValues] = useState<UserInput>(EMPTY);
  const [errors, setErrors] = useState<ValidationErrors<UserInput>>({});
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the dialog opens for a different user.
  const formKey = `${open ? "open" : "closed"}:${user?.id ?? "new"}`;
  const [lastFormKey, setLastFormKey] = useState(formKey);

  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setValues(
      open && user
        ? { name: user.name, email: user.email, password: "", role: user.role }
        : EMPTY,
    );
    setErrors({});
  }

  const setField = <K extends keyof UserInput>(key: K, value: UserInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateUser(values, { isNew: !user });
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) return;

    setSaving(true);

    try {
      if (user) {
        await userService.update(user.id, {
          name: values.name,
          role: values.role,
          // Leave the password unchanged unless the admin typed a new one.
          ...(values.password ? { password: values.password } : {}),
        });
        toast.success("User updated");
      } else {
        await userService.create(values);
        toast.success("User created");
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update this team member's name, role, or password."
              : "Create a new Sentinel portal account for a team member."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Jane Doe"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="jane@hsehub.co.ke"
              aria-invalid={Boolean(errors.email)}
              disabled={Boolean(user)}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email}</p>
            ) : user ? (
              <p className="text-xs text-muted-foreground">Email can&apos;t be changed after the account is created.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">{user ? "New password (optional)" : "Password"}</Label>
            <Input
              id="user-password"
              type="password"
              value={values.password}
              onChange={(event) => setField("password", event.target.value)}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password}</p>
            ) : user ? (
              <p className="text-xs text-muted-foreground">Leave blank to keep the current password.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select value={values.role} onValueChange={(value) => setField("role", value as UserInput["role"])}>
              <SelectTrigger id="user-role" className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role ? <p className="text-xs text-destructive">{errors.role}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {user ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
