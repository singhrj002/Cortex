'use client';

import { Box, Flex, Text, HStack, Icon, Grid } from '@chakra-ui/react';
import { FiCpu, FiArrowRight, FiZap, FiShield, FiTrendingUp, FiUsers, FiMic, FiActivity } from 'react-icons/fi';
import Link from 'next/link';

// ─── Mockup data ──────────────────────────────────────────────────────────────

const mockNavItems = ['Dashboard', 'Decisions', 'Conflicts', 'Briefings', 'Health', 'Git'];
const mockStats = [
  { label: 'Org Health', value: '42', unit: '/100', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  { label: 'Open Conflicts', value: '6', unit: '', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  { label: 'Decisions', value: '12', unit: ' today', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  { label: 'At Risk', value: '3', unit: ' people', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
];
const mockAlerts = [
  { dot: '#F87171', text: 'SEC-007 — Basic Auth in prod · 17 days open', tag: 'CRITICAL' },
  { dot: '#FBBF24', text: 'Redis/Memcached deadlock · Carlos blocked 14d', tag: 'HIGH' },
  { dot: '#A78BFA', text: 'PR #294 shadow work detected by ARIA', tag: 'MEDIUM' },
];
const features = [
  { icon: FiMic,      title: 'Briefings', desc: 'ARIA attends your meetings, transcribes every word, and surfaces decisions, action items, and risks — automatically.' },
  { icon: FiShield,   title: 'Conflict Detection', desc: 'Catch contradictions, policy violations, and shadow decisions before they escalate. Real evidence, real names, real context.' },
  { icon: FiActivity, title: 'Org Health Score', desc: 'Live intelligence across every team. Know who is overloaded, which tickets are blocked, and where trust is eroding.' },
  { icon: FiUsers,    title: 'People Intelligence', desc: 'Track morale trends, burnout signals, and contribution patterns across your entire engineering org.' },
  { icon: FiZap,      title: 'ARIA Assistant', desc: 'Voice-first AI that knows your org. Ask anything: "Prep me for the board meeting" and get an answer in seconds.' },
  { icon: FiTrendingUp, title: 'Shadow Topics', desc: 'Surface undiscussed risks, unresolved debates, and unofficial decisions hiding in Slack and email threads.' },
];

// ─── Product mockup window ────────────────────────────────────────────────────

function ProductMockup() {
  return (
    <Box
      borderRadius="16px"
      overflow="hidden"
      border="1px solid rgba(167,139,250,0.2)"
      boxShadow="0 0 0 1px rgba(139,92,246,0.1), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(109,40,217,0.15)"
      style={{ transform: 'perspective(1000px) rotateY(-6deg) rotateX(2deg)' }}
      maxW="620px"
      w="full"
    >
      {/* Window chrome */}
      <Box bg="#111116" px={4} py={3} borderBottom="1px solid rgba(255,255,255,0.06)">
        <HStack spacing={1.5}>
          <Box w="10px" h="10px" borderRadius="full" bg="#FF5F57" />
          <Box w="10px" h="10px" borderRadius="full" bg="#FEBC2E" />
          <Box w="10px" h="10px" borderRadius="full" bg="#28C840" />
          <HStack spacing={2} ml={4}>
            <Box w="28px" h="28px" borderRadius="7px" bgGradient="linear(135deg, #7C3AED, #4C1D95)"
              display="flex" alignItems="center" justifyContent="center">
              <Icon as={FiCpu} color="white" boxSize={3} />
            </Box>
            <Text fontSize="12px" fontWeight="700" color="white" letterSpacing="-0.02em">Cortex</Text>
            <Text fontSize="9px" color="rgba(255,255,255,0.3)" letterSpacing="0.08em" textTransform="uppercase">Organizational Intelligence</Text>
          </HStack>
        </HStack>
      </Box>

      {/* App body */}
      <Flex bg="#09090C" h="320px">
        {/* Sidebar */}
        <Box w="120px" flexShrink={0} bg="#111116" borderRight="1px solid rgba(255,255,255,0.05)" py={3} px={2}>
          {mockNavItems.map((item, i) => (
            <Box
              key={item}
              px={2} py={1.5} borderRadius="6px" mb={0.5}
              bg={i === 0 ? 'rgba(139,92,246,0.15)' : 'transparent'}
            >
              <Text fontSize="10px" fontWeight={i === 0 ? '700' : '400'}
                color={i === 0 ? '#C4B5FD' : 'rgba(255,255,255,0.35)'}>
                {item}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Main content */}
        <Box flex={1} p={3} overflow="hidden">
          {/* Stats row */}
          <Grid templateColumns="repeat(4, 1fr)" gap={2} mb={3}>
            {mockStats.map(s => (
              <Box key={s.label} bg={s.bg} border="1px solid" borderColor={`${s.color}30`}
                borderRadius="8px" p={2}>
                <Text fontSize="9px" color="rgba(255,255,255,0.4)" mb={0.5}>{s.label}</Text>
                <Text fontSize="14px" fontWeight="800" color={s.color} lineHeight="1">
                  {s.value}<Text as="span" fontSize="9px" fontWeight="400">{s.unit}</Text>
                </Text>
              </Box>
            ))}
          </Grid>

          {/* ARIA alert panel */}
          <Box bg="rgba(139,92,246,0.07)" border="1px solid rgba(139,92,246,0.2)"
            borderRadius="8px" p={2.5} mb={3}>
            <HStack spacing={2} mb={2}>
              <Box bg="#7C3AED" borderRadius="full" p={1} display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiCpu} color="white" boxSize={2.5} />
              </Box>
              <Text fontSize="9px" fontWeight="800" color="#A78BFA" textTransform="uppercase" letterSpacing="0.07em">
                ARIA · 3 Issues Detected
              </Text>
              <Box ml="auto" w="6px" h="6px" borderRadius="full" bg="#34D399"
                style={{ animation: 'pulse 2s infinite' }} />
            </HStack>
            {mockAlerts.map((a, i) => (
              <HStack key={i} spacing={2} mb={i < 2 ? 1 : 0}>
                <Box w="5px" h="5px" borderRadius="full" bg={a.dot} flexShrink={0} />
                <Text fontSize="9px" color="rgba(255,255,255,0.5)" flex={1} noOfLines={1}>{a.text}</Text>
                <Box bg={`${a.dot}20`} borderRadius="full" px={1.5} py={0.5} flexShrink={0}>
                  <Text fontSize="7px" fontWeight="700" color={a.dot}>{a.tag}</Text>
                </Box>
              </HStack>
            ))}
          </Box>

          {/* Mini graph bars */}
          <Box>
            <Text fontSize="8px" color="rgba(255,255,255,0.25)" mb={1.5} textTransform="uppercase" letterSpacing="0.08em">
              Decision Velocity · Last 7 days
            </Text>
            <HStack spacing={1.5} align="flex-end" h="40px">
              {[55, 70, 42, 88, 60, 95, 72].map((h, i) => (
                <Box
                  key={i}
                  flex={1}
                  borderRadius="3px 3px 0 0"
                  bg={i === 5 ? 'rgba(139,92,246,0.7)' : 'rgba(139,92,246,0.2)'}
                  style={{ height: `${h}%` }}
                />
              ))}
            </HStack>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <Box
      minH="100vh"
      bg="#09090C"
      color="white"
      fontFamily="var(--font-jakarta), system-ui, sans-serif"
      overflow="hidden"
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes glow  { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
      `}</style>

      {/* Background glow orbs */}
      <Box position="fixed" inset={0} pointerEvents="none" overflow="hidden" zIndex={0}>
        <Box
          position="absolute" top="-20%" left="30%"
          w="700px" h="700px" borderRadius="full"
          bg="radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)"
          style={{ animation: 'glow 6s ease-in-out infinite' }}
        />
        <Box
          position="absolute" bottom="-10%" right="10%"
          w="500px" h="500px" borderRadius="full"
          bg="radial-gradient(circle, rgba(76,29,149,0.12) 0%, transparent 70%)"
          style={{ animation: 'glow 8s ease-in-out infinite reverse' }}
        />
        {/* Subtle grid */}
        <Box
          position="absolute" inset={0}
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </Box>

      {/* ── Navbar ── */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100}
        bg="rgba(9,9,12,0.8)"
        style={{ backdropFilter: 'blur(20px)' }}
        borderBottom="1px solid rgba(255,255,255,0.06)"
      >
        <Flex maxW="1200px" mx="auto" px={6} h="60px" align="center" justify="space-between">
          {/* Logo */}
          <HStack spacing={2.5}>
            <Box
              w="30px" h="30px" borderRadius="8px" flexShrink={0}
              bgGradient="linear(135deg, #7C3AED, #4C1D95)"
              display="flex" alignItems="center" justifyContent="center"
              boxShadow="0 0 0 1px rgba(167,139,250,0.25), 0 4px 14px rgba(109,40,217,0.4)"
            >
              <Icon as={FiCpu} color="white" boxSize={3.5} />
            </Box>
            <Text fontSize="lg" fontWeight="800" letterSpacing="-0.04em"
              style={{ background: 'linear-gradient(to right, #C4B5FD, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Cortex
            </Text>
          </HStack>

          {/* Nav links */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            {['Features', 'How it works', 'Pricing'].map(item => (
              <Text key={item} fontSize="sm" color="rgba(255,255,255,0.5)"
                cursor="pointer" _hover={{ color: 'white' }}
                transition="color 0.15s">
                {item}
              </Text>
            ))}
          </HStack>

          {/* CTAs */}
          <HStack spacing={3}>
            <Text fontSize="sm" color="rgba(255,255,255,0.5)" cursor="pointer"
              _hover={{ color: 'white' }} transition="color 0.15s" display={{ base: 'none', md: 'block' }}>
              Sign In
            </Text>
            <Link href="/org-map">
              <Box
                as="button"
                px={4} py={2} borderRadius="lg"
                bg="rgba(139,92,246,0.15)"
                border="1px solid rgba(139,92,246,0.4)"
                color="#C4B5FD"
                fontSize="sm" fontWeight="700"
                cursor="pointer"
                display="flex" alignItems="center" gap={2}
                _hover={{ bg: 'rgba(139,92,246,0.25)', borderColor: 'rgba(167,139,250,0.6)' }}
                transition="all 0.15s"
                style={{ outline: 'none' }}
              >
                Enter Cortex
                <Icon as={FiArrowRight} boxSize={3.5} />
              </Box>
            </Link>
          </HStack>
        </Flex>
      </Box>

      {/* ── Hero ── */}
      <Box position="relative" zIndex={1} pt="120px" pb="80px" px={6}>
        <Flex maxW="1200px" mx="auto" align="center" gap={16} direction={{ base: 'column', lg: 'row' }}>

          {/* Left: copy */}
          <Box flex={1} maxW="560px">
            {/* Badge */}
            <Box
              display="inline-flex" alignItems="center" gap={2}
              bg="rgba(139,92,246,0.1)" border="1px solid rgba(139,92,246,0.25)"
              borderRadius="full" px={3} py={1.5} mb={6}
            >
              <Box w="6px" h="6px" borderRadius="full" bg="#8B5CF6"
                style={{ animation: 'pulse 2s infinite' }} />
              <Text fontSize="11px" fontWeight="700" color="#A78BFA" letterSpacing="0.06em" textTransform="uppercase">
                AI-Powered Organizational Intelligence
              </Text>
            </Box>

            {/* Headline */}
            <Text
              fontSize={{ base: '42px', md: '56px', lg: '62px' }}
              fontWeight="800"
              letterSpacing="-0.04em"
              lineHeight="1.05"
              mb={6}
            >
              <Text as="span" color="white">Your org's</Text>
              {' '}
              <Text
                as="span"
                style={{ background: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 50%, #6D28D9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                AI brain.
              </Text>
              <br />
              <Text as="span" color="rgba(255,255,255,0.75)">See everything.</Text>
              <br />
              <Text as="span" color="rgba(255,255,255,0.45)">Miss nothing.</Text>
            </Text>

            {/* Sub */}
            <Text fontSize={{ base: 'md', md: 'lg' }} color="rgba(255,255,255,0.45)" lineHeight="1.75" mb={10} maxW="440px">
              Detect hidden risks and stalled decisions before they cost you and lead your growing team with complete visibility.
            </Text>

            {/* CTA buttons */}
            <HStack spacing={4} flexWrap="wrap">
              <Link href="/org-map">
                <Box
                  as="button"
                  px={7} py={3.5} borderRadius="xl"
                  bgGradient="linear(135deg, #7C3AED, #4C1D95)"
                  color="white"
                  fontSize="sm" fontWeight="700"
                  cursor="pointer"
                  display="flex" alignItems="center" gap={2.5}
                  boxShadow="0 4px 24px rgba(109,40,217,0.5), 0 0 0 1px rgba(167,139,250,0.2)"
                  _hover={{ boxShadow: '0 6px 32px rgba(109,40,217,0.7)', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  style={{ outline: 'none' }}
                >
                  <Icon as={FiArrowRight} boxSize={4} />
                  Enter Dashboard
                </Box>
              </Link>
              <Box
                as="button"
                px={7} py={3.5} borderRadius="xl"
                bg="transparent"
                border="1px solid rgba(255,255,255,0.12)"
                color="rgba(255,255,255,0.6)"
                fontSize="sm" fontWeight="600"
                cursor="pointer"
                _hover={{ borderColor: 'rgba(255,255,255,0.25)', color: 'white' }}
                transition="all 0.15s"
                style={{ outline: 'none' }}
              >
                Watch Demo
              </Box>
            </HStack>

          </Box>

          {/* Right: product mockup */}
          <Box
            flex={1} display="flex" justifyContent="center" alignItems="center"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            <ProductMockup />
          </Box>
        </Flex>
      </Box>

      {/* ── Powered by ── */}
      <Box position="relative" zIndex={1} py={14} px={6} borderTop="1px solid rgba(255,255,255,0.05)">
        <Box maxW="1060px" mx="auto">
          <Text
            textAlign="center"
            fontSize="11px"
            fontWeight="600"
            color="rgba(255,255,255,0.2)"
            textTransform="uppercase"
            letterSpacing="0.14em"
            mb={8}
          >
            Built on world-class AI infrastructure
          </Text>

          <Flex justify="center" align="center" flexWrap="wrap" gap={3}>

            {/* ── Mistral AI ── */}
            <Box
              bg="rgba(243,90,42,0.08)" border="1px solid rgba(243,90,42,0.25)"
              borderRadius="14px" px={5} py={3.5}
              display="flex" alignItems="center" gap={3}
              _hover={{ borderColor: 'rgba(167,139,250,0.4)', bg: 'rgba(139,92,246,0.08)' }}
              transition="all 0.2s" style={{ cursor: 'default' }}
            >
              <Box w="32px" h="32px" borderRadius="8px" overflow="hidden" flexShrink={0}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mistral.png" alt="Mistral AI" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              <Box lineHeight="1">
                <Text fontSize="13px" fontWeight="700" color="rgba(255,255,255,0.85)" letterSpacing="-0.01em">Mistral AI</Text>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)" mt={0.5} textTransform="uppercase" letterSpacing="0.06em">LLM · Extraction</Text>
              </Box>
            </Box>

            {/* ── ElevenLabs ── */}
            <Box
              bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.1)"
              borderRadius="14px" px={5} py={3.5}
              display="flex" alignItems="center" gap={3}
              _hover={{ borderColor: 'rgba(167,139,250,0.4)', bg: 'rgba(139,92,246,0.08)' }}
              transition="all 0.2s" style={{ cursor: 'default' }}
            >
              <Box w="32px" h="32px" borderRadius="8px" overflow="hidden" flexShrink={0}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/elevenlabs.png" alt="ElevenLabs" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              <Box lineHeight="1">
                <Text fontSize="13px" fontWeight="700" color="rgba(255,255,255,0.85)" letterSpacing="-0.01em">ElevenLabs</Text>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)" mt={0.5} textTransform="uppercase" letterSpacing="0.06em">Voice & Speech</Text>
              </Box>
            </Box>

            {/* ── LangGraph ── */}
            <Box
              bg="rgba(28,138,94,0.08)" border="1px solid rgba(28,138,94,0.25)"
              borderRadius="14px" px={5} py={3.5}
              display="flex" alignItems="center" gap={3}
              _hover={{ borderColor: 'rgba(167,139,250,0.4)', bg: 'rgba(139,92,246,0.08)' }}
              transition="all 0.2s" style={{ cursor: 'default' }}
            >
              <Box w="32px" h="32px" borderRadius="8px" overflow="hidden" flexShrink={0}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/langgraph.png" alt="LangGraph" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              <Box lineHeight="1">
                <Text fontSize="13px" fontWeight="700" color="rgba(255,255,255,0.85)" letterSpacing="-0.01em">LangGraph</Text>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)" mt={0.5} textTransform="uppercase" letterSpacing="0.06em">Agent Orchestration</Text>
              </Box>
            </Box>

            {/* ── Neo4j ── */}
            <Box
              bg="rgba(0,140,193,0.08)" border="1px solid rgba(0,140,193,0.25)"
              borderRadius="14px" px={5} py={3.5}
              display="flex" alignItems="center" gap={3}
              _hover={{ borderColor: 'rgba(167,139,250,0.4)', bg: 'rgba(139,92,246,0.08)' }}
              transition="all 0.2s" style={{ cursor: 'default' }}
            >
              <Box w="32px" h="32px" borderRadius="8px" bg="white" flexShrink={0}
                display="flex" alignItems="center" justifyContent="center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {/* Neo4j — connected graph nodes */}
                  <line x1="10" y1="10" x2="3.5" y2="4.5"  stroke="#008CC1" strokeWidth="1.5"/>
                  <line x1="10" y1="10" x2="16.5" y2="4.5" stroke="#008CC1" strokeWidth="1.5"/>
                  <line x1="10" y1="10" x2="16.5" y2="16"  stroke="#008CC1" strokeWidth="1.5"/>
                  <circle cx="10"  cy="10"  r="3.2" fill="#008CC1"/>
                  <circle cx="3.5" cy="4.5" r="2.2" fill="#008CC1"/>
                  <circle cx="16.5" cy="4.5" r="2.2" fill="#008CC1"/>
                  <circle cx="16.5" cy="16"  r="2.2" fill="#008CC1"/>
                </svg>
              </Box>
              <Box lineHeight="1">
                <Text fontSize="13px" fontWeight="700" color="rgba(255,255,255,0.85)" letterSpacing="-0.01em">Neo4j</Text>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)" mt={0.5} textTransform="uppercase" letterSpacing="0.06em">Knowledge Graph</Text>
              </Box>
            </Box>

            {/* ── Next.js ── */}
            <Box
              bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.1)"
              borderRadius="14px" px={5} py={3.5}
              display="flex" alignItems="center" gap={3}
              _hover={{ borderColor: 'rgba(167,139,250,0.4)', bg: 'rgba(139,92,246,0.08)' }}
              transition="all 0.2s" style={{ cursor: 'default' }}
            >
              <Box w="32px" h="32px" borderRadius="8px" bg="#000" flexShrink={0}
                display="flex" alignItems="center" justifyContent="center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {/* Next.js — classic N mark on black */}
                  <line x1="4.5" y1="4"  x2="4.5" y2="16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  <path d="M4.5 4 L15.5 16"          stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="15.5" y1="4" x2="15.5" y2="16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.35"/>
                </svg>
              </Box>
              <Box lineHeight="1">
                <Text fontSize="13px" fontWeight="700" color="rgba(255,255,255,0.85)" letterSpacing="-0.01em">Next.js</Text>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)" mt={0.5} textTransform="uppercase" letterSpacing="0.06em">Frontend</Text>
              </Box>
            </Box>

          </Flex>
        </Box>
      </Box>

      {/* ── Features grid ── */}
      <Box position="relative" zIndex={1} py={20} px={6} borderTop="1px solid rgba(255,255,255,0.05)">
        <Box maxW="1200px" mx="auto">
          <Box textAlign="center" mb={14}>
            <Text fontSize="11px" fontWeight="700" color="#8B5CF6" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
              What Cortex does
            </Text>
            <Text fontSize={{ base: '28px', md: '38px' }} fontWeight="800" letterSpacing="-0.03em" color="white" mb={4}>
              Intelligence across every layer
            </Text>
            <Text fontSize="md" color="rgba(255,255,255,0.4)" maxW="480px" mx="auto" lineHeight="1.7">
              From Slack threads to board presentations — Cortex connects the dots your team doesn't have time to see.
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={5}>
            {features.map((f, i) => (
              <Box
                key={f.title}
                bg="rgba(255,255,255,0.02)"
                border="1px solid rgba(255,255,255,0.07)"
                borderRadius="xl" p={6}
                _hover={{ bg: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}
                transition="all 0.2s"
                position="relative" overflow="hidden"
              >
                <Box
                  position="absolute" top={0} left={0} right={0} h="2px"
                  bgGradient={i % 3 === 0 ? 'linear(to-r, #7C3AED, transparent)' : i % 3 === 1 ? 'linear(to-r, transparent, #7C3AED, transparent)' : 'linear(to-r, transparent, #7C3AED)'}
                />
                <Box
                  w="36px" h="36px" borderRadius="9px" mb={4}
                  bg="rgba(139,92,246,0.12)" border="1px solid rgba(139,92,246,0.2)"
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <Icon as={f.icon} color="#A78BFA" boxSize={4} />
                </Box>
                <Text fontSize="sm" fontWeight="700" color="white" mb={2} letterSpacing="-0.01em">{f.title}</Text>
                <Text fontSize="sm" color="rgba(255,255,255,0.4)" lineHeight="1.7">{f.desc}</Text>
              </Box>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ── Bottom CTA ── */}
      <Box position="relative" zIndex={1} py={24} px={6} textAlign="center">
        <Box maxW="600px" mx="auto">
          <Text fontSize={{ base: '32px', md: '44px' }} fontWeight="800" letterSpacing="-0.04em" color="white" mb={5} lineHeight="1.1">
            Your organization, finally{' '}
            <Text as="span" style={{ background: 'linear-gradient(135deg, #C4B5FD, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              understood.
            </Text>
          </Text>
          <Text fontSize="md" color="rgba(255,255,255,0.4)" mb={8} lineHeight="1.7">
            Stop piecing together what happened in meetings you missed.<br />
            Let Cortex do the watching — so you can do the leading.
          </Text>
          <Link href="/org-map">
            <Box
              as="button"
              display="inline-flex" alignItems="center" gap={2.5}
              px={8} py={4} borderRadius="xl"
              bgGradient="linear(135deg, #7C3AED, #4C1D95)"
              color="white" fontSize="md" fontWeight="700"
              cursor="pointer"
              boxShadow="0 4px 32px rgba(109,40,217,0.55), 0 0 0 1px rgba(167,139,250,0.2)"
              _hover={{ boxShadow: '0 6px 40px rgba(109,40,217,0.75)', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              style={{ outline: 'none' }}
            >
              <Icon as={FiArrowRight} boxSize={4.5} />
              Enter Cortex
            </Box>
          </Link>
        </Box>
      </Box>

      {/* Footer */}
      <Box borderTop="1px solid rgba(255,255,255,0.05)" py={8} px={6} position="relative" zIndex={1}>
        <Flex maxW="1200px" mx="auto" justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <HStack spacing={2.5}>
            <Box
              w="22px" h="22px" borderRadius="6px"
              bgGradient="linear(135deg, #7C3AED, #4C1D95)"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Icon as={FiCpu} color="white" boxSize={3} />
            </Box>
            <Text fontSize="sm" fontWeight="700" color="rgba(255,255,255,0.4)">Cortex</Text>
          </HStack>
          <Text fontSize="xs" color="rgba(255,255,255,0.2)">
            © 2026 Cortex · Organizational Intelligence Platform
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
