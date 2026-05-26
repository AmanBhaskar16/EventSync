
// Real-time-ish message thread — polls every 10s for new messages

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Message = {
  id:        string;
  senderId:  string;
  content:   string;
  isRead:    boolean;
  createdAt: string;
};

export function MessageThread({ bookingId }: { bookingId: string }) {
  const { data: session }   = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content,  setContent]  = useState("");
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/messages`);
      const data = await res.json() as { success: boolean; data?: Message[] };
      if (data.success && data.data) setMessages(data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  // Initial fetch + poll every 10s
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json() as { success: boolean; data?: Message };
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data!]);
        setContent("");
      }
    } catch { /* silent */ }
    finally { setSending(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="size-5 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-75 max-h-100">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === session?.user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 space-y-1",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={cn(
                    "text-[10px]",
                    isMe ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
                  )}>
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-end gap-2 p-4 border-t border-border">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
        />
        <Button type="submit" size="icon" disabled={!content.trim() || sending} className="h-10 w-10 shrink-0">
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}