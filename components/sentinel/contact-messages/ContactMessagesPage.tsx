"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Inbox, MailOpen, Reply, Search } from "lucide-react";
import { toast } from "sonner";

import ContactMessageTable from "@/components/sentinel/contact-messages/ContactMessageTable";
import ContactMessageDetailDialog from "@/components/sentinel/contact-messages/ContactMessageDetailDialog";
import StatsCard from "@/components/sentinel/StatsCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { contactMessageService } from "@/services/contact-message.service";
import {
  CONTACT_MESSAGE_STATUSES,
  type ContactMessage,
  type ContactMessageStats,
  type ContactMessageStatus,
} from "@/types/contact-message";

const PAGE_SIZE = 10;

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [stats, setStats] = useState<ContactMessageStats | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [status, setStatus] = useState<ContactMessageStatus | "all">("all");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contactMessageService.list({
        page,
        limit: PAGE_SIZE,
        sort,
        q: debouncedSearch || undefined,
        status,
      });
      setMessages(result.items);
      setPagination(result.pagination);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load contact messages");
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, status]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await contactMessageService.stats());
    } catch {
      // Stats are supplementary; a failure here shouldn't block the message list.
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const hasFilters = Boolean(search) || status !== "all";

  const handleView = (message: ContactMessage) => {
    setSelected(message);
    setDetailOpen(true);
  };

  const handleStatusChange = async (id: string, nextStatus: ContactMessageStatus) => {
    try {
      const updated = await contactMessageService.updateStatus(id, nextStatus);
      setSelected(updated);
      setMessages((current) => current.map((item) => (item.id === id ? updated : item)));
      void loadStats();
      if (nextStatus !== "read") {
        toast.success(`Marked as ${nextStatus}`);
      }
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update the message");
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await contactMessageService.remove(pendingDelete.id);
      toast.success("Message deleted");
      setPendingDelete(null);
      if (selected?.id === pendingDelete.id) {
        setDetailOpen(false);
        setSelected(null);
      }
      await load();
      void loadStats();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete the message");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Messages"
        description="Messages submitted through the public contact form."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Contact Messages" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="New"
          value={stats ? String(stats.new) : "—"}
          icon={Inbox}
          loading={!stats}
        />
        <StatsCard
          title="Read"
          value={stats ? String(stats.read) : "—"}
          icon={MailOpen}
          loading={!stats}
        />
        <StatsCard
          title="Replied"
          value={stats ? String(stats.replied) : "—"}
          icon={Reply}
          loading={!stats}
        />
        <StatsCard
          title="Archived"
          value={stats ? String(stats.archived) : "—"}
          icon={Archive}
          loading={!stats}
        />
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or subject..."
              className="pl-9"
              aria-label="Search contact messages"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              if (typeof value === "string") setStatus(value as ContactMessageStatus | "all");
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue>
                <span className="capitalize">{status === "all" ? "All statuses" : status}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {CONTACT_MESSAGE_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="capitalize">{option}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => typeof value === "string" && setSort(value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue>{sort === "-createdAt" ? "Newest" : "Oldest"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest</SelectItem>
              <SelectItem value="createdAt">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton rows={6} columns={6} />
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
          ) : messages.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={hasFilters ? "No matching messages" : "No messages yet"}
                description={
                  hasFilters
                    ? "Try a different search term or clear the filters."
                    : "Messages submitted through the public contact form will show up here."
                }
                action={
                  hasFilters ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        setStatus("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              <ContactMessageTable
                messages={messages}
                onView={handleView}
                onDelete={setPendingDelete}
              />
              <Pagination
                page={pagination.page}
                totalPages={pagination.pages}
                total={pagination.total}
                onPrev={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() => setPage((current) => Math.min(pagination.pages, current + 1))}
                hasPrev={pagination.page > 1}
                hasNext={pagination.page < pagination.pages}
              />
            </>
          )}
        </CardContent>
      </Card>

      <ContactMessageDetailDialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
        message={selected}
        onStatusChange={handleStatusChange}
        onDelete={(message) => {
          setDetailOpen(false);
          setPendingDelete(message);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete message?"
        description={
          pendingDelete
            ? `The message from "${pendingDelete.name}" will be permanently deleted.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
