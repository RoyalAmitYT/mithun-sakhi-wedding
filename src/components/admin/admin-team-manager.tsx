"use client";

import React, { useState, useTransition } from "react";
import { manageAdminUserAction } from "@/actions/admin-management";

export type AdminTeamMember = {
  id: string;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
  full_name: string;
  email: string;
  mobile_number: string | null;
  permissions: string[];
};

interface AdminTeamManagerProps {
  initialTeam: AdminTeamMember[];
}

const ALL_PERMISSION_GROUPS = [
  { id: "guest_rsvp", label: "Guest Access & RSVPs" },
  { id: "wishes", label: "Wishes Moderation" },
  { id: "questions", label: "Hospitality Inquiries" },
  { id: "photos", label: "Photo Gallery" },
  { id: "events_website", label: "Events & Website" },
  { id: "invitation_studio", label: "Digital Invitations" },
];

export function AdminTeamManager({ initialTeam }: AdminTeamManagerProps) {
  const [team, setTeam] = useState<AdminTeamMember[]>(initialTeam);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStartEdit = (member: AdminTeamMember) => {
    setEditingAdminId(member.id);
    setEditIsActive(member.is_active);
    setEditPermissions([...member.permissions]);
    setStatusMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingAdminId(null);
  };

  const togglePermission = (permId: string) => {
    setEditPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSave = (memberId: string) => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await manageAdminUserAction(memberId, editIsActive, editPermissions);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Administrator configuration successfully updated.",
        });
        setTeam((prev) =>
          prev.map((m) =>
            m.id === memberId
              ? { ...m, is_active: editIsActive, permissions: editPermissions }
              : m
          )
        );
        setEditingAdminId(null);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update administrator.",
        });
      }
    });
  };

  return (
    <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div className="border-b border-[#B8975E]/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#A52232] block mb-0.5">
            Super Administrator Authority
          </span>
          <h2 className="font-serif text-2xl font-light text-[#292322]">
            Staff Administrators &amp; Permission Matrix
          </h2>
          <p className="font-sans text-xs text-[#292322]/60 mt-0.5">
            Manage administrative access and assign granular permission boundaries for the wedding coordination team.
          </p>
        </div>

        <span className="text-xs font-sans text-[#292322]/50 self-start sm:self-center">
          {team.length} Team Member{team.length === 1 ? "" : "s"}
        </span>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className={`p-3.5 rounded-xl text-xs font-sans leading-relaxed border ${
            statusMessage.type === "success"
              ? "bg-[#69765D]/10 border-[#69765D]/30 text-[#434D3A]"
              : "bg-[#A52232]/10 border-[#A52232]/30 text-[#A52232]"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-4">
        {team.map((member) => {
          const isEditing = editingAdminId === member.id;

          return (
            <div
              key={member.id}
              className={`p-5 rounded-2xl border transition-all ${
                member.is_super_admin
                  ? "bg-[#FFFCF6] border-[#A52232]/30 shadow-xs"
                  : "bg-white border-[#B8975E]/25"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-medium text-[#292322]">
                      {member.full_name}
                    </span>
                    {member.is_super_admin ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#A52232]/15 text-[#A52232] border border-[#A52232]/30">
                        Super Administrator
                      </span>
                    ) : member.is_active ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-[#69765D]/15 text-[#525D48] border border-[#69765D]/30">
                        Active Staff
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-300">
                        Deactivated
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-sans text-[#292322]/50 mt-0.5">
                    {member.email} {member.mobile_number ? `• ${member.mobile_number}` : ""}
                  </p>
                </div>

                {!member.is_super_admin && !isEditing && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(member)}
                    disabled={isPending}
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-full border border-[#B8975E]/40 text-xs font-sans text-[#8E6D38] hover:bg-[#B8975E]/10 transition-colors cursor-pointer"
                  >
                    Edit Permissions
                  </button>
                )}
              </div>

              {/* Permissions Tags or Editor */}
              {isEditing ? (
                <div className="mt-4 pt-4 border-t border-[#B8975E]/15 space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-sans font-medium text-[#292322] flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsActive}
                        onChange={(e) => setEditIsActive(e.target.checked)}
                        className="rounded border-[#B8975E]/40 text-[#A52232] focus:ring-[#A52232]"
                      />
                      <span>Active Administrator Account</span>
                    </label>
                  </div>

                  <div>
                    <span className="text-[11px] font-sans font-semibold text-[#292322]/60 uppercase tracking-wider block mb-2">
                      Assigned Permission Groups
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {ALL_PERMISSION_GROUPS.map((grp) => {
                        const checked = editPermissions.includes(grp.id);
                        return (
                          <label
                            key={grp.id}
                            className={`p-2.5 rounded-xl border text-xs font-sans flex items-center gap-2 cursor-pointer transition-colors ${
                              checked
                                ? "bg-[#B8975E]/10 border-[#B8975E] text-[#292322]"
                                : "bg-white border-[#B8975E]/20 text-[#292322]/70 hover:bg-[#F7F1E6]/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(grp.id)}
                              className="rounded border-[#B8975E]/40 text-[#B8975E] focus:ring-[#B8975E]"
                            />
                            <span>{grp.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-sans text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(member.id)}
                      disabled={isPending}
                      className="px-5 py-1.5 rounded-full bg-[#A52232] text-xs font-sans font-semibold text-white uppercase tracking-wider hover:bg-[#8D1B29] transition-colors cursor-pointer shadow-sm"
                    >
                      {isPending ? "Saving..." : "Save Configuration"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {member.is_super_admin ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans bg-[#A52232]/10 text-[#A52232]">
                      Full Super Admin Access (All System Privileges)
                    </span>
                  ) : member.permissions.length === 0 ? (
                    <span className="text-[11px] font-sans text-[#292322]/40 italic">
                      No permissions currently assigned.
                    </span>
                  ) : (
                    member.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium bg-[#B8975E]/15 text-[#8E6D38] border border-[#B8975E]/30"
                      >
                        {p.replace("_", " ")}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
