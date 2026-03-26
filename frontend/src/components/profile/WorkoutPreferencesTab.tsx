"use client"
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function WorkoutPreferencesTab() {
  const [workoutTypes, setWorkoutTypes] = useState<string[]>(['strength', 'cardio']);
  const [daysPerWeek, setDaysPerWeek] = useState('4');
  const [sessionDuration, setSessionDuration] = useState('45-min');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const types = [
    { id: 'strength', label: 'Strength Training' },
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

  return (
    <div className="flex-1 bg-white rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-1">Workout Preferences</h2>
      <p className="text-sm text-muted-foreground mb-6">Configure your training style and schedule</p>

      <div className="space-y-5 max-w-lg">
        <div className="space-y-2">
          <Label>Preferred Workout Types</Label>
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
        </div>

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
              <SelectItem value="20-min">20-30 minutes</SelectItem>
              <SelectItem value="45-min">30-45 minutes</SelectItem>
              <SelectItem value="60-min">45-60 minutes</SelectItem>
              <SelectItem value="90-min">60+ minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
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

        <Button
          onClick={handleSave}
          disabled={isSaving || saved}
          className="gap-2"
        >
          {saved ? (
            <>
              <CheckCircle2 className="size-4" />
              Saved!
            </>
          ) : isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
