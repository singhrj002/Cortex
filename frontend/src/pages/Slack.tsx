'use client';

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Divider,
  Icon,
  Button,
  useColorModeValue,
  Tag,
  Spacer,
} from '@chakra-ui/react';
import { FiSearch, FiSend, FiHash, FiLock, FiStar, FiChevronDown, FiPaperclip } from 'react-icons/fi';

// Mock data for channels and messages
const channels = [
  { id: 1, name: 'general', unread: 5, isPrivate: false, isPinned: true },
  { id: 2, name: 'marketing', unread: 0, isPrivate: false, isPinned: false },
  { id: 3, name: 'product', unread: 12, isPrivate: false, isPinned: true },
  { id: 4, name: 'design', unread: 0, isPrivate: true, isPinned: false },
  { id: 5, name: 'engineering', unread: 3, isPrivate: false, isPinned: false },
];

const directMessages = [
  { id: 101, name: 'Sarah Johnson', status: 'online', unread: 2 },
  { id: 102, name: 'Alex Wong', status: 'offline', unread: 0 },
  { id: 103, name: 'Priya Sharma', status: 'away', unread: 1 },
  { id: 104, name: 'Marcus Lee', status: 'online', unread: 0 },
];

const messages = [
  {
    id: 201,
    sender: 'Sarah Johnson',
    avatar: '',
    time: '10:45 AM',
    content: 'Has anyone seen the latest project requirements document?',
    reactions: [{ emoji: '👍', count: 3 }, { emoji: '❓', count: 1 }]
  },
  {
    id: 202,
    sender: 'Marcus Lee',
    avatar: '',
    time: '10:48 AM',
    content: 'I have it. Just uploaded it to the shared drive folder.',
    reactions: [{ emoji: '🙏', count: 2 }]
  },
  {
    id: 203,
    sender: 'Priya Sharma',
    avatar: '',
    time: '10:52 AM',
    content: 'Thanks Marcus! I\'ll review it this afternoon and share my feedback.',
    reactions: []
  },
  {
    id: 204,
    sender: 'Alex Wong',
    avatar: '',
    time: '11:05 AM',
    content: 'Can we discuss some concerns I have about the timeline during our standup?',
    reactions: [{ emoji: '👀', count: 4 }]
  },
  {
    id: 205,
    sender: 'Sarah Johnson',
    avatar: '',
    time: '11:08 AM',
    content: 'Sure thing, Alex. I\'ll add it to the agenda.',
    reactions: [{ emoji: '👍', count: 1 }]
  },
];

export default function SlackPage() {
  const [selectedChannel, setSelectedChannel] = useState('general');
  
  const sidebarBg = useColorModeValue('gray.50', 'gray.800');
  const channelBg = useColorModeValue('gray.100', 'gray.700');
  const channelHoverBg = useColorModeValue('gray.200', 'gray.600');
  const messageHoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Flex h="calc(100vh - 80px)">
      {/* Sidebar */}
      <Box w="250px" bg={sidebarBg} borderRight="1px" borderColor={borderColor} p={4}>
        <InputGroup mb={4} size="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.500" />
          </InputLeftElement>
          <Input type="text" placeholder="Search" rounded="md" />
        </InputGroup>
        
        <Box mb={4}>
          <HStack mb={2}>
            <Text fontSize="sm" fontWeight="bold" color="gray.600">CHANNELS</Text>
            <Icon as={FiChevronDown} color="gray.600" />
          </HStack>
          
          <VStack align="stretch" spacing={1}>
            {channels.map((channel) => (
              <HStack 
                key={channel.id} 
                py={1} 
                px={2} 
                borderRadius="md" 
                cursor="pointer"
                bg={selectedChannel === channel.name ? channelBg : 'transparent'}
                _hover={{ bg: channelHoverBg }}
                onClick={() => setSelectedChannel(channel.name)}
              >
                <Icon as={channel.isPrivate ? FiLock : FiHash} boxSize={4} color="gray.500" />
                <Text fontWeight={channel.unread > 0 ? "bold" : "normal"}>
                  {channel.name}
                </Text>
                {channel.unread > 0 && (
                  <Tag size="sm" colorScheme="blue" borderRadius="full" ml="auto">
                    {channel.unread}
                  </Tag>
                )}
                {channel.isPinned && !channel.unread && (
                  <Icon as={FiStar} color="yellow.500" ml="auto" boxSize={3} />
                )}
              </HStack>
            ))}
          </VStack>
        </Box>
        
        <Box>
          <HStack mb={2}>
            <Text fontSize="sm" fontWeight="bold" color="gray.600">DIRECT MESSAGES</Text>
            <Icon as={FiChevronDown} color="gray.600" />
          </HStack>
          
          <VStack align="stretch" spacing={1}>
            {directMessages.map((dm) => (
              <HStack 
                key={dm.id} 
                py={1} 
                px={2} 
                borderRadius="md" 
                cursor="pointer"
                _hover={{ bg: channelHoverBg }}
              >
                <Avatar size="xs" name={dm.name} />
                <Text fontWeight={dm.unread > 0 ? "bold" : "normal"}>
                  {dm.name}
                </Text>
                <Box 
                  w="8px" 
                  h="8px" 
                  borderRadius="full" 
                  bg={dm.status === 'online' ? 'green.500' : 
                     dm.status === 'away' ? 'yellow.500' : 'gray.400'} 
                  ml="auto"
                />
                {dm.unread > 0 && (
                  <Tag size="sm" colorScheme="blue" borderRadius="full">
                    {dm.unread}
                  </Tag>
                )}
              </HStack>
            ))}
          </VStack>
        </Box>
      </Box>
      
      {/* Main Chat Area */}
      <Flex flex={1} flexDirection="column">
        {/* Channel Header */}
        <HStack 
          p={4} 
          borderBottom="1px" 
          borderColor={borderColor}
        >
          <Icon as={FiHash} color="gray.500" mr={1} />
          <Heading size="md">{selectedChannel}</Heading>
          <Spacer />
          <Text fontSize="sm" color="gray.500">5 members</Text>
        </HStack>
        
        {/* Messages */}
        <Box flex={1} overflowY="auto" p={4}>
          <VStack spacing={4} align="stretch">
            {messages.map((message) => (
              <Box 
                key={message.id} 
                _hover={{ bg: messageHoverBg }} 
                borderRadius="md" 
                p={2}
              >
                <HStack mb={1}>
                  <Avatar size="sm" name={message.sender} />
                  <Text fontWeight="bold">{message.sender}</Text>
                  <Text fontSize="xs" color="gray.500">{message.time}</Text>
                </HStack>
                <Text ml={10}>{message.content}</Text>
                {message.reactions.length > 0 && (
                  <HStack mt={2} ml={10} spacing={2}>
                    {message.reactions.map((reaction, idx) => (
                      <Tag 
                        key={idx} 
                        size="sm" 
                        borderRadius="full" 
                        variant="outline"
                        px={2}
                      >
                        {reaction.emoji} {reaction.count}
                      </Tag>
                    ))}
                  </HStack>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
        
        {/* Message Input */}
        <Box p={4} borderTop="1px" borderColor={borderColor}>
          <InputGroup>
            <Input placeholder={`Message #${selectedChannel}`} py={6} />
            <HStack position="absolute" right="2" top="3" spacing={2} zIndex={2}>
              <Icon as={FiPaperclip} color="gray.500" cursor="pointer" />
              <Button colorScheme="blue" size="sm" leftIcon={<FiSend />}>
                Send
              </Button>
            </HStack>
          </InputGroup>
        </Box>
      </Flex>
    </Flex>
  );
}