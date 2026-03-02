'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Flex, Text, HStack, VStack, IconButton, Icon } from '@chakra-ui/react';
import {
  FiMic, FiMicOff, FiX, FiZap, FiSend,
  FiSunrise, FiSunset, FiCalendar, FiCheck,
  FiAlertTriangle, FiUsers, FiHelpCircle, FiList, FiFileText,
} from 'react-icons/fi';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MeetingBooking {
  title: string;
  attendees: string[];
  day: string;
  date: string;
  startHour: number;
  duration: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: number;
  booking?: MeetingBooking;
  isBrief?: 'morning' | 'evening';
}

// ─── Parse BOOK tag from ARIA response ───────────────────────────────────────
function parseBooking(text: string): { clean: string; booking: MeetingBooking | null } {
  const match = text.match(/<!--BOOK:(\{.*?\})-->/s);
  if (!match) return { clean: text, booking: null };
  try {
    const booking = JSON.parse(match[1]) as MeetingBooking;
    const clean = text.replace(/<!--BOOK:.*?-->/s, '').trim();
    return { clean, booking };
  } catch {
    return { clean: text, booking: null };
  }
}

// ─── Save booked meeting to localStorage ─────────────────────────────────────
function saveMeeting(booking: MeetingBooking) {
  const DAY_MAP: Record<string, number> = {
    Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4,
  };
  const existing = JSON.parse(localStorage.getItem('aria_booked_meetings') || '[]');
  existing.push({
    id: `booked-${Date.now()}`,
    title: booking.title,
    attendees: booking.attendees,
    day: DAY_MAP[booking.day] ?? 0,
    startHour: booking.startHour,
    startMin: 0,
    duration: booking.duration,
    type: 'booked',
    isBooked: true,
  });
  localStorage.setItem('aria_booked_meetings', JSON.stringify(existing));
  window.dispatchEvent(new Event('aria_meeting_booked'));
}

// ─── Waveform bars shown while ARIA is speaking ───────────────────────────────
function WaveBar({ delay }: { delay: number }) {
  return (
    <Box
      w="2px" borderRadius="full" bg="purple.300" flexShrink={0}
      sx={{
        animation: `waveAnim 0.8s ${delay}s infinite ease-in-out`,
        '@keyframes waveAnim': {
          '0%,100%': { height: '4px' },
          '50%': { height: '16px' },
        },
      }}
    />
  );
}

// ─── Typing dots while ARIA thinks ───────────────────────────────────────────
function ThinkingDots() {
  return (
    <Flex align="flex-start" mb={3}>
      <Box
        w={6} h={6} borderRadius="full"
        bgGradient="linear(135deg, #4C1D95, #1E40AF)"
        display="flex" alignItems="center" justifyContent="center"
        mr={2} flexShrink={0}
      >
        <Icon as={FiZap} color="white" boxSize={3} />
      </Box>
      <Box px={3} py={2.5} borderRadius="18px 18px 18px 4px" bg="gray.100"
        display="inline-flex" alignItems="center" gap={1}
      >
        {[0, 0.18, 0.36].map((d, i) => (
          <Box key={i} w={1.5} h={1.5} borderRadius="full" bg="gray.400"
            sx={{
              animation: `dotBounce 1.2s ${d}s infinite ease-in-out`,
              '@keyframes dotBounce': {
                '0%,80%,100%': { transform: 'translateY(0)' },
                '40%': { transform: 'translateY(-5px)' },
              },
            }}
          />
        ))}
      </Box>
    </Flex>
  );
}

