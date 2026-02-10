"use server";

import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { updateWorkout } from "@/data/workouts";
import { findOrCreateExercise } from "@/data/exercises";
import {
  addWorkoutExercise,
  removeWorkoutExercise,
} from "@/data/workout-exercises";
import { addSet, removeSet } from "@/data/sets";
import { revalidatePath } from "next/cache";

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

  revalidatePath(`/dashboard/workout/${parsed.workoutId}`);
}

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().trim().min(1).max(256),
});

export async function addExerciseToWorkoutAction(params: {
  workoutId: number;
  exerciseName: string;
}) {
  const parsed = addExerciseSchema.parse(params);
  const userId = await getCurrentUserId();

  const exercise = await findOrCreateExercise(userId, parsed.exerciseName);
  await addWorkoutExercise(userId, parsed.workoutId, exercise.id);

  revalidatePath(`/dashboard/workout/${parsed.workoutId}`);
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(params: {
  workoutExerciseId: number;
  workoutId: number;
}) {
  const parsed = removeExerciseSchema.parse(params);
  const userId = await getCurrentUserId();

  await removeWorkoutExercise(userId, parsed.workoutExerciseId);

  revalidatePath(`/dashboard/workout/${parsed.workoutId}`);
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
  weight: z.string().min(1),
  reps: z.coerce.number().int().positive(),
});

export async function addSetAction(params: {
  workoutExerciseId: number;
  workoutId: number;
  weight: string;
  reps: number;
}) {
  const parsed = addSetSchema.parse(params);
  const userId = await getCurrentUserId();

  await addSet(userId, parsed.workoutExerciseId, {
    weight: parsed.weight,
    reps: parsed.reps,
  });

  revalidatePath(`/dashboard/workout/${parsed.workoutId}`);
}

const removeSetSchema = z.object({
  setId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export async function removeSetAction(params: {
  setId: number;
  workoutId: number;
}) {
  const parsed = removeSetSchema.parse(params);
  const userId = await getCurrentUserId();

  await removeSet(userId, parsed.setId);

  revalidatePath(`/dashboard/workout/${parsed.workoutId}`);
}
