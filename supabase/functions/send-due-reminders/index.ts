import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const gmailUser = Deno.env.get("GMAIL_USER") ?? "";
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD") ?? "";

    if (!gmailUser || !gmailAppPassword) {
      throw new Error("GMAIL_USER atau GMAIL_APP_PASSWORD tidak ditetapkan di Supabase Secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ambil data isu yang belum selesai dan mempunyai alamat PIC email
    const { data: issues, error: fetchError } = await supabase
      .from("issues")
      .select("*")
      .neq("status", "Completed")
      .not("pic_email", "is", null);

    if (fetchError) throw fetchError;

    // Ambil tarikh hari ini mengikut zon masa Malaysia (MYT / UTC+8)
    const today = new Date();
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(today);

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailAppPassword,
        },
      },
    });

    const sentResults = [];

    for (const issue of issues || []) {
      if (!issue.estimated_closing || !issue.pic_email) continue;

      const closingDate = issue.estimated_closing.split("T")[0];
      const timeDiff = new Date(closingDate).getTime() - new Date(todayStr).getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));

      // Tentukan status dan tema peringatan
      let shouldSend = false;
      let tagLabel = "";
      let titleHeader = "";
      let headerColor = "#d97706"; // Amber (Default)
      let descriptionText = "";

      if (daysDiff === 3) {
        // 3 Hari Sebelum Due Date
        shouldSend = true;
        tagLabel = "3 DAYS BEFORE DUE";
        titleHeader = "⚠️ Due Date Reminder";
        headerColor = "#d97706";
        descriptionText = `The following issue assigned to you is approaching its target closing date in <strong>3 DAYS</strong>:`;
      } else if (daysDiff === -3) {
        // 3 Hari Selepas Due Date (Overdue)
        shouldSend = true;
        tagLabel = "OVERDUE (3 DAYS LATE)";
        titleHeader = "🚨 Overdue Issue Reminder";
        headerColor = "#dc2626"; // Red
        descriptionText = `The following issue assigned to you is now <strong>OVERDUE by 3 DAYS</strong>:`;
      } else if (daysDiff === -6) {
        // 6 Hari Selepas Due Date (Critical Overdue)
        shouldSend = true;
        tagLabel = "CRITICAL OVERDUE (6 DAYS LATE)";
        titleHeader = "🛑 Critical Overdue Notice";
        headerColor = "#7f1d1d"; // Dark Red
        descriptionText = `The following issue is strictly <strong>OVERDUE by 6 DAYS</strong> and requires immediate action:`;
      }

      if (shouldSend) {
        const subject = `[${tagLabel}] Issue: ${issue.what_issue || "Pending Issue"}`;

        const htmlContent = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">` +
          `<h2 style="color: ${headerColor}; margin-top: 0;">${titleHeader}</h2>` +
          `<p>${descriptionText}</p>` +
          `<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">` +
            `<tr><td style="padding: 8px; font-weight: bold; background-color: #f8fafc; border: 1px solid #e2e8f0; width: 35%;">Issue:</td><td style="padding: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">${issue.what_issue || "-"}</td></tr>` +
            `<tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e2e8f0;">Group:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${issue.group_name || "-"}</td></tr>` +
            `<tr><td style="padding: 8px; font-weight: bold; background-color: #f8fafc; border: 1px solid #e2e8f0;">Location:</td><td style="padding: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">${issue.location || "-"}</td></tr>` +
            `<tr><td style="padding: 8px; font-weight: bold; border: 1px solid #e2e8f0;">PIC:</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${issue.pic_name || "-"}</td></tr>` +
            `<tr><td style="padding: 8px; font-weight: bold; background-color: #fee2e2; color: #991b1b; border: 1px solid #e2e8f0;">Target Due Date:</td><td style="padding: 8px; background-color: #fee2e2; color: #991b1b; font-weight: bold; border: 1px solid #e2e8f0;">${closingDate}</td></tr>` +
          `</table>` +
          `<p>Please update the issue status to <strong>Completed</strong> in the ME Data Tracker system once the issue has been resolved.</p>` +
          `<hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />` +
          `<small style="color: #64748b;">Manufacturing Engineering - Data Tracker System</small>` +
        `</div>`;

        await client.send({
          from: `ME Issue Tracker <${gmailUser}>`,
          to: issue.pic_email,
          subject: subject,
          html: htmlContent,
        });

        sentResults.push({
          issue_id: issue.id,
          recipient: issue.pic_email,
          condition: tagLabel,
        });
      }
    }

    await client.close();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Peringatan dihantar: ${sentResults.length} e-mel`,
        data: sentResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});