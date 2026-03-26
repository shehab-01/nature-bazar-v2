import { useState } from 'react';
// import { ToggleSwitch } from './ToggleSwitch';
import { ToggleSwitch } from '@/components/profile/ToggleSwitch';

export function NotificationsTab() {
  const [mealReminders, setMealReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [progressSummary, setProgressSummary] = useState(false);

  return (
    <div 
      className="bg-white rounded p-6 md:p-8 border"
      style={{ 
        borderColor: 'rgba(113, 113, 122, 0.2)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px'
      }}
    >
      <h2 
        className="text-2xl mb-6"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
      >
        Notifications
      </h2>

      <div className="space-y-6">
        {/* Meal Reminders */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b" style={{ borderColor: 'rgba(113, 113, 122, 0.15)' }}>
          <div className="flex-1">
            <div 
              className="mb-1"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
            >
              Meal Reminders
            </div>
            <p 
              className="text-sm"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
            >
              Get notified when it's time for your scheduled meals
            </p>
          </div>
          <ToggleSwitch
            checked={mealReminders}
            onChange={setMealReminders}
          />
        </div>

        {/* Workout Reminders */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b" style={{ borderColor: 'rgba(113, 113, 122, 0.15)' }}>
          <div className="flex-1">
            <div 
              className="mb-1"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
            >
              Workout Reminders
            </div>
            <p 
              className="text-sm"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
            >
              Receive notifications for your scheduled workout sessions
            </p>
          </div>
          <ToggleSwitch
            checked={workoutReminders}
            onChange={setWorkoutReminders}
          />
        </div>

        {/* Weekly Progress Summary */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div 
              className="mb-1"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
            >
              Weekly Progress Summary
            </div>
            <p 
              className="text-sm"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
            >
              Get a weekly email with your progress stats and achievements
            </p>
          </div>
          <ToggleSwitch
            checked={progressSummary}
            onChange={setProgressSummary}
          />
        </div>
      </div>
    </div>
  );
}
