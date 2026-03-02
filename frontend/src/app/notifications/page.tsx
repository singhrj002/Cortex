import { Suspense } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import dynamicImport from 'next/dynamic';

// This is a special Next.js configuration export
export const dynamic = 'force-dynamic';

// Import the client component with no SSR
const NotificationsContent = dynamicImport(
  () => import('./notifications-content'),
  { ssr: false }
);

// Loading fallback component
const LoadingFallback = () => (
  <Box p={8} display="flex" justifyContent="center">
    <Spinner size="xl" />
  </Box>
);

export default async function NotificationsPage() {
  // Server component that acts as a shell and loads the client component
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotificationsContent />
    </Suspense>
  );
}
