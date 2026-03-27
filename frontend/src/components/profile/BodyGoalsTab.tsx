"use client"
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export function BodyGoalsTab() {
  const [age, setAge] = useState('32');
  const [height, setHeight] = useState('5\'6"');
  const [currentWeight, setCurrentWeight] = useState('169');
  const [targetWeight, setTargetWeight] = useState('160');
  const [targetBodyFat, setTargetBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [hips, setHips] = useState('');
  const [thighs, setThighs] = useState('');
  const [goal, setGoal] = useState('lose-weight');
  const [timeline, setTimeline] = useState('3-months');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => setIsRecalculating(false), 2000);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Body & Goals</h2>
      <p className="text-sm text-muted-foreground mb-6">Set your physical stats and fitness goals.</p>

      <Section title="Physical Stats" description="Your current measurements used to calculate calorie and macro targets">
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height">Height</Label>
            <Input id="height" type="text" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 5'6&quot; or 168 cm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="current-weight">Current Weight (lbs)</Label>
            <Input id="current-weight" type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target-weight">Target Weight (lbs)</Label>
            <Input id="target-weight" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="target-body-fat">
              Target Body Fat % <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input id="target-body-fat" type="number" value={targetBodyFat} onChange={(e) => setTargetBodyFat(e.target.value)} placeholder="e.g., 20" />
          </div>
        </div>
      </Section>

      <Section title="Body Measurements" description="Track key measurements in inches to monitor body composition changes">
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="waist">Waist</Label>
            <Input id="waist" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g., 32" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chest">Chest</Label>
            <Input id="chest" type="number" value={chest} onChange={(e) => setChest(e.target.value)} placeholder="e.g., 38" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="arms">Arms</Label>
            <Input id="arms" type="number" value={arms} onChange={(e) => setArms(e.target.value)} placeholder="e.g., 13" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hips">Hips</Label>
            <Input id="hips" type="number" value={hips} onChange={(e) => setHips(e.target.value)} placeholder="e.g., 40" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="thighs">Thighs</Label>
            <Input id="thighs" type="number" value={thighs} onChange={(e) => setThighs(e.target.value)} placeholder="e.g., 22" />
          </div>
        </div>
      </Section>

      <Section title="Goals & Timeline" description="Define what you want to achieve and by when">
        <div className="space-y-4 max-w-sm">
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
                <SelectItem value="health-condition">Health Condition Management</SelectItem>
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
        </div>
      </Section>

      <div className="flex items-center justify-between pt-6">
        <p className="text-xs text-muted-foreground">Recalculating will regenerate your diet and workout plans</p>
        <Button onClick={handleRecalculate} disabled={isRecalculating} className="gap-2">
          <RefreshCw className={`size-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalculating...' : 'Recalculate My Plan'}
        </Button>
      </div>
    </div>
  );
}
