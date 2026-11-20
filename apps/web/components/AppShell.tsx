"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { actions, useStore, getLoadWarning, useHydrated } from '@/lib/store';

export const NAV = [{ href: '/', label: 'Learn' }, { href: '/paths', label: 'Learning paths' }, { href: '/notebook', label: 'My notebook' }];
const RESOURCES = [{ href: '/learn', label: 'Full topic library' }, { href: '/simulations', label: 'Visual labs' }, { href: '/practice', label: 'Practice' }, { href: '/academy', label: 'University chapters' }, { href: '/exams', label: 'Exams' }, { href: '/progress', label: 'Reference progress' }, { href: '/library', label: 'Search reference library' }, { href: '/settings', label: 'Settings & data export' }];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const settings = useStore(s => s.settings);
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const isDark = settings.theme === 'dark' || (settings.theme === 'system' && mq.matches);
      el.dataset.theme = isDark ? 'dark' : 'light'; setDark(isDark);
      el.dataset.contrast = settings.contrast;
      el.dataset.motion = settings.reducedMotion ? 'reduce' : 'auto';
      el.style.setProperty('--font-scale', String(settings.fontScale));
    };
    apply(); mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings]);
  useEffect(() => setOpen(false), [path]);
  return <div className="app-frame">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="notebook-header">
      <Link href="/" className="brand" aria-label="Mathematics Command Center home"><span className="brand-mark" aria-hidden="true">m<span>·</span></span><span>math<span className="brand-note"> / field notes</span></span></Link>
      <nav aria-label="Primary" className="primary-nav">{NAV.map(n => <Link key={n.href} href={n.href} aria-current={path === n.href ? 'page' : undefined}>{n.label}</Link>)}</nav>
      <div className="header-tools"><button className="icon-button" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => actions.setSettings({ theme: dark ? 'light' : 'dark' })}>{dark ? '☀' : '☾'}</button><button className="quiet-button resource-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="resource-menu">Resources <span aria-hidden="true">⌄</span></button></div>
      {open && <nav id="resource-menu" aria-label="Resources" className="resource-menu">{RESOURCES.map(n => <Link onClick={() => setOpen(false)} href={n.href} key={n.href}>{n.label}</Link>)}</nav>}
    </header>
    {hydrated && getLoadWarning() && <p className="storage-warning" role="alert">{getLoadWarning()}</p>}
    <main id="main" className={path === '/' ? 'workbench-main' : 'reference-main'}>{children}</main>
    <footer className="notebook-footer"><span>MATHEMATICS COMMAND CENTER</span><span>Your own pace. One idea at a time.</span><Link href="/settings">Saved in this browser · Export data</Link></footer>
  </div>;
}
