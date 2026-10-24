// Transactional email bodies: one short message and one button, in the
// brand's gold on ivory. Inline styles only (email clients ignore <style>).
import type { Email } from "./send.server"

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

function layout(heading: string, body: string, action: string, url: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#f8f3ea;font-family:Helvetica,Arial,sans-serif;color:#2a1e14">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e9dcc4;border-radius:12px">
<tr><td style="padding:32px">
<p style="margin:0 0 24px;font-family:Georgia,serif;font-size:22px;color:#a8783a">Festly</p>
<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;font-weight:normal">${escape(heading)}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6">${escape(body)}</p>
<a href="${escape(url)}" style="display:inline-block;background:#a8783a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px">${escape(action)}</a>
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#7a6a58">If the button does not work, paste this link into your browser:<br>${escape(url)}</p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#7a6a58">You received this because someone used this address on Festly. If it was not you, ignore this email.</p>
</td></tr></table>
</body></html>`
}

function message(
  to: string,
  subject: string,
  heading: string,
  body: string,
  action: string,
  url: string
): Email {
  return {
    to,
    subject,
    text: `${heading}\n\n${body}\n\n${action}: ${url}\n`,
    html: layout(heading, body, action, url),
  }
}

export const resetPasswordEmail = (to: string, url: string) =>
  message(
    to,
    "Reset your Festly password",
    "Reset your password",
    "Use the button below to choose a new password. The link expires in one hour.",
    "Choose a new password",
    url
  )

export const verifyEmail = (to: string, url: string) =>
  message(
    to,
    "Confirm your email for Festly",
    "Confirm your email",
    "Confirm this address so we can send you RSVP updates and receipts.",
    "Confirm email",
    url
  )
