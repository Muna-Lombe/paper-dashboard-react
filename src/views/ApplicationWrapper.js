import TextLogo from "../components/TextLogo";
import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import useAuth from "../variables/hooks/useAuth";

const sidebarItems = [
  { name: "Dashboard", icon: "fas fa-th-large", href: "/admin/dashboard" },
  { name: "Course Scraper", icon: "fas fa-book", href: "/admin/course-scraper" },
  { name: "Schedule Builder", icon: "fas fa-calendar-alt", href: "/admin/schedule-builder" },
  { name: "Course Builder", icon: "fas fa-ruler-combined", href: "/admin/course-builder" },
  { name: "Teacher Assistant", icon: "fas fa-user-plus", href: "/admin/teacher-assistant" },
  { name: "Integrations", icon: "fas fa-link", href: "/admin/integrations" },
];

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function ApplicationWrapper({ children, user: userProp }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const user = useMemo(
    () => ({
      name: userProp?.name || "New User",
      role: userProp?.role || "Projects Teacher",
    }),
    [userProp]
  );

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const navContent = (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 lg:px-3" aria-label="Admin">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            title={item.name}
            className={({ isActive }) =>
              `pd-nav-link justify-center lg:justify-start ${isActive ? "is-active" : ""}`
            }
          >
            <i className={item.icon} aria-hidden="true" />
            <span className="pd-nav-label truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--pd-border)] px-2 py-3 lg:px-3">
        <Link
          to="/admin/user-profile"
          className="pd-nav-link justify-center lg:justify-start"
          title="User profile"
        >
          <i className="fas fa-user" aria-hidden="true" />
          <span className="pd-nav-label truncate">{user.name}</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="pd-nav-link w-full justify-center text-left text-[var(--pd-danger)] lg:justify-start"
          title="Logout"
        >
          <i className="fas fa-sign-out-alt" aria-hidden="true" />
          <span className="pd-nav-label">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="pd-canvas flex h-dvh w-full overflow-hidden text-[var(--pd-ink)]">
      {/* Desktop / tablet sidebar */}
      <aside className="pd-sidebar relative z-20 hidden h-full shrink-0 border-r border-[var(--pd-border)] bg-[var(--pd-surface)] md:flex md:w-16 md:flex-col lg:w-60">
        <div className="flex h-14 items-center justify-center border-b border-[var(--pd-border)] px-2 lg:justify-start lg:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="PaperDash home">
            <TextLogo className="h-8 lg:h-9" />
          </Link>
        </div>
        {navContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`pd-overlay fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--pd-ink)_45%,transparent)] md:hidden ${
          drawerOpen ? "is-open" : ""
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`pd-drawer fixed inset-y-0 left-0 z-50 flex w-[min(18rem,86vw)] flex-col border-r border-[var(--pd-border)] bg-[var(--pd-surface)] md:hidden ${
          drawerOpen ? "is-open" : ""
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--pd-border)] px-4">
          <Link to="/" onClick={() => setDrawerOpen(false)}>
            <TextLogo className="h-8" />
          </Link>
          <button
            type="button"
            className="pd-btn pd-btn-ghost px-2 py-2"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <i className="fas fa-times" />
          </button>
        </div>
        {navContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--pd-border)] bg-[var(--pd-surface)] px-3 sm:px-4">
          <button
            type="button"
            className="pd-btn pd-btn-ghost px-2.5 py-2 md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <i className="fas fa-bars" />
          </button>

          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-sm font-semibold text-[var(--pd-ink)]">
              Hello, {user.name}
            </p>
            <p className="truncate text-xs text-[var(--pd-muted)]">{user.role}</p>
          </div>

          <div className={`min-w-0 flex-1 md:max-w-sm md:flex-none ${searchOpen ? "block" : "hidden sm:block"}`}>
            <label className="relative block">
              <span className="sr-only">Search</span>
              <i className="fas fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--pd-muted)]" />
              <input
                type="search"
                placeholder="Search here"
                className="pd-input py-2 pl-9 pr-3 text-sm"
              />
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="pd-btn pd-btn-ghost px-2.5 py-2 sm:hidden"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Toggle search"
            >
              <i className="fas fa-search" />
            </button>
            <button type="button" className="pd-btn pd-btn-ghost px-2.5 py-2" aria-label="Notifications">
              <i className="fas fa-bell" />
            </button>
            <div className="flex items-center gap-2 rounded-[10px] border border-[var(--pd-border)] px-2 py-1.5">
              <div className="pd-avatar" aria-hidden="true">
                {getInitials(user.name)}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold leading-tight">{user.name}</p>
                <p className="truncate text-xs text-[var(--pd-muted)]">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default ApplicationWrapper;
