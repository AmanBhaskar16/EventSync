// Real-time messaging via Socket.io 

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession }  from "next-auth/react";
import { Send, Loader2, Circle } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { formatDateTime } from "@/lib/utils/format";
import { cn }        from "@/lib/utils";

type Message = {
  id:        string;
  senderId:  string;
  content:   string;
  isRead:    boolean;
  createdAt: string;
};

export function MessageThread({ bookingId }: { bookingId: string }) {
  const { data: session }     = useSession();
  const socket                = useSocket(session?.user?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content,  setContent]  = useState("");
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [typing,   setTyping]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial messages
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/bookings/${bookingId}/messages`);
        const data = await res.json() as { 
          success: boolean; 
          data?: Message[] };
        if (data.success && data.data) setMessages(data.data);
      } catch { /* silent */ }
      finally   { setLoading(false); }
    }
    load();
  }, [bookingId]);

  // Socket.io real-time
  useEffect(() => {
    if (!socket) return;

    // Join booking room
    socket.emit("join-booking", bookingId);

    // Listen for new messages
    function onNewMessage(msg: Message) {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    // Listen for typing indicator
    function onTyping({ senderId, isTyping }: { senderId: string; isTyping: boolean }) {
      if (senderId !== session?.user?.id) setTyping(isTyping);
    }

    socket.on("new-message", onNewMessage);
    socket.on("typing", onTyping);

    return () => {
      socket.emit("leave-booking", bookingId);
      socket.off("new-message", onNewMessage);
      socket.off("typing", onTyping);
    };
  }, [socket, bookingId, session?.user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function handleTyping() {
    if (!socket) return;
    socket.emit("typing", { bookingId, senderId: session?.user?.id, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", { bookingId, senderId: session?.user?.id, isTyping: false });
    }, 1500);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);

    // Stop typing indicator
    if (socket) socket.emit("typing", { bookingId, senderId: session?.user?.id, isTyping: false });

    try {
      const res  = await fetch(`/api/bookings/${bookingId}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json() as { success: boolean; data?: Message };
      if (data.success && data.data) {
        // Optimistically add — socket will also receive but we dedup
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.data!.id)) return prev;
          return [...prev, data.data!];
        });
        setContent("");
      }
    } catch { /* silent */ }
    finally   { setSending(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="size-5 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div className="overflow-y-auto space-y-3 p-4 min-h-50 max-h-95">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
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

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0,1,2].map((i) => (
                <Circle key={i}
                  className="size-1.5 fill-muted-foreground text-muted-foreground animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-end gap-2 p-4 border-t border-border">
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
          }}
          placeholder="Type a message… (Enter to send)"
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