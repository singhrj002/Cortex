'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import theme from '@/theme';
// import { NotificationProvider } from '@/lib/websocket'; // Temporarily disabled

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider>
        <ChakraProvider theme={theme}>
          {/* Temporarily disabled WebSocket - will implement later */}
          {/* <NotificationProvider userEmail="demo@example.com"> */}
            {children}
          {/* </NotificationProvider> */}
        </ChakraProvider>
      </CacheProvider>
    </QueryClientProvider>
  );
}