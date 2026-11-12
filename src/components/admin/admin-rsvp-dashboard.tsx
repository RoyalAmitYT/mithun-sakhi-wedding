"use client";

import React, { useState } from "react";

export interface AdminPublicRsvpItem {
  id: string;
  guest_name: string;
  mobile_number: string | null;
  address: string | null;
  relationship: string | null;
  guest_count: number;
  attending_haldi: boolean;
  attending_mehndi: boolean;
  attending_wedding: boolean;
  attending_reception: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AdminRsvpDashboardProps {
  publicRsvps: AdminPublicRsvpItem[];
}

const CEREMONY_FILTERS = [
  { value: "all", label: "All Ceremonies" },
  { value: "haldi", label: "Haldi (19 Nov)" },
  { value: "mehndi", label: "Mehndi (20 Nov)" },
  { value: "wedding", label: "Sacred Wedding (21 Nov)" },
  { value: "reception", label: "Reception (22 Nov)" },
];

const ATTENDANCE_DOT: Record<string, string> = {
  haldi: "bg-amber-400",
  mehndi: "bg-green-500",
  wedding: "bg-[#A52232]",
  reception: "bg-[#8E6D38]",
};

function AttendancePip({
  attending,
  label,
  color,
}: {
  attending: boolean;
  label: string;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-sans font-medium ${
        attending ? "text-[#292322]" : "text-[#292322]/30 line-through"
      }`}
      title={label}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${attending ? color : "bg-[#292322]/15"}`}
      />
      {label.split(" ")[0]}
    </span>
  );
}

