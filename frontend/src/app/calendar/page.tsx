'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Heading, Badge, Avatar,
  Select, Button, Icon, Divider,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiUsers, FiPlus, FiZap } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Meeting {
  id: string;
  title: string;
  attendees: string[];
  day: number;       // 0=Mon … 4=Fri
  startHour: number; // 9–17
  startMin: number;  // 0 or 30
  duration: number;  // minutes
  type: 'standup' | 'sync' | 'review' | '1:1' | 'planning' | 'booked';
  isBooked?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const HOUR_H = 72;   // px per hour
const START_H = 9;   // 9 AM
const END_H   = 18;  // 6 PM
const HOURS   = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
const DAYS    = ['Mon Mar 2', 'Tue Mar 3', 'Wed Mar 4', 'Thu Mar 5', 'Fri Mar 6'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const TEAM_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  Leadership:    { bg: '#EDE9FE', border: '#7C3AED', text: '#5B21B6' },
  Backend:       { bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8' },
  Frontend:      { bg: '#F3E8FF', border: '#9333EA', text: '#7E22CE' },
  DevOps:        { bg: '#FEF3C7', border: '#D97706', text: '#92400E' },
  Security:      { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' },
  QA:            { bg: '#D1FAE5', border: '#059669', text: '#065F46' },
  'Cross-team':  { bg: '#E0F2FE', border: '#0284C7', text: '#0C4A6E' },
  Booked:        { bg: '#FDF4FF', border: '#A21CAF', text: '#86198F' },
};

const EMPLOYEE_TEAM: Record<string, string> = {
  'Grace Liu':        'Leadership',
  'Michael Park':     'Leadership',
  'Alice Chen':       'Backend',
  'David Kim':        'Backend',
  'Jack Williams':    'Frontend',
  'Sarah Chen':       'Frontend',
  'Bob Martinez':     'DevOps',
  'Carlos Rodriguez': 'DevOps',
  'Irene Garcia':     'Security',
  'Marcus Thompson':  'Security',
  'Leo Zhang':        'QA',
  'Emma Wilson':      'QA',
};

// ─── Meeting data (week of Mar 2-6, 2026) ────────────────────────────────────
const INITIAL_MEETINGS: Meeting[] = [
  // ── Monday ──────────────────────────────────────────────────────────────────
  { id: 'm1', title: 'Engineering All-Hands Standup', attendees: ['Grace Liu','Michael Park','Alice Chen','Jack Williams','Bob Martinez','Irene Garcia','Leo Zhang'], day: 0, startHour: 9, startMin: 0, duration: 30, type: 'standup' },
  { id: 'm2', title: 'Backend Team Sync', attendees: ['Alice Chen','David Kim'], day: 0, startHour: 10, startMin: 0, duration: 60, type: 'sync' },
  { id: 'm3', title: 'DevOps Weekly', attendees: ['Bob Martinez','Carlos Rodriguez'], day: 0, startHour: 10, startMin: 0, duration: 60, type: 'sync' },
  { id: 'm4', title: 'Sprint 3 Mid-Sprint Review', attendees: ['Grace Liu','Michael Park','Alice Chen','Jack Williams','Bob Martinez','Irene Garcia','Leo Zhang'], day: 0, startHour: 11, startMin: 0, duration: 60, type: 'review' },
  { id: 'm5', title: 'Team Leads Weekly', attendees: ['Michael Park','Alice Chen','Jack Williams','Bob Martinez','Irene Garcia','Leo Zhang'], day: 0, startHour: 14, startMin: 0, duration: 60, type: 'sync' },
  { id: 'm6', title: 'SEC-007 Internal Review', attendees: ['Irene Garcia','Marcus Thompson'], day: 0, startHour: 15, startMin: 0, duration: 60, type: 'review' },
  { id: 'm7', title: 'Frontend Team Sync', attendees: ['Jack Williams','Sarah Chen'], day: 0, startHour: 15, startMin: 0, duration: 60, type: 'sync' },

  // ── Tuesday ─────────────────────────────────────────────────────────────────
  { id: 'm8',  title: 'QA Daily Standup', attendees: ['Leo Zhang','Emma Wilson'], day: 1, startHour: 9, startMin: 0, duration: 30, type: 'standup' },
  { id: 'm9',  title: 'Backend / Infra Sync', attendees: ['Alice Chen','Bob Martinez'], day: 1, startHour: 10, startMin: 0, duration: 60, type: 'sync' },
  { id: 'm10', title: 'Security Audit Session', attendees: ['Irene Garcia','Marcus Thompson'], day: 1, startHour: 10, startMin: 0, duration: 60, type: 'review' },
  { id: 'm11', title: 'CORE-078 Redis Review', attendees: ['Alice Chen','David Kim','Michael Park'], day: 1, startHour: 11, startMin: 0, duration: 60, type: 'review' },
  { id: 'm12', title: 'QA-034 Results Presentation', attendees: ['Leo Zhang','Alice Chen','Bob Martinez'], day: 1, startHour: 14, startMin: 0, duration: 60, type: 'review' },
  { id: 'm13', title: 'WEB-051 Work Session', attendees: ['Jack Williams'], day: 1, startHour: 15, startMin: 0, duration: 60, type: 'planning' },
  { id: 'm14', title: 'Frontend Code Review', attendees: ['Jack Williams','Sarah Chen'], day: 1, startHour: 16, startMin: 0, duration: 60, type: 'review' },
  { id: 'm15', title: 'Grace / Michael 1:1', attendees: ['Grace Liu','Michael Park'], day: 1, startHour: 14, startMin: 0, duration: 60, type: '1:1' },

  // ── Wednesday ────────────────────────────────────────────────────────────────
  { id: 'm16', title: 'DevOps Policy Decision', attendees: ['Bob Martinez','Michael Park'], day: 2, startHour: 9, startMin: 0, duration: 60, type: 'planning' },
  { id: 'm17', title: '1:1 Bob / Carlos', attendees: ['Bob Martinez','Carlos Rodriguez'], day: 2, startHour: 10, startMin: 0, duration: 60, type: '1:1' },
  { id: 'm18', title: 'Board Update Prep', attendees: ['Grace Liu'], day: 2, startHour: 10, startMin: 0, duration: 60, type: 'planning' },
  { id: 'm19', title: 'Frontend Sprint Review', attendees: ['Jack Williams','Sarah Chen','Michael Park'], day: 2, startHour: 11, startMin: 0, duration: 60, type: 'review' },
  { id: 'm20', title: 'Redis Implementation Review', attendees: ['Alice Chen','David Kim'], day: 2, startHour: 14, startMin: 0, duration: 60, type: 'review' },
  { id: 'm21', title: '1:1 Irene / Michael', attendees: ['Irene Garcia','Michael Park'], day: 2, startHour: 14, startMin: 0, duration: 60, type: '1:1' },
  { id: 'm22', title: '1:1 Leo / Emma', attendees: ['Leo Zhang','Emma Wilson'], day: 2, startHour: 15, startMin: 0, duration: 60, type: '1:1' },

  // ── Thursday ─────────────────────────────────────────────────────────────────
  { id: 'm23', title: 'Engineering Standup', attendees: ['Michael Park','Alice Chen','Jack Williams','Bob Martinez','Irene Garcia','Leo Zhang'], day: 3, startHour: 9, startMin: 0, duration: 30, type: 'standup' },
  { id: 'm24', title: 'INFRA Policy Decision — Redis', attendees: ['Michael Park','Bob Martinez','Alice Chen'], day: 3, startHour: 10, startMin: 0, duration: 60, type: 'planning' },
  { id: 'm25', title: 'CORE-078 Progress Check', attendees: ['Alice Chen','David Kim'], day: 3, startHour: 11, startMin: 0, duration: 60, type: 'sync' },
  { id: 'm26', title: 'Frontend Sprint Review', attendees: ['Jack Williams','Sarah Chen'], day: 3, startHour: 14, startMin: 0, duration: 60, type: 'review' },
  { id: 'm27', title: 'All-Hands Prep', attendees: ['Grace Liu','Michael Park'], day: 3, startHour: 15, startMin: 0, duration: 60, type: 'planning' },
  { id: 'm28', title: 'Carlos — Extended Work Block', attendees: ['Carlos Rodriguez'], day: 3, startHour: 15, startMin: 0, duration: 120, type: 'planning' },

  // ── Friday ───────────────────────────────────────────────────────────────────
  { id: 'm29', title: 'Sprint Retrospective', attendees: ['Michael Park','Alice Chen','Jack Williams','Bob Martinez','Irene Garcia','Leo Zhang','Sarah Chen','David Kim','Emma Wilson','Marcus Thompson','Carlos Rodriguez'], day: 4, startHour: 9, startMin: 0, duration: 60, type: 'review' },
  { id: 'm30', title: 'Company All-Hands', attendees: ['Grace Liu','Michael Park','Alice Chen','Jack Williams','Bob Martinez','Irene Garcia','Leo Zhang','Sarah Chen','David Kim','Emma Wilson','Marcus Thompson','Carlos Rodriguez'], day: 4, startHour: 10, startMin: 0, duration: 60, type: 'sync' },
  { id: 'm31', title: 'Security Follow-up', attendees: ['Irene Garcia','Marcus Thompson'], day: 4, startHour: 11, startMin: 0, duration: 60, type: 'sync' },
  { id: 'm32', title: 'Sprint 4 Planning Kickoff', attendees: ['Grace Liu','Michael Park','Alice Chen','Jack Williams','Bob Martinez','Irene Garcia','Leo Zhang'], day: 4, startHour: 14, startMin: 0, duration: 60, type: 'planning' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function topPx(h: number, m: number) {
  return (h - START_H) * HOUR_H + (m / 60) * HOUR_H;
}
function heightPx(mins: number) {
  return Math.max((mins / 60) * HOUR_H - 3, 20);
}
function fmt12(h: number, m = 0) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
function meetingTeam(m: Meeting) {
  if (m.isBooked) return 'Booked';
  if (m.attendees.length > 4) return 'Cross-team';
  const teams = [...new Set(m.attendees.map(a => EMPLOYEE_TEAM[a] || 'Cross-team'))];
  return teams.length === 1 ? teams[0] : 'Cross-team';
}

// ─── MeetingBlock ────────────────────────────────────────────────────────────
function MeetingBlock({ meeting, onClick }: { meeting: Meeting; onClick: (m: Meeting) => void }) {
  const top    = topPx(meeting.startHour, meeting.startMin);
  const height = heightPx(meeting.duration);
  const team   = meetingTeam(meeting);
  const col    = TEAM_COLOR[team] || TEAM_COLOR['Cross-team'];
  const short  = height < 40;

  return (
    <Box
      position="absolute"
      left="2px" right="2px"
      top={`${top}px`}
      height={`${height}px`}
      bg={col.bg}
      borderLeft="3px solid"
      borderColor={col.border}
      borderRadius="md"
      px={1.5} py={short ? 0.5 : 1}
      cursor="pointer"
      overflow="hidden"
      zIndex={1}
      _hover={{ filter: 'brightness(0.96)', zIndex: 10 }}
      transition="filter 0.1s"
      onClick={() => onClick(meeting)}
    >
      {meeting.isBooked && (
        <Box position="absolute" top={1} right={1}>
          <Icon as={FiZap} boxSize={2.5} color={col.border} />
        </Box>
      )}
      <Text fontSize="10px" fontWeight="700" color={col.text} noOfLines={1} lineHeight="1.2">
        {meeting.title}
      </Text>
      {!short && (
        <Text fontSize="9px" color={col.text} opacity={0.75} lineHeight="1.2" mt={0.5}>
          {fmt12(meeting.startHour, meeting.startMin)} · {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
        </Text>
      )}
    </Box>
  );
}

// ─── MeetingDetailPanel ───────────────────────────────────────────────────────
function MeetingDetail({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const team = meetingTeam(meeting);
  const col  = TEAM_COLOR[team] || TEAM_COLOR['Cross-team'];
  const endH = meeting.startHour + Math.floor((meeting.startMin + meeting.duration) / 60);
  const endM = (meeting.startMin + meeting.duration) % 60;

  return (
    <Box
      position="fixed" top="50%" left="50%"
      style={{ transform: 'translate(-50%,-50%)' }}
      w="360px" bg="background.surface" borderRadius="2xl"
      boxShadow="0 20px 60px rgba(0,0,0,0.18)"
      zIndex={2000} overflow="hidden"
    >
      <Box bg={col.bg} borderBottom="2px solid" borderColor={col.border} px={5} py={4}>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text fontSize="11px" fontWeight="700" color={col.text} textTransform="uppercase" mb={1}>
              {meetingTeam(meeting)} · {meeting.type}
            </Text>
            <Text fontWeight="800" fontSize="16px" color="text.primary" lineHeight="1.3">
              {meeting.title}
            </Text>
          </Box>
          <Button size="xs" variant="ghost" onClick={onClose} ml={2}>✕</Button>
        </Flex>
      </Box>
      <Box px={5} py={4}>
        <HStack mb={3} spacing={2}>
          <Icon as={FiCalendar} color="text.muted" boxSize={4} />
          <Text fontSize="13px" color="text.secondary">{DAYS[meeting.day]}</Text>
        </HStack>
        <HStack mb={4} spacing={2}>
          <Icon as={FiClock} color="text.muted" boxSize={4} />
          <Text fontSize="13px" color="text.secondary">
            {fmt12(meeting.startHour, meeting.startMin)} – {fmt12(endH, endM)} ({meeting.duration} min)
          </Text>
        </HStack>
        <Divider mb={3} borderColor="border.subtle" />
        <HStack mb={2} spacing={2}>
          <Icon as={FiUsers} color="text.muted" boxSize={4} />
          <Text fontSize="12px" fontWeight="600" color="text.secondary">
            {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
          </Text>
        </HStack>
        <Flex flexWrap="wrap" gap={1.5}>
          {meeting.attendees.map(a => (
            <HStack key={a} spacing={1.5} bg="background.raised" px={2} py={1} borderRadius="full">
              <Avatar size="2xs" name={a} />
              <Text fontSize="11px" color="text.secondary">{a}</Text>
            </HStack>
          ))}
        </Flex>
        {meeting.isBooked && (
          <Box mt={3} p={2.5} bg="rgba(167,139,250,0.08)" borderRadius="lg" borderLeft="3px solid" borderColor="purple.400">
            <HStack spacing={1.5}>
              <Icon as={FiZap} color="purple.500" boxSize={3} />
              <Text fontSize="11px" color="purple.300" fontWeight="600">Booked by ARIA</Text>
            </HStack>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [personFilter, setPersonFilter] = useState('All');
  const [selected, setSelected] = useState<Meeting | null>(null);

  // Load ARIA-booked meetings from localStorage
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('aria_booked_meetings');
        if (raw) {
          const booked: Meeting[] = JSON.parse(raw);
          setMeetings([...INITIAL_MEETINGS, ...booked]);
        }
      } catch {}
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener('aria_meeting_booked', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('aria_meeting_booked', load);
    };
  }, []);

  const people = ['All', ...Object.keys(EMPLOYEE_TEAM).sort()];

  const visible = meetings.filter(m =>
    personFilter === 'All' || m.attendees.includes(personFilter)
  );

  // Today's meetings (treat Monday as "today" for demo)
  const today = visible.filter(m => m.day === 0).sort(
    (a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin)
  );

  return (
    <AppLayout>
      <Box maxW="1400px" mx="auto" pt={6} pb={12} px={4}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={5}>
          <Box>
            <Heading size="xl" color="text.primary">Calendar</Heading>
            <Text fontSize="sm" color="text.muted" mt={0.5}>Week of Mar 2–6, 2026 · Sprint 3</Text>
          </Box>
          <HStack spacing={3}>
            <Select
              size="sm" value={personFilter}
              onChange={e => setPersonFilter(e.target.value)}
              borderRadius="lg" maxW="200px" fontSize="sm"
              bg="background.raised"
            >
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Button
              size="sm" colorScheme="purple" borderRadius="lg"
              leftIcon={<Icon as={FiPlus} />}
              onClick={() => alert('Ask ARIA to book a meeting — try: "Book a meeting with Grace Liu and Jack Williams"')}
            >
              Book via ARIA
            </Button>
          </HStack>
        </Flex>

        {/* Legend */}
        <HStack spacing={3} mb={4} flexWrap="wrap">
          {Object.entries(TEAM_COLOR).map(([team, col]) => (
            <HStack key={team} spacing={1.5}
              as="button"
              onClick={() => {
                const first = Object.entries(EMPLOYEE_TEAM).find(([, t]) => t === team)?.[0];
                if (first && team !== 'Cross-team' && team !== 'Booked') setPersonFilter(first);
                else setPersonFilter('All');
              }}
            >
              <Box w={2.5} h={2.5} borderRadius="sm" bg={col.border} />
              <Text fontSize="11px" color="text.secondary">{team}</Text>
            </HStack>
          ))}
        </HStack>

        <Flex gap={4} align="flex-start">
          {/* ── Weekly grid ─────────────────────────────────────────────────── */}
          <Box flex={1} overflow="auto">
            <Box minW="700px">
              {/* Day headers */}
              <Flex ml="52px" mb={1}>
                {DAYS.map((d, i) => (
                  <Box key={i} flex={1} textAlign="center">
                    <Text fontSize="11px" fontWeight="700" color={i === 0 ? 'purple.400' : 'text.muted'}>
                      {DAY_SHORT[i]}
                    </Text>
                    <Text fontSize="11px" color={i === 0 ? 'purple.400' : 'text.disabled'}>
                      {d.split(' ').slice(1).join(' ')}
                    </Text>
                  </Box>
                ))}
              </Flex>

              {/* Grid */}
              <Flex>
                {/* Time column */}
                <Box w="52px" flexShrink={0}>
                  {HOURS.map(h => (
                    <Box key={h} h={`${HOUR_H}px`} pr={2} display="flex" alignItems="flex-start" pt={1}>
                      <Text fontSize="10px" color="text.disabled" textAlign="right" w="100%">
                        {fmt12(h)}
                      </Text>
                    </Box>
                  ))}
                </Box>

                {/* Day columns */}
                {DAYS.map((_, dayIdx) => {
                  const dayMeetings = visible.filter(m => m.day === dayIdx);
                  return (
                    <Box
                      key={dayIdx} flex={1}
                      borderLeft="1px solid" borderColor="border.subtle"
                      position="relative"
                      h={`${HOURS.length * HOUR_H}px`}
                    >
                      {/* Hour lines */}
                      {HOURS.map(h => (
                        <Box
                          key={h}
                          position="absolute" left={0} right={0}
                          top={`${(h - START_H) * HOUR_H}px`}
                          borderTop="1px solid" borderColor="border.subtle"
                        />
                      ))}
                      {/* Meetings */}
                      {dayMeetings.map(m => (
                        <MeetingBlock key={m.id} meeting={m} onClick={setSelected} />
                      ))}
                    </Box>
                  );
                })}
              </Flex>
            </Box>
          </Box>

          {/* ── Today's agenda sidebar ───────────────────────────────────────── */}
          <Box w="220px" flexShrink={0}>
            <Box bg="background.surface" borderRadius="xl" border="1px solid" borderColor="border.subtle" overflow="hidden">
              <Box px={4} py={3} borderBottom="1px solid" borderColor="border.subtle">
                <Text fontWeight="700" fontSize="13px" color="text.primary">Monday · Mar 2</Text>
                <Text fontSize="11px" color="text.disabled">Today's agenda</Text>
              </Box>
              <VStack spacing={0} align="stretch">
                {today.length === 0 ? (
                  <Box p={4}>
                    <Text fontSize="12px" color="text.disabled">No meetings</Text>
                  </Box>
                ) : (
                  today.map((m, i) => {
                    const team = meetingTeam(m);
                    const col  = TEAM_COLOR[team] || TEAM_COLOR['Cross-team'];
                    return (
                      <Box
                        key={m.id}
                        px={4} py={3}
                        borderBottom={i < today.length - 1 ? '1px solid' : 'none'}
                        borderColor="border.subtle"
                        cursor="pointer"
                        _hover={{ bg: 'background.raised' }}
                        onClick={() => setSelected(m)}
                      >
                        <HStack spacing={2} mb={1}>
                          <Box w={2} h={2} borderRadius="full" bg={col.border} flexShrink={0} />
                          <Text fontSize="11px" fontWeight="700" color="text.primary" noOfLines={2} lineHeight="1.3">
                            {m.title}
                          </Text>
                        </HStack>
                        <Text fontSize="10px" color="text.disabled">
                          {fmt12(m.startHour, m.startMin)} · {m.duration}m
                        </Text>
                      </Box>
                    );
                  })
                )}
              </VStack>
            </Box>

            {/* ARIA tip */}
            <Box mt={3} p={3} bg="rgba(167,139,250,0.08)" borderRadius="xl" border="1px solid" borderColor="purple.700">
              <HStack spacing={2} mb={1}>
                <Icon as={FiZap} color="purple.400" boxSize={3.5} />
                <Text fontSize="11px" fontWeight="700" color="purple.300">Book via ARIA</Text>
              </HStack>
              <Text fontSize="10px" color="purple.400" lineHeight="1.5">
                Ask ARIA: "Book a meeting with Grace and Jack to discuss SEC-007" — ARIA will find their first free slot.
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Meeting detail overlay */}
      {selected && (
        <>
          <Box
            position="fixed" inset={0} bg="blackAlpha.300" zIndex={1999}
            onClick={() => setSelected(null)}
          />
          <MeetingDetail meeting={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </AppLayout>
  );
}
