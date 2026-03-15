import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: string;
  completed: boolean;
}

export function TodaysMeals() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Oatmeal with berries & almonds', time: 'Breakfast', calories: '350 cal', completed: false },
    { id: '2', name: 'Grilled chicken salad', time: 'Lunch', calories: '450 cal', completed: false },
    { id: '3', name: 'Greek yogurt & honey', time: 'Snack', calories: '150 cal', completed: false },
    { id: '4', name: 'Salmon with quinoa & veggies', time: 'Dinner', calories: '550 cal', completed: false },
  ]);

  const toggleMeal = (id: string) => {
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, completed: !meal.completed } : meal
    ));
  };

  return (
    <div 
      className="bg-white rounded p-6 border"
      style={{ 
        borderColor: 'rgba(113, 113, 122, 0.2)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px'
      }}
    >
      <h3 
        className="text-xl mb-4"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
      >
        Today&apos;s Meals
      </h3>

      <div className="space-y-3">
        {meals.map((meal) => (
          <div 
            key={meal.id}
            className="flex items-center gap-3 py-2"
          >
            <Checkbox.Root
              checked={meal.completed}
              onCheckedChange={() => toggleMeal(meal.id)}
              className="flex items-center justify-center w-5 h-5 border rounded transition-colors"
              style={{ 
                borderColor: meal.completed ? 'var(--nutritrack-primary)' : 'var(--nutritrack-neutral)',
                backgroundColor: meal.completed ? 'var(--nutritrack-primary)' : 'transparent',
                borderRadius: '4px'
              }}
            >
              <Checkbox.Indicator>
                <Check size={14} color="white" />
              </Checkbox.Indicator>
            </Checkbox.Root>

            <div className="flex-1 min-w-0">
              <div 
                className="mb-0.5"
                style={{ 
                  fontFamily: 'var(--font-sans)', 
                  color: meal.completed ? 'var(--nutritrack-neutral)' : 'var(--nutritrack-text)',
                  textDecoration: meal.completed ? 'line-through' : 'none'
                }}
              >
                {meal.name}
              </div>
              <div 
                className="text-xs"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
              >
                {meal.time} • {meal.calories}
              </div>
            </div>

            <button 
              className="p-2 hover:bg-opacity-10 hover:bg-gray-500 rounded transition-colors"
              style={{ borderRadius: '4px' }}
            >
              <ArrowRightLeft size={16} style={{ color: 'var(--nutritrack-neutral)' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
