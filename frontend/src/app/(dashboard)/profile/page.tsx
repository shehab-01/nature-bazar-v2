"use client"
import React, { useState } from 'react';
import { AccountTab } from '@/components/profile/AccountTab';
import { BodyGoalsTab } from '@/components/profile/BodyGoalsTab';
import { DietPreferencesTab } from '@/components/profile/DietPreferencesTab';
import { MyProfileTab } from '@/components/profile/MyProfileTab';
import { NotificationsTab } from '@/components/profile/NotificationsTab';
import { WorkoutPreferencesTab } from '@/components/profile/WorkoutPreferencesTab';
import { SettingsTabs } from '@/components/profile/SettingsTabs';

export type SettingsTab = 'profile' | 'body-goals' | 'diet' | 'workout' | 'notifications' | 'account';

export function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':       return <MyProfileTab />;
      case 'body-goals':    return <BodyGoalsTab />;
      case 'diet':          return <DietPreferencesTab />;
      case 'workout':       return <WorkoutPreferencesTab />;
      case 'notifications': return <NotificationsTab />;
      case 'account':       return <AccountTab />;
      default:              return <MyProfileTab />;
    }
  };

  return (
    <div className="flex-1 pb-20 lg:pb-0">
      <div className="px-6 md:px-12 py-8 md:py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
          >
            Settings
          </h1>
          <p
            className="text-lg"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
          >
            Manage your profile and preferences
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;