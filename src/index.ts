import * as core from "@actions/core"
import { createTransport, SentMessageInfo, Transporter } from "nodemailer"
import Mail from "nodemailer/lib/mailer"

const host = core.getInput("smtp-server") || process.env.SMTP_SERVER
const port = parseInt(core.getInput("smtp-port"))
const secure = core.getInput("smtp-secure") === "true"
const from = core.getInput("from-email") || process.env.SMTP_FROM || "action@example.com"
const to = (core.getInput("to-email") || process.env.SMTP_TO || '').split(",")

// setup nodemailer
const transporter: Transporter<SentMessageInfo> = createTransport({
  host,
  port,
  secure,
  auth: {
    user: core.getInput("username"),
    pass: core.getInput("password"),
  },
})

run()
  .then(() => core.info("Action completed successfully"))
  .catch((e) => core.setFailed(e))

async function run(): Promise<void> {
  // log server info
  core.info(`Sending email via ${host}:${port}`)
  core.info(`Sending email as ${from}`)

  const sender: string = from
  const recipients: string[] = to
  const subject: string = core.getInput("subject") || process.env.SMTP_SUBJECT || "GitHub Action Email"
  const body: string = core.getInput("body")
  const html: string = core.getInput("html")
  const message: Mail.Options = {
    from: sender,
    to: recipients,
    subject: subject,
  }
  if (body !== "") {
    message.text = body
  } else if (html !== "") {
    message.html = html
  } else {
    throw new Error("No body or html provided")
  }
  transporter.sendMail(
    message,
    (error: Error | null, info: SentMessageInfo): void => {
      if (error) {
        throw error
      }
      core.info(`Email sent successfully: ${info.messageId}`)
    },
  )
}
