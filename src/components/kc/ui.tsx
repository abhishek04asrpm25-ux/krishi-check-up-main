import { t, useLang } from "@/lib/i18n";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-deep",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        outline: "border border-input bg-card text-foreground hover:bg-muted",
        ghost: "text-primary hover:bg-secondary",
        inverse: "bg-card text-primary-deep hover:bg-secondary",
      },
      size: { sm: "h-9 px-3 text-sm", md: "h-12 px-5 text-base", lg: "h-14 px-6 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  useLang();
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  useLang();
  return <div className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>{t(children)}</div>;
}

export function CardTitle({ children, action, icon }: { children: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  useLang();
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex min-w-0 items-center gap-2 text-base font-semibold">
        {icon && <span className="shrink-0 text-primary">{t(icon)}</span>}
        <span className="truncate">{t(children)}</span>
      </h3>
      {t(action)}
    </div>
  );
}

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", {
  variants: {
    tone: {
      success: "bg-success-soft text-success",
      warning: "bg-warning-soft text-warning-foreground",
      info: "bg-info-soft text-info",
      danger: "bg-danger-soft text-destructive",
      neutral: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});
export type Tone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export function StatusBadge({ tone, children }: { tone?: Tone; children: ReactNode }) {
  useLang();
  return (
    <span className={badgeVariants({ tone })}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {t(children)}
    </span>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  useLang();
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold">{t(label)}</label>
      {t(children)}
      {hint && <p className="text-xs text-muted-foreground">{t(hint)}</p>}
    </div>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  useLang();
  return <input {...props} className={cn(inputCls, props.className)} />;
}
export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  useLang();
  return <select {...props} className={cn(inputCls, "appearance-none", props.className)}>{t(children)}</select>;
}

export function Progress({ value, label }: { value: number; label?: string }) {
  useLang();
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-muted-foreground">{t(label)}</span>
          <span className="font-semibold">{t(value)}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-emerald" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export type TimelineStep = { title: string; time?: string; detail?: string; state: "done" | "current" | "upcoming" };
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  useLang();
  return (
    <ol className="relative space-y-6">
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-4">
          {i < steps.length - 1 && (
            <span className={cn("absolute left-[15px] top-8 h-[calc(100%-4px)] w-0.5", s.state === "done" ? "bg-emerald" : "bg-border")} aria-hidden />
          )}
          <span
            className={cn(
              "z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
              s.state === "done" && "border-emerald bg-emerald text-primary-foreground",
              s.state === "current" && "border-primary bg-card text-primary ring-4 ring-secondary",
              s.state === "upcoming" && "border-border bg-card text-muted-foreground",
            )}
          >
            {s.state === "done" ? <Check className="size-4" /> : i + 1}
          </span>
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-x-3">
              <p className={cn("font-semibold", s.state === "upcoming" && "text-muted-foreground")}>{t(s.title)}</p>
              {s.time && <span className="text-sm text-muted-foreground">{t(s.time)}</span>}
            </div>
            {s.detail && <p className="mt-0.5 text-sm text-muted-foreground">{t(s.detail)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

const alertIcons = { info: Info, warning: AlertTriangle, danger: XCircle, success: CheckCircle2 };
export function Alert({ tone = "info", title, children }: { tone?: keyof typeof alertIcons; title: string; children?: ReactNode }) {
  useLang();
  const Icon = alertIcons[tone];
  const cls = {
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning-foreground",
    danger: "bg-danger-soft text-destructive",
    success: "bg-success-soft text-success",
  }[tone];
  return (
    <div role="status" className={cn("flex gap-3 rounded-xl p-4", cls)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="text-sm">
        <p className="font-semibold">{t(title)}</p>
        {children && <div className="mt-0.5 text-foreground/80">{t(children)}</div>}
      </div>
    </div>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  useLang();
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{t(h)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => <td key={j} className="px-4 py-3">{t(c)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  useLang();
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{t(label)}</span>
      <span className="text-right text-sm font-semibold">{t(value)}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  useLang();
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">{t(title)}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{t(subtitle)}</p>}
      </div>
      {t(action)}
    </div>
  );
}
