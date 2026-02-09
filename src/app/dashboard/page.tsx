import { parse, isValid } from "date-fns";
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

  const exercises = workouts.flatMap((workout) =>
    workout.workoutExercises.map((we) => ({
      id: we.id,
      name: we.exercise.name,
      sets: we.sets,
    }))
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workouts</h2>
        <DatePicker value={date} />
      </div>

      {exercises.length === 0 ? (
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
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription>
                  {exercise.sets.length}{" "}
                  {exercise.sets.length === 1 ? "set" : "sets"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground">
                  <span>Set</span>
                  <span>Weight (lbs)</span>
                  <span>Reps</span>
                </div>
                {exercise.sets.map((set) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-3 gap-2 border-t py-2 text-sm"
                  >
                    <span>{set.setNumber}</span>
                    <span>{set.weight}</span>
                    <span>{set.reps}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
