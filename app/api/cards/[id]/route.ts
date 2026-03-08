import { NextResponse } from "next/server";
import { getCardById, isDatabaseConfigured } from "@/lib/cards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL не задан. Подключите Neon/Postgres в Vercel для доступа к открыткам.",
      },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const card = await getCardById(id);

  if (!card) {
    return NextResponse.json({ error: "Открытка не найдена." }, { status: 404 });
  }

  return NextResponse.json({ card });
}
