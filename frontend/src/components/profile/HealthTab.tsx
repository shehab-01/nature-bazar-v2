"use client"
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { Health } from '@/types/profiles';

interface HealthTab {
  healthData : Health | null | undefined
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

export function HealthTab({healthData}: HealthTab) {
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const conditionOptions = [
    { id: 'diabetes-t1', label: 'Type 1 Diabetes' },
    { id: 'diabetes-t2', label: 'Type 2 Diabetes' },
    { id: 'hypertension', label: 'Hypertension' },
    { id: 'pcos', label: 'PCOS' },
    { id: 'hypothyroid', label: 'Hypothyroidism' },
    { id: 'hyperthyroid', label: 'Hyperthyroidism' },
    { id: 'ibs', label: 'IBS' },
    { id: 'celiac', label: 'Celiac Disease' },
    { id: 'heart-disease', label: 'Heart Disease' },
    { id: 'none', label: 'None' },
  ];

  const allergyOptions = [
    { id: 'gluten', label: 'Gluten' },
    { id: 'lactose', label: 'Lactose' },
    { id: 'nuts', label: 'Tree Nuts' },
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'soy', label: 'Soy' },
    { id: 'fish', label: 'Fish' },
  ];

  const toggleCondition = (id: string) => {
    if (id === 'none') {
      setConditions(['none']);
    } else {
      const filtered = conditions.filter(c => c !== 'none');
      if (conditions.includes(id)) {
        const updated = filtered.filter(c => c !== id);
        setConditions(updated.length === 0 ? ['none'] : updated);
      } else {
        setConditions([...filtered, id]);
      }
    }
  };

  const toggleAllergy = (id: string) => {
    if (allergies.includes(id)) {
      setAllergies(allergies.filter(a => a !== id));
    } else {
      setAllergies([...allergies, id]);
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

  useEffect(() => {
  if (healthData) {
    setConditions(healthData.medical_conditions);
    setOtherCondition(healthData.other_medical_condition ?? '');
    setMedications(healthData.medications ?? '');
    setAllergies(healthData.food_allergies);
    setOtherAllergy(healthData.other_food_allergy ?? '');
  }
}, [healthData]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Health & Medical</h2>
      <p className="text-sm text-muted-foreground mb-6">Help us personalize your plan around your health needs.</p>

      <Section title="Medical Conditions" description="Select any conditions so your plan can be adjusted accordingly">
        <div className="flex flex-wrap gap-2">
          {conditionOptions.map((option) => {
            const isSelected = conditions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleCondition(option.id)}
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
        <div className="space-y-1.5">
          <Label htmlFor="other-condition">Other condition</Label>
          <Input
            id="other-condition"
            type="text"
            value={otherCondition}
            onChange={(e) => setOtherCondition(e.target.value)}
            placeholder="Describe any other condition"
            className="max-w-sm"
          />
        </div>
      </Section>

      <Section title="Current Medications" description="Some medications affect nutrient absorption and metabolism">
        <div className="space-y-1.5">
          <Label htmlFor="medications">Medications</Label>
          <Input
            id="medications"
            type="text"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="e.g., metformin, levothyroxine"
            className="max-w-sm"
          />
          <p className="text-xs text-muted-foreground">Separate multiple medications with commas</p>
        </div>
      </Section>

      <Section title="Food Allergies & Intolerances" description="These will be strictly excluded from all meal suggestions">
        <div className="flex flex-wrap gap-2">
          {allergyOptions.map((option) => {
            const isSelected = allergies.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleAllergy(option.id)}
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
        <div className="space-y-1.5">
          <Label htmlFor="other-allergy">Other allergy or intolerance</Label>
          <Input
            id="other-allergy"
            type="text"
            value={otherAllergy}
            onChange={(e) => setOtherAllergy(e.target.value)}
            placeholder="e.g., sesame, mustard"
            className="max-w-sm"
          />
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
