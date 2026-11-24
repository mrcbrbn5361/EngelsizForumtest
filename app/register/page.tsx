import WriteLockNotice from '@/components/layout/write-lock-notice';

/**
 * Registration is closed while the forum is being renewed.
 */
export default function RegisterPage() {
  return (
    <div className="w-full">
      <WriteLockNotice title="Yeni kayıt şimdilik kapalı" headingLevel={1} />
    </div>
  );
}
