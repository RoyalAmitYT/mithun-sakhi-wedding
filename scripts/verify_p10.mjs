// scripts/verify_p10.mjs
// Verification of P-10 HTTP endpoints against local Supabase stack

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

async function verify() {
  console.log("=== P-10 Verification against Local PostgREST / Supabase ===");
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Verify get_approved_wishes RPC is callable by anon
  console.log("Checking get_approved_wishes RPC via anon client...");
  const { data: approvedWishes, error: wishesError } = await anonClient.rpc("get_approved_wishes");
  if (wishesError) {
    console.error("FAIL: get_approved_wishes RPC error:", wishesError);
    process.exit(1);
  }
  console.log(`PASS: get_approved_wishes RPC returned ${approvedWishes.length} approved wishes.`);

  // 2. Verify approved_wishes view is readable by anon
  console.log("Checking approved_wishes view via anon client...");
  const { data: viewWishes, error: viewError } = await anonClient.from("approved_wishes").select("*");
  if (viewError) {
    console.error("FAIL: approved_wishes view error:", viewError);
    process.exit(1);
  }
  console.log(`PASS: approved_wishes view returned ${viewWishes.length} rows.`);

  // 3. Verify anon cannot read unapproved wishes or private conversation messages
  console.log("Verifying private conversations are inaccessible to anon...");
  const { data: convData } = await anonClient.from("conversations").select("*");
  if (convData && convData.length > 0) {
    console.error("FAIL: anon should not see conversations!");
    process.exit(1);
  }
  console.log("PASS: conversations are completely inaccessible to anon.");

  console.log("Verifying private messages are inaccessible to anon...");
  const { data: msgData } = await anonClient.from("conversation_messages").select("*");
  if (msgData && msgData.length > 0) {
    console.error("FAIL: anon should not see conversation_messages!");
    process.exit(1);
  }
  console.log("PASS: conversation_messages are completely inaccessible to anon.");

  // 4. Verify admin RPCs reject unauthenticated execution
  console.log("Verifying admin_moderate_wish rejects anon...");
  const { error: adminRpcError } = await anonClient.rpc("admin_moderate_wish", {
    p_wish_id: "00000000-0000-0000-0000-000000000000",
    p_decision: "approved",
  });
  if (!adminRpcError) {
    console.error("FAIL: admin_moderate_wish should have thrown an error for anon!");
    process.exit(1);
  }
  console.log("PASS: admin_moderate_wish rejected anon as expected.");

  console.log("=== All P-10 HTTP PostgREST API checks passed! ===");
}

verify().catch((err) => {
  console.error("Verification failed with exception:", err);
  process.exit(1);
});
