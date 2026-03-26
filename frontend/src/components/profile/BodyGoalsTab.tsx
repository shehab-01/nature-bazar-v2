import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

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
    setTimeout(() => {
      setIsRecalculating(false);
    }, 2000);
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
        Body & Goals
      </h2>

      <div className="space-y-6">
        {/* Age */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Height */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Height
          </label>
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g., 5'6&quot; or 168 cm"
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Current Weight */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Current Weight (lbs)
          </label>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Target Weight */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Target Weight (lbs)
          </label>
          <input
            type="number"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Goal */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Primary Goal
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          >
            <option value="lose-weight">Lose Weight</option>
            <option value="gain-muscle">Gain Muscle</option>
            <option value="maintain">Maintain Weight</option>
            <option value="tone">Tone & Define</option>
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
          >
            Timeline
          </label>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full px-4 py-3 rounded border"
            style={{ 
              borderColor: 'rgba(113, 113, 122, 0.3)',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px'
            }}
          >
            <option value="1-month">1 Month</option>
            <option value="3-months">3 Months</option>
            <option value="6-months">6 Months</option>
            <option value="1-year">1 Year</option>
          </select>
        </div>
      </div>

      {/* Recalculate Button */}
      <div className="mt-8">
        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="px-6 py-3 rounded transition-all flex items-center gap-2"
          style={{ 
            backgroundColor: 'var(--nutritrack-primary)',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            borderRadius: '4px',
            opacity: isRecalculating ? 0.7 : 1
          }}
        >
          <RefreshCw size={18} className={isRecalculating ? 'animate-spin' : ''} />
          <span>{isRecalculating ? 'Recalculating...' : 'Recalculate My Plan'}</span>
        </button>
        <p 
          className="text-sm mt-2"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
        >
          This will regenerate your diet and workout plans based on your updated goals
        </p>
      </div>
    </div>
  );
}