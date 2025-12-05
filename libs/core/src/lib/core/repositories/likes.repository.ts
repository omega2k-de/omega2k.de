import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { LikeState } from '../interfaces';

const DEFAULT_LIKES_DB_PATH = process.env['LIKES_DB_PATH'] ?? 'likes.db';

const LIKES_TABLE = 'likes';

const LIKE_COLUMNS = ['article_id', 'user_id', 'liked', 'updated_at'] as const;

const buildColumnList = (columns: readonly string[]): string => columns.join(', ');

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
};

const toBoolean = (value: unknown): boolean => value === 1 || value === '1' || value === true;

export class LikesRepository {
  private constructor(
    private readonly db: Database,
    private readonly filePath: string
  ) {}

  static async create(dbPath: string = DEFAULT_LIKES_DB_PATH): Promise<LikesRepository> {
    const SQL = await initSqlJs();
    const resolved = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let db: Database;
    if (fs.existsSync(resolved)) {
      const buffer = fs.readFileSync(resolved);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    db.exec(`
      create table if not exists ${LIKES_TABLE} (
                                                  article_id text not null,
                                                  user_id text not null,
                                                  liked integer not null,
                                                  updated_at text not null,
                                                  primary key (article_id, user_id)
        );
      create index if not exists likes_article_liked_idx
        on ${LIKES_TABLE}(article_id, liked);
    `);

    const repo = new LikesRepository(db, resolved);
    repo.persist();
    return repo;
  }

  private persist(): void {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.filePath, buffer);
  }

  getState(articleId: number, userId: string | null): LikeState {
    const countStmt = this.db.prepare(
      `select count(*) as count from ${LIKES_TABLE} where article_id = ? and liked = 1`
    );
    countStmt.bind([articleId]);
    let count = 0;
    if (countStmt.step()) {
      const row = countStmt.getAsObject();
      count = toNumber(row['count'], 0);
    }
    countStmt.free();

    let liked = false;
    if (userId) {
      const userStmt = this.db.prepare(
        `select liked from ${LIKES_TABLE} where article_id = ? and user_id = ?`
      );
      userStmt.bind([articleId, userId]);
      if (userStmt.step()) {
        const row = userStmt.getAsObject();
        liked = toBoolean(row['liked']);
      }
      userStmt.free();
    }

    return { articleId, count, liked };
  }

  getAllStates(userId: string | null): LikeState[] {
    const statesByArticle = new Map<number, LikeState>();

    const countStmt = this.db.prepare(
      `
      select
        article_id,
        sum(case when liked = 1 then 1 else 0 end) as count
      from ${LIKES_TABLE}
      group by article_id
      `
    );
    while (countStmt.step()) {
      const row = countStmt.getAsObject();
      const articleId = toNumber(row['article_id']);
      if (!Number.isNaN(articleId)) {
        const count = toNumber(row['count'], 0);
        statesByArticle.set(articleId, {
          articleId,
          count,
          liked: false,
        });
      }
    }
    countStmt.free();

    if (userId) {
      const userStmt = this.db.prepare(
        `
        select ${buildColumnList(['article_id', 'liked'])}
        from ${LIKES_TABLE}
        where user_id = ?
        `
      );
      userStmt.bind([userId]);
      while (userStmt.step()) {
        const row = userStmt.getAsObject();
        const articleId = toNumber(row['article_id']);
        if (Number.isNaN(articleId)) {
          continue;
        }
        const liked = toBoolean(row['liked']);
        const existing = statesByArticle.get(articleId);
        if (existing) {
          existing.liked = liked;
        } else {
          statesByArticle.set(articleId, {
            articleId,
            count: liked ? 1 : 0,
            liked,
          });
        }
      }
      userStmt.free();
    }

    return Array.from(statesByArticle.values()).sort((a, b) => a.articleId - b.articleId);
  }

  toggle(articleId: number, userId: string): LikeState {
    const now = new Date().toISOString();

    const selectStmt = this.db.prepare(
      `select liked from ${LIKES_TABLE} where article_id = ? and user_id = ?`
    );
    selectStmt.bind([articleId, userId]);
    let exists = false;
    let currentLiked = false;
    if (selectStmt.step()) {
      const row = selectStmt.getAsObject();
      exists = true;
      currentLiked = toBoolean(row['liked']);
    }
    selectStmt.free();

    if (!exists) {
      const insertStmt = this.db.prepare(
        `insert into ${LIKES_TABLE} (${buildColumnList(LIKE_COLUMNS)}) values (?, ?, ?, ?)`
      );
      insertStmt.bind([articleId, userId, 1, now]);
      insertStmt.step();
      insertStmt.free();
    } else {
      const next = currentLiked ? 0 : 1;
      const updateStmt = this.db.prepare(
        `update ${LIKES_TABLE} set liked = ?, updated_at = ? where article_id = ? and user_id = ?`
      );
      updateStmt.bind([next, now, articleId, userId]);
      updateStmt.step();
      updateStmt.free();
    }

    this.persist();
    return this.getState(articleId, userId);
  }
}
