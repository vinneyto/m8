import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Database } from 'bun:sqlite';
import { randomUUID } from 'crypto';

export interface Card {
  id: string;
  text: string;
}

@Injectable()
export class CardsService {
  private db: Database;

  constructor() {
    this.db = new Database('cards.sqlite');
    this.db.run(`CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
  }

  create(text: string): Card {
    const countStmt = this.db.query(
      "SELECT COUNT(*) as count FROM cards WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')",
    );
    const count = (countStmt.get() as { count: number }).count;
    if (count >= 1000) {
      throw new BadRequestException('Monthly limit reached');
    }
    const id = randomUUID();
    this.db.run('INSERT INTO cards (id, text) VALUES (?, ?)', [id, text]);
    return { id, text };
  }

  findOne(id: string): Card {
    const row = this.db
      .query('SELECT id, text FROM cards WHERE id = ?')
      .get(id);
    if (!row) {
      throw new NotFoundException('Card not found');
    }
    return row as Card;
  }
}
