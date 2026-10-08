import { eq } from 'drizzle-orm';
import { db } from '../../database';
import { ApiError } from '../../core/errors/ApiError';
import { users, NewUser } from './users.schema';

export const usersService = {
  findAll: () => db.select().from(users),

  async findById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async remove(id: number) {
    const res = await db.delete(users).where(eq(users.id, id)).returning();
    if (!res.length) throw ApiError.notFound('User not found');
  },
};