import { NextResponse } from "next/server";

import { bookingSchema, sendBookingEmail, sendBookingTelegram } from "@/lib/booking";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = bookingSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Проверьте данные формы." },
        { status: 400 },
      );
    }

    await Promise.all([sendBookingEmail(parsed.data), sendBookingTelegram(parsed.data)]);

    return NextResponse.json({
      message: "Мы свяжемся с вами в ближайшее время.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте еще раз.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
