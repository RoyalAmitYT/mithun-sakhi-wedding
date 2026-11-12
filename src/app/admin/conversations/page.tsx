import { redirect } from "next/navigation";

/**
 * Conversations / Inquiries Desk workflow has been removed from the final system architecture.
 * Public guest inquiry management is no longer part of the product.
 * This page safely redirects to the admin overview.
 */
export default function AdminConversationsPage() {
  redirect("/admin");
}
