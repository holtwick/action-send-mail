import * as core from "@actions/core"
import { createTransport, SentMessageInfo, Transporter } from "nodemailer"
import Mail from "nodemailer/lib/mailer"
import process from "process"

core.info(`environment variables: ${JSON.stringify(process.env, null, 2)}`)

const vars = JSON.parse(process.env.SMTP_VARS || process.env.VARS || '{}')

const host = core.getInput("smtp-server") || vars.SMTP_SERVER
const port = parseInt(core.getInput("smtp-port"))
const secure = core.getInput("smtp-secure") === "true"
const from = core.getInput("from-email") || vars.SMTP_FROM || "action@example.com"
const to = (core.getInput("to-email") || vars.SMTP_TO || '').split(",")

// setup nodemailer
const transporter: Transporter<SentMessageInfo> = createTransport({
  host,
  port,
  secure,
  auth: {
    user: core.getInput("username") || vars.SMTP_USERNAME,
    pass: core.getInput("password") || vars.SMTP_PASSWORD,
  },
})

run()
  .then(() => core.info("Action completed successfully"))
  .catch((e) => core.setFailed(e))

async function run(): Promise<void> {
  core.info(`Sending email via ${host}:${port}`)
  core.info(`Sending email as ${from}`)

  const recipients: string[] = to
  const subject: string = core.getInput("subject") || vars.SMTP_SUBJECT || "GitHub Action Email"
  const body: string = core.getInput("body") || vars.SMTP_BODY || ""
  const html: string = core.getInput("html") || vars.SMTP_HTML || ""
  const message: Mail.Options = {
    from,
    to: recipients,
    subject,
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
