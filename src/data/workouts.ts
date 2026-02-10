import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

export async function getWorkoutById(userId: string, workoutId: number) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
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

export async function updateWorkout(
  userId: string,
  workoutId: number,
  data: { name?: string; startedAt: Date }
) {
  return db
    .update(workouts)
    .set({
      name: data.name || null,
      startedAt: data.startedAt,
      updatedAt: new Date(),
    })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function createWorkout(
  userId: string,
  data: { name?: string; startedAt: Date }
) {
  return db
    .insert(workouts)
    .values({
      userId,
      name: data.name || null,
      startedAt: data.startedAt,
    })
    .returning({ id: workouts.id });
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
