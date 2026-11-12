"use client";

import React, { useState, useTransition } from "react";
import {
  addFamilyMemberAction,
  updateFamilyMemberAction,
  deleteFamilyMemberAction,
  type FamilyMemberRecord,
} from "@/actions/family-members";

interface FamilyMembersManagerProps {
  initialMembers: FamilyMemberRecord[];
  familyGroupName: string | null;
}

export function FamilyMembersManager({
  initialMembers,
  familyGroupName,
}: FamilyMembersManagerProps) {
  const [members, setMembers] = useState<FamilyMemberRecord[]>(initialMembers);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setFeedback({ type: "error", message: "Please enter a family member's name." });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await addFamilyMemberAction(trimmed);
      if (res.success) {
        if (res.member) {
          setMembers((prev) => [...prev, res.member!]);
        }
        setNewName("");
        setFeedback({
          type: "success",
          message: res.message || `${trimmed} has been added to your household.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to add family member.",
        });
      }
    });
  };

  const handleStartEdit = (member: FamilyMemberRecord) => {
    setEditingId(member.id);
    setEditingName(member.name);
    setFeedback(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = (memberId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setFeedback({ type: "error", message: "Family member name cannot be blank." });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await updateFamilyMemberAction(memberId, trimmed);
      if (res.success) {
        if (res.member) {
          setMembers((prev) =>
            prev.map((m) => (m.id === memberId ? res.member! : m))
          );
        }
        setEditingId(null);
        setEditingName("");
        setFeedback({ type: "success", message: res.message || "Member name updated." });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update member name.",
        });
      }
    });
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (members.length <= 1) {
      setFeedback({
        type: "error",
        message: "Your household must have at least one family member.",
      });
      return;
    }

    if (!confirm(`Are you sure you want to remove ${memberName} from your household?`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await deleteFamilyMemberAction(memberId);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setFeedback({
          type: "success",
          message: `${memberName} was removed from your household.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to remove family member.",
        });
      }
    });
  };

  return (
    <div className="bg-white/90 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B8975E]/20 pb-5">
        <div>
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
            Household Attendees
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#292322]">
            My Family
          </h2>
          <p className="font-sans text-xs text-[#292322]/65 mt-1 max-w-xl">
            {familyGroupName ? (
              <>Household: <span className="font-semibold text-[#A52232]">{familyGroupName}</span>. </>
            ) : null}
            Add the names of everyone in your household attending the wedding. You can select individual members for each ceremony below.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B8975E]/10 border border-[#B8975E]/30 text-xs font-sans font-medium text-[#8E6D38] self-start sm:self-auto">
          <svg className="w-4 h-4 text-[#B8975E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{members.length} {members.length === 1 ? "Member" : "Members"} Registered</span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-sans flex items-start gap-2.5 transition-all ${
            feedback.type === "success"
              ? "bg-[#69765D]/10 text-[#525D48] border border-[#69765D]/30"
              : "bg-[#A52232]/10 text-[#A52232] border border-[#A52232]/30"
          }`}
        >
          {feedback.type === "success" ? (
            <svg className="w-4 h-4 shrink-0 text-[#69765D] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0 text-[#A52232] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Member List */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block">
          Household Members ({members.length})
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((member, idx) => {
            const isEditing = editingId === member.id;
            const isFirst = idx === 0;

            if (isEditing) {
              return (
                <div
                  key={member.id}
                  className="p-3.5 rounded-xl border border-[#B8975E] bg-[#FFFCF6] space-y-2.5 shadow-xs"
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Enter member full name"
                    disabled={isPending}
                    className="w-full px-3 py-1.5 text-xs font-sans rounded-lg border border-[#B8975E]/40 bg-white focus:outline-hidden focus:border-[#B8975E] text-[#292322]"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="px-2.5 py-1 text-[11px] font-sans rounded-md border border-[#292322]/20 text-[#292322]/70 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(member.id)}
                      disabled={isPending}
                      className="px-3 py-1 text-[11px] font-sans font-medium rounded-md bg-[#8E6D38] text-white hover:bg-[#785c2e] transition-colors"
                    >
                      {isPending ? "Saving..." : "Save Name"}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={member.id}
                className="p-3.5 rounded-xl border border-[#B8975E]/25 bg-[#FFFCF6]/80 hover:bg-[#FFFCF6] hover:border-[#B8975E]/40 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#B8975E]/15 border border-[#B8975E]/30 flex items-center justify-center text-[#8E6D38] text-xs font-serif shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-sans text-xs font-medium text-[#292322] truncate">
                        {member.name}
                      </p>
                      {isFirst && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(member)}
                    disabled={isPending}
                    title="Edit Name"
                    className="p-1.5 rounded-md text-[#292322]/50 hover:text-[#8E6D38] hover:bg-white transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      disabled={isPending}
                      title="Remove Member"
                      className="p-1.5 rounded-md text-[#292322]/40 hover:text-[#A52232] hover:bg-[#A52232]/10 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Member Form */}
      <form
        onSubmit={handleAddMember}
        className="pt-4 border-t border-[#B8975E]/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add spouse, elder, or family member full name"
            disabled={isPending}
            className="w-full px-3.5 py-2 text-xs font-sans rounded-xl border border-[#B8975E]/30 bg-white placeholder:text-[#292322]/40 focus:outline-hidden focus:border-[#B8975E] text-[#292322]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !newName.trim()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A52232] to-[#801422] text-white text-xs font-sans font-medium uppercase tracking-wider hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
        >
          {isPending ? (
            <span>Adding...</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Member</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
