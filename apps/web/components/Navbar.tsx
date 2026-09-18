"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  PackageSearch,
  Truck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Container } from "./Container";
import { Button } from "./Button";
import { useAuth } from "./AuthProvider";
import { UserRole } from "@pack-and-go/types";
import { notificationApi, type CustomerNotification } from "@/lib/apiClient";
import { AdminCreationModal } from "./AdminCreationModal";

const links = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState<CustomerNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const notificationBellRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userInitials = user
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "";

  const isCustomer =
    user && [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER].includes(user.role);

  useEffect(() => {
    if (!isCustomer) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let isActive = true;
    const loadNotifications = async () => {
      try {
        const result = await notificationApi.list(8);
        if (isActive) {
          setNotifications(result.notifications);
          setUnreadCount(result.unreadCount);
        }
      } catch {
        // The dashboard remains the fallback notification surface.
      }
    };

    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 30000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [isCustomer]);

  useEffect(() => {
    const closeMenus = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        isNotificationsOpen &&
        notificationBellRef.current &&
        !notificationBellRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeMenus);
    return () => document.removeEventListener("pointerdown", closeMenus);
  }, [isNotificationsOpen, isUserMenuOpen]);

  const markNotificationRead = async (notification: CustomerNotification) => {
    if (notification.readAt) return;
    try {
      const result = await notificationApi.markRead(notification._id);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? result.notification : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // Keep the item unread if the server update fails.
    }
  };

  return (
    <header className="border-b border-navy-950/10 bg-paper/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-navy-950 tracking-tighter"
        >
          Pack &amp; Go <span className="text-route">GH</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted hover:text-navy-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <>
              {[UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role) && (
                <Button
                  href="/admin"
                  variant="ghost"
                  className="hidden xl:inline-flex"
                >
                  Admin
                </Button>
              )}
              {isCustomer && (
                <div className="relative">
                  <button
                    ref={notificationBellRef}
                    type="button"
                    onClick={() => setIsNotificationsOpen((open) => !open)}
                    aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                    aria-expanded={isNotificationsOpen}
                    title="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-sm text-navy-950 hover:bg-navy-950/5"
                  >
                    <Bell aria-hidden="true" className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-route px-1 text-[10px] font-bold text-navy-950">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="fixed inset-x-4 top-24 z-50 max-h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-navy-950/10 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:max-h-none sm:w-[22rem]">
                      <div className="flex items-center justify-between border-b border-navy-950/10 px-4 py-3">
                        <div>
                          <p className="font-semibold text-navy-950">
                            Notifications
                          </p>
                          <p className="text-xs text-ink-muted">
                            Shipment updates
                          </p>
                        </div>
                        <span className="rounded-full bg-paper px-2 py-1 text-xs font-semibold text-navy-950">
                          {unreadCount} unread
                        </span>
                      </div>
                      <div className="max-h-[min(20rem,calc(100vh-14rem))] overflow-y-auto sm:max-h-80">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-sm text-ink-muted">
                            No notifications yet.
                          </p>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              type="button"
                              key={notification._id}
                              onClick={() =>
                                void markNotificationRead(notification)
                              }
                              className={`block w-full border-b border-navy-950/5 px-4 py-3 text-left hover:bg-paper ${notification.readAt ? "opacity-60" : ""}`}
                            >
                              <div className="flex gap-3">
                                <span
                                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? "bg-navy-950/15" : "bg-route"}`}
                                />
                                <span className="min-w-0">
                                  <span className="block break-words text-sm font-semibold text-navy-950">
                                    {notification.title}
                                  </span>
                                  <span className="mt-0.5 block break-words text-xs leading-5 text-ink-muted">
                                    {notification.message}
                                  </span>
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <Link
                        href="/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block border-t border-navy-950/10 px-4 py-3 text-center text-xs font-semibold text-navy-950 hover:bg-paper"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-label={`${user.name} account menu`}
                  aria-expanded={isUserMenuOpen}
                  className="flex items-center gap-2 rounded-full border border-navy-950/10 bg-white p-1 pr-2 text-navy-950 hover:border-navy-950/25"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-950 text-xs font-semibold text-paper">
                    {userInitials}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-navy-950/10 bg-white shadow-xl">
                    <div className="border-b border-navy-950/10 px-4 py-3">
                      <p className="font-semibold text-navy-950">{user.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      {isCustomer && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-950 hover:bg-paper"
                          >
                            <LayoutDashboard
                              aria-hidden="true"
                              className="h-4 w-4 text-ink-muted"
                            />
                            Dashboard
                          </Link>
                          <Link
                            href="/track"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-950 hover:bg-paper"
                          >
                            <PackageSearch
                              aria-hidden="true"
                              className="h-4 w-4 text-ink-muted"
                            />
                            Track shipment
                          </Link>
                          <Link
                            href="/request-delivery"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-950 hover:bg-paper"
                          >
                            <Truck
                              aria-hidden="true"
                              className="h-4 w-4 text-ink-muted"
                            />
                            Request delivery
                          </Link>
                        </>
                      )}
                      {isCustomer && (
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-950 hover:bg-paper"
                        >
                          <MapPin
                            aria-hidden="true"
                            className="h-4 w-4 text-ink-muted"
                          />
                          Profile &amp; saved locations
                        </Link>
                      )}
                      {[UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(
                        user.role,
                      ) && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-950 hover:bg-paper"
                          >
                            <UserRound
                              aria-hidden="true"
                              className="h-4 w-4 text-ink-muted"
                            />
                            Admin console
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsAdminModalOpen(true);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-navy-950 hover:bg-paper"
                          >
                            <UserPlus
                              aria-hidden="true"
                              className="h-4 w-4 text-ink-muted"
                            />
                            Add admin
                          </button>
                        </>
                      )}
                    </div>
                    <div className="border-t border-navy-950/10 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          void logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
                      >
                        <LogOut aria-hidden="true" className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <AdminCreationModal
                open={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
              />
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost">
                Sign in
              </Button>
              <Button href="/register" className="hidden sm:inline-flex">
                Create account
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
