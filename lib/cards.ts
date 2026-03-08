import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const DEFAULT_CARD_TEXT = "Милые девушки, поздравляю с 8-м марта!";
export const MAX_CARD_TEXT_LENGTH = 500;
export const MONTHLY_CARD_LIMIT = 1000;
const CARD_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CardRecord {
  id: string;
  text: string;
  createdAt: string;
}

interface CardRow {
  id: string;
  text: string;
  created_at: string | Date;
}

interface CountRow {
  count: number | string;
}

declare global {
  var __cardsSchemaPromise: Promise<void> | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function normalizeCardText(input: string) {
  const text = input.trim();

  if (!text) {
    throw new Error("Введите текст открытки.");
  }

  if (text.length > MAX_CARD_TEXT_LENGTH) {
    throw new Error(
      `Текст открытки не должен превышать ${MAX_CARD_TEXT_LENGTH} символов.`,
    );
  }

  return text;
}

function getDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL не задан. Подключите Postgres-интеграцию в Vercel или задайте строку подключения локально.",
    );
  }

  return neon(connectionString);
}

function mapCard(row: CardRow): CardRecord {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at).toISOString();

  return {
    id: row.id,
    text: row.text,
    createdAt,
  };
}

async function ensureCardsSchema() {
  if (!globalThis.__cardsSchemaPromise) {
    const database = getDatabase();

    globalThis.__cardsSchemaPromise = (async () => {
      await database`
        CREATE TABLE IF NOT EXISTS cards (
          id UUID PRIMARY KEY,
          text TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await database`
        CREATE INDEX IF NOT EXISTS cards_created_at_idx
        ON cards (created_at DESC)
      `;
    })().catch((error) => {
      globalThis.__cardsSchemaPromise = undefined;
      throw error;
    });
  }

  await globalThis.__cardsSchemaPromise;
}

export async function createCard(text: string) {
  const normalizedText = normalizeCardText(text);
  const database = getDatabase();

  await ensureCardsSchema();

  const countRows = (await database`
    SELECT COUNT(*)::int AS count
    FROM cards
    WHERE date_trunc('month', created_at) = date_trunc('month', NOW())
  `) as CountRow[];

  const currentMonthCount = Number(countRows[0]?.count ?? 0);

  if (currentMonthCount >= MONTHLY_CARD_LIMIT) {
    throw new Error("Достигнут месячный лимит на создание открыток.");
  }

  const id = randomUUID();
  const rows = (await database`
    INSERT INTO cards (id, text)
    VALUES (${id}, ${normalizedText})
    RETURNING id, text, created_at
  `) as CardRow[];

  return mapCard(rows[0]);
}

export async function getCardById(id: string) {
  if (!CARD_ID_PATTERN.test(id)) {
    return null;
  }

  const database = getDatabase();

  await ensureCardsSchema();

  const rows = (await database`
    SELECT id, text, created_at
    FROM cards
    WHERE id = ${id}
    LIMIT 1
  `) as CardRow[];

  return rows[0] ? mapCard(rows[0]) : null;
}
