"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MOCK_WORKOUTS = [
  {
    id: "1",
    name: "Bench Press",
    sets: [
      { reps: 8, weight: 135 },
      { reps: 8, weight: 155 },
      { reps: 6, weight: 175 },
    ],
  },
  {
    id: "2",
    name: "Barbell Row",
    sets: [
      { reps: 10, weight: 115 },
      { reps: 10, weight: 135 },
      { reps: 8, weight: 135 },
    ],
  },
  {
    id: "3",
    name: "Overhead Press",
    sets: [
      { reps: 10, weight: 75 },
      { reps: 8, weight: 85 },
      { reps: 6, weight: 95 },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workouts</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day) => day && setDate(day)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {MOCK_WORKOUTS.length === 0 ? (
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
          {MOCK_WORKOUTS.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>
                  {workout.sets.length} {workout.sets.length === 1 ? "set" : "sets"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground">
                  <span>Set</span>
                  <span>Weight (lbs)</span>
                  <span>Reps</span>
                </div>
                {workout.sets.map((set, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 border-t py-2 text-sm"
                  >
                    <span>{i + 1}</span>
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
