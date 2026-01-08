export const dynamic = 'force-dynamic'

import InstallClient from '@/components/install-client';

export default function InstallPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <InstallClient />
    </div>
  );
}
