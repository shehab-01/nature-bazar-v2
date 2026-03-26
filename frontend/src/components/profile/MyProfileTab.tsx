"use client"
import { useState } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex-1 bg-white rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-1">My Profile</h2>
      <p className="text-sm text-muted-foreground mb-6">Update your personal information</p>

      {/* Avatar Upload */}
      <div className="flex items-center gap-4 mb-6">
        <label className="cursor-pointer group relative">
          <Avatar className="size-20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="size-5 text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="sr-only"
          />
        </label>
        <div>
          <p className="text-sm font-medium">Profile Photo</p>
          <p className="text-sm text-muted-foreground">Click to upload a new photo</p>
        </div>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || saved}
          className="gap-2 mt-2"
        >
          {saved ? (
            <>
              <CheckCircle2 className="size-4" />
              Saved!
            </>
          ) : isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
