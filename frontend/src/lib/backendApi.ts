/**
 * backendApi.ts — Typed client for the FastAPI backend at :8000
 *
 * All functions fall back gracefully when the backend is unavailable,
 * returning null so the UI can display its hardcoded demo data.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API  = `${BASE}/api/v1`;

// ─── Types (mirror backend Pydantic / SQLAlchemy models) ─────────────────────

export interface OrgHealthPillar {
  name: string;
  score: number;
  weight: number;
  status: 'healthy' | 'moderate' | 'at_risk' | 'critical';
  detail: Record<string, unknown>;
}

export interface TeamScore {
  team: string;
  score: number;
  headcount: number;
  status: string;
}

export interface OrgHealth {
  overall_score: number;
  trend: 'improving' | 'stable' | 'declining';
  computed_at: string;
  pillars: OrgHealthPillar[];
  team_scores: TeamScore[];
  summary: {
    open_conflicts: number;
    blocked_tickets: number;
    at_risk_employees: number;
    total_employees: number;
  };
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  tier: string;
  sprint: number;
  score: number;
  velocityScore: number;
  communicationScore: number;
  collaborationScore: number;
  ticketsResolved: number;
  ticketsBlocked: number;
  avgCloseTimeDays: number;
  prReviews: number;
  hoursThisWeek: number;
  riskLevel: 'healthy' | 'at_risk' | 'overloaded' | 'critical';
  riskReason: string | null;
  trend: number[];
  hasShadowWork: boolean;
  isBurnoutRisk: boolean;
  insight: string | null;
  computedAt: string;
}

export interface OrgConflict {
  id: string;
  conflict_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  description: string;
  entity_ids: string[];
  evidence: Record<string, unknown>[];
  days_open: number;
  created_at: string;
}

export interface Ticket {
  id: string;
  key: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_name: string | null;
  team_name: string | null;
  sprint: number;
  days_open: number;
  is_blocked: boolean;
  is_shadow: boolean;
  is_conflict_linked: boolean;
}

export interface Brief {
  type: 'morning' | 'evening';
  brief: string;
  generated_at: string;
}

export interface ConflictSummary {
  total_open: number;
  critical: number;
  high: number;
  conflicts: {
    id: string;
    type: string;
    severity: string;
    description: string;
    days_open: number;
    entities: string[];
  }[];
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      // Short timeout so UI doesn't hang if backend is down
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn(`[backendApi] ${path} → ${res.status}`);
      return null;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    console.warn(`[backendApi] ${path} unavailable:`, err);
    return null;
  }
}

// ─── Org Health ───────────────────────────────────────────────────────────────

export async function getOrgHealth(): Promise<OrgHealth | null> {
  return apiFetch<OrgHealth>('/org-health/');
}

// ─── Employees ────────────────────────────────────────────────────────────────

export async function getEmployees(sprint = 3): Promise<Employee[]> {
  const res = await apiFetch<{ employees: Employee[] }>(`/employees/?sprint=${sprint}`);
  return res?.employees ?? [];
}

export async function getAtRiskEmployees(sprint = 3): Promise<Employee[]> {
  const res = await apiFetch<{ employees: Employee[] }>(`/employees/at-risk?sprint=${sprint}`);
  return res?.employees ?? [];
}

// ─── Conflicts ────────────────────────────────────────────────────────────────

export async function getConflicts(status?: string): Promise<OrgConflict[]> {
  const qs = status ? `?status=${status}` : '';
  const res = await apiFetch<{ conflicts: OrgConflict[] }>(`/conflicts/${qs}`);
  return res?.conflicts ?? [];
}

export async function getConflictSummary(): Promise<ConflictSummary | null> {
  return apiFetch<ConflictSummary>('/conflicts/summary');
}

export async function resolveConflict(id: string, resolution: string): Promise<boolean> {
  const res = await apiFetch(`/conflicts/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ resolution }),
  });
  return res !== null;
}

export async function triggerConflictDetection(eventId: string): Promise<boolean> {
  const res = await apiFetch(`/conflicts/detect/${eventId}`, { method: 'POST' });
  return res !== null;
}

export async function detectAllConflicts(): Promise<boolean> {
  const res = await apiFetch('/conflicts/detect-all', { method: 'POST' });
  return res !== null;
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function getTickets(opts?: {
  status?: string; team?: string; blockedOnly?: boolean; sprint?: number;
}): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (opts?.status)      params.set('status', opts.status);
  if (opts?.team)        params.set('team', opts.team);
  if (opts?.blockedOnly) params.set('blocked_only', 'true');
  if (opts?.sprint)      params.set('sprint', String(opts.sprint));
  const qs = params.toString() ? `?${params}` : '';
  const res = await apiFetch<{ tickets: Ticket[] }>(`/tickets/${qs}`);
  return res?.tickets ?? [];
}

export async function updateTicketStatus(key: string, status: string): Promise<boolean> {
  const res = await apiFetch(`/tickets/${key}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res !== null;
}

// ─── Briefs ───────────────────────────────────────────────────────────────────

export async function getMorningBrief(): Promise<Brief | null> {
  return apiFetch<Brief>('/briefs/morning');
}

export async function getEveningBrief(): Promise<Brief | null> {
  return apiFetch<Brief>('/briefs/evening');
}

// ─── Backend health check ─────────────────────────────────────────────────────

export async function isBackendOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
