import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/auth";
import { getWorkoutById } from "@/data/workouts";
import { WorkoutForm } from "./workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId: workoutIdParam } = await params;
  const workoutId = Number(workoutIdParam);

  if (!Number.isInteger(workoutId) || workoutId <= 0) {
    notFound();
  }

  const userId = await getCurrentUserId();
  const workout = await getWorkoutById(userId, workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
          <CardDescription>
            Update your workout details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkoutForm workout={workout} />
        </CardContent>
      </Card>
    </main>
  );
}
