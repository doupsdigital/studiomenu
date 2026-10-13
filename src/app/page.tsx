import { SalesLandingPage } from '@/components/sales/SalesLandingPage';
import { FbclidTracker } from '@/components/sales/FbclidTracker';
import { PostHogTracker } from '@/components/sales/PostHogTracker';

export default function StudioMenuLandingPage() {
  return (
    <>
      <FbclidTracker />
      <PostHogTracker />
      <SalesLandingPage />
    </>
  );
}
