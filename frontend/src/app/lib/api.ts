import { Profile } from "@/types/profiles";
import axiosInstance from "./axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MealEntry {
  entry_id: string;
  day_of_week: number;
  day_name: string;
  meal_type: string;
  sort_order: number;
  recipe_name: string;
  recipe_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DayTotals {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
}

export interface WeekMealPlan {
  entries: MealEntry[];
  day_totals: Record<number, DayTotals>; // key is day_of_week (0 = Mon, 6 = Sun)
}

// ─── Meal Plan ────────────────────────────────────────────────────────────────

export const mealPlan = {
  /**
   * Fetch the full week meal plan for a user.
   * @param userId  - UUID of the user
   * @param weekStart - ISO date string (e.g. "2026-03-23")
   */
  getWeekPlan: async (userId: string, weekStart: string): Promise<WeekMealPlan> => {
    const { data } = await axiosInstance.get<{ data: WeekMealPlan }>("/api/v1/meal-plan/week-meal-plan", {
      params: { user_id: userId, week_start_date: weekStart },
    });
    return data.data;
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Placeholder — add functions as backend routes are built

export const dashboard = {
  // getSummary: async (userId: string): Promise<DashboardSummary> => { ... }
};

// ─── Workout ──────────────────────────────────────────────────────────────────

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
}

export interface WorkoutSession {
  session_name: string;
  category: string;
  duration: number;
  completed: boolean;
  exercises: WorkoutExercise[];
}

export interface WorkoutDay {
  day_name: string;
  is_rest_day: boolean;
  sessions: WorkoutSession[];
}

export const workout = {
  getWeekPlan: async (userId: string, weekStart: string): Promise<WorkoutDay[]> => {
    const { data } = await axiosInstance.get<{ data: WorkoutDay[] }>("/api/v1/workout/week-plan", {
      params: { user_id: userId, week_start_date: weekStart },
    });
    return data.data;
  },
};

// ─── Progress ─────────────────────────────────────────────────────────────────

export const progress = {
  // getLogs: async (userId: string): Promise<ProgressLog[]> => { ... }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  // login: async (email: string, password: string): Promise<AuthResponse> => { ... }
  // signup: async (payload: SignupPayload): Promise<AuthResponse> => { ... }
};

// Profile

export const profile = {
  getProfile: async (userId: string): Promise<Profile> => {
    const {data} = await axiosInstance.get<{data : Profile }> ("/api/v1/profile",{
      params: {user_id : userId}
    });
    return data.data
  }
}