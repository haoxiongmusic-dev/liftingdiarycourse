"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "./actions";

interface WorkoutFormProps {
  workout: {
    id: number;
    name: string | null;
    startedAt: Date;
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
  );
}
