"use client"
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function NotificationCard({ id, title, description, checked, onCheckedChange }: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border rounded-lg bg-white">
      <div>
        <Label htmlFor={id} className="text-sm font-semibold cursor-pointer">{title}</Label>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="ml-6 shrink-0" />
    </div>
  );
}

export function NotificationsTab() {
  const [mealReminders, setMealReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [progressSummary, setProgressSummary] = useState(false);

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Notifications</h2>
      <p className="text-sm text-muted-foreground mb-5">Manage how you receive notifications.</p>

      <div className="space-y-3 max-w-2xl">
        <NotificationCard
          id="meal-reminders"
          title="Meal Reminders"
          description="Get notified when it's time for your scheduled meals"
          checked={mealReminders}
          onCheckedChange={setMealReminders}
        />
        <NotificationCard
          id="workout-reminders"
          title="Workout Reminders"
          description="Receive notifications for your scheduled workout sessions"
          checked={workoutReminders}
          onCheckedChange={setWorkoutReminders}
        />
        <NotificationCard
          id="progress-summary"
          title="Weekly Progress Summary"
          description="Get a weekly email with your progress stats and achievements"
          checked={progressSummary}
          onCheckedChange={setProgressSummary}
        />
      </div>
    </div>
  );
}
