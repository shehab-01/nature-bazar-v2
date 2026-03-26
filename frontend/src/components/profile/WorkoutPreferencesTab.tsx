import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

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
        Workout Preferences
      </h2>

      <div className="space-y-6">
        {/* Workout Types */}
        <div>
          <label 
            className="block text-sm mb-3"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Preferred Workout Types
          </label>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => {
              const isSelected = workoutTypes.includes(type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className="px-4 py-2 rounded border transition-all"
                  style={{ 
                    borderColor: isSelected ? 'var(--nutritrack-primary)' : 'rgba(113, 113, 122, 0.3)',
                    backgroundColor: isSelected ? 'var(--nutritrack-highlight)' : 'transparent',
                    color: isSelected ? 'var(--nutritrack-primary)' : 'var(--nutritrack-neutral)',
                    fontFamily: 'var(--font-sans)',
                    borderRadius: '20px'
                  }}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Days Per Week */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Workout Days Per Week
          </label>
          <select
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          >
            <option value="2">2 Days</option>
            <option value="3">3 Days</option>
            <option value="4">4 Days</option>
            <option value="5">5 Days</option>
            <option value="6">6 Days</option>
          </select>
        </div>

        {/* Session Duration */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Session Duration
          </label>
          <select
            value={sessionDuration}
            onChange={(e) => setSessionDuration(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          >
            <option value="20-min">20-30 minutes</option>
            <option value="45-min">30-45 minutes</option>
            <option value="60-min">45-60 minutes</option>
            <option value="90-min">60+ minutes</option>
          </select>
        </div>

        {/* Fitness Level */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Fitness Level
          </label>
          <select
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className="px-6 py-3 rounded transition-all flex items-center gap-2"
          style={{ 
            backgroundColor: 'var(--nutritrack-primary)',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            borderRadius: '4px',
            opacity: isSaving || saved ? 0.7 : 1
          }}
        >
          {saved ? (
            <>
              <CheckCircle2 size={18} />
              <span>Saved!</span>
            </>
          ) : (
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          )}
        </button>
      </div>
    </div>
  );
}
