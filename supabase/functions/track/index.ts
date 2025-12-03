import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    // Extract tracking ID from query parameters
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("id");

    if (!trackingId) {
      return new Response(JSON.stringify({ error: "Missing tracking ID" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    console.log(`[TRACK] Processing tracking ID: ${trackingId}`);

    // Update the email status in database
    const { data: existingEmail, error: fetchError } = await supabase
      .from("tracked_emails")
      .select("id, status")
      .eq("tracking_id", trackingId)
      .single();

    if (fetchError) {
      console.error(`[TRACK] Error fetching email: ${fetchError.message}`);
      // Return 1x1 pixel regardless of error
      return getPixelResponse();
    }

    if (!existingEmail) {
      console.warn(`[TRACK] Email not found for tracking ID: ${trackingId}`);
      return getPixelResponse();
    }

    // Only update if status is 'sent'
    if (existingEmail.status === "sent") {
      const { error: updateError } = await supabase
        .from("tracked_emails")
        .update({
          status: "opened",
          opened_at: new Date().toISOString(),
        })
        .eq("id", existingEmail.id);

      if (updateError) {
        console.error(`[TRACK] Error updating email: ${updateError.message}`);
      } else {
        console.log(
          `[TRACK] Successfully marked email as opened: ${existingEmail.id}`
        );
      }
    } else {
      console.log(
        `[TRACK] Email already opened or in different status: ${existingEmail.status}`
      );
    }

    // Always return a 1x1 transparent pixel
    return getPixelResponse();
  } catch (error) {
    console.error(`[TRACK] Unexpected error: ${error.message}`);
    // Still return pixel on error
    return getPixelResponse();
  }
});

// Helper function to return 1x1 transparent pixel
function getPixelResponse(): Response {
  const pixel = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
    0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x0a,
    0x00, 0x01, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
    0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
  ]);

  return new Response(pixel, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
