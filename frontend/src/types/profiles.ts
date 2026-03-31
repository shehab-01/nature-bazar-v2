
export interface User {
  id: string;
  name: string;
  email: string;
  sex: "male" | "female" | "other";
  avatar_url: string | null;
  unit_preference: "metric" | "imperial";
  created_at: string;
}

export interface BodyGoals {
  height_cm: string;
  current_weight_kg: string;
  target_weight_kg: string;
  target_body_fat_pct: string | null;
  age: number;
  waist_cm: string;
  chest_cm: string;
  arms_cm: string;
  hips_cm: string;
  thighs_cm: string;
  primary_goal: "lose_weight" | "gain_muscle" | "maintain" | "improve_fitness";
  timeline: string;
  unit_preference: "metric" | "imperial";
}

export interface Health {
  medical_conditions: string[];
  other_medical_condition: string | null;
  medications: string | null;
  food_allergies: string[];
  other_food_allergy: string | null;
  updated_at: string;
}

export interface DietPreferences {
  dietary_styles: string[];
  cultural_restrictions: string[];
  meals_per_day: string;
  meal_timing: string | null;
  preferred_cooking_time: string;
  weekly_food_budget: "low" | "moderate" | "high";
  foods_you_love: string | null;
  foods_to_avoid: string | null;
  updated_at: string;
}

export interface WorkoutPreferences {
  workout_styles: string[];
  fitness_level: "beginner" | "intermediate" | "advanced";
  workout_days_per_week: number;
  session_duration: string;
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active";
  avg_sleep_hours: string;
  stress_level: "low" | "moderate" | "high";
  updated_at: string;
}

export interface NotificationPreferences {
  meal_reminders: boolean;
  workout_reminders: boolean;
  weekly_progress_summary: boolean;
  updated_at: string;
}

export interface Profile {
  user: User;
  body_goals: BodyGoals;
  health: Health;
  diet_preferences: DietPreferences;
  workout_preferences: WorkoutPreferences;
  notification_preferences: NotificationPreferences;
}