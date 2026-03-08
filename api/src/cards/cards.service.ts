import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseSync } from 'node:sqlite';

export interface Card {
  id: string;
  text: string;
}

@Injectable()
export class CardsService {
  private db: DatabaseSync;

  constructor() {
    const dbPath = process.env.CARDS_DB_PATH ?? 'cards.sqlite';
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
  }

  create(text: string): Card {
    const count = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM cards WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')",
      )
      .get() as { count: number };

    if (count.count >= 1000) {
      throw new BadRequestException('Monthly limit reached');
    }

    const id = randomUUID();
    this.db.prepare('INSERT INTO cards (id, text) VALUES (?, ?)').run(id, text);
    return { id, text };
  }

  findOne(id: string): Card {
    const row = this.db
      .prepare('SELECT id, text FROM cards WHERE id = ?')
      .get(id) as Card | undefined;

    if (!row) {
      throw new NotFoundException('Card not found');
    }

    return row;
  }
}
