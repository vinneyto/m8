import { NextRequest, NextResponse } from "next/server";
import { createCard, isDatabaseConfigured } from "@/lib/cards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Произошла неизвестная ошибка.";
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL не задан. Подключите Neon/Postgres в Vercel перед созданием открыток.",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { text?: unknown };
    const text = typeof body.text === "string" ? body.text : "";
    const card = await createCard(text);
    const shareUrl = new URL(`/cards/${card.id}`, request.url).toString();

    return NextResponse.json(
      {
        card,
        shareUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 400 },
    );
  }
}
