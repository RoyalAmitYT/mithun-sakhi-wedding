import { Ceremony, WEDDING_DATA } from "@/data/wedding-data";

/**
 * Calendar Integration Utilities (Phase P-13)
 * RFC 5545 iCalendar specification & Google Calendar URL generation
 * Strict Rule: TC-CAL-02 — Zero Invented End Times (end times are unconfirmed; DTEND omitted or point-in-time)
 */

const CRLF = "\r\n";

/**
 * Formats ISO timestamp to UTC string format: YYYYMMDDTHHMMSSZ
 */
function formatUtcTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Formats ISO timestamp to local IST string format: YYYYMMDDTHHMMSS
 */
function formatLocalTimestamp(isoString: string): string {
  const date = new Date(isoString);
  // Convert UTC to Asia/Kolkata (UTC + 5 hours 30 minutes)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffsetMs);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    istDate.getUTCFullYear().toString() +
    pad(istDate.getUTCMonth() + 1) +
    pad(istDate.getUTCDate()) +
    "T" +
    pad(istDate.getUTCHours()) +
    pad(istDate.getUTCMinutes()) +
    pad(istDate.getUTCSeconds())
  );
}

/**
 * Escapes text for RFC 5545 iCalendar fields (commas, semicolons, backslashes, newlines)
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Generates an RFC 5545 VTIMEZONE component for Asia/Kolkata
 */
function getVTimezoneComponent(): string {
  return [
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "X-LIC-LOCATION:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
  ].join(CRLF);
}

/**
 * Generates an RFC 5545 VEVENT block for a single ceremony.
 * Notice: Zero invented end times. DTEND is strictly omitted per RFC 5545 Section 3.6.1.
 */
function buildVEvent(ceremony: Ceremony): string {
  const dtStamp = formatUtcTimestamp(new Date().toISOString());
  const dtStart = formatLocalTimestamp(ceremony.isoTimestamp);
  const summary = escapeIcsText(`${ceremony.name} — Mithun & Sakhi Wedding`);
  const description = escapeIcsText(
    `${ceremony.tagline}\\n\\n${ceremony.description}\\n\\nVenue: ${ceremony.venueName}\\nAddress: ${ceremony.address}\\nTime: ${ceremony.timeString}\\n\\nNotice: Ceremony end time is unconfirmed. Check website for updates.`
  );
  const location = escapeIcsText(`${ceremony.venueName}, ${ceremony.address}`);
  const uid = `${ceremony.id}-202611@mithun-sakhi-wedding.vercel.app`;
  const websiteUrl = "https://mithun-sakhi-wedding.vercel.app/#events";

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
    // Strictly NO DTEND per TC-CAL-02 (Zero invented end times)
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `URL:${websiteUrl}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  ];

  return lines.join(CRLF);
}

/**
 * Generates an RFC 5545 compliant .ics string for a single ceremony
 */
export function generateCeremonyIcs(ceremony: Ceremony): string {
  const parts = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mithun & Sakhi Wedding//Digital Invitation Studio//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    getVTimezoneComponent(),
    buildVEvent(ceremony),
    "END:VCALENDAR",
  ];

  return parts.join(CRLF);
}

/**
 * Generates an RFC 5545 compliant .ics string containing all 4 wedding ceremonies
 */
export function generateAllCeremoniesIcs(ceremonies: Ceremony[] = WEDDING_DATA.ceremonies): string {
  const events = ceremonies.map((c) => buildVEvent(c));
  const parts = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mithun & Sakhi Wedding//Digital Invitation Studio//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    getVTimezoneComponent(),
    ...events,
    "END:VCALENDAR",
  ];

  return parts.join(CRLF);
}

/**
 * Generates a direct Google Calendar web URL for a ceremony.
 * Zero invented end time: dates range is start/start point-in-time in UTC.
 */
export function generateGoogleCalendarUrl(ceremony: Ceremony): string {
  const startUtc = formatUtcTimestamp(ceremony.isoTimestamp);
  const endUtc = startUtc; // Point-in-time / zero duration — no fabricated end time
  const title = encodeURIComponent(`${ceremony.name} — Mithun & Sakhi Wedding`);
  const details = encodeURIComponent(
    `${ceremony.tagline}\n\n${ceremony.description}\n\nVenue: ${ceremony.venueName}\nAddress: ${ceremony.address}\nTime: ${ceremony.timeString}\n\nWebsite: https://mithun-sakhi-wedding.vercel.app`
  );
  const location = encodeURIComponent(`${ceremony.venueName}, ${ceremony.address}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startUtc}/${endUtc}&ctz=Asia/Kolkata`;
}

/**
 * Browser-side helper to trigger a direct file download for generated .ics content
 */
export function triggerCalendarDownload(filename: string, icsContent: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".ics") ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
