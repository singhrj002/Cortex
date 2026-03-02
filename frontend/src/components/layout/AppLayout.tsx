'use client';

import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import VoiceAssistant from '../VoiceAssistant';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar - Overlay */}
      {isMobileMenuOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.700"
          zIndex={20}
          onClick={handleMobileMenuToggle}
        />
      )}

      {/* Mobile Sidebar - Content */}
      <Box
        position="fixed"
        top="0"
        left="0"
        bottom="0"
        w="64"
        bg="background.surface"
        zIndex={30}
        transform={isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'}
        transition="transform 0.3s ease"
        display={{ base: 'block', md: 'none' }}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex="1" overflow="hidden">
        <TopBar onMenuClick={handleMobileMenuToggle} />

        <Box
          as="main"
          pt="16"
          pl={{ base: 0, md: '64' }}
          flex="1"
          overflow="auto"
          bg="background.primary"
          transition="padding-left 0.3s ease"
        >
          <Box maxW="7xl" mx="auto" p={4}>
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Voice Assistant - Available on all pages */}
      <VoiceAssistant />
    </Flex>
  );
}