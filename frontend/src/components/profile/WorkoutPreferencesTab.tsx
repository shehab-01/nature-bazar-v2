"use client"
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { WorkoutPreferences } from '@/types/profiles';

interface WorkoutTab {
  workoutData : WorkoutPreferences | null | undefined
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b last:border-b-0">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">
        {children}
      </div>
    </div>
  );
}

export function WorkoutPreferencesTab({workoutData}: WorkoutTab) {
  const [workoutTypes, setWorkoutTypes] = useState<string[]>(['strength', 'cardio']);
  const [daysPerWeek, setDaysPerWeek] = useState('4');
  const [sessionDuration, setSessionDuration] = useState('45-min');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [activityLevel, setActivityLevel] = useState('');
  const [sleepHours, setSleepHours] = useState('7-8');
  const [stressLevel, setStressLevel] = useState('moderate');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const types = [
    { id: 'strength_training', label: 'Strength Training' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'yoga', label: 'Yoga & Flexibility' },
    { id: 'hiit', label: 'HIIT' },
    { id: 'pilates', label: 'Pilates' },
  ];

  const toggleType = (id: string) => {
    if (workoutTypes.includes(id)) {
      setWorkoutTypes(workoutTypes.filter(t => t !== id));
    } else {
      setWorkoutTypes([...workoutTypes, id]);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  useEffect(()=>{
    if(workoutData){
      setWorkoutTypes(workoutData?.workout_styles)
      setDaysPerWeek(workoutData?.workout_days_per_week)
      setSessionDuration(workoutData?.session_duration)
      setFitnessLevel(workoutData?.fitness_level)
      setActivityLevel(workoutData?.activity_level)
      setSleepHours(workoutData?.avg_sleep_hours)
      setStressLevel(workoutData?.stress_level)
    }
  })

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Workout Preferences</h2>
      <p className="text-sm text-muted-foreground mb-6">Configure your training style and schedule.</p>

      <Section title="Workout Style" description="The types of exercise you enjoy and your current fitness level">
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isSelected = workoutTypes.includes(type.id);
            return (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors text-sm px-4 py-1.5 rounded-full font-normal',
                    !isSelected && 'hover:bg-muted hover:text-foreground'
                  )}
                >
                  {type.label}
                </Badge>
              </button>
            );
          })}
        </div>
        <div className="space-y-1.5 max-w-sm">
          <Label>Fitness Level</Label>
          <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Schedule" description="How often and how long you work out each week">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>Workout Days Per Week</Label>
            <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Days</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="4">4 Days</SelectItem>
                <SelectItem value="5">5 Days</SelectItem>
                <SelectItem value="6">6 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Session Duration</Label>
            <Select value={sessionDuration} onValueChange={setSessionDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20_30_min">20–30 minutes</SelectItem>
                <SelectItem value="30_45_min">30–45 minutes</SelectItem>
                <SelectItem value="45_60_min">45–60 minutes</SelectItem>
                <SelectItem value="60+_min">60+ minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Lifestyle" description="Sleep and stress levels affect your metabolism and recovery">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>General Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (desk job, little movement)</SelectItem>
                <SelectItem value="lightly_active">Lightly Active (1–3 days/week)</SelectItem>
                <SelectItem value="moderately_active">Moderately Active (3–5 days/week)</SelectItem>
                <SelectItem value="very_active">Very Active (6–7 days/week)</SelectItem>
                <SelectItem value="extra_active">Extra Active (physical job + training)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used to calculate your daily calorie needs</p>
          </div>
          <div className="space-y-1.5">
            <Label>Average Sleep Per Night</Label>
            <Select value={sleepHours} onValueChange={setSleepHours}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less_5">Less than 5 hours</SelectItem>
                <SelectItem value="5_6">5–6 hours</SelectItem>
                <SelectItem value="7_8">7–8 hours</SelectItem>
                <SelectItem value="9+">9+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Stress Level</Label>
            <Select value={stressLevel} onValueChange={setStressLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (generally relaxed)</SelectItem>
                <SelectItem value="moderate">Moderate (occasional stress)</SelectItem>
                <SelectItem value="high">High (frequent stress)</SelectItem>
                <SelectItem value="very_high">Very High (chronic stress)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving || saved} className="gap-2">
          {saved ? <><CheckCircle2 className="size-4" />Saved!</> : isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
