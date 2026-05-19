import { z } from "zod";

export const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите ваше имя.")
    .max(100, "Имя слишком длинное."),
  email: z.email("Введите корректный email."),
  instagram: z
    .string()
    .trim()
    .min(2, "Введите ваш Instagram.")
    .max(100, "Instagram слишком длинный."),
});

export type BookingPayload = z.infer<typeof bookingSchema>;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export async function sendBookingEmail(payload: BookingPayload) {
  const resendApiKey = getRequiredEnv("RESEND_API_KEY");
  const bookingEmailTo = getRequiredEnv("BOOKING_EMAIL_TO");
  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);

  const from =
    process.env.BOOKING_EMAIL_FROM?.trim() || "Blooming Diva <bookings@lizakarasiova.com>";

  const result = await resend.emails.send({
    from,
    to: [bookingEmailTo],
    subject: `Новая заявка BLOOMING DIVA: ${payload.name}`,
    text: [
      "Новая заявка на BLOOMING DIVA PHOTO DAY",
      "",
      `Имя: ${payload.name}`,
      `Email: ${payload.email}`,
      `Instagram: ${payload.instagram}`,
    ].join("\n"),
  });

  if (result.error) {
    const detail =
      typeof result.error.message === "string" ? result.error.message : "Resend API error";
    console.error("[booking] Resend email failed:", detail);
  }

  return result;
}

export async function sendBookingTelegram(payload: BookingPayload) {
  const botToken = getRequiredEnv("TELEGRAM_BOT_TOKEN");
  const chatId = getRequiredEnv("TELEGRAM_CHAT_ID");

  const text = [
    "Новая заявка на BLOOMING DIVA PHOTO DAY",
    `Имя: ${payload.name}`,
    `Email: ${payload.email}`,
    `Instagram: ${payload.instagram}`,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Telegram delivery failed.");
  }

  return response.json();
}
