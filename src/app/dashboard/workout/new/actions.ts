"use server";

import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createWorkout } from "@/data/workouts";
import { redirect } from "next/navigation";

const createWorkoutSchema = z.object({
  name: z.string().trim().max(256).optional(),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name?: string;
  startedAt: Date;
}) {
  const parsed = createWorkoutSchema.parse(params);
  const userId = await getCurrentUserId();

  await createWorkout(userId, {
    name: parsed.name || undefined,
    startedAt: parsed.startedAt,
  });

  redirect("/dashboard");
}
