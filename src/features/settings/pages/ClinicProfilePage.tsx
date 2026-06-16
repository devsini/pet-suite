import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { FileUpload } from '@/components/common/FileUpload';
import { useClinicProfile, useUpdateClinicProfile } from '../settings.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const emptyProfile = {
  name: '',
  address: '',
  phone: '',
  email: '',
  description: '',
  logoUrl: ''
};

export default function ClinicProfilePage() {
  useDocumentTitle('Clinic Profile');
  const { data, isLoading } = useClinicProfile();
  const updateProfile = useUpdateClinicProfile();
  const [profile, setProfile] = useState({ ...emptyProfile });
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setProfile({
        name: data.name ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        description: data.description ?? '',
        logoUrl: data.logoUrl ?? ''
      });
      setLogoPreview(data.logoUrl ?? undefined);
    }
  }, [data]);

  const canSave = useMemo(
    () => !!profile.name && !!profile.address && !!profile.phone && !!profile.email,
    [profile]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Clinic Profile" description="Manage clinic information and branding." />
      <Card className="space-y-6 p-6 rounded-2xl">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Clinic Name</label>
              <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="PetCare Clinic" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <Input value={profile.address} onChange={(event) => setProfile({ ...profile, address: event.target.value })} placeholder="123 Main Street" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <Input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="(123) 456-7890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <Input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} type="email" placeholder="hello@petcare.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <Textarea
                value={profile.description}
                onChange={(event) => setProfile({ ...profile, description: event.target.value })}
                placeholder="Describe your clinic, services, and values."
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => updateProfile.mutate(profile)} disabled={!canSave || updateProfile.isLoading}>
                {updateProfile.isLoading ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Clinic logo</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Upload a logo for the clinic to display in invoices and communications.</p>
            </div>
            <FileUpload
              bucket="clinic-assets"
              storagePath="clinic-logo"
              label="Clinic logo"
              description="Click or drag a file to upload a logo image."
              onUpload={(url) => {
                setProfile({ ...profile, logoUrl: url });
                setLogoPreview(url);
              }}
            />
            {logoPreview ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Logo preview</p>
                <img src={logoPreview} alt="Clinic logo preview" className="mt-4 h-40 w-full object-contain" />
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
