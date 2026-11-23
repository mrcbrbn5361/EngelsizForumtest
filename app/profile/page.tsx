import WriteLockNotice from '@/components/layout/write-lock-notice';

/**
 * Profile editing is closed while the forum is being renewed.
 */
export default function ProfileManagementPage() {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-xl font-bold text-white mb-4">Profil</h1>
      <WriteLockNotice title="Profil düzenleme şimdilik kapalı" />
    </div>
  );
}
