"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { sendGuestMessageAction } from "@/actions/conversations";
import type { Database } from "@/types/database.types";

type ConversationRecord = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRecord = Database["public"]["Tables"]["conversation_messages"]["Row"];

interface GuestConversationThreadProps {
  conversation: ConversationRecord | null;
  initialMessages: MessageRecord[];
  guestName: string;
  isCutoffPassed: boolean;
}

export function GuestConversationThread({
  conversation,
  initialMessages,
  guestName,
  isCutoffPassed,
}: GuestConversationThreadProps) {
  const [messages, setMessages] = useState<MessageRecord[]>(initialMessages);
  const [status, setStatus] = useState<string>(conversation?.status || "new");
  const [inputText, setInputText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || inputText.trim().length < 1) return;

    setErrorText(null);
    const content = inputText.trim();

    startTransition(async () => {
      const res = await sendGuestMessageAction(conversation.id, content);
      if (res.success) {
        setInputText("");
        // Optimistic message
        const optimisticMsg: MessageRecord = {
          id: res.messageId || ("temp-" + Date.now()),
          conversation_id: conversation.id,
          sender_id: "me",
          message_body: content,
          is_from_admin: false,
          read_at: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        // Reopened to 'new' if previously 'resolved'
        if (status === "resolved") {
          setStatus("new");
        }
      } else {
        setErrorText(res.error || "Failed to send message.");
      }
    });
  };

  return (
    <div id="inquiries" className="space-y-6 scroll-mt-24">
      {/* Header */}
      <div className="border-b border-[#B8975E]/30 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
            Hospitality Desk &bull; Private Inquiries
          </span>
          <h2 className="font-serif text-3xl font-light text-[#292322]">
            Conversation with the Hosts
          </h2>
          <p className="font-sans text-xs text-[#292322]/60 mt-1">
            A direct, private line with Mithun &amp; Sakhi’s hospitality coordination team for any questions regarding travel, logistics, or arrangements.
          </p>
        </div>

        {/* Status Pill */}
        <div>
          {status === "resolved" ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider bg-[#69765D]/15 text-[#525D48] border border-[#69765D]/30">
              Resolved
            </span>
          ) : status === "in_progress" ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30">
              In Discussion
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              New Inquiry
            </span>
          )}
        </div>
      </div>

      {errorText && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#A52232]/10 border border-[#A52232]/30 text-xs font-sans text-[#A52232]"
        >
          {errorText}
        </div>
      )}

      {/* Message Stream */}
      <div className="bg-white/90 border border-[#B8975E]/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="min-h-[220px] max-h-[420px] overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2 text-[#292322]/60 text-xs font-sans">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#B8975E]/10 border border-[#B8975E]/20 flex items-center justify-center text-[#B8975E] mb-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="font-medium text-[#292322]">No messages yet</p>
              <p className="max-w-xs mx-auto">
                Have questions regarding accommodation, arrival timings, or ceremony attire? Send a note below.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.is_from_admin;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isAdmin ? "items-start" : "items-end"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-sans font-medium text-[#292322]/60">
                      {isAdmin ? "Mithun & Sakhi • Hospitality Desk" : guestName}
                    </span>
                    <span className="text-[10px] text-[#292322]/40 font-sans">
                      {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      isAdmin
                        ? "bg-[#F7F1E6]/90 border border-[#B8975E]/40 text-[#292322] rounded-tl-sm"
                        : "bg-gradient-to-r from-[#B8975E] to-[#9B7D48] text-white shadow-sm rounded-tr-sm"
                    }`}
                  >
                    {msg.message_body}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Status notification if resolved */}
        {status === "resolved" && !isCutoffPassed && (
          <div className="p-3 rounded-xl bg-[#69765D]/10 border border-[#69765D]/20 text-[11px] font-sans text-[#434D3A] text-center">
            This inquiry was marked as resolved. Sending a new question will automatically reopen it for the team.
          </div>
        )}

        {/* Composer */}
        {isCutoffPassed ? (
          <div className="p-4 rounded-xl bg-[#FFFCF6] border border-[#B8975E]/30 text-center text-xs text-[#292322]/70 font-sans">
            The hospitality coordination desk is closed as wedding celebrations transition into Memories Mode.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="pt-2 space-y-2">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Type your question or request here..."
                disabled={isPending || !conversation}
                className="w-full px-4 py-3 rounded-xl border border-[#B8975E]/30 focus:border-[#B8975E] focus:outline-none focus:ring-1 focus:ring-[#B8975E] font-sans text-base sm:text-xs text-[#292322] bg-[#FFFCF6]/60 placeholder-[#292322]/30 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#292322]/50 font-sans">
              <span>{inputText.length} / 2000 characters</span>

              <button
                type="submit"
                disabled={isPending || !conversation || inputText.trim().length < 1}
                className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-full bg-[#292322] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#3D3534] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {isPending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
