"use client"
import { User, Target, Utensils, Dumbbell, Bell, Settings } from 'lucide-react';
import { SettingsTab } from '@/app/(dashboard)/profile/page';
import { cn } from '@/lib/utils';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

const tabs = [
  { id: 'profile' as SettingsTab, label: 'My Profile', icon: User },
  { id: 'body-goals' as SettingsTab, label: 'Body & Goals', icon: Target },
  { id: 'diet' as SettingsTab, label: 'Diet Preferences', icon: Utensils },
  { id: 'workout' as SettingsTab, label: 'Workout Preferences', icon: Dumbbell },
  { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
  { id: 'account' as SettingsTab, label: 'Account', icon: Settings },
];

export function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  return (
    <nav className="lg:w-56 flex-shrink-0">
      <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full text-left',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden lg:inline">{tab.label}</span>
              <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
