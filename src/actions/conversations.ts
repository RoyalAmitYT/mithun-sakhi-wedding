"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-helpers";
import { isWeddingCutoffPassed } from "@/data/wedding-data";
import type { Database } from "@/types/database.types";

export type ConversationRecord = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationMessageRecord = Database["public"]["Tables"]["conversation_messages"]["Row"];

export type ConversationActionResult =
  | { success: true; messageId?: string }
  | { success: false; error: string };

/**
 * Retrieves or initializes the single private 1-to-1 conversation thread for the current guest.
 */
export async function getOrCreateGuestConversationAction(): Promise<{
  conversation: ConversationRecord | null;
  messages: ConversationMessageRecord[];
  error?: string;
}> {
  try {
    if (isWeddingCutoffPassed()) {
      return {
        conversation: null,
        messages: [],
        error:
          "Private guest inquiries have concluded as wedding celebrations transition into Memories Mode.",
      };
    }

    const { user } = await requireAuth("/account");
    const supabase = await createClient();

    // Look for existing conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    // If none exists, create the unique conversation thread
    if (!conversation) {
      if (isWeddingCutoffPassed()) {
        return {
          conversation: null,
          messages: [],
          error:
            "Private guest inquiries have concluded as wedding celebrations transition into Memories Mode.",
        };
      }

      const { data: created, error: createError } = await supabase
        .from("conversations")
        .insert({
          profile_id: user.id,
          status: "new",
        })
        .select("*")
        .single();

      if (createError) {
        // Handle race condition where conversation was created concurrently
        const { data: fallback } = await supabase
          .from("conversations")
          .select("*")
          .eq("profile_id", user.id)
          .single();

        if (!fallback) {
          return { conversation: null, messages: [], error: createError.message };
        }
        conversation = fallback;
      } else {
        conversation = created;
      }
    }

    // Fetch messages chronologically
    const { data: messages, error: messagesError } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return { conversation, messages: [], error: messagesError.message };
    }

    return { conversation, messages: messages || [] };
  } catch (err) {
    return {
      conversation: null,
      messages: [],
      error: err instanceof Error ? err.message : "Failed to load conversation.",
    };
  }
}

/**
 * Sends a message from the authenticated guest to their private hospitality coordination desk thread.
 * Enforces character limits (1-2000 chars) and wedding cutoff boundary.
 */
export async function sendGuestMessageAction(
  conversationId: string,
  messageBody: string
): Promise<ConversationActionResult> {
  try {
    if (isWeddingCutoffPassed()) {
      return {
        success: false,
        error: "Private guest inquiries have concluded as wedding celebrations transition into Memories Mode.",
      };
    }

    const { user } = await requireAuth("/account");

    const trimmed = (messageBody || "").trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      return {
        success: false,
        error: "Message must be between 1 and 2000 characters.",
      };
    }

    const supabase = await createClient();

    // Verify ownership of the conversation thread
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("id, profile_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conv || conv.profile_id !== user.id) {
      return {
        success: false,
        error: "You are not authorized to post in this conversation.",
      };
    }

    const { data: msg, error: msgError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_body: trimmed,
        is_from_admin: false,
      })
      .select("id")
      .single();

    if (msgError || !msg) {
      return {
        success: false,
        error: msgError?.message || "Failed to deliver message.",
      };
    }

    revalidatePath("/account");
    revalidatePath("/admin/conversations");
    return { success: true, messageId: msg.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Sends a response from an administrator with the 'questions' permission to a guest thread.
 * Updates conversation status from 'new' to 'in_progress'.
 */
export async function sendAdminMessageAction(
  conversationId: string,
  messageBody: string
): Promise<ConversationActionResult> {
  try {
    const { user } = await requireAdmin("questions");

    const trimmed = (messageBody || "").trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      return {
        success: false,
        error: "Message must be between 1 and 2000 characters.",
      };
    }

    const supabase = await createClient();

    const { data: msg, error: msgError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_body: trimmed,
        is_from_admin: true,
      })
      .select("id")
      .single();

    if (msgError || !msg) {
      return {
        success: false,
        error: msgError?.message || "Failed to deliver administrator response.",
      };
    }

    revalidatePath("/account");
    revalidatePath("/admin/conversations");
    return { success: true, messageId: msg.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Updates the lifecycle status of a private conversation thread.
 * Restricted to administrators holding the 'questions' permission group (or Super Admin).
 */
export async function adminUpdateConversationStatusAction(
  conversationId: string,
  status: "new" | "in_progress" | "resolved"
): Promise<ConversationActionResult> {
  try {
    await requireAdmin("questions");
    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_update_conversation_status", {
      p_conversation_id: conversationId,
      p_status: status,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update conversation status.",
      };
    }

    revalidatePath("/admin/conversations");
    revalidatePath("/account");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
