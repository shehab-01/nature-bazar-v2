"use client"
import { SettingsTab } from '@/app/(dashboard)/profile/page';
import { cn } from '@/lib/utils';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'profile',       label: 'My Profile' },
  { id: 'body-goals',    label: 'Body & Goals' },
  { id: 'health',        label: 'Health' },
  { id: 'diet',          label: 'Diet' },
  { id: 'workout',       label: 'Workout' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'account',       label: 'Account' },
];

export function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  return (
    <div className="border-b overflow-x-auto">
      <nav className="flex gap-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
