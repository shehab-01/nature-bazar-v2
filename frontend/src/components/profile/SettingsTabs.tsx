import { User, Target, Utensils, Dumbbell, Bell, Settings } from 'lucide-react';
// import { SettingsTab } from '../../pages/ProfileSettingsPage';
import { SettingsTab } from '@/app/(dashboard)/profile/page';

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
    <div className="lg:w-64 flex-shrink-0">
      <div 
        className="bg-white rounded p-2 border"
        style={{ 
          borderColor: 'rgba(113, 113, 122, 0.2)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded transition-all"
              style={{ 
                backgroundColor: isActive ? 'var(--nutritrack-highlight)' : 'transparent',
                color: isActive ? 'var(--nutritrack-primary)' : 'var(--nutritrack-neutral)',
                fontFamily: 'var(--font-sans)',
                borderRadius: '6px'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
