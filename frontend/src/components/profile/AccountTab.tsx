"use client"
import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function AccountTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = () => {
    if (newPassword === confirmPassword && currentPassword && newPassword) {
      setIsChangingPassword(true);
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordChanged(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordChanged(false), 3000);
      }, 800);
    }
  };

  const canChangePassword = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="flex-1 bg-white rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-1">Account</h2>
      <p className="text-sm text-muted-foreground mb-6">Manage your security and account settings</p>

      {/* Change Password */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Change Password</h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!passwordMismatch}
            />
            {passwordMismatch && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
          <Button
            onClick={handlePasswordChange}
            disabled={!canChangePassword || isChangingPassword || passwordChanged}
            className="gap-2"
          >
            {passwordChanged ? (
              <>
                <CheckCircle2 className="size-4" />
                Password Changed!
              </>
            ) : isChangingPassword ? 'Updating...' : 'Change Password'}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Delete Account */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold">Delete Account</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-1"
          >
            Delete Account
          </Button>
        ) : (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-3 max-w-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Are you sure?</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm">
                Yes, delete my account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
