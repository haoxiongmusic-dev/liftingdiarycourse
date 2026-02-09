"use server";

import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().trim().max(256).optional(),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name?: string;
  startedAt: Date;
}) {
  const parsed = updateWorkoutSchema.parse(params);
  const userId = await getCurrentUserId();

  await updateWorkout(userId, parsed.workoutId, {
    name: parsed.name,
    startedAt: parsed.startedAt,
  });
}
