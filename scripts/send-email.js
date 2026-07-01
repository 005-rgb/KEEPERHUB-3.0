#!/usr/bin/env node
/**
 * Email sender worker — dijalankan sebagai child process oleh API route.
 * Menerima argumen via stdin (JSON), kirim email, exit.
 */
const nodemailer = require("nodemailer");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", async () => {
  try {
    const { to, toNama, subject, html } = JSON.parse(raw);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
      socketTimeout: 15000,
    });
    await transporter.sendMail({
      from: `"KeeperHub" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("EMAIL_SENT_OK");
    process.exit(0);
  } catch (e) {
    console.error("EMAIL_ERROR:", e.message);
    process.exit(1);
  }
});
