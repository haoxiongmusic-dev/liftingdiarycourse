import { parse, isValid, format } from "date-fns";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/auth";
import { getWorkoutsByDate } from "@/data/workouts";
import { DatePicker } from "./date-picker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;

  let date = new Date();
  if (dateParam) {
    const parsed = parse(dateParam, "yyyy-MM-dd", new Date());
    if (isValid(parsed)) {
      date = parsed;
    }
  }

  const userId = await getCurrentUserId();
  const workouts = await getWorkoutsByDate(userId, date);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workouts</h2>
        <DatePicker value={date} />
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="mb-4 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              No workouts logged for this day.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/dashboard/workout/${workout.id}`}
              className="block transition-opacity hover:opacity-80"
            >
            <Card>
              <CardHeader>
                <CardTitle>
                  {workout.name || "Workout"}
                </CardTitle>
                <CardDescription>
                  Started at {format(workout.startedAt, "h:mm a")}
                  {" · "}
                  {workout.workoutExercises.length}{" "}
                  {workout.workoutExercises.length === 1
                    ? "exercise"
                    : "exercises"}
                </CardDescription>
              </CardHeader>
              {workout.workoutExercises.length > 0 && (
                <CardContent className="flex flex-col gap-4">
                  {workout.workoutExercises.map((we) => (
                    <div key={we.id}>
                      <p className="mb-1 text-sm font-medium">
                        {we.exercise.name}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground">
                        <span>Set</span>
                        <span>Weight (lbs)</span>
                        <span>Reps</span>
                      </div>
                      {we.sets.map((set) => (
                        <div
                          key={set.id}
                          className="grid grid-cols-3 gap-2 border-t py-2 text-sm"
                        >
                          <span>{set.setNumber}</span>
                          <span>{set.weight}</span>
                          <span>{set.reps}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
