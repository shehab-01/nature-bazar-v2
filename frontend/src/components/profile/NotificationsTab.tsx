"use client"
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function NotificationsTab() {
  const [mealReminders, setMealReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [progressSummary, setProgressSummary] = useState(false);

  return (
    <div className="flex-1 bg-white rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-1">Notifications</h2>
      <p className="text-sm text-muted-foreground mb-6">Choose what updates you want to receive</p>

      <div>
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 flex-1 pr-4">
            <Label className="text-sm font-semibold">Meal Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when it&apos;s time for your scheduled meals
            </p>
          </div>
          <Switch checked={mealReminders} onCheckedChange={setMealReminders} />
        </div>
        <Separator />
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 flex-1 pr-4">
            <Label className="text-sm font-semibold">Workout Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications for your scheduled workout sessions
            </p>
          </div>
          <Switch checked={workoutReminders} onCheckedChange={setWorkoutReminders} />
        </div>
        <Separator />
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 flex-1 pr-4">
            <Label className="text-sm font-semibold">Weekly Progress Summary</Label>
            <p className="text-sm text-muted-foreground">
              Get a weekly email with your progress stats and achievements
            </p>
          </div>
          <Switch checked={progressSummary} onCheckedChange={setProgressSummary} />
        </div>
      </div>
    </div>
  );
}
