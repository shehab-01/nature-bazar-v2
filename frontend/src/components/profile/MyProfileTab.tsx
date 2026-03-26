import { useState } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';

export function MyProfileTab() {
  const [name, setName] = useState('Sarah Johnson');
  const [email, setEmail] = useState('sarah.johnson@email.com');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

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
        My Profile
      </h2>

      {/* Avatar Upload */}
      <div className="mb-8">
        <label className="block">
          <div className="flex items-center gap-4">
            <div 
              className="w-24 h-24 rounded-full border-2 overflow-hidden flex items-center justify-center relative group cursor-pointer"
              style={{ borderColor: 'rgba(113, 113, 122, 0.2)' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(113, 113, 122, 0.1)' }}
                >
                  <Camera size={32} style={{ color: 'var(--nutritrack-neutral)' }} />
                </div>
              )}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={24} style={{ color: 'white' }} />
              </div>
            </div>
            <div>
              <div 
                className="text-sm mb-1"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
              >
                Profile Photo
              </div>
              <div 
                className="text-xs"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
              >
                Click to upload a new photo
              </div>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Name Field */}
      <div className="mb-6">
        <label 
          className="block text-sm mb-2"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
        >
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded border"
          style={{ 
            borderColor: 'rgba(113, 113, 122, 0.3)',
            fontFamily: 'var(--font-sans)',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Email Field */}
      <div className="mb-8">
        <label 
          className="block text-sm mb-2"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-text)' }}
        >
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded border"
          style={{ 
            borderColor: 'rgba(113, 113, 122, 0.3)',
            fontFamily: 'var(--font-sans)',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || saved}
        className="px-6 py-3 rounded transition-all flex items-center gap-2"
        style={{ 
          backgroundColor: 'var(--nutritrack-primary)',
          color: 'white',
          fontFamily: 'var(--font-sans)',
          borderRadius: '4px',
          opacity: isSaving || saved ? 0.7 : 1
        }}
      >
        {saved ? (
          <>
            <CheckCircle2 size={18} />
            <span>Saved!</span>
          </>
        ) : (
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        )}
      </button>
    </div>
  );
}
