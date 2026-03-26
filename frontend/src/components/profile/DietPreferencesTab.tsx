import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function DietPreferencesTab() {
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['gluten-free']);
  const [mealsPerDay, setMealsPerDay] = useState('4');
  const [cookingTime, setCookingTime] = useState('30-min');
  const [avoidFoods, setAvoidFoods] = useState('mushrooms, olives');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const restrictions = [
    { id: 'none', label: 'No Restrictions' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'keto', label: 'Keto' },
    { id: 'paleo', label: 'Paleo' },
  ];

  const toggleRestriction = (id: string) => {
    if (id === 'none') {
      setDietaryRestrictions(['none']);
    } else {
      const filtered = dietaryRestrictions.filter(r => r !== 'none');
      if (dietaryRestrictions.includes(id)) {
        const updated = filtered.filter(r => r !== id);
        setDietaryRestrictions(updated.length === 0 ? ['none'] : updated);
      } else {
        setDietaryRestrictions([...filtered, id]);
      }
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
        Diet Preferences
      </h2>

      <div className="space-y-6">
        {/* Dietary Restrictions */}
        <div>
          <label 
            className="block text-sm mb-3"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Dietary Restrictions
          </label>
          <div className="flex flex-wrap gap-2">
            {restrictions.map((restriction) => {
              const isSelected = dietaryRestrictions.includes(restriction.id);
              return (
                <button
                  key={restriction.id}
                  onClick={() => toggleRestriction(restriction.id)}
                  className="px-4 py-2 rounded border transition-all"
                  style={{ 
                    borderColor: isSelected ? 'var(--nutritrack-primary)' : 'rgba(113, 113, 122, 0.3)',
                    backgroundColor: isSelected ? 'var(--nutritrack-highlight)' : 'transparent',
                    color: isSelected ? 'var(--nutritrack-primary)' : 'var(--nutritrack-neutral)',
                    fontFamily: 'var(--font-sans)',
                    borderRadius: '20px'
                  }}
                >
                  {restriction.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meals Per Day */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Meals Per Day
          </label>
          <select
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          >
            <option value="3">3 Meals</option>
            <option value="4">3 Meals + 1 Snack</option>
            <option value="5">3 Meals + 2 Snacks</option>
            <option value="6">5-6 Small Meals</option>
          </select>
        </div>

        {/* Cooking Time */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Preferred Cooking Time
          </label>
          <select
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          >
            <option value="15-min">Under 15 minutes</option>
            <option value="30-min">15-30 minutes</option>
            <option value="45-min">30-45 minutes</option>
            <option value="60-min">45-60 minutes</option>
          </select>
        </div>

        {/* Foods to Avoid */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Foods to Avoid (Optional)
          </label>
          <input
            type="text"
            value={avoidFoods}
            onChange={(e) => setAvoidFoods(e.target.value)}
            placeholder="e.g., mushrooms, shellfish"
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          />
          <p 
            className="text-xs mt-1"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
          >
            Separate multiple items with commas
          </p>
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