// ─── Booking confirmation card ────────────────────────────────────────────────
function BookingCard({ booking, onConfirm, onDismiss }: {
  booking: MeetingBooking;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const fmt12 = (h: number) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
  return (
    <Box mt={2} p={3} borderRadius="xl" bg="purple.50" border="1.5px solid" borderColor="purple.300">
      <HStack mb={2} spacing={1.5}>
        <Icon as={FiCalendar} color="purple.600" boxSize={3.5} />
        <Text fontSize="11px" fontWeight="800" color="purple.700" textTransform="uppercase">Schedule Meeting</Text>
      </HStack>
      <Text fontSize="13px" fontWeight="700" color="gray.900" mb={1}>{booking.title}</Text>
      <Text fontSize="11px" color="gray.600" mb={0.5}>
        {booking.day}, {booking.date} · {fmt12(booking.startHour)} ({booking.duration} min)
      </Text>
      <Text fontSize="11px" color="gray.500" mb={3}>{booking.attendees.join(', ')}</Text>
      <HStack spacing={2}>
        <Box as="button" onClick={onConfirm} flex={1} py={1.5} borderRadius="lg"
          bg="purple.600" color="white" fontSize="12px" fontWeight="700"
          display="flex" alignItems="center" justifyContent="center" gap={1}
          _hover={{ bg: 'purple.700' }}
          style={{ cursor: 'pointer', border: 'none', outline: 'none' }}
        >
          <Icon as={FiCheck} boxSize={3} /> Confirm
        </Box>
        <Box as="button" onClick={onDismiss} flex={1} py={1.5} borderRadius="lg"
          bg="white" color="gray.500" fontSize="12px" fontWeight="600"
          border="1px solid" borderColor="gray.200"
          display="flex" alignItems="center" justifyContent="center"
          _hover={{ bg: 'gray.50' }}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          Dismiss
        </Box>
      </HStack>
    </Box>
  );
}

// ─── Brief trigger button ─────────────────────────────────────────────────────
function BriefButton({ icon, label, sublabel, gradient, onClick, disabled }: {
  icon: any; label: string; sublabel: string;
  gradient: string; onClick: () => void; disabled: boolean;
}) {
  return (
    <Box
      as="button" onClick={onClick} disabled={disabled}
      flex={1} p={3} borderRadius="xl"
      bgGradient={gradient}
      display="flex" flexDirection="column" alignItems="flex-start"
      border="none" cursor={disabled ? 'not-allowed' : 'pointer'}
      opacity={disabled ? 0.5 : 1}
      _hover={disabled ? {} : { filter: 'brightness(1.08)' }}
      transition="filter 0.15s"
      style={{ outline: 'none' }}
    >
      <Icon as={icon} color="white" boxSize={4} mb={1.5} />
      <Text fontSize="12px" fontWeight="800" color="white" lineHeight="1">{label}</Text>
      <Text fontSize="10px" color="whiteAlpha.700" mt={0.5} lineHeight="1.3">{sublabel}</Text>
    </Box>
  );
}

// ─── Cross-question chips ─────────────────────────────────────────────────────
const CROSS_QUESTIONS = [
  { icon: FiAlertTriangle, label: 'Why is SEC-007 still open?' },
  { icon: FiUsers,         label: 'What should I do about Carlos?' },
  { icon: FiHelpCircle,    label: "Should I trust Jack's fix?" },
  { icon: FiCalendar,      label: 'Book SEC-007 meeting with Jack and Irene' },
];

const BRIEFING_QUESTIONS = [
  { icon: FiFileText, label: 'What were the Q2 roadmap decisions?' },
  { icon: FiList,     label: 'What are my outstanding action items?' },
  { icon: FiCalendar, label: 'Prep me for the board meeting on Mar 5' },
  { icon: FiMic,      label: 'Summarize the Sprint 3 retrospective' },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoiceAssistant() {
  const [isOpen, setIsOpen]             = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [liveText, setLiveText]         = useState('');
  const [textInput, setTextInput]       = useState('');
  const [messages, setMessages]         = useState<Message[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Set<number>>(new Set());
  const [briefPlayed, setBriefPlayed]   = useState<Set<string>>(new Set());

  const recognitionRef  = useRef<any>(null);
  const messagesRef     = useRef<Message[]>([]);
  const bottomRef       = useRef<HTMLDivElement>(null);
  const audioRef        = useRef<HTMLAudioElement | null>(null);

  // Create a persistent Audio element and unlock it on first user gesture.
  // Reusing the same element after unlocking lets play() work after async ops in Safari.
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // 1-frame silent WAV — plays instantly to mark the element as user-activated
    const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=';

    const unlock = () => {
      audio.src = SILENCE;
      audio.play().then(() => { audio.pause(); audio.src = ''; }).catch(() => {});
    };

    window.addEventListener('click',   unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      audio.pause();
      window.removeEventListener('click',   unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e: any) => {
      const t = e.results[e.resultIndex][0].transcript;
      setLiveText(t);
      if (e.results[e.resultIndex].isFinal) { setLiveText(''); sendMessage(t); }
    };
    r.onerror = () => { setIsListening(false); setLiveText(''); };
    r.onend   = () => { setIsListening(false); };
    recognitionRef.current = r;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core send ────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string, briefType?: 'morning' | 'evening') => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);

    const uid = Date.now();
    const userMsg: Message = { role: 'user', content: text.trim(), id: uid };
    const nextMsgs = [...messagesRef.current, userMsg];
    setMessages(nextMsgs);
    messagesRef.current = nextMsgs;

    try {
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMsgs.map(m => ({ role: m.role, content: m.content })),
          liveScore: undefined,
        }),
      });

      const data = await res.json();
      const raw = data.message || 'Sorry, I could not process that request.';
      const { clean: reply, booking } = parseBooking(raw);

      const aMsg: Message = {
        role: 'assistant', content: reply, id: Date.now(),
        booking: booking ?? undefined,
        isBrief: briefType,
      };
      const withReply = [...messagesRef.current, aMsg];
      setMessages(withReply);
      messagesRef.current = withReply;

      await speakText(reply);
    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        id: Date.now(),
      };
      const withErr = [...messagesRef.current, errMsg];
      setMessages(withErr);
      messagesRef.current = withErr;
    } finally {
      setIsProcessing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessing]);

  // ── Stop any active audio ─────────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      const audio = audioRef.current!;
      audio.src = url;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.muted = true;          // bypass autoplay policy — always allowed when muted
      await audio.play();
      audio.muted = false;         // unmute immediately so ElevenLabs voice is heard
    } catch (err) {
      console.error('TTS error:', err);
      const utt = new SpeechSynthesisUtterance(text);
      utt.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utt);
    }
  };

  // ── Brief triggers — tries real backend first, falls back to ARIA chat ────────
  const triggerBrief = async (type: 'morning' | 'evening') => {
    if (isProcessing || isSpeaking) return;
    setBriefPlayed(prev => new Set(prev).add(type));
    setIsProcessing(true);

    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${BASE}/api/v1/briefs/${type}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.brief as string;
        const aMsg: Message = { role: 'assistant', content: text, id: Date.now(), isBrief: type };
        const next = [...messagesRef.current, aMsg];
        setMessages(next); messagesRef.current = next;
        setIsProcessing(false);
        await speakText(text);
        return;
      }
    } catch { /* backend offline */ }

    setIsProcessing(false);
    // Fallback: ask ARIA via GPT with static context
    const prompt = type === 'morning'
      ? 'Give me my morning brief for today, Monday March 2, 2026.'
      : "Give me my evening brief — summarise today and give me tomorrow's top priorities.";
    sendMessage(prompt, type);
  };

  // ── Voice toggle ──────────────────────────────────────────────────────────────
  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false); setLiveText('');
    } else {
      setLiveText('');
      try { recognitionRef.current?.start(); setIsListening(true); } catch {}
    }
  };

  const handleTextSend = () => {
    if (textInput.trim() && !isListening) {
      sendMessage(textInput.trim());
      setTextInput('');
    }
  };

  const handleOpen = () => {
    setIsOpen(o => !o);
    if (!isOpen && messages.length === 0) {
      const welcome: Message = {
        role: 'assistant',
        content: 'Good morning, Grace. I\'m ARIA, your AI executive assistant. Tap "Morning Brief" to start your day, or ask me anything about the organisation.',
        id: Date.now(),
      };
      setMessages([welcome]);
      messagesRef.current = [welcome];
    }
  };

  const hasMessages = messages.length > 1;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(12px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes orbPulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(107,70,193,0.55); }
          50%      { box-shadow: 0 0 0 14px rgba(107,70,193,0); }
        }
        @keyframes micRing {
          0%,100% { box-shadow: 0 0 0 0   rgba(220,38,38,0.5); }
          50%      { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
        }
        @keyframes liveDot {
          0%,100% { opacity:1; } 50% { opacity:0.3; }
        }
      `}</style>

      <Box position="fixed" bottom="6" right="6" zIndex={1500}>

        {/* ── Panel ─────────────────────────────────────────────────────────── */}
        {isOpen && (
          <Box
            position="absolute" bottom="72px" right="0"
            w="380px" maxH="calc(100vh - 100px)" borderRadius="2xl" bg="white"
            border="1px solid" borderColor="gray.150"
            boxShadow="0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)"
            overflow="hidden"
            style={{ animation: 'slideUp 0.22s ease' }}
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <Box bgGradient="linear(135deg, #3B0764, #1E3A8A)" px={4} py={3}>
              <Flex justify="space-between" align="center">
                <HStack spacing={2.5}>
                  <Box w={2} h={2} borderRadius="full" bg="green.400"
                    style={{ animation: 'liveDot 2s infinite' }} />
                  <Box>
                    <HStack spacing={2} align="baseline">
                      <Text fontWeight="900" fontSize="15px" color="white" lineHeight="1">ARIA</Text>
                      <Text fontSize="10px" color="whiteAlpha.500" lineHeight="1">CTO DAILY BRIEF</Text>
                    </HStack>
                    <Text fontSize="10px" color="whiteAlpha.500" lineHeight="1" mt={0.5}>
                      Grace Liu · Nexus Technologies · Mon Mar 2, 2026
                    </Text>
                  </Box>
                </HStack>
                <HStack spacing={1}>
                  {isSpeaking && (
                    <HStack spacing="2px" px={2} py={1} borderRadius="full" bg="whiteAlpha.200">
                      {[0, 0.1, 0.2, 0.3, 0.4].map((d, i) => <WaveBar key={i} delay={d} />)}
                      <Text fontSize="9px" color="whiteAlpha.700" ml={1}>Speaking</Text>
                    </HStack>
                  )}
                  <IconButton aria-label="Close" icon={<FiX />} size="sm" variant="ghost"
                    color="white" _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => { stopAudio(); setIsOpen(false); }} />
                </HStack>
              </Flex>
            </Box>

            {/* ── Brief buttons ─────────────────────────────────────────────── */}
            <Box px={3} pt={3} pb={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
              <HStack spacing={2} mb={hasMessages ? 0 : 2}>
                <BriefButton
                  icon={FiSunrise} label="Morning Brief" sublabel="Priorities · Alerts · Meetings"
                  gradient="linear(135deg, #D97706, #B45309)"
                  onClick={() => triggerBrief('morning')}
                  disabled={isProcessing || isSpeaking}
                />
                <BriefButton
                  icon={FiSunset} label="Evening Brief" sublabel="Day summary · Tomorrow's plan"
                  gradient="linear(135deg, #4C1D95, #1E3A8A)"
                  onClick={() => triggerBrief('evening')}
                  disabled={isProcessing || isSpeaking}
                />
              </HStack>

              {/* Cross-question + Briefing chips — shown only before first real exchange */}
              {!hasMessages && (
                <>
                  <Text fontSize="10px" color="gray.400" fontWeight="700" textTransform="uppercase" mb={1.5} mt={2.5}>
                    Ask ARIA directly
                  </Text>
                  <Flex gap={1.5} flexWrap="wrap" mb={2}>
                    {CROSS_QUESTIONS.map(q => (
                      <Box
                        key={q.label} as="button"
                        onClick={() => sendMessage(q.label)}
                        display="flex" alignItems="center" gap={1}
                        px={2.5} py={1.5} borderRadius="full"
                        bg="white" border="1px solid" borderColor="gray.200"
                        fontSize="11px" color="gray.600" cursor="pointer"
                        _hover={{ bg: 'gray.100', borderColor: 'gray.400' }}
                        transition="all 0.15s"
                      >
                        <Icon as={q.icon} boxSize={3} />
                        {q.label}
                      </Box>
                    ))}
                  </Flex>

                  <Text fontSize="10px" fontWeight="700" textTransform="uppercase" mb={1.5}
                    style={{ color: '#7C3AED', letterSpacing: '0.06em' }}>
                    From your Briefings
                  </Text>
                  <Flex gap={1.5} flexWrap="wrap">
                    {BRIEFING_QUESTIONS.map(q => (
                      <Box
                        key={q.label} as="button"
                        onClick={() => sendMessage(q.label)}
                        display="flex" alignItems="center" gap={1}
                        px={2.5} py={1.5} borderRadius="full"
                        bg="purple.50" border="1px solid" borderColor="purple.200"
                        fontSize="11px" color="purple.700" cursor="pointer"
                        _hover={{ bg: 'purple.100', borderColor: 'purple.400' }}
                        transition="all 0.15s"
                      >
                        <Icon as={q.icon} boxSize={3} />
                        {q.label}
                      </Box>
                    ))}
                  </Flex>
                </>
              )}
            </Box>

            {/* ── Messages ──────────────────────────────────────────────────── */}
            <Box h="220px" overflowY="auto" p={4} bg="white">
              <VStack align="stretch" spacing={0}>
                {messages.map(msg => (
                  <Flex
                    key={msg.id}
                    justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                    mb={3}
                  >
                    {msg.role === 'assistant' && (
                      <Box
                        w={6} h={6} borderRadius="full"
                        bgGradient="linear(135deg, #3B0764, #1E3A8A)"
                        display="flex" alignItems="center" justifyContent="center"
                        mr={2} flexShrink={0} mt={0.5}
                      >
                        {msg.isBrief === 'morning'
                          ? <Icon as={FiSunrise} color="white" boxSize={3} />
                          : msg.isBrief === 'evening'
                          ? <Icon as={FiSunset} color="white" boxSize={3} />
                          : <Icon as={FiZap} color="white" boxSize={3} />
                        }
                      </Box>
                    )}
                    <Box maxW="82%">
                      {/* Brief label */}
                      {msg.isBrief && (
                        <Text fontSize="9px" fontWeight="800" color="gray.400"
                          textTransform="uppercase" mb={1} ml={1}>
                          {msg.isBrief === 'morning' ? '☀️ Morning Brief' : '🌙 Evening Brief'}
                        </Text>
                      )}
                      <Box
                        px={3} py={2.5}
                        borderRadius={msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'}
                        bg={msg.role === 'user' ? 'purple.700' : msg.isBrief ? 'gray.50' : 'gray.100'}
                        border={msg.isBrief ? '1px solid' : 'none'}
                        borderColor="gray.200"
                      >
                        <Text
                          fontSize="13px" lineHeight="1.7"
                          color={msg.role === 'user' ? 'white' : 'gray.800'}
                          whiteSpace="pre-wrap"
                        >
                          {msg.content}
                        </Text>
                      </Box>
                      {msg.booking && !confirmedBookings.has(msg.id) && (
                        <BookingCard
                          booking={msg.booking}
                          onConfirm={() => {
                            saveMeeting(msg.booking!);
                            setConfirmedBookings(prev => new Set(prev).add(msg.id));
                            const conf: Message = {
                              role: 'assistant',
                              content: `Done — "${msg.booking!.title}" added to your calendar for ${msg.booking!.day}, ${msg.booking!.date} at ${msg.booking!.startHour % 12 || 12}:00 ${msg.booking!.startHour >= 12 ? 'PM' : 'AM'}.`,
                              id: Date.now(),
                            };
                            const next = [...messagesRef.current, conf];
                            setMessages(next); messagesRef.current = next;
                          }}
                          onDismiss={() => setConfirmedBookings(prev => new Set(prev).add(msg.id))}
                        />
                      )}
                      {msg.booking && confirmedBookings.has(msg.id) && (
                        <HStack mt={1.5} spacing={1}>
                          <Icon as={FiCheck} color="green.500" boxSize={3} />
                          <Text fontSize="10px" color="green.600" fontWeight="600">Added to calendar</Text>
                        </HStack>
                      )}
                    </Box>
                  </Flex>
                ))}

                {/* Live transcript */}
                {isListening && liveText && (
                  <Flex justify="flex-end" mb={3}>
                    <Box maxW="78%" px={3} py={2.5}
                      borderRadius="18px 18px 4px 18px"
                      bg="purple.100" border="1px dashed" borderColor="purple.300"
                    >
                      <Text fontSize="13px" color="purple.700" fontStyle="italic">{liveText}…</Text>
                    </Box>
                  </Flex>
                )}

                {isProcessing && <ThinkingDots />}
                <div ref={bottomRef} />
              </VStack>
            </Box>

            {/* ── Input bar ─────────────────────────────────────────────────── */}
            <Box px={3} py={3} borderTop="1px solid" borderColor="gray.100" bg="gray.50">
              <HStack spacing={2}>
                <Box
                  as="input" flex={1}
                  placeholder={
                    isListening ? '🎙 Listening…'
                    : isProcessing ? 'ARIA is thinking…'
                    : 'Cross-question ARIA…'
                  }
                  value={isListening ? liveText : textInput}
                  onChange={(e: any) => !isListening && setTextInput(e.target.value)}
                  onKeyDown={(e: any) => e.key === 'Enter' && !isListening && handleTextSend()}
                  readOnly={isListening || isProcessing}
                  px={3} py={2} borderRadius="full"
                  border="1.5px solid"
                  borderColor={isListening ? 'red.300' : isProcessing ? 'purple.200' : 'gray.200'}
                  bg="white" fontSize="13px" outline="none"
                  style={{ transition: 'border-color 0.15s' }}
                  sx={{ '&:focus': { borderColor: 'purple.400' } }}
                />
                <IconButton
                  aria-label="Send" icon={<FiSend />} size="sm"
                  colorScheme="purple" borderRadius="full"
                  onClick={handleTextSend}
                  isDisabled={isListening || isProcessing || !textInput.trim()}
                />
                <Box
                  as="button" onClick={toggleListen}
                  disabled={isProcessing || isSpeaking}
                  w="32px" h="32px" borderRadius="full"
                  display="flex" alignItems="center" justifyContent="center"
                  bg={isListening ? 'red.500' : 'white'}
                  border="1.5px solid"
                  borderColor={isListening ? 'red.500' : 'gray.300'}
                  color={isListening ? 'white' : 'gray.600'}
                  cursor={isProcessing || isSpeaking ? 'not-allowed' : 'pointer'}
                  opacity={isProcessing || isSpeaking ? 0.5 : 1}
                  transition="all 0.15s"
                  style={{ animation: isListening ? 'micRing 1s infinite' : 'none', outline: 'none' }}
                >
                  <Icon as={isListening ? FiMicOff : FiMic} boxSize={3.5} />
                </Box>
              </HStack>

              {/* Status line */}
              <Flex justify="center" mt={1.5} h={4} align="center">
                {isListening && (
                  <HStack spacing={1}>
                    <Box w={1.5} h={1.5} borderRadius="full" bg="red.400"
                      style={{ animation: 'liveDot 0.8s infinite' }} />
                    <Text fontSize="10px" color="red.500" fontWeight="600">Listening — speak now</Text>
                  </HStack>
                )}
                {isProcessing && !isListening && (
                  <Text fontSize="10px" color="purple.500" fontWeight="600">ARIA is preparing your brief…</Text>
                )}
                {isSpeaking && !isListening && !isProcessing && (
                  <HStack spacing={1.5}>
                    {[0, 0.1, 0.2, 0.3, 0.4].map((d, i) => <WaveBar key={i} delay={d} />)}
                    <Text fontSize="10px" color="purple.500" fontWeight="600">ARIA speaking</Text>
                  </HStack>
                )}
                {!isListening && !isProcessing && !isSpeaking && (
                  <Text fontSize="10px" color="gray.400">
                    🎤 voice  ·  ⌨️ type  ·  ↵ send
                  </Text>
                )}
              </Flex>
            </Box>
          </Box>
        )}

        {/* ── Floating orb ──────────────────────────────────────────────────── */}
        <Box
          as="button" onClick={handleOpen}
          w="56px" h="56px" borderRadius="full"
          bgGradient={isListening
            ? 'linear(135deg, #DC2626, #991B1B)'
            : 'linear(135deg, #3B0764, #1E3A8A)'}
          display="flex" alignItems="center" justifyContent="center"
          cursor="pointer" border="2.5px solid" borderColor="white"
          transition="all 0.2s"
          style={{
            outline: 'none',
            animation: isListening ? 'orbPulse 0.9s infinite' : isOpen ? 'none' : 'orbPulse 3s infinite',
            boxShadow: isOpen
              ? '0 4px 24px rgba(59,7,100,0.6)'
              : '0 4px 14px rgba(59,7,100,0.4)',
          }}
          sx={{ '&:hover': { transform: 'scale(1.08)' } }}
        >
          <Icon as={isListening ? FiMicOff : isOpen ? FiX : FiMic} color="white" boxSize={5} />
        </Box>

        {/* Tooltip */}
        {!isOpen && (
          <Box
            position="absolute" bottom="64px" right="0"
            bg="gray.900" color="white" px={2.5} py={1}
            borderRadius="lg" fontSize="11px" fontWeight="600"
            whiteSpace="nowrap" pointerEvents="none" opacity={0.85}
          >
            Grace's Daily Brief
          </Box>
        )}
      </Box>
    </>
  );
}
