"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useStore, getLoadWarning, useHydrated } from "@/lib/store";

export const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/academy", label: "Academy" },
  { href: "/simulations", label: "Simulations" },
  { href: "/practice", label: "Practice" },
  { href: "/exams", label: "Exams" },
  { href: "/notebook", label: "Notebook" },
  { href: "/progress", label: "Progress" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
];

/** Applies theme / contrast / motion / font-size settings to <html>. */
function SettingsEffect() {
  const settings = useStore((s) => s.settings);
  useEffect(() => {
    const el = document.documentElement;
    const apply = () => {
      const theme = settings.theme === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : settings.theme;
      el.dataset.theme = theme;
      el.dataset.contrast = settings.contrast;
      el.dataset.motion = settings.reducedMotion ? "reduce" : "auto";
      el.style.setProperty("--font-scale", String(settings.fontScale));
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings]);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const returnTo = useStore((s) => s.returnTo);
  const warning = hydrated ? getLoadWarning() : null;
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <SettingsEffect />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold no-underline">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-mono text-accent-fg">∑</span>
            <span>Mathematics Command Center</span>
          </Link>
          <nav aria-label="Primary" className="ml-auto hidden xl:block">
            <ul className="flex gap-1">
              {NAV.map((n) => {
                const active = path === n.href || path.startsWith(n.href + "/");
                return (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={active ? "page" : undefined} className={`rounded-md px-2.5 py-1.5 text-sm no-underline ${active ? "bg-card-2 text-fg" : "text-muted hover:text-fg"}`}>
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button className="ml-auto rounded-md border border-line px-3 py-1.5 xl:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
            Menu
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Primary" className="border-t border-line xl:hidden">
            <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-1 p-3 sm:grid-cols-5">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined} className="block rounded-md px-3 py-2 no-underline hover:bg-card-2">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {returnTo && !path.startsWith(returnTo.href.split("#")[0]) && (
          <div className="border-t border-line bg-card-2">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 text-sm">
              <span className="text-muted">Bridge in progress —</span>
              <Link href={returnTo.href} className="font-semibold text-accent">↩ Return to {returnTo.label}</Link>
              <button className="ml-auto text-muted underline" onClick={() => import("@/lib/store").then((m) => m.actions.setReturnTo(null))}>
                Dismiss
              </button>
            </div>
          </div>
        )}
      </header>
      {warning && (
        <div role="alert" className="bg-warn/20 px-4 py-2 text-center text-sm">
          {warning}
        </div>
      )}
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        <p>MCC keeps your progress in this browser only (guest mode). Export or delete it in <Link href="/settings" className="underline">Settings</Link>.</p>
        <p className="mt-1">University lecture PDFs are referenced by file and page, never redistributed.</p>
      </footer>
    </div>
  );
}
