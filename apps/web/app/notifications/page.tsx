"use client";

import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ToastProvider";
import { notificationApi, type CustomerNotification } from "@/lib/apiClient";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    notificationApi
      .list()
      .then((result) => {
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
      })
      .catch((reason) =>
        showToast(
          reason instanceof Error
            ? reason.message
            : "Unable to load your notifications.",
          "error",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [showToast]);

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
    } catch (reason) {
      showToast(
        reason instanceof Error
          ? reason.message
          : "Unable to update notification.",
        "error",
      );
    }
  };

  return (
    <ProtectedRoute>
      <Container className="py-14 sm:py-20">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-navy-950"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-route">
              Customer portal
            </p>
            <h1 className="mt-3 text-4xl font-semibold">Notifications</h1>
            <p className="mt-2 text-ink-muted">
              Shipment updates and delivery activity.
            </p>
          </div>
          <span className="flex w-fit items-center gap-2 rounded-full bg-route px-3 py-1.5 text-sm font-semibold text-navy-950">
            <Bell aria-hidden="true" className="h-4 w-4" />
            {unreadCount} unread
          </span>
        </div>

        <section className="mt-10 overflow-hidden rounded-2xl border border-navy-950/10 bg-white shadow-sm">
          {isLoading ? (
            <p className="p-8 text-sm text-ink-muted">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center">
              <Bell
                aria-hidden="true"
                className="mx-auto h-8 w-8 text-ink-faint"
              />
              <p className="mt-3 font-semibold text-navy-950">
                No notifications yet
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                New shipment updates will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-950/10">
              {notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() => void markNotificationRead(notification)}
                  className={`block w-full px-5 py-5 text-left transition-colors hover:bg-paper sm:px-7 ${notification.readAt ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${notification.readAt ? "bg-navy-950/15" : "bg-route"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
                        <p className="font-semibold text-navy-950">
                          {notification.title}
                        </p>
                        <time className="shrink-0 text-xs text-ink-faint">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </Container>
    </ProtectedRoute>
  );
}
