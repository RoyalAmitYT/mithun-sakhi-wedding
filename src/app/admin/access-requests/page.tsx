import { redirect } from "next/navigation";

/**
 * Access Requests workflow has been removed from the final system architecture.
 * Public guest registration and invitation-based access requests are no longer used.
 * This page safely redirects to the admin overview.
 */
export default function AdminAccessRequestsPage() {
  redirect("/admin");
}
