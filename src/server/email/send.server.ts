// Outgoing email. Resend when RESEND_API_KEY is set; otherwise (development
// only, env validation requires the key in production) the message is printed
// to the server log so links can be clicked from the terminal.
import { Resend } from "resend"
import { serverEnv, type ServerEnv } from "@/env.server"

export type Email = {
  to: string
  subject: string
  /** Plain text: always sent, and what the dev log prints. */
  text: string
  html: string
}

export type EmailSender = (email: Email) => Promise<void>

const DEV_FROM = "Festly <onboarding@resend.dev>"

export function createEmailSender(env: ServerEnv): EmailSender {
  if (!env.RESEND_API_KEY) {
    return async (email) => {
      console.info(
        `\n[email] (not sent: RESEND_API_KEY is unset)\n  to: ${email.to}\n  subject: ${email.subject}\n\n${email.text}\n`
      )
    }
  }
  const resend = new Resend(env.RESEND_API_KEY)
  const from = env.EMAIL_FROM ?? DEV_FROM
  return async (email) => {
    const { error } = await resend.emails.send({ from, ...email })
    if (error) throw new Error(`Email to ${email.to} failed: ${error.message}`)
  }
}

let sender: EmailSender | undefined
export const sendEmail: EmailSender = (email) =>
  (sender ??= createEmailSender(serverEnv))(email)
