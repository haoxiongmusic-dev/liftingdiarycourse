import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

export async function createWorkout(
  userId: string,
  data: { name?: string; startedAt: Date }
) {
  return db.insert(workouts).values({
    userId,
    name: data.name || null,
    startedAt: data.startedAt,
  });
}

export async function getWorkoutsByDate(userId: string, date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, dayStart),
      lt(workouts.startedAt, dayEnd)
    ),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });
}
