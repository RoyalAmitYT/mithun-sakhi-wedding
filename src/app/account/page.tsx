import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditorForm } from "@/components/account/profile-editor-form";
import { FamilyMembersManager } from "@/components/account/family-members-manager";
import { CeremonyRsvpCard } from "@/components/rsvp/ceremony-rsvp-card";
import { GuestWishesManager } from "@/components/wishes/guest-wishes-manager";
import { GuestConversationThread } from "@/components/conversations/guest-conversation-thread";
import { PageTransition } from "@/components/motion";
import { signOutAction } from "@/actions/auth";
import { isWeddingCutoffPassed, getCurrentTimeMs } from "@/lib/lifecycle";
import type { Database } from "@/types/database.types";
import type { FamilyMemberRecord } from "@/actions/family-members";

export const instant = false;

export const metadata: Metadata = {
  title: "Guest Account · Mithun & Sakhi",
  description:
    "Manage household members, confirm ceremony RSVPs, bestow wedding blessings, and connect with the hospitality desk.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const { user, profile: initialProfile } = await requireAuth("/account");
  const supabase = await createClient();

  let profile = initialProfile;

  // 1. Self-healing household initialization: ensure user always has a private household
  if (!profile.family_group_id) {
    const { data: newHouseholdId } = await supabase.rpc(
      "initialize_user_household",
      {
        p_user_id: user.id,
        p_full_name: profile.full_name || "Guest",
      }
    );

    if (newHouseholdId) {
      const { data: refreshedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (refreshedProfile) {
        profile = refreshedProfile;
      }
    }
  }

  // 2. Fetch assigned family group details
  let familyGroupName: string | null = null;
  if (profile.family_group_id) {
    const { data: familyGroup } = await supabase
      .from("family_groups")
      .select("name")
      .eq("id", profile.family_group_id)
      .maybeSingle();

    if (familyGroup) {
      familyGroupName = familyGroup.name;
    }
  }

  // 3. Fetch household family members
  let householdMembers: FamilyMemberRecord[] = [];
  if (profile.family_group_id) {
    const { data: members } = await supabase
      .from("family_members")
      .select("*")
      .eq("family_group_id", profile.family_group_id)
      .order("created_at", { ascending: true });

    if (members && members.length > 0) {
      householdMembers = members as unknown as FamilyMemberRecord[];
    } else {
      // Auto-insert primary user if member list was somehow empty
      const { data: insertedMember } = await supabase
        .from("family_members")
        .insert({
          family_group_id: profile.family_group_id,
          name: profile.full_name || "Guest",
        })
        .select()
        .single();
      if (insertedMember) {
        householdMembers = [insertedMember as unknown as FamilyMemberRecord];
      }
    }
  }

  // 4. Fetch published ceremonies
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  // 5. Fetch family RSVPs
  let familyRsvps: Array<{
    id: string;
    event_id: string;
    status: "attending" | "not_attending" | "not_sure";
    arrival_details: string | null;
    special_dietary_requests: string | null;
    submitted_at: string;
    attendees: Array<{
      id: string;
      full_name: string;
      family_member_id: string | null;
    }>;
  }> = [];

  if (profile.family_group_id) {
    const { data: rsvpsData } = await supabase
      .from("rsvps")
      .select(`
        id,
        event_id,
        status,
        arrival_details,
        special_dietary_requests,
        submitted_at,
        attendees (
          id,
          full_name,
          family_member_id
        )
      `)
      .eq("family_group_id", profile.family_group_id);

    if (rsvpsData) {
      familyRsvps = rsvpsData as unknown as typeof familyRsvps;
    }
  }

  // 6. Fetch administrator permissions
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("is_super_admin, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = Boolean(adminRecord?.is_active);
  const isSuperAdmin = Boolean(adminRecord?.is_super_admin);

  const { data: adminPermissions } = isAdmin
    ? await supabase
        .from("admin_permissions")
        .select("permission_group")
        .eq("admin_id", user.id)
    : { data: [] };

  const hasRsvpPerm =
    isSuperAdmin || adminPermissions?.some((p) => p.permission_group === "guest_rsvp");
  const hasWishesPerm =
    isSuperAdmin || adminPermissions?.some((p) => p.permission_group === "wishes");
  const hasQuestionsPerm =
    isSuperAdmin || adminPermissions?.some((p) => p.permission_group === "questions");
  const hasInvitationPerm =
    isSuperAdmin || adminPermissions?.some((p) => p.permission_group === "invitation_studio");

  // 7. Fetch user's submitted wishes
  const { data: userWishes } = await supabase
    .from("wishes")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const isCutoff = isWeddingCutoffPassed();
  const authorFirstName = profile.full_name?.trim().split(/\s+/)[0] || "Guest";

  // 8. Fetch or initialize private conversation thread
  let { data: userConversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!userConversation && !isCutoff) {
    const { data: createdConv } = await supabase
      .from("conversations")
      .insert({ profile_id: user.id, status: "new" })
      .select("*")
      .maybeSingle();
    userConversation = createdConv;
  }

  let conversationMessages: Array<Database["public"]["Tables"]["conversation_messages"]["Row"]> = [];
  if (userConversation) {
    const { data: msgs } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", userConversation.id)
      .order("created_at", { ascending: true });
    conversationMessages = msgs || [];
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFFCF6] pt-32 pb-32 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="max-w-3xl mx-auto space-y-12">
          {/* Header Card */}
          <div className="bg-white/90 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div>
              <span className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-[#B8975E] block mb-1.5">
                Wedding Guest Portal
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#292322]">
                {profile.full_name}
              </h1>
              <p className="font-sans text-xs text-[#292322]/60 mt-1">
                Account: {profile.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isAdmin && (
                <>
                  {hasRsvpPerm && (
                    <Link
                      href="/admin/rsvps"
                      className="px-3.5 py-1.5 rounded-full border border-[#B8975E] bg-[#B8975E]/15 text-[#8E6D38] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-[#B8975E]/25 transition-colors"
                    >
                      RSVP Roster
                    </Link>
                  )}
                  {hasWishesPerm && (
                    <Link
                      href="/admin/wishes"
                      className="px-3.5 py-1.5 rounded-full border border-[#B8975E]/40 bg-white text-[#8E6D38] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-[#B8975E]/10 transition-colors"
                    >
                      Wishes Desk
                    </Link>
                  )}
                  {hasQuestionsPerm && (
                    <Link
                      href="/admin/conversations"
                      className="px-3.5 py-1.5 rounded-full border border-[#292322]/20 bg-white text-[#292322] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                    >
                      Inquiries
                    </Link>
                  )}
                  {hasInvitationPerm && (
                    <Link
                      href="/admin/invitation"
                      className="px-3.5 py-1.5 rounded-full border border-[#B8975E]/40 bg-white text-[#8E6D38] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-[#B8975E]/10 transition-colors"
                    >
                      Invitation Studio
                    </Link>
                  )}
                </>
              )}

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-full border border-[#A52232]/30 text-[#A52232] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-[#A52232]/10 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* 1. MY FAMILY — Self-Service Household Manager */}
          <FamilyMembersManager
            initialMembers={householdMembers}
            familyGroupName={familyGroupName}
          />

          {/* 2. CEREMONY RSVPS — Four Independent Rituals */}
          <div className="space-y-6">
            <div className="border-b border-[#B8975E]/30 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B8975E] block mb-1">
                  Four Sacred Ceremonies
                </span>
                <h2 className="font-serif text-3xl font-light text-[#292322]">
                  Ceremony RSVPs
                </h2>
                <p className="font-sans text-xs text-[#292322]/60 mt-1">
                  Confirm attendance and select household attendees for each ritual before the respective cutoff deadline.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {events?.map((evt) => {
                const existingRsvp = familyRsvps.find((r) => r.event_id === evt.id);
                const isDeadlinePassed =
                  isCutoff || getCurrentTimeMs() >= new Date(evt.rsvp_deadline_utc).getTime();

                return (
                  <CeremonyRsvpCard
                    key={`${evt.id}-${existingRsvp?.id || "draft"}-${existingRsvp?.submitted_at || "init"}`}
                    event={{
                      id: evt.id as "haldi" | "mehndi" | "wedding" | "reception",
                      title: evt.title,
                      traditionalTitle: evt.traditional_title,
                      tagline: evt.tagline,
                      ceremonyDate: evt.ceremony_date,
                      startTimeIst: evt.start_time_ist,
                      venueName: evt.venue_name,
                      venueAddress: evt.venue_address,
                      googleMapsUrl: evt.google_maps_url,
                      rsvpDeadlineUtc: evt.rsvp_deadline_utc,
                    }}
                    familyGroupId={profile.family_group_id!}
                    familyMembers={householdMembers.map((m) => ({
                      id: m.id,
                      name: m.name,
                    }))}
                    isDeadlinePassed={isDeadlinePassed}
                    existingRsvp={
                      existingRsvp
                        ? {
                            id: existingRsvp.id,
                            status: existingRsvp.status,
                            arrivalDetails: existingRsvp.arrival_details,
                            specialDietaryRequests: existingRsvp.special_dietary_requests,
                            submittedAt: existingRsvp.submitted_at,
                            attendees: existingRsvp.attendees,
                          }
                        : null
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* 3. GUEST WISHES & BLESSINGS */}
          <GuestWishesManager
            initialWishes={userWishes || []}
            isCutoffPassed={isCutoff}
            authorFirstName={authorFirstName}
          />

          {/* 4. HOSPITALITY DESK CONVERSATION */}
          <GuestConversationThread
            conversation={userConversation}
            initialMessages={conversationMessages}
            guestName={profile.full_name}
            isCutoffPassed={isCutoff}
          />

          {/* 5. PROFILE EDITOR */}
          <ProfileEditorForm profile={profile} />
        </div>
        </PageTransition>
      </main>

      <EditorialFooter />
    </>
  );
}
