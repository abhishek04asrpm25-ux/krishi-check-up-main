import { t, useLang } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BellOff, CheckCircle2, Info, XCircle } from "lucide-react";
import { AppShell } from "@/components/kc/AppShell";
import { Button, Card, PageHeader } from "@/components/kc/ui";
import { fmtStamp, markAllRead, markRead, useKC } from "@/lib/kc-store";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => pageHead("Notifications", "Booking confirmations, demo status changes, reminders and payment updates."),
  component: Notifications,
});

const icon = { warning: AlertTriangle, success: CheckCircle2, info: Info, danger: XCircle };
const tint = { warning: "bg-warning-soft text-warning-foreground", success: "bg-success-soft text-success", info: "bg-info-soft text-info", danger: "bg-danger-soft text-destructive" };

function Notifications() {
  useLang();
  const { notices } = useKC();
  const unread = notices.filter((n) => !n.read).length;
  return (
    <AppShell>
      <PageHeader title={t("Notifications")} subtitle={t(unread ? `${unread} unread` : "All caught up")}
        action={<Button variant="outline" size="sm" disabled={!unread} onClick={markAllRead}>{t("Mark all as read")}</Button>} />
      {notices.length === 0 ? (
        <Card className="py-12 text-center"><BellOff className="mx-auto size-10 text-muted-foreground" /><p className="mt-3 font-semibold">{t("No notifications")}</p></Card>
      ) : (
        <ul className="space-y-3">
          {notices.map((n) => {
            const Icon = icon[n.type];
            return (
              <li key={n.id} className={cn("flex gap-4 rounded-2xl border bg-card p-4 shadow-card", !n.read && "border-emerald")}>
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tint[n.type])}><Icon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{t(n.title)}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{t(fmtStamp(n.at))}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t(n.body)}</p>
                  {!n.read && <button type="button" onClick={() => markRead(n.id)} className="mt-2 text-sm font-semibold text-primary">{t("Mark as read")}</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
