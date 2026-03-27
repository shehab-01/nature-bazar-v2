"use client"
import React, { useState } from 'react';
import { AccountTab } from '@/components/profile/AccountTab';
import { BodyGoalsTab } from '@/components/profile/BodyGoalsTab';
import { DietPreferencesTab } from '@/components/profile/DietPreferencesTab';
import { HealthTab } from '@/components/profile/HealthTab';
import { MyProfileTab } from '@/components/profile/MyProfileTab';
import { NotificationsTab } from '@/components/profile/NotificationsTab';
import { WorkoutPreferencesTab } from '@/components/profile/WorkoutPreferencesTab';
import { SettingsTabs } from '@/components/profile/SettingsTabs';

export type SettingsTab = 'profile' | 'body-goals' | 'health' | 'diet' | 'workout' | 'notifications' | 'account';

export function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':       return <MyProfileTab />;
      case 'body-goals':    return <BodyGoalsTab />;
      case 'health':        return <HealthTab />;
      case 'diet':          return <DietPreferencesTab />;
      case 'workout':       return <WorkoutPreferencesTab />;
      case 'notifications': return <NotificationsTab />;
      case 'account':       return <AccountTab />;
      default:              return <MyProfileTab />;
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 md:px-8 py-6 md:py-8 w-full">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl tracking-tight font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your profile and preferences</p>
      </div>

      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-8 pb-8">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
