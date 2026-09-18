"use client";

import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "./Container";
import { Button } from "./Button";
import { useAuth } from "./AuthProvider";
import { UserRole } from "@pack-and-go/types";
import { notificationApi, type CustomerNotification } from "@/lib/apiClient";

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
              {isCustomer && (
                <Button
                  href="/dashboard"
                  variant="ghost"
                  className="hidden md:inline-flex"
                >
                  Dashboard
                </Button>
              )}
              {isCustomer && (
                <Button
                  href="/track"
                  variant="ghost"
                  className="hidden lg:inline-flex"
                >
                  Track shipment
                </Button>
              )}
              {isCustomer && (
                <Button
                  href="/request-delivery"
                  className="hidden sm:inline-flex"
                >
                  Request delivery
                </Button>
              )}
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
                    <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-navy-950/10 bg-white shadow-xl">
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
                      <div className="max-h-80 overflow-y-auto">
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
                                <span>
                                  <span className="block text-sm font-semibold text-navy-950">
                                    {notification.title}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-5 text-ink-muted">
                                    {notification.message}
                                  </span>
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block border-t border-navy-950/10 px-4 py-3 text-center text-xs font-semibold text-navy-950 hover:bg-paper"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <Link
                href="/account"
                title={`${user.name} account`}
                aria-label={`${user.name} account`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-950 text-xs font-semibold text-paper"
              >
                {userInitials}
              </Link>
              <Button
                variant="secondary"
                onClick={() => void logout()}
                aria-label="Sign out"
                title="Sign out"
                className="h-10 w-10 !p-0"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
              </Button>
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