export function AdminRsvpDashboard({ publicRsvps }: AdminRsvpDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ceremonyFilter, setCeremonyFilter] = useState("all");

  // Filter RSVPs
  const filteredRsvps = publicRsvps.filter((rsvp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      rsvp.guest_name.toLowerCase().includes(q) ||
      (rsvp.mobile_number && rsvp.mobile_number.includes(q)) ||
      (rsvp.address && rsvp.address.toLowerCase().includes(q)) ||
      (rsvp.relationship && rsvp.relationship.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (ceremonyFilter === "haldi") return rsvp.attending_haldi;
    if (ceremonyFilter === "mehndi") return rsvp.attending_mehndi;
    if (ceremonyFilter === "wedding") return rsvp.attending_wedding;
    if (ceremonyFilter === "reception") return rsvp.attending_reception;

    return true;
  });

  // Live stats
  const totalSubmissions = publicRsvps.length;
  const totalGuests = publicRsvps.reduce((s, r) => s + (r.guest_count || 1), 0);
  const haldiGuests = publicRsvps.filter((r) => r.attending_haldi).reduce((s, r) => s + r.guest_count, 0);
  const mehndiGuests = publicRsvps.filter((r) => r.attending_mehndi).reduce((s, r) => s + r.guest_count, 0);
  const weddingGuests = publicRsvps.filter((r) => r.attending_wedding).reduce((s, r) => s + r.guest_count, 0);
  const receptionGuests = publicRsvps.filter((r) => r.attending_reception).reduce((s, r) => s + r.guest_count, 0);

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Guest Name",
      "Mobile Number",
      "Address",
      "Relationship",
      "Number of Guests",
      "Haldi (19 Nov)",
      "Mehndi (20 Nov)",
      "The Sacred Wedding (21 Nov)",
      "Reception (22 Nov)",
      "Submission Date",
    ];

    const rows = filteredRsvps.map((r) => [
      `"${(r.guest_name || "").replace(/"/g, '""')}"`,
      `"${(r.mobile_number || "—").replace(/"/g, '""')}"`,
      `"${(r.address || "—").replace(/"/g, '""')}"`,
      `"${(r.relationship || "—").replace(/"/g, '""')}"`,
      r.guest_count,
      r.attending_haldi ? "Yes" : "No",
      r.attending_mehndi ? "Yes" : "No",
      r.attending_wedding ? "Yes" : "No",
      r.attending_reception ? "Yes" : "No",
      `"${new Date(r.created_at).toLocaleString("en-IN")}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mithun-sakhi-rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#B8975E]/30 shadow-xs">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block mb-1">
            Total RSVPs
          </span>
          <span className="font-serif text-3xl text-[#292322]">{totalSubmissions}</span>
          <span className="text-[11px] text-[#292322]/60 block mt-1">
            {totalGuests} total guests confirmed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#B8975E]/30 shadow-xs">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block mb-1">
            Sacred Wedding
          </span>
          <span className="font-serif text-3xl text-[#A52232]">{weddingGuests}</span>
          <span className="text-[11px] text-[#292322]/60 block mt-1">Guests on 21 Nov</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#B8975E]/30 shadow-xs">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block mb-1">
            Reception
          </span>
          <span className="font-serif text-3xl text-[#8E6D38]">{receptionGuests}</span>
          <span className="text-[11px] text-[#292322]/60 block mt-1">Guests on 22 Nov</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#B8975E]/30 shadow-xs">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#292322]/50 block mb-1">
            Haldi / Mehndi
          </span>
          <span className="font-serif text-3xl text-[#292322]">
            {haldiGuests} / {mehndiGuests}
          </span>
          <span className="text-[11px] text-[#292322]/60 block mt-1">19 Nov / 20 Nov</span>
        </div>
      </div>

      {/* Search + Filter + Export Bar */}
      <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-5">
          <div>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-0.5">
              Guest RSVP Registry
            </span>
            <h3 className="font-serif text-xl font-medium text-[#292322]">
              Public Submissions
            </h3>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredRsvps.length === 0}
            className="shrink-0 px-4 py-2 rounded-full border border-[#B8975E]/40 text-xs font-sans font-semibold text-[#8E6D38] hover:bg-[#F7F1E6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV ({filteredRsvps.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, address, or relationship…"
            className="flex-1 px-4 py-2 rounded-xl border border-[#B8975E]/30 text-sm font-sans text-[#292322] placeholder:text-[#292322]/40 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8975E]/30"
          />

          <select
            value={ceremonyFilter}
            onChange={(e) => setCeremonyFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[#B8975E]/30 text-sm font-sans text-[#292322] bg-white focus:outline-none focus:ring-2 focus:ring-[#B8975E]/30"
          >
            {CEREMONY_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* RSVP Table */}
        {publicRsvps.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#B8975E]/10 mx-auto flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <p className="font-serif text-lg text-[#292322]/70">
              No RSVP submissions received yet.
            </p>
            <p className="text-xs font-sans text-[#292322]/50">
              Public RSVP submissions will appear here once guests start confirming attendance.
            </p>
          </div>
        ) : filteredRsvps.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-sans text-[#292322]/60">
              No RSVPs match your search filters. Try adjusting them.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left text-sm font-sans min-w-[640px]">
              <thead>
                <tr className="border-b border-[#B8975E]/20 text-[10px] uppercase tracking-wider text-[#292322]/50">
                  <th className="pb-3 pr-4 font-semibold">Guest</th>
                  <th className="pb-3 pr-4 font-semibold">Contact & Location</th>
                  <th className="pb-3 pr-4 font-semibold text-center">Guests</th>
                  <th className="pb-3 pr-4 font-semibold">Ceremonies</th>
                  <th className="pb-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8975E]/10">
                {filteredRsvps.map((rsvp) => (
                  <tr
                    key={rsvp.id}
                    className="hover:bg-[#FFFCF6] transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium text-[#292322]">
                        {rsvp.guest_name}
                      </div>
                      {rsvp.relationship && (
                        <div className="text-[11px] text-[#292322]/50 mt-0.5">
                          {rsvp.relationship}
                        </div>
                      )}
                    </td>

                    <td className="py-3 pr-4">
                      {rsvp.mobile_number && (
                        <div className="text-[#292322]/80">{rsvp.mobile_number}</div>
                      )}
                      {rsvp.address && (
                        <div className="text-[11px] text-[#292322]/50 mt-0.5 max-w-[160px] leading-snug">
                          {rsvp.address}
                        </div>
                      )}
                      {!rsvp.mobile_number && !rsvp.address && (
                        <span className="text-[#292322]/30">—</span>
                      )}
                    </td>

                    <td className="py-3 pr-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#B8975E]/10 font-serif text-sm font-semibold text-[#8E6D38]">
                        {rsvp.guest_count}
                      </span>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <AttendancePip
                          attending={rsvp.attending_haldi}
                          label="Haldi"
                          color={ATTENDANCE_DOT.haldi}
                        />
                        <AttendancePip
                          attending={rsvp.attending_mehndi}
                          label="Mehndi"
                          color={ATTENDANCE_DOT.mehndi}
                        />
                        <AttendancePip
                          attending={rsvp.attending_wedding}
                          label="Wedding"
                          color={ATTENDANCE_DOT.wedding}
                        />
                        <AttendancePip
                          attending={rsvp.attending_reception}
                          label="Reception"
                          color={ATTENDANCE_DOT.reception}
                        />
                      </div>
                    </td>

                    <td className="py-3 text-[11px] text-[#292322]/50 whitespace-nowrap">
                      {new Date(rsvp.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <br />
                      {new Date(rsvp.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
