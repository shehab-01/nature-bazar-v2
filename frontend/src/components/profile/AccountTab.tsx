import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

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

  return (
    <div 
      className="bg-white rounded p-6 md:p-8 border"
      style={{ 
        borderColor: 'rgba(113, 113, 122, 0.2)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px'
      }}
    >
      <h2 
        className="text-2xl mb-6"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
      >
        Account
      </h2>

      {/* Change Password Section */}
      <div className="mb-8 pb-8 border-b" style={{ borderColor: 'rgba(113, 113, 122, 0.15)' }}>
        <h3 
          className="text-lg mb-4"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
        >
          Change Password
        </h3>

        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
            >
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded border"
              style={{ 
                borderColor: 'rgba(113, 113, 122, 0.3)',
                fontFamily: 'var(--font-sans)',
                borderRadius: '4px'
              }}
            />
          </div>

          {/* New Password */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
            >
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded border"
              style={{ 
                borderColor: 'rgba(113, 113, 122, 0.3)',
                fontFamily: 'var(--font-sans)',
                borderRadius: '4px'
              }}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label 
              className="block text-sm mb-2"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded border"
              style={{ 
                borderColor: 'rgba(113, 113, 122, 0.3)',
                fontFamily: 'var(--font-sans)',
                borderRadius: '4px'
              }}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p 
                className="text-xs mt-1"
                style={{ fontFamily: 'var(--font-sans)', color: '#DC2626' }}
              >
                Passwords do not match
              </p>
            )}
          </div>

          {/* Change Password Button */}
          <button
            onClick={handlePasswordChange}
            disabled={!canChangePassword || isChangingPassword || passwordChanged}
            className="px-6 py-3 rounded transition-all flex items-center gap-2"
            style={{ 
              backgroundColor: canChangePassword ? 'var(--nutritrack-primary)' : 'rgba(113, 113, 122, 0.3)',
              color: 'white',
              fontFamily: 'var(--font-sans)',
              borderRadius: '4px',
              cursor: canChangePassword ? 'pointer' : 'not-allowed',
              opacity: isChangingPassword || passwordChanged ? 0.7 : 1
            }}
          >
            {passwordChanged ? (
              <>
                <CheckCircle2 size={18} />
                <span>Password Changed!</span>
              </>
            ) : (
              <span>{isChangingPassword ? 'Updating...' : 'Change Password'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Delete Account Section */}
      <div>
        <h3 
          className="text-lg mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
        >
          Delete Account
        </h3>
        <p 
          className="text-sm mb-4"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
        >
          Permanently delete your account and all associated data
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm underline transition-opacity hover:opacity-70"
            style={{ fontFamily: 'var(--font-sans)', color: '#DC2626' }}
          >
            Delete my account
          </button>
        ) : (
          <div 
            className="p-4 rounded border"
            style={{ 
              borderColor: '#DC2626',
              backgroundColor: 'rgba(220, 38, 38, 0.05)',
              borderRadius: '6px'
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div 
                  className="mb-1"
                  style={{ fontFamily: 'var(--font-sans)', color: '#DC2626' }}
                >
                  Are you sure?
                </div>
                <p 
                  className="text-sm"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
                >
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded border transition-all text-sm"
                style={{ 
                  borderColor: 'rgba(113, 113, 122, 0.3)',
                  color: 'var(--nutritrack-neutral)',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded transition-all text-sm"
                style={{ 
                  backgroundColor: '#DC2626',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: '4px'
                }}
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
