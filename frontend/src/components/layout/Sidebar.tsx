'use client';

import {
  Box,
  Flex,
  Text,
  Icon,
  VStack,
  HStack,
  Divider,
  Avatar,
} from '@chakra-ui/react';
import {
  FiActivity,
  FiGitPullRequest,
  FiUsers,
  FiAlertTriangle,
  FiSettings,
  FiMail,
  FiTrendingUp,
  FiExternalLink,
  FiGitCommit,
  FiHeart,
  FiCalendar,
  FiMic,
  FiCpu,
} from 'react-icons/fi';
import { FaSlack } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const SidebarItems = [
  { name: 'Email', icon: FiMail, path: '/email', badge: 3 },
  { name: 'Slack', icon: FaSlack, path: '/slack', badge: 7 },
  { name: 'Graph', icon: FiActivity, path: '/graph' },
  { name: 'Decisions', icon: FiGitPullRequest, path: '/decisions' },
  { name: 'Org Map', icon: FiUsers, path: '/org-map' },
  { name: 'Health', icon: FiHeart, path: '/health', badge: 5 },
  { name: 'Briefings', icon: FiMic, path: '/briefings', badge: 4 },
  { name: 'Calendar', icon: FiCalendar, path: '/calendar' },
  { name: 'Conflicts', icon: FiAlertTriangle, path: '/conflicts', badge: 2 },
  { name: 'Shadow Topics', icon: FiTrendingUp, path: '/shadow-topics', badge: 3 },
  { name: 'JIRA', icon: FiExternalLink, path: '/jira' },
  { name: 'Git', icon: FiGitCommit, path: '/git', badge: 4 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      position="fixed"
      left="0"
      w="64"
      h="full"
      bg="background.surface"
      borderRight="1px"
      borderColor="border.subtle"
      p={4}
      overflowY="auto"
      display={{ base: 'none', md: 'block' }}
    >
      <Flex direction="column" h="full">
        <Box mb={6}>
          <HStack spacing={2.5} align="center">
            <Box
              w="28px" h="28px" borderRadius="8px" flexShrink={0}
              bgGradient="linear(135deg, #7C3AED, #4C1D95)"
              display="flex" alignItems="center" justifyContent="center"
              boxShadow="0 0 0 1px rgba(167,139,250,0.2), 0 4px 14px rgba(109,40,217,0.35)"
            >
              <Icon as={FiCpu} color="white" boxSize={3.5} />
            </Box>
            <Box lineHeight="1">
              <Text
                fontSize="md"
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
                letterSpacing="0.1em"
                textTransform="uppercase"
                mt={0.5}
                lineHeight="1"
              >
                Organizational Intelligence
              </Text>
            </Box>
          </HStack>
        </Box>

        <VStack as="ul" spacing={1} align="stretch" mb={8}>
          {SidebarItems.map((item) => (
            <Box as="li" key={item.path}>
              <Link href={item.path} style={{ textDecoration: 'none', display: 'block' }}>
                <Flex
                  align="center"
                  p={3}
                  borderRadius="lg"
                  cursor="pointer"
                  bg={pathname === item.path ? 'rgba(139,92,246,0.12)' : 'transparent'}
                  color={pathname === item.path ? 'text.primary' : 'text.secondary'}
                  _hover={{
                    bg: pathname === item.path ? 'rgba(139,92,246,0.15)' : 'background.raised',
                    color: 'text.primary',
                  }}
                >
                  <Icon as={item.icon} boxSize={5} mr={3} />
                  <Text>{item.name}</Text>
                  {item.badge && (
                    <Flex
                      ml="auto"
                      borderRadius="full"
                      bg={pathname === item.path ? 'semantic.info' : 'background.raised'}
                      color={pathname === item.path ? 'white' : 'text.secondary'}
                      w="6"
                      h="6"
                      justify="center"
                      align="center"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {item.badge}
                    </Flex>
                  )}
                </Flex>
              </Link>
            </Box>
          ))}
        </VStack>

        <Box as="section" mt="auto">
          <Divider mb={4} />
          <Box>
            <Flex align="center" p={3}>
              <Avatar size="sm" name="Grace Liu" mr={2} />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Grace Liu</Text>
                <Text fontSize="xs" color="text.secondary">Chief Technology Officer</Text>
              </Box>
              <Icon as={FiSettings} ml="auto" color="text.secondary" cursor="pointer" />
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}