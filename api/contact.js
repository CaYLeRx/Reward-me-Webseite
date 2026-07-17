const MAX_BODY_BYTES = 32_000;

function json(response, status, payload) {
  response.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readPayload(body) {
  return {
    company: clean(body.company, 180),
    industry: clean(body.industry, 120),
    name: clean(body.name, 160),
    email: clean(body.email, 254).toLowerCase(),
    package: clean(body.package, 120),
    message: clean(body.message, 4_000),
    locale: ["de", "en", "fr", "it"].includes(body.locale) ? body.locale : "de",
  };
}

async function storeInSupabase(payload) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_CONTACT_TABLE || "website_contact_submissions";
  if (!url || !key) throw new Error("Contact storage is not configured");

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ ...payload, source: "reward-me.ch" }),
  });
  if (!response.ok) throw new Error(`Contact storage failed (${response.status})`);
}

async function notifyByEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `Neue Reward Me Partner-Anfrage: ${payload.company}`,
      text: [
        `Firma: ${payload.company}`,
        `Branche: ${payload.industry}`,
        `Kontakt: ${payload.name}`,
        `E-Mail: ${payload.email}`,
        `Paket: ${payload.package || "Nicht angegeben"}`,
        `Sprache: ${payload.locale}`,
        "",
        payload.message,
      ].join("\n"),
    }),
  });
  if (!response.ok) throw new Error(`Email notification failed (${response.status})`);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, error: "Method not allowed" });
  }

  const contentLength = Number(request.headers["content-length"] || 0);
  if (contentLength > MAX_BODY_BYTES) return json(response, 413, { ok: false, error: "Payload too large" });

  const payload = readPayload(request.body || {});
  const valid =
    payload.company.length >= 2 &&
    payload.industry.length >= 2 &&
    payload.name.length >= 2 &&
    /^\S+@\S+\.\S+$/.test(payload.email) &&
    payload.message.length >= 10;
  if (!valid) return json(response, 400, { ok: false, error: "Invalid form data" });

  try {
    await storeInSupabase(payload);
    await notifyByEmail(payload);
    return json(response, 200, { ok: true });
  } catch (error) {
    console.error("Contact submission failed", error);
    return json(response, 503, { ok: false, error: "Contact service unavailable" });
  }
}
