"use client";

// Shared composition of the approved Models/Projects navigation:
// Centered Nav Header (21220), Liquid Morph Floating Menu (16369),
// and Magnetic Button (1507). Original bundles are archived in docs/21st-source/.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { isSiteNavigationActive, siteNavigationItems } from "@/data/siteNavigation";
import { MagneticLink } from "@/components/projects/21st/Magnetic";
import { SubtleLink } from "@/components/ui/SubtleAction";
import OknoLogo from "@/components/Brand/OknoLogo";
import { useSiteContentMap } from "@/lib/useSiteContent";
import styles from "./Header.module.css";

type Item = { href: string; label: string };

function RollingLink({ href, label, current, onClick }: Item & { current?: boolean; onClick?: () => void }) {
  return (
    <Link href={href} className={styles.rolling} aria-label={label} aria-current={current ? "page" : undefined} onClick={onClick} data-models-magnetic>
      <span aria-hidden="true" className={styles.letters}>
        {[...label].map((character, index) => (
          <span className={styles.character} key={`${character}-${index}`}>
            <span style={{ transitionDelay: `${index * 18}ms` }}>
              <span>{character === " " ? "\u00a0" : character}</span>
              <span>{character === " " ? "\u00a0" : character}</span>
            </span>
          </span>
        ))}
      </span>
    </Link>
  );
}

function SiteMorphMenu({ items, currentHref, menuLabel, closeLabel, navigationLabel, mobileNavigationLabel, openAccessible, closeAccessible, compactForCopy }: { items: Item[]; currentHref: string; menuLabel: string; closeLabel: string; navigationLabel: string; mobileNavigationLabel: string; openAccessible: string; closeAccessible: string; compactForCopy: boolean }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      if (window.innerWidth > 1120 && !compactForCopy) setOpen(false);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [compactForCopy]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = toggle.current;
    const shell = root.current?.querySelector<HTMLElement>("[data-menu-shell]");
    if (shell) shell.scrollTop = 0;
    document.body.style.overflow = "hidden";
    trigger?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const controls = root.current?.querySelectorAll<HTMLElement>("button, nav a[href]");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  const duration = reduced ? 0 : 0.68;
  const expandedWidth = viewport.width <= 520
    ? Math.max(220, viewport.width - 32)
    : 340;
  const expandedHeight = Math.max(280, Math.min(560, viewport.height - 32));
  const collapsedWidth = Math.max(100, Math.min(220, Math.max(menuLabel.length, closeLabel.length) * 9 + 52));
  return (
    <div className={styles.menuPosition} ref={root} style={{ width: collapsedWidth }}>
      <motion.div
        className={styles.menuShell}
        data-menu-shell
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label={open ? navigationLabel : undefined}
        initial={false}
        animate={{ width: open ? expandedWidth : collapsedWidth, height: open ? expandedHeight : 42, borderRadius: open ? 24 : 30 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className={styles.menuCircle} aria-hidden="true" initial={false} animate={{ bottom: open ? "-20%" : "-200%" }} transition={{ duration, ease: [0.22, 1, 0.36, 1] }} />
        <button
          ref={toggle}
          data-models-magnetic
          className={styles.menuToggle}
          style={{ width: collapsedWidth }}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? closeAccessible : openAccessible}
          onClick={() => setOpen((current) => !current)}
          data-open={open}
        >
          <span data-type-field={"header.menu.close"}>{open ? closeLabel : menuLabel}</span>
          <span className={styles.menuIcon} aria-hidden="true">
            <motion.i animate={{ rotate: open ? 45 : 0, y: open ? 0 : -3 }} transition={{ duration: reduced ? 0 : 0.3 }} />
            <motion.i animate={{ rotate: open ? -45 : 0, y: open ? 0 : 3 }} transition={{ duration: reduced ? 0 : 0.3 }} />
          </span>
        </button>
        <nav id={menuId} className={styles.menuLinks} aria-label={mobileNavigationLabel} inert={!open} aria-hidden={!open}>
          {items.map((item, index) => (
            <motion.div key={item.href} initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : 8 }} transition={{ duration: reduced ? 0 : 0.4, delay: open && !reduced ? 0.16 + 0.035 * index : 0 }}>
              <RollingLink {...item} current={isSiteNavigationActive(currentHref, item.href)} onClick={() => setOpen(false)} />
            </motion.div>
          ))}
        </nav>
      </motion.div>
    </div>
  );
}

type HeaderProps = {
  tone?: "dark" | "light";
  enquiryHref?: string;
  enquiryLabel?: string;
  currentHref?: string;
  // Accepted while existing page compositions move to this shared header.
  variant?: "glass" | "immersive";
  mobileOnly?: boolean;
  trapFocus?: boolean;
};

export default function Header({ tone, variant, enquiryHref = "/enquiry", enquiryLabel, currentHref }: HeaderProps) {
  const values = useSiteContentMap();
  const get = (key: string, fallback: string) => values[`header.${key}`] || fallback;
  const brandName = values["brand.logo.alt"] || "OKNO Modhomes";
  const pathname = usePathname();
  const activePath = currentHref ?? pathname ?? "/";
  const resolvedTone = tone ?? (variant === "glass" ? "light" : "dark");
  const navigation = siteNavigationItems.map(item => ({ ...item, label: get(`nav.${item.href.slice(1)}`, item.label) }));
  const enquireLabel = enquiryLabel ?? get("action.enquire", "Enquire");
  const items = [{ href: "/", label: get("nav.home", "Home") }, ...navigation, { href: enquiryHref, label: enquireLabel }];
  const menuLabel = get("menu.open", "Menu");
  const closeLabel = get("menu.close", "Close");
  const navigationLabel = get("menu.navigation-label", "Site navigation");
  const compactForCopy = navigation.some(item => item.label.length > 20) || navigation.reduce((length, item) => length + item.label.length, 0) > 90;
  return (
    <header className={styles.header} data-type-section="shared.header" data-tone={resolvedTone} data-copy-compact={compactForCopy} data-site-header>
      <div className={styles.shell}>
        <MagneticLink href="/" className={styles.logo} aria-label={`${brandName} home`} data-models-magnetic>
          <OknoLogo tone={resolvedTone === "light" ? "dark" : "light"} priority />
        </MagneticLink>
        <nav className={styles.navigation} aria-label={get("nav.accessible-label", "Primary navigation")}>
          {navigation.map((item) => <RollingLink key={item.href} {...item} current={isSiteNavigationActive(activePath, item.href)} />)}
        </nav>
        <div className={styles.actions} data-type-field={"header.menu.open"}>
          <SubtleLink href={enquiryHref} className={styles.enquire} tone={resolvedTone === "light" ? "paper" : "glass"} data-models-magnetic data-type-field={"header.action.enquire"}>{enquireLabel}</SubtleLink>
          <SiteMorphMenu items={items} currentHref={activePath} menuLabel={menuLabel} closeLabel={closeLabel} navigationLabel={navigationLabel}
            mobileNavigationLabel={get("menu.mobile-navigation-label", "Mobile navigation")}
            openAccessible={get("menu.open-accessible", "Open navigation")}
            closeAccessible={get("menu.close-accessible", "Close navigation")}
            compactForCopy={compactForCopy} />
        </div>
      </div>
    </header>
  );
}
