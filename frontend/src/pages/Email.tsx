'use client';

import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Divider,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiMail, FiStar, FiTrash, FiArchive, FiFolder } from 'react-icons/fi';

// Mock data for emails
const emails = [
  {
    id: 1,
    sender: 'John Smith',
    email: 'john.smith@company.com',
    subject: 'Project Status Update',
    preview: 'Here\'s the latest update on the project progress and next steps...',
    time: '10:45 AM',
    read: false,
    starred: true,
  },
  {
    id: 2,
    sender: 'Sarah Johnson',
    email: 'sarah.j@partner.org',
    subject: 'Meeting Agenda - Tomorrow',
    preview: 'I\'ve prepared the agenda for our meeting tomorrow. Please review...',
    time: 'Yesterday',
    read: true,
    starred: false,
  },
  {
    id: 3,
    sender: 'Marketing Team',
    email: 'marketing@company.com',
    subject: 'Campaign Results',
    preview: 'The quarterly marketing campaign results are in. We\'ve exceeded our targets...',
    time: 'Feb 5',
    read: true,
    starred: false,
  },
  {
    id: 4,
    sender: 'Alex Wong',
    email: 'alex.w@client.com',
    subject: 'Feedback on Proposal',
    preview: 'Thank you for sending over the proposal. We have some feedback to share...',
    time: 'Feb 3',
    read: false,
    starred: true,
  },
  {
    id: 5,
    sender: 'HR Department',
    email: 'hr@company.com',
    subject: 'New Policy Update',
    preview: 'Please review the attached updated company policy document that will be effective from...',
    time: 'Feb 1',
    read: true,
    starred: false,
  },
];

export default function EmailPage() {
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box maxW="1200px" mx="auto" pt={8} pb={12} px={4}>
      <HStack mb={6} justify="space-between">
        <Heading size="xl">Email</Heading>
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.500" />
          </InputLeftElement>
          <Input type="text" placeholder="Search emails..." />
        </InputGroup>
      </HStack>
      
      <Flex mb={6} gap={4}>
        <HStack spacing={4} overflow="auto" pb={2}>
          <Badge colorScheme="blue" px={3} py={1} borderRadius="full" display="flex" alignItems="center">
            <Icon as={FiMail} mr={1} /> Inbox (25)
          </Badge>
          <Badge colorScheme="yellow" px={3} py={1} borderRadius="full" display="flex" alignItems="center">
            <Icon as={FiStar} mr={1} /> Starred
          </Badge>
          <Badge colorScheme="gray" px={3} py={1} borderRadius="full" display="flex" alignItems="center">
            <Icon as={FiArchive} mr={1} /> Archived
          </Badge>
          <Badge colorScheme="green" px={3} py={1} borderRadius="full" display="flex" alignItems="center">
            <Icon as={FiFolder} mr={1} /> Projects
          </Badge>
          <Badge colorScheme="red" px={3} py={1} borderRadius="full" display="flex" alignItems="center">
            <Icon as={FiTrash} mr={1} /> Trash
          </Badge>
        </HStack>
      </Flex>

      <VStack spacing={0} align="stretch" borderWidth="1px" borderColor={borderColor} borderRadius="md">
        {emails.map((email, index) => (
          <React.Fragment key={email.id}>
            {index > 0 && <Divider />}
            <HStack 
              p={4} 
              spacing={4} 
              _hover={{ bg: bgHover }}
              bg={email.read ? 'transparent' : 'blue.50'}
              cursor="pointer"
            >
              <Avatar size="sm" name={email.sender} />
              <Box flex="1">
                <HStack mb={1} justify="space-between">
                  <HStack>
                    <Text fontWeight={email.read ? 'normal' : 'bold'}>{email.sender}</Text>
                    {email.starred && <Icon as={FiStar} color="yellow.500" />}
                  </HStack>
                  <Text fontSize="sm" color="gray.500">{email.time}</Text>
                </HStack>
                <Text fontWeight={email.read ? 'normal' : 'bold'} mb={1}>{email.subject}</Text>
                <Text fontSize="sm" color="gray.600" noOfLines={1}>{email.preview}</Text>
              </Box>
            </HStack>
          </React.Fragment>
        ))}
      </VStack>
    </Box>
  );
}