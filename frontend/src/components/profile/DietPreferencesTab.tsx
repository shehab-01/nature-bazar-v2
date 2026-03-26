"use client"
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
    <div className="flex-1 bg-white rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-1">Diet Preferences</h2>
      <p className="text-sm text-muted-foreground mb-6">Customize your meal planning and dietary needs</p>

      <div className="space-y-5 max-w-lg">
        <div className="space-y-2">
          <Label>Dietary Restrictions</Label>
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
        </div>

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
              <SelectItem value="6">5-6 Small Meals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Preferred Cooking Time</Label>
          <Select value={cookingTime} onValueChange={setCookingTime}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15-min">Under 15 minutes</SelectItem>
              <SelectItem value="30-min">15-30 minutes</SelectItem>
              <SelectItem value="45-min">30-45 minutes</SelectItem>
              <SelectItem value="60-min">45-60 minutes</SelectItem>
            </SelectContent>
          </Select>
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
