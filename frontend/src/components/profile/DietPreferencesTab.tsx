"use client"
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

export function DietPreferencesTab() {
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['gluten-free']);
  const [culturalRestrictions, setCulturalRestrictions] = useState<string[]>([]);
  const [mealsPerDay, setMealsPerDay] = useState('4');
  const [mealTiming, setMealTiming] = useState('');
  const [cookingTime, setCookingTime] = useState('30-min');
  const [budget, setBudget] = useState('moderate');
  const [favoriteFoods, setFavoriteFoods] = useState('');
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

  const culturalOptions = [
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'hindu-vegetarian', label: 'Hindu Vegetarian' },
    { id: 'jain', label: 'Jain' },
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

  const toggleCultural = (id: string) => {
    if (culturalRestrictions.includes(id)) {
      setCulturalRestrictions(culturalRestrictions.filter(r => r !== id));
    } else {
      setCulturalRestrictions([...culturalRestrictions, id]);
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
    <div>
      <h2 className="text-lg font-bold mb-1">Diet Preferences</h2>
      <p className="text-sm text-muted-foreground mb-6">Customize your meal planning and dietary needs.</p>

      <Section title="Dietary Style" description="Your overall eating pattern and diet approach">
        <div className="flex flex-wrap gap-2">
          {restrictions.map((restriction) => {
            const isSelected = dietaryRestrictions.includes(restriction.id);
            return (
              <button
                key={restriction.id}
                onClick={() => toggleRestriction(restriction.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors text-sm px-4 py-1.5 rounded-full font-normal',
                    !isSelected && 'hover:bg-muted hover:text-foreground'
                  )}
                >
                  {restriction.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Cultural & Religious" description="Restrictions based on cultural or religious requirements">
        <div className="flex flex-wrap gap-2">
          {culturalOptions.map((option) => {
            const isSelected = culturalRestrictions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleCultural(option.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors text-sm px-4 py-1.5 rounded-full font-normal',
                    !isSelected && 'hover:bg-muted hover:text-foreground'
                  )}
                >
                  {option.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Meal Planning" description="How you prefer to structure your meals throughout the day">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>Meals Per Day</Label>
            <Select value={mealsPerDay} onValueChange={setMealsPerDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Meals</SelectItem>
                <SelectItem value="4">3 Meals + 1 Snack</SelectItem>
                <SelectItem value="5">3 Meals + 2 Snacks</SelectItem>
                <SelectItem value="6">5–6 Small Meals</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meal-timing">
              Meal Timing <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="meal-timing"
              type="text"
              value={mealTiming}
              onChange={(e) => setMealTiming(e.target.value)}
              placeholder="e.g., breakfast 8am, lunch 1pm, dinner 7pm"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Preferred Cooking Time</Label>
            <Select value={cookingTime} onValueChange={setCookingTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15-min">Under 15 minutes</SelectItem>
                <SelectItem value="30-min">15–30 minutes</SelectItem>
                <SelectItem value="45-min">30–45 minutes</SelectItem>
                <SelectItem value="60-min">45–60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Food Preferences & Budget" description="What you enjoy eating and how much you'd like to spend">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>Weekly Food Budget</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget (under $50/week)</SelectItem>
                <SelectItem value="moderate">Moderate ($50–$100/week)</SelectItem>
                <SelectItem value="comfortable">Comfortable ($100–$150/week)</SelectItem>
                <SelectItem value="flexible">Flexible (no limit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="favorite-foods">
              Foods You Love <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="favorite-foods"
              type="text"
              value={favoriteFoods}
              onChange={(e) => setFavoriteFoods(e.target.value)}
              placeholder="e.g., salmon, avocado, berries"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avoid-foods">
              Foods to Avoid <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="avoid-foods"
              type="text"
              value={avoidFoods}
              onChange={(e) => setAvoidFoods(e.target.value)}
              placeholder="e.g., mushrooms, shellfish"
            />
            <p className="text-xs text-muted-foreground">Separate multiple items with commas</p>
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
