"use client";

import { useEffect, useState } from "react";
import { Copy, Link2, Loader2, Mail, Printer, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useSettings } from "@/components/SettingsProvider";
import { documentShareService } from "@/services/sentinel/document-share.service";
import { waLink } from "@/lib/whatsapp";
import type { SalesDocumentType } from "@/types/sentinel/document-share";

interface ShareDocumentMenuProps {
  type: SalesDocumentType;
  id: string;
  documentLabel: string;
  documentNumber: string;
  customerName?: string;
  customerEmail?: string;
  /** Trigger button size - lets denser pages (e.g. the quotation list's
   *  compact action row) match their surrounding buttons. */
  triggerSize?: "default" | "sm";
  triggerClassName?: string;
}

type BusyAction = "print" | "native" | "whatsapp" | "copy" | null;

/**
 * The one share surface for invoices, quotations, and sales orders:
 * Native Share, Email (PDF attachment), WhatsApp (secure link), Copy
 * secure link, and Print. Deliberately has no "Download PDF" action - PDF
 * generation still happens (for Print/native-share/email), it's just never
 * exposed as a standalone download button.
 */
export function ShareDocumentMenu({
  type,
  id,
  documentLabel,
  documentNumber,
  customerName,
  customerEmail,
  triggerSize = "default",
  triggerClassName,
}: ShareDocumentMenuProps) {
  const { settings } = useSettings();
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState(customerEmail ?? "");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    setEmailTo(customerEmail ?? "");
  }, [customerEmail]);

  const fileName = `${type}-${documentNumber}.pdf`;
  const isBusy = busyAction !== null;

  const runAction = async (action: Exclude<BusyAction, null>, task: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await task();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setBusyAction(null);
    }
  };

  const handlePrint = () =>
    runAction("print", async () => {
      // Open a blank tab synchronously, inside this click handler's user
      // gesture - this is the fast path and works in most browsers. We
      // point it at the PDF once it's ready below.
      const printTab = window.open("", "_blank", "noopener,noreferrer");
      try {
        const blob = await documentShareService.fetchPdfBlob(type, id);
        const url = URL.createObjectURL(blob);
        if (printTab && !printTab.closed) {
          printTab.location.href = url;
        } else {
          // window.open can still get blocked here - by an extension,
          // an enterprise policy, or a browser popup heuristic stricter
          // than the site-level "allow pop-ups" setting - even when the
          // user has genuinely allowed pop-ups. A programmatic click on
          // an <a target="_blank"> isn't treated as a popup the same
          // way, so it reliably opens the PDF as a fallback.
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener";
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (caught) {
        printTab?.close();
        throw caught;
      }
    });

  const handleNativeShare = () =>
    runAction("native", async () => {
      const shareData: ShareData = {
        title: `${documentLabel} ${documentNumber}`,
        text: `${documentLabel} ${documentNumber}${customerName ? ` for ${customerName}` : ""}`,
      };

      const blob = await documentShareService.fetchPdfBlob(type, id);
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
        return;
      }

      // Fall back to sharing the secure link when this device/browser
      // can't share files directly (common on desktop browsers).
      const url = await documentShareService.getShareLink(type, id);
      await navigator.share({ ...shareData, url });
    });

  const handleWhatsApp = () =>
    runAction("whatsapp", async () => {
      const url = await documentShareService.getShareLink(type, id);
      const message = `Hello${customerName ? ` ${customerName}` : ""}, please find your ${documentLabel.toLowerCase()} ${documentNumber} from ${settings.companyName}:\n\n${url}`;
      window.open(waLink(message, settings.whatsapp), "_blank", "noreferrer");
    });

  const handleCopyLink = () =>
    runAction("copy", async () => {
      const url = await documentShareService.getShareLink(type, id);
      await navigator.clipboard.writeText(url);
      toast.success("Secure link copied");
    });

  const submitEmail = async () => {
    const trimmed = emailTo.trim();
    if (!trimmed) {
      toast.error("Enter an email address");
      return;
    }

    setSendingEmail(true);
    try {
      const sentTo = await documentShareService.emailDocument(type, id, trimmed);
      toast.success(`${documentLabel} emailed to ${sentTo}`);
      setEmailOpen(false);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size={triggerSize} disabled={isBusy} className={triggerClassName} />
          }
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">Share</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {canNativeShare ? (
            <DropdownMenuItem disabled={isBusy} onClick={() => void handleNativeShare()}>
              <Share2 className="h-4 w-4" /> Share...
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem disabled={isBusy} onClick={() => setEmailOpen(true)}>
            <Mail className="h-4 w-4" /> Email PDF
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isBusy} onClick={() => void handleWhatsApp()}>
            <FaWhatsapp className="h-4 w-4" /> Share via WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isBusy} onClick={() => void handleCopyLink()}>
            <Copy className="h-4 w-4" /> Copy secure link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isBusy} onClick={() => void handlePrint()}>
            <Printer className="h-4 w-4" /> Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={emailOpen} onOpenChange={(open) => !sendingEmail && setEmailOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email {documentLabel.toLowerCase()}</DialogTitle>
            <DialogDescription>
              Sends {documentNumber} as a PDF attachment. The recipient never needs a Sentinel account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="share-email-to">Send to</Label>
            <Input
              id="share-email-to"
              type="email"
              value={emailTo}
              onChange={(event) => setEmailTo(event.target.value)}
              placeholder="customer@example.com"
              disabled={sendingEmail}
            />
            {!customerEmail ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" /> No email on file for this customer - enter one to send.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)} disabled={sendingEmail}>
              Cancel
            </Button>
            <Button onClick={() => void submitEmail()} disabled={sendingEmail}>
              {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShareDocumentMenu;
