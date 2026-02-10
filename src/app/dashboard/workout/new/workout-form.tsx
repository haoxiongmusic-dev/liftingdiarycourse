"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";

export function WorkoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = (formData.get("name") as string) || undefined;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;

    const startedAt = new Date(`${dateStr}T${timeStr}`);

    startTransition(async () => {
      const { workoutId } = await createWorkoutAction({ name, startedAt });
      router.push(`/dashboard/workout/${workoutId}`);
    });
  }

  const today = new Date();
  const defaultDate = format(today, "yyyy-MM-dd");
  const defaultTime = format(today, "HH:mm");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout Name (optional)</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Push Day, Leg Day"
          maxLength={256}
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
          {isPending ? "Creating..." : "Create Workout"}
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
