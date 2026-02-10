import { db } from "@/db";
import { sets, workoutExercises, workouts } from "@/db/schema";
import { eq, and, max } from "drizzle-orm";

export async function addSet(
  userId: string,
  workoutExerciseId: number,
  data: { weight: string; reps: number }
) {
  // Verify ownership via join chain: sets -> workoutExercises -> workouts
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

  // Compute the next set number
  const [result] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const nextSetNumber = (result?.maxSetNumber ?? 0) + 1;

  const [created] = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: nextSetNumber,
      weight: data.weight,
      reps: data.reps,
    })
    .returning();

  return created;
}

export async function removeSet(userId: string, setId: number) {
  // Verify ownership via join chain: sets -> workoutExercises -> workouts
  const record = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(
      workoutExercises,
      eq(sets.workoutExerciseId, workoutExercises.id)
    )
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));

  if (record.length === 0) {
    throw new Error("Set not found");
  }

  await db.delete(sets).where(eq(sets.id, setId));
}
