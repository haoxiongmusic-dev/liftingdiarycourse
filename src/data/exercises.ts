import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, and, ilike } from "drizzle-orm";

export async function findOrCreateExercise(userId: string, name: string) {
  const existing = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.userId, userId), ilike(exercises.name, name)));

  if (existing.length > 0) {
    return existing[0];
  }

  const [created] = await db
    .insert(exercises)
    .values({ userId, name: name.trim() })
    .returning();

  return created;
}
