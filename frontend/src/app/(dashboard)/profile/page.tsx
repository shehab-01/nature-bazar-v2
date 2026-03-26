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
    <div className="flex flex-col flex-1 px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto w-full min-h-0">
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl tracking-tight font-display">Settings</h1>
        <p className="text-muted-foreground mt-1 ">Manage your profile and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 items-stretch">
        <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 min-w-0 flex">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
