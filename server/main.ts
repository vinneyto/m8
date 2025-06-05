import { NestFactory } from '@nestjs/core';
import {
  Module,
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Database } from 'bun:sqlite';
import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { TextPipe } from './text.pipe.js';

let db: Database;

async function initDb() {
  db = new Database('cards.db');
  db.run(`CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);
}

@Controller('cards')
class CardController {
  @Post()
  async create(@Body('text', new TextPipe()) text: string) {
    const row = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM cards WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
    );
    if (row && row.count >= 1000) {
      throw new HttpException('Monthly limit reached', HttpStatus.BAD_REQUEST);
    }
    const id = randomUUID();
    await db.run(
      'INSERT INTO cards (id, text, created_at) VALUES (?, ?, datetime(\'now\'))',
      id,
      text
    );
    return { id, text };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const card = await db.get<{ id: string; text: string }>(
      'SELECT id, text FROM cards WHERE id = ?',
      id
    );
    if (!card) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return card;
  }
}

@Module({
  controllers: [CardController],
})
class AppModule {}

async function bootstrap() {
  await initDb();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Server listening on http://localhost:3000');
}

bootstrap();
