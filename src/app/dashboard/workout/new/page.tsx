import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkoutForm } from "./workout-form";

export default function NewWorkoutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>New Workout</CardTitle>
          <CardDescription>
            Log a new workout session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkoutForm />
        </CardContent>
      </Card>
    </main>
  );
}
