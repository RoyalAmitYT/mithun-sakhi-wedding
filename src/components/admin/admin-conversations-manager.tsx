"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import {
  sendAdminMessageAction,
  adminUpdateConversationStatusAction,
} from "@/actions/conversations";

export type AdminConversationThread = {
  id: string;
  profile_id: string;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    email: string;
    mobile_number: string | null;
  } | null;
  messages: Array<{
    id: string;
    conversation_id: string;
    sender_id: string;
    message_body: string;
    is_from_admin: boolean;
    created_at: string;
  }>;
};

interface AdminConversationsManagerProps {
  initialThreads: AdminConversationThread[];
}

export function AdminConversationsManager({
  initialThreads,
}: AdminConversationsManagerProps) {
  const [threads, setThreads] = useState<AdminConversationThread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    initialThreads.length > 0 ? initialThreads[0].id : null
  );
  const [filter, setFilter] = useState<"all" | "new" | "in_progress" | "resolved">("all");
  const [replyText, setReplyText] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length, selectedThreadId]);

  const newCount = threads.filter((t) => t.status === "new").length;
  const inProgressCount = threads.filter((t) => t.status === "in_progress").length;
  const resolvedCount = threads.filter((t) => t.status === "resolved").length;

  const filteredThreads = threads.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || replyText.trim().length < 1) return;

    setStatusMessage(null);
    const content = replyText.trim();

    startTransition(async () => {
      const res = await sendAdminMessageAction(activeThread.id, content);
      if (res.success) {
        setReplyText("");
        // Optimistic update
        const newMsg = {
          id: res.messageId || ("temp-" + Date.now()),
          conversation_id: activeThread.id,
          sender_id: "admin",
          message_body: content,
          is_from_admin: true,
          created_at: new Date().toISOString(),
        };

        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeThread.id) {
              return {
                ...t,
                status: t.status === "new" ? "in_progress" : t.status,
                updated_at: new Date().toISOString(),
                messages: [...t.messages, newMsg],
              };
            }
            return t;
          })
        );
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to deliver response.",
        });
      }
    });
  };

  const handleStatusChange = (newStatus: "new" | "in_progress" | "resolved") => {
    if (!activeThread || activeThread.status === newStatus) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await adminUpdateConversationStatusAction(activeThread.id, newStatus);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: `Thread status updated to ${newStatus}.`,
        });
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThread.id
              ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
              : t
          )
        );
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update status.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-sans leading-relaxed border ${
            statusMessage.type === "success"
              ? "bg-[#69765D]/10 border-[#69765D]/30 text-[#434D3A]"
              : "bg-[#A52232]/10 border-[#A52232]/30 text-[#A52232]"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#B8975E]/20 pb-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "all"
              ? "bg-[#292322] text-white shadow-sm"
              : "bg-white text-[#292322]/70 hover:bg-[#F7F1E6] border border-[#B8975E]/30"
          }`}
        >
          <span>All Threads</span>
          <span className="text-[10px] opacity-75">({threads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("new")}
          className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "new"
              ? "bg-blue-800 text-white shadow-sm"
              : "bg-white text-blue-900 hover:bg-blue-50 border border-blue-200"
          }`}
        >
          <span>New Inquiries</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
            {newCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("in_progress")}
          className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "in_progress"
              ? "bg-[#B8975E] text-white shadow-sm"
              : "bg-white text-[#8E6D38] hover:bg-[#F7F1E6] border border-[#B8975E]/30"
          }`}
        >
          <span>In Discussion</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#B8975E]/15 text-[#8E6D38]">
            {inProgressCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("resolved")}
          className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "resolved"
              ? "bg-[#69765D] text-white shadow-sm"
              : "bg-white text-[#525D48] hover:bg-[#F7F1E6] border border-[#69765D]/30"
          }`}
        >
          <span>Resolved</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#69765D]/15 text-[#525D48]">
            {resolvedCount}
          </span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Thread List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredThreads.length === 0 ? (
            <div className="bg-white/70 border border-[#B8975E]/30 rounded-2xl p-8 text-center text-xs text-[#292322]/60">
              No conversations found in this category.
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = thread.id === selectedThreadId;
              const lastMsg = thread.messages[thread.messages.length - 1];

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#B8975E] shadow-md ring-1 ring-[#B8975E]"
                      : "bg-white/80 border-[#B8975E]/25 hover:bg-white hover:border-[#B8975E]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-serif text-base font-medium text-[#292322]">
                      {thread.profile?.full_name || "Guest"}
                    </span>

                    {thread.status === "new" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-100 text-blue-800">
                        New
                      </span>
                    ) : thread.status === "in_progress" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[#B8975E]/15 text-[#8E6D38]">
                        In Discussion
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[#69765D]/15 text-[#525D48]">
                        Resolved
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-sans text-[#292322]/50 truncate mb-2">
                    {thread.profile?.email || "No email available"}
                    {thread.profile?.mobile_number ? ` • ${thread.profile.mobile_number}` : ""}
                  </p>

                  <p className="text-xs font-sans text-[#292322]/70 line-clamp-2 italic">
                    {lastMsg ? `"${lastMsg.message_body}"` : "No messages exchanged yet."}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#292322]/40 pt-2 mt-2 border-t border-[#B8975E]/10">
                    <span>{thread.messages.length} message{thread.messages.length === 1 ? "" : "s"}</span>
                    <span>
                      {new Date(thread.updated_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Thread Detail */}
        <div className="lg:col-span-7">
          {activeThread ? (
            <div className="bg-white/95 border border-[#B8975E]/30 rounded-2xl p-6 backdrop-blur-md space-y-4 shadow-sm">
              {/* Thread Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#B8975E]/20 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#292322]">
                    {activeThread.profile?.full_name || "Guest"}
                  </h3>
                  <p className="text-xs font-sans text-[#292322]/60">
                    {activeThread.profile?.email}{" "}
                    {activeThread.profile?.mobile_number ? `• ${activeThread.profile.mobile_number}` : ""}
                  </p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className="text-[11px] font-sans text-[#292322]/50 mr-1">Status:</span>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("new")}
                    disabled={isPending || activeThread.status === "new"}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                      activeThread.status === "new"
                        ? "bg-blue-800 text-white"
                        : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                    }`}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("in_progress")}
                    disabled={isPending || activeThread.status === "in_progress"}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                      activeThread.status === "in_progress"
                        ? "bg-[#B8975E] text-white"
                        : "bg-[#B8975E]/15 text-[#8E6D38] hover:bg-[#B8975E]/25"
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("resolved")}
                    disabled={isPending || activeThread.status === "resolved"}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                      activeThread.status === "resolved"
                        ? "bg-[#69765D] text-white"
                        : "bg-[#69765D]/15 text-[#525D48] hover:bg-[#69765D]/25"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="min-h-[300px] max-h-[460px] overflow-y-auto space-y-4 pr-1">
                {activeThread.messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#292322]/50">
                    No messages in this inquiry thread yet.
                  </div>
                ) : (
                  activeThread.messages.map((msg) => {
                    const isAdmin = msg.is_from_admin;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isAdmin ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] font-sans font-medium text-[#292322]/60">
                            {isAdmin
                              ? "Mithun & Sakhi • Hospitality Desk"
                              : activeThread.profile?.full_name || "Guest"}
                          </span>
                          <span className="text-[10px] text-[#292322]/40 font-sans">
                            {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                            isAdmin
                              ? "bg-gradient-to-r from-[#B8975E] to-[#9B7D48] text-white shadow-sm rounded-tr-sm"
                              : "bg-[#F7F1E6]/90 border border-[#B8975E]/30 text-[#292322] rounded-tl-sm"
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

              {/* Admin Reply Composer */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-[#B8975E]/15 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Type an official host response to the guest..."
                  disabled={isPending}
                  className="w-full px-4 py-3 rounded-xl border border-[#B8975E]/30 focus:border-[#B8975E] focus:outline-none focus:ring-1 focus:ring-[#B8975E] font-sans text-xs text-[#292322] bg-[#FFFCF6]/60 placeholder-[#292322]/30 transition-colors resize-none"
                />

                <div className="flex items-center justify-between text-[10px] text-[#292322]/50 font-sans">
                  <span>{replyText.length} / 2000 characters</span>

                  <button
                    type="submit"
                    disabled={isPending || replyText.trim().length < 1}
                    className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#B8975E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#9B7D48] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {isPending ? "Sending..." : "Send Response"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white/60 border border-[#B8975E]/20 rounded-2xl p-12 text-center text-xs text-[#292322]/60">
              Select an inquiry thread on the left to view the message history and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
