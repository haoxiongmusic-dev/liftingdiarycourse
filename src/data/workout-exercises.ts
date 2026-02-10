import { db } from "@/db";
import { workoutExercises, workouts } from "@/db/schema";
import { eq, and, max } from "drizzle-orm";

export async function addWorkoutExercise(
  userId: string,
  workoutId: number,
  exerciseId: number
) {
  // Verify the user owns this workout
  const workout = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  if (workout.length === 0) {
    throw new Error("Workout not found");
  }

  // Compute the next order value
  const [result] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const nextOrder = (result?.maxOrder ?? 0) + 1;

  const [created] = await db
    .insert(workoutExercises)
    .values({
      workoutId,
      exerciseId,
      order: nextOrder,
    })
    .returning();

  return created;
}

export async function removeWorkoutExercise(
  userId: string,
  workoutExerciseId: number
) {
  // Verify ownership via join to workout
  const record = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    );

  if (record.length === 0) {
    throw new Error("Workout exercise not found");
  }

  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}
