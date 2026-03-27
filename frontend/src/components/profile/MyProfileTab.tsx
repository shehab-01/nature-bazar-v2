"use client"
import { useState } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b last:border-b-0">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">
        {children}
      </div>
    </div>
  );
}

export function MyProfileTab() {
  const [name, setName] = useState('Sarah Johnson');
  const [email, setEmail] = useState('sarah.johnson@email.com');
  const [sex, setSex] = useState('female');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
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
    <div>
      <h2 className="text-lg font-bold mb-1">My Profile</h2>
      <p className="text-sm text-muted-foreground mb-6">Update your personal information.</p>

      <Section title="Profile Photo" description="Update your profile picture">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer group relative">
            <Avatar className="size-16">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-base bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="size-4 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
          </label>
          <div>
            <p className="text-sm font-medium">Click to upload a new photo</p>
            <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG up to 5MB</p>
          </div>
        </div>
      </Section>

      <Section title="Personal Information" description="Your name and contact details">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-sm" />
        </div>
        <div className="space-y-1.5">
          <Label>Sex</Label>
          <Select value={sex} onValueChange={setSex}>
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other / Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving || saved} className="gap-2">
          {saved ? <><CheckCircle2 className="size-4" />Saved!</> : isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
