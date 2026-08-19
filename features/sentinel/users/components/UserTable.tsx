"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUser } from "@/types/sentinel/user";

interface UserTableProps {
  users: AdminUser[];
  currentUserId?: string;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UserTable({ users, currentUserId, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <p className="text-sm font-medium text-foreground">
                    {user.name}
                    {isSelf ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </TableCell>

                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "Staff"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit {user.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSelf}
                      title={isSelf ? "You can't delete your own account" : undefined}
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete {user.name}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
