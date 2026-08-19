"use client";

import { Building2, Mail, Pencil, Phone, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Customer } from "@/types/sentinel/customer";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export default function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-md border border-border/70">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="min-w-[180px] font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <p className="font-medium text-foreground">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.address || "No address on file"}</p>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-sm">
                      {customer.email ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {customer.email}
                        </div>
                      ) : null}
                      {customer.phone ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </div>
                      ) : null}
                      {!customer.email && !customer.phone ? (
                        <span className="text-xs text-muted-foreground">No contact info</span>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>
                    {customer.company ? (
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.company}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        aria-label={`Edit ${customer.name}`}
                        onClick={() => onEdit(customer)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${customer.name}`}
                        onClick={() => onDelete(customer)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-2.5 md:hidden">
        {customers.map((customer) => (
          <Card key={customer.id} className="border-border/70 shadow-sm">
            <CardContent className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{customer.name}</p>
                  {customer.company ? (
                    <p className="truncate text-xs text-muted-foreground">{customer.company}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                    aria-label={`Edit ${customer.name}`}
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${customer.name}`}
                    onClick={() => onDelete(customer)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                {customer.email ? (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                ) : null}
                {customer.phone ? (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
