"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateWorkoutAction,
  addExerciseToWorkoutAction,
  removeExerciseFromWorkoutAction,
  addSetAction,
  removeSetAction,
} from "./actions";

interface SetData {
  id: number;
  setNumber: number;
  weight: string;
  reps: number;
}

interface WorkoutExerciseData {
  id: number;
  order: number;
  exercise: {
    id: number;
    name: string;
  };
  sets: SetData[];
}

interface WorkoutFormProps {
  workout: {
    id: number;
    name: string | null;
    startedAt: Date;
    workoutExercises: WorkoutExerciseData[];
  };
}

export function WorkoutForm({ workout }: WorkoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultDate = format(new Date(workout.startedAt), "yyyy-MM-dd");
  const defaultTime = format(new Date(workout.startedAt), "HH:mm");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = (formData.get("name") as string) || undefined;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;

    const startedAt = new Date(`${dateStr}T${timeStr}`);

    startTransition(async () => {
      await updateWorkoutAction({
        workoutId: workout.id,
        name,
        startedAt,
      });
      router.push("/dashboard");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Workout Name (optional)</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Push Day, Leg Day"
            maxLength={256}
            defaultValue={workout.name ?? ""}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={defaultTime}
            required
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>

      <hr />

      <AddExerciseForm workoutId={workout.id} />

      {workout.workoutExercises.length > 0 && (
        <div className="flex flex-col gap-6">
          {workout.workoutExercises.map((we) => (
            <ExerciseCard
              key={we.id}
              workoutId={workout.id}
              workoutExercise={we}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddExerciseForm({ workoutId }: { workoutId: number }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const exerciseName = (formData.get("exerciseName") as string).trim();

    if (!exerciseName) return;

    startTransition(async () => {
      await addExerciseToWorkoutAction({ workoutId, exerciseName });
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex items-end gap-3"
    >
      <div className="flex flex-col gap-2 flex-1">
        <Label htmlFor="exerciseName">Add Exercise</Label>
        <Input
          id="exerciseName"
          name="exerciseName"
          placeholder="e.g. Bench Press, Squat"
          maxLength={256}
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add Exercise"}
      </Button>
    </form>
  );
}

function ExerciseCard({
  workoutId,
  workoutExercise,
}: {
  workoutId: number;
  workoutExercise: WorkoutExerciseData;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemoveExercise() {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction({
        workoutExerciseId: workoutExercise.id,
        workoutId,
      });
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">
          {workoutExercise.exercise.name}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveExercise}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {workoutExercise.sets.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Set</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {workoutExercise.sets.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  workoutId={workoutId}
                />
              ))}
            </TableBody>
          </Table>
        )}

        <AddSetForm
          workoutId={workoutId}
          workoutExerciseId={workoutExercise.id}
        />
      </CardContent>
    </Card>
  );
}

function SetRow({
  set,
  workoutId,
}: {
  set: SetData;
  workoutId: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      await removeSetAction({ setId: set.id, workoutId });
    });
  }

  return (
    <TableRow>
      <TableCell>{set.setNumber}</TableCell>
      <TableCell>{set.weight}</TableCell>
      <TableCell>{set.reps}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={isPending}
          className="h-8 w-8"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function AddSetForm({
  workoutId,
  workoutExerciseId,
}: {
  workoutId: number;
  workoutExerciseId: number;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = (formData.get("weight") as string).trim();
    const reps = Number(formData.get("reps") as string);

    if (!weight || !reps) return;

    startTransition(async () => {
      await addSetAction({ workoutExerciseId, workoutId, weight, reps });
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex items-end gap-3"
    >
      <div className="flex flex-col gap-1 flex-1">
        <Label htmlFor={`weight-${workoutExerciseId}`} className="text-xs">
          Weight
        </Label>
        <Input
          id={`weight-${workoutExerciseId}`}
          name="weight"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          required
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <Label htmlFor={`reps-${workoutExerciseId}`} className="text-xs">
          Reps
        </Label>
        <Input
          id={`reps-${workoutExerciseId}`}
          name="reps"
          type="number"
          min="1"
          placeholder="0"
          required
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Adding..." : "Add Set"}
      </Button>
    </form>
  );
}
