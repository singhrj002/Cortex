'use client';

import {
  Flex,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Badge,
  Avatar,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiCpu,
} from 'react-icons/fi';
import { useState } from 'react';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications] = useState([
    { id: 1, title: 'New task assigned', read: false },
    { id: 2, title: 'Decision requires your input', read: false },
    { id: 3, title: 'Meeting notes ready for review', read: true },
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      width="full"
      zIndex={10}
      h="16"
      bg="background.surface"
      borderBottom="1px"
      borderColor="border.subtle"
      px={4}
      align="center"
      justify="space-between"
    >
      {/* ── Centered brand mark ── */}
      <Box
        position="absolute"
        left="50%"
        transform="translateX(-50%)"
        pointerEvents="none"
        userSelect="none"
      >
        <HStack spacing={2.5} align="center">
          <Box
            w="28px" h="28px" borderRadius="8px" flexShrink={0}
            bgGradient="linear(135deg, #7C3AED, #4C1D95)"
            display="flex" alignItems="center" justifyContent="center"
            boxShadow="0 0 0 1px rgba(167,139,250,0.2), 0 4px 14px rgba(109,40,217,0.4)"
          >
            <Icon as={FiCpu} color="white" boxSize={3.5} />
          </Box>
          <Box lineHeight="1">
            <Text
              fontSize="lg"
              fontWeight="800"
              letterSpacing="-0.04em"
              lineHeight="1"
              bgGradient="linear(to-r, #C4B5FD, #8B5CF6)"
              bgClip="text"
            >
              Cortex
            </Text>
            <Text
              fontSize="8px"
              color="text.disabled"
              letterSpacing="0.12em"
              textTransform="uppercase"
              mt={0.5}
              lineHeight="1"
            >
              Organizational Intelligence
            </Text>
          </Box>
        </HStack>
      </Box>
      <HStack spacing={4}>
        <IconButton
          icon={<FiMenu />}
          variant="ghost"
          aria-label="Open menu"
          display={{ base: 'flex', md: 'none' }}
          onClick={onMenuClick}
        />

        <InputGroup maxW="md" ml={{ base: 0, md: 4 }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="text.muted" />
          </InputLeftElement>
          <Input 
            placeholder="Search decisions, tasks, and more..." 
            bg="background.raised"
            border="none"
            _focus={{
              boxShadow: 'none',
              bg: 'background.raised',
              borderColor: 'background.raised',
            }}
          />
        </InputGroup>
      </HStack>

      <HStack spacing={4}>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={
              <Box position="relative">
                <FiBell />
                {unreadCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    right="-1"
                    colorScheme="red"
                    borderRadius="full"
                    w="4"
                    h="4"
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Box>
            }
            variant="ghost"
            aria-label="Notifications"
          />
          <MenuList bg="background.surface" borderColor="background.raised">
            <Text p={2} fontWeight="medium">Notifications</Text>
            {notifications.map(notification => (
              <MenuItem 
                key={notification.id}
                bg={notification.read ? 'transparent' : 'whiteAlpha.50'}
                _hover={{
                  bg: 'background.raised',
                }}
              >
                <Text>{notification.title}</Text>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiUser />}
            variant="ghost"
            aria-label="User menu"
          />
          <MenuList bg="background.surface" borderColor="background.raised">
            <MenuItem icon={<FiUser />} command="P">Profile</MenuItem>
            <MenuItem icon={<FiSettings />} command="⌘S">Settings</MenuItem>
            <MenuItem icon={<FiHelpCircle />} command="⌘H">Help</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}