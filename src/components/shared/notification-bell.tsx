
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession }  from "next-auth/react";
import { useRouter }   from "next/navigation";
import { Bell, X } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notifications";
import { NOTIFICATION_ICONS } from "@/types/notifications";

export function NotificationBell() {
  const { data: session }   = useSession();
  const router = useRouter();
  const socket = useSocket(session?.user?.id);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch on mount
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications")
      .then((r) => r.json() as Promise<{ success: boolean; data?: Notification[] }>)
      .then((data) => {
        if (data.success && data.data) {
          setNotifications(data.data);
          setUnread(data.data.filter((n) => !n.isRead).length);
        }
      })
      .catch(() => {});
  }, [session?.user]);

  // Real-time notifications
  useEffect(() => {
    if (!socket) return;
    function onNotification(notification: Notification) {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnread((prev) => prev + 1);
    }
    socket.on("notification", onNotification);
    return () => { socket.off("notification", onNotification); };
  }, [socket]);

  // Mark ALL read — clears list + resets counter
  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "PATCH" });
    // Clear the list entirely + reset counter
    setNotifications([]);
    setUnread(0);
  }

  // Mark single read
  function handleClick(n: Notification) {
    setOpen(false);
    if (n.link) router.push(n.link);
    fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => {});
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
    setUnread((prev) => Math.max(0, prev - (n.isRead ? 0 : 1)));
  }

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-semibold text-sm">
              Notifications
              {unread > 0 && (
                <span className="ml-2 text-xs text-primary font-normal">
                  {unread} unread
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell className="size-8 mx-auto text-muted-foreground opacity-30" />
                <p className="text-xs text-muted-foreground">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0",
                    !n.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">
                      {NOTIFICATION_ICONS[n.type as NotificationType] ?? "🔔"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-xs font-semibold leading-snug",
                        !n.isRead && "text-foreground"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleString("en-IN", {
                          day: "numeric", month: "short",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}