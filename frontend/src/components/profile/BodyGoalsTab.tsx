"use client"
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BodyGoalsTab() {
  const [age, setAge] = useState('32');
  const [height, setHeight] = useState('5\'6"');
  const [currentWeight, setCurrentWeight] = useState('169');
  const [targetWeight, setTargetWeight] = useState('160');
  const [goal, setGoal] = useState('lose-weight');
  const [timeline, setTimeline] = useState('3-months');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => setIsRecalculating(false), 2000);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-1">Body & Goals</h2>
      <p className="text-sm text-muted-foreground mb-6">Set your physical stats and fitness goals</p>

      <div className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g., 5'6&quot; or 168 cm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="current-weight">Current Weight (lbs)</Label>
            <Input
              id="current-weight"
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target-weight">Target Weight (lbs)</Label>
            <Input
              id="target-weight"
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Primary Goal</Label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose-weight">Lose Weight</SelectItem>
              <SelectItem value="gain-muscle">Gain Muscle</SelectItem>
              <SelectItem value="maintain">Maintain Weight</SelectItem>
              <SelectItem value="tone">Tone & Define</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Timeline</Label>
          <Select value={timeline} onValueChange={setTimeline}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-month">1 Month</SelectItem>
              <SelectItem value="3-months">3 Months</SelectItem>
              <SelectItem value="6-months">6 Months</SelectItem>
              <SelectItem value="1-year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-1">
          <Button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Recalculating...' : 'Recalculate My Plan'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will regenerate your diet and workout plans based on your updated goals
          </p>
        </div>
      </div>
    </div>
  );
}
