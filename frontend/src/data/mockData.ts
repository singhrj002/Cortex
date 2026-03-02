// ============================================================
// NEXUS TECHNOLOGIES — Complete Organizational Mock Data
// Story: A fintech company where 3 decisions were made without
// CTO knowledge, and a critical security violation is live.
// ============================================================

// ─────────────────────────────────────────────────────────────
// PEOPLE & TEAMS
// ─────────────────────────────────────────────────────────────

export const members = [
  // Leadership
  { id: 'u-001', name: 'Grace Liu',       email: 'grace.liu@nexus.tech',      avatar: 'GL', role: 'CTO',                       team: 'Leadership',    teamId: 'team-000' },
  { id: 'u-002', name: 'Michael Park',    email: 'michael.park@nexus.tech',   avatar: 'MP', role: 'VP Engineering',             team: 'Leadership',    teamId: 'team-000' },
  { id: 'u-003', name: 'Rachel Foster',   email: 'rachel.foster@nexus.tech',  avatar: 'RF', role: 'Head of Product',            team: 'Leadership',    teamId: 'team-000' },
  // Backend Platform
  { id: 'u-004', name: 'Alice Chen',      email: 'alice.chen@nexus.tech',     avatar: 'AC', role: 'Backend Lead',               team: 'Backend Platform', teamId: 'team-001' },
  { id: 'u-005', name: 'David Kim',       email: 'david.kim@nexus.tech',      avatar: 'DK', role: 'Senior Backend Engineer',    team: 'Backend Platform', teamId: 'team-001' },
  { id: 'u-006', name: 'Priya Patel',     email: 'priya.patel@nexus.tech',    avatar: 'PP', role: 'Backend Engineer',           team: 'Backend Platform', teamId: 'team-001' },
  { id: 'u-007', name: 'James Wu',        email: 'james.wu@nexus.tech',       avatar: 'JW', role: 'Backend Engineer',           team: 'Backend Platform', teamId: 'team-001' },
  // Frontend
  { id: 'u-008', name: 'Jack Williams',   email: 'jack.williams@nexus.tech',  avatar: 'JW', role: 'Frontend Lead',              team: 'Frontend',      teamId: 'team-002' },
  { id: 'u-009', name: 'Sarah Chen',      email: 'sarah.chen@nexus.tech',     avatar: 'SC', role: 'Senior Frontend Engineer',   team: 'Frontend',      teamId: 'team-002' },
  { id: 'u-010', name: 'Tom Baker',       email: 'tom.baker@nexus.tech',      avatar: 'TB', role: 'Frontend Engineer',          team: 'Frontend',      teamId: 'team-002' },
  { id: 'u-011', name: 'Maya Rodriguez',  email: 'maya.r@nexus.tech',         avatar: 'MR', role: 'Frontend Engineer',          team: 'Frontend',      teamId: 'team-002' },
  // DevOps / Infrastructure
  { id: 'u-012', name: 'Bob Martinez',    email: 'bob.martinez@nexus.tech',   avatar: 'BM', role: 'DevOps Lead',                team: 'Infrastructure', teamId: 'team-003' },
  { id: 'u-013', name: 'Carlos Rodriguez',email: 'carlos.r@nexus.tech',       avatar: 'CR', role: 'Senior DevOps Engineer',     team: 'Infrastructure', teamId: 'team-003' },
  { id: 'u-014', name: 'Nina Patel',      email: 'nina.patel@nexus.tech',     avatar: 'NP', role: 'DevOps Engineer',            team: 'Infrastructure', teamId: 'team-003' },
  // Security
  { id: 'u-015', name: 'Irene Garcia',    email: 'irene.garcia@nexus.tech',   avatar: 'IG', role: 'Security Lead',              team: 'Security',      teamId: 'team-004' },
  { id: 'u-016', name: 'Marcus Thompson', email: 'marcus.t@nexus.tech',       avatar: 'MT', role: 'Security Engineer',          team: 'Security',      teamId: 'team-004' },
  // QA
  { id: 'u-017', name: 'Leo Zhang',       email: 'leo.zhang@nexus.tech',      avatar: 'LZ', role: 'QA Lead',                    team: 'QA',            teamId: 'team-005' },
  { id: 'u-018', name: 'Emma Wilson',     email: 'emma.wilson@nexus.tech',    avatar: 'EW', role: 'QA Engineer',                team: 'QA',            teamId: 'team-005' },
];

export const teams = [
  { id: 'team-000', name: 'Leadership',        color: '#805AD5', memberIds: ['u-001','u-002','u-003'], lead: 'u-001' },
  { id: 'team-001', name: 'Backend Platform',  color: '#3182CE', memberIds: ['u-004','u-005','u-006','u-007'], lead: 'u-004' },
  { id: 'team-002', name: 'Frontend',          color: '#38A169', memberIds: ['u-008','u-009','u-010','u-011'], lead: 'u-008' },
  { id: 'team-003', name: 'Infrastructure',    color: '#DD6B20', memberIds: ['u-012','u-013','u-014'], lead: 'u-012' },
  { id: 'team-004', name: 'Security',          color: '#E53E3E', memberIds: ['u-015','u-016'], lead: 'u-015' },
  { id: 'team-005', name: 'QA',                color: '#D69E2E', memberIds: ['u-017','u-018'], lead: 'u-017' },
];

// ─────────────────────────────────────────────────────────────
// JIRA PROJECTS & EPICS
// ─────────────────────────────────────────────────────────────

export const jiraProjects = [
  { id: 'proj-001', key: 'CORE',  name: 'Nexus Core Backend',        teamId: 'team-001', color: '#3182CE', description: 'Payment processing APIs and data layer' },
  { id: 'proj-002', key: 'WEB',   name: 'Nexus Web Application',     teamId: 'team-002', color: '#38A169', description: 'Customer-facing Next.js frontend' },
  { id: 'proj-003', key: 'INFRA', name: 'Infrastructure & DevOps',   teamId: 'team-003', color: '#DD6B20', description: 'Cloud infrastructure, CI/CD, monitoring' },
  { id: 'proj-004', key: 'SEC',   name: 'Security Initiative',       teamId: 'team-004', color: '#E53E3E', description: 'Q1 Security hardening and compliance' },
  { id: 'proj-005', key: 'QA',    name: 'Quality Assurance',         teamId: 'team-005', color: '#D69E2E', description: 'Testing, performance benchmarks, coverage' },
];

export const jiraEpics = [
  { id: 'epic-001', key: 'SEC-EPIC-001', title: 'Q1 Security Hardening',           projectKey: 'SEC',   status: 'in_progress', priority: 'critical', lead: 'u-015' },
  { id: 'epic-002', key: 'CORE-EPIC-002',title: 'Performance & Caching Overhaul',  projectKey: 'CORE',  status: 'in_progress', priority: 'high',     lead: 'u-004' },
  { id: 'epic-003', key: 'WEB-EPIC-003', title: 'Auth & User Profile APIs',        projectKey: 'WEB',   status: 'done',        priority: 'high',     lead: 'u-008' },
  { id: 'epic-004', key: 'INFRA-EPIC-004',title:'Infrastructure Standards 2025',   projectKey: 'INFRA', status: 'in_progress', priority: 'medium',   lead: 'u-012' },
];

// ─────────────────────────────────────────────────────────────
// JIRA TICKETS
// Story timeline (newest first):
//
// [TODAY]   SEC-007 — Critical: Basic Auth violation found in prod  ← Nobody told Grace
// [3d ago]  WEB-051 — PR: Migrate endpoints to OAuth 2.0 (Draft)   ← Jack trying to fix quietly
// [5d ago]  QA-037  — Performance comparison: Redis 40% faster      ← Grace approved Redis
// [6d ago]  CORE-082— Redis caching merged to staging               ← Alice
// [7d ago]  WEB-047 — Settings page uses Basic Auth (MERGED PROD)   ← Tom, shadow decision
// [8d ago]  WEB-046 — User profile uses Basic Auth (MERGED PROD)    ← Sarah, shadow decision
// [9d ago]  WEB-045 — Implement auth endpoints with Basic Auth (MERGED PROD) ← Jack, shadow decision
// [10d ago] INFRA-025 — Redis cluster config (BLOCKED)              ← Carlos
// [12d ago] CORE-079 — Migrate Memcached → Redis (BLOCKED by INFRA) ← David
// [14d ago] SEC-002 — Security audit of auth methods (In Progress)  ← Marcus
// [15d ago] QA-034  — Cache performance benchmark (Done)            ← Leo
// [18d ago] INFRA-023— Evaluate Redis vs Memcached (Done—Memcached) ← Bob
// [20d ago] CORE-078 — Implement Redis caching layer (In Progress)  ← Alice
// [25d ago] SEC-001  — Implement OAuth 2.0 for all APIs (Done)     ← Irene — THE ROOT
// ─────────────────────────────────────────────────────────────

export type TicketStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface JiraTicket {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  projectKey: string;
  epicKey?: string;
  assigneeId: string;
  reporterId: string;
  affectedTeams: string[];
  createdDaysAgo: number;
  updatedDaysAgo: number;
  isShadowDecision?: boolean;      // Decisions Grace doesn't know about
  isConflict?: boolean;
  linkedPR?: string;
  storyPoints?: number;
  labels?: string[];
}

export const jiraTickets: JiraTicket[] = [
  // ── SECURITY ───────────────────────────────────────────────
  {
    id: 'ticket-001',
    key: 'SEC-001',
    title: 'Implement OAuth 2.0 as mandatory standard for all API endpoints',
    description: 'Company-wide policy: all internal and external APIs must migrate to OAuth 2.0. Basic Auth is no longer permitted per SEC-STD-012. All teams must comply by end of Q1. This includes user-profile, settings, payments, and notification endpoints.',
    status: 'done',
    priority: 'critical',
    projectKey: 'SEC',
    epicKey: 'SEC-EPIC-001',
    assigneeId: 'u-015',
    reporterId: 'u-001',
    affectedTeams: ['Backend Platform', 'Frontend', 'Infrastructure'],
    createdDaysAgo: 25,
    updatedDaysAgo: 20,
    labels: ['security', 'oauth', 'compliance', 'company-policy'],
    storyPoints: 13,
  },
  {
    id: 'ticket-002',
    key: 'SEC-002',
    title: 'Security audit: scan all active endpoints for Basic Auth usage',
    description: 'Full audit of all APIs currently in production. Identify any endpoints still using Basic Auth following SEC-001 policy. Generate report for CTO. Priority scan: Frontend APIs deployed in last 30 days.',
    status: 'in_progress',
    priority: 'high',
    projectKey: 'SEC',
    epicKey: 'SEC-EPIC-001',
    assigneeId: 'u-016',
    reporterId: 'u-015',
    affectedTeams: ['Security', 'Frontend', 'Backend Platform'],
    createdDaysAgo: 14,
    updatedDaysAgo: 1,
    labels: ['audit', 'security', 'basic-auth'],
    storyPoints: 5,
  },
  {
    id: 'ticket-003',
    key: 'SEC-007',
    title: '🚨 CRITICAL: Basic Auth violation detected in production endpoints',
    description: 'Security audit (SEC-002) found 3 production endpoints using Basic Auth in violation of SEC-001:\n• /api/user-profile (WEB-045)\n• /api/user-settings (WEB-047)\n• /api/notifications (WEB-046)\n\nAll 3 were merged in the last 10 days. Compliance failure — immediate action required. Not yet escalated to CTO.',
    status: 'todo',
    priority: 'critical',
    projectKey: 'SEC',
    epicKey: 'SEC-EPIC-001',
    assigneeId: 'u-015',
    reporterId: 'u-016',
    affectedTeams: ['Security', 'Frontend', 'Leadership'],
    createdDaysAgo: 0,
    updatedDaysAgo: 0,
    isShadowDecision: true,
    isConflict: true,
    labels: ['critical', 'production', 'compliance-breach', 'unread'],
    storyPoints: 8,
  },

  // ── BACKEND / CORE ─────────────────────────────────────────
  {
    id: 'ticket-004',
    key: 'CORE-078',
    title: 'Implement Redis caching layer for payment transaction queries',
    description: 'Replace direct DB queries with Redis cache for high-frequency transaction lookups. Expected 40% latency reduction based on benchmarks. Propose Redis over Memcached for richer data structures and pub/sub support.',
    status: 'in_progress',
    priority: 'high',
    projectKey: 'CORE',
    epicKey: 'CORE-EPIC-002',
    assigneeId: 'u-004',
    reporterId: 'u-004',
    affectedTeams: ['Backend Platform', 'Infrastructure'],
    createdDaysAgo: 20,
    updatedDaysAgo: 6,
    linkedPR: 'PR-289',
    labels: ['redis', 'caching', 'performance'],
    storyPoints: 8,
  },
  {
    id: 'ticket-005',
    key: 'CORE-079',
    title: 'Migrate existing Memcached cache to Redis (blocked by INFRA standards)',
    description: 'Data migration task: move all cached data from Memcached to Redis. Blocked pending INFRA team decision on INFRA-024. Cannot proceed until infrastructure standards are updated to allow Redis.',
    status: 'blocked',
    priority: 'high',
    projectKey: 'CORE',
    epicKey: 'CORE-EPIC-002',
    assigneeId: 'u-005',
    reporterId: 'u-004',
    affectedTeams: ['Backend Platform', 'Infrastructure'],
    createdDaysAgo: 12,
    updatedDaysAgo: 5,
    isConflict: true,
    linkedPR: 'PR-292',
    labels: ['redis', 'migration', 'blocked'],
    storyPoints: 5,
  },
  {
    id: 'ticket-006',
    key: 'CORE-082',
    title: 'Redis integration merged to staging — pending prod approval',
    description: 'Redis caching layer successfully deployed to staging. Load tests show 43% improvement in P99 latency. Awaiting CTO sign-off to promote to production. Conflicts with active INFRA-023 Memcached standard.',
    status: 'in_progress',
    priority: 'high',
    projectKey: 'CORE',
    epicKey: 'CORE-EPIC-002',
    assigneeId: 'u-004',
    reporterId: 'u-004',
    affectedTeams: ['Backend Platform', 'Infrastructure', 'Leadership'],
    createdDaysAgo: 6,
    updatedDaysAgo: 1,
    linkedPR: 'PR-289',
    labels: ['redis', 'staging', 'pending-approval'],
    storyPoints: 3,
  },

  // ── FRONTEND ───────────────────────────────────────────────
  {
    id: 'ticket-007',
    key: 'WEB-045',
    title: 'Implement user authentication endpoints — /api/user-profile',
    description: 'Build authentication flow for user profile endpoint. Implemented using HTTP Basic Auth for speed of delivery. Sprint deadline was tight. NOTE: This predates SEC-001 awareness by the Frontend team.',
    status: 'done',
    priority: 'high',
    projectKey: 'WEB',
    epicKey: 'WEB-EPIC-003',
    assigneeId: 'u-008',
    reporterId: 'u-008',
    affectedTeams: ['Frontend', 'Backend Platform'],
    createdDaysAgo: 15,
    updatedDaysAgo: 9,
    isShadowDecision: true,
    isConflict: true,
    linkedPR: 'PR-267',
    labels: ['auth', 'basic-auth', 'production', 'sec-violation'],
    storyPoints: 5,
  },
  {
    id: 'ticket-008',
    key: 'WEB-046',
    title: 'User notifications API integration — /api/notifications',
    description: 'Integrate notification API on frontend. Used Basic Auth for consistency with WEB-045. Merged to production as part of user profile sprint.',
    status: 'done',
    priority: 'medium',
    projectKey: 'WEB',
    epicKey: 'WEB-EPIC-003',
    assigneeId: 'u-009',
    reporterId: 'u-008',
    affectedTeams: ['Frontend'],
    createdDaysAgo: 13,
    updatedDaysAgo: 8,
    isShadowDecision: true,
    isConflict: true,
    linkedPR: 'PR-268',
    labels: ['notifications', 'basic-auth', 'production', 'sec-violation'],
    storyPoints: 3,
  },
  {
    id: 'ticket-009',
    key: 'WEB-047',
    title: 'Settings page API integration — /api/user-settings',
    description: 'Connect settings page to backend. Auth method: Basic Auth (matched existing WEB-045 pattern). Merged to production. Part of Q1 user profile feature delivery.',
    status: 'done',
    priority: 'medium',
    projectKey: 'WEB',
    epicKey: 'WEB-EPIC-003',
    assigneeId: 'u-010',
    reporterId: 'u-008',
    affectedTeams: ['Frontend'],
    createdDaysAgo: 12,
    updatedDaysAgo: 7,
    isShadowDecision: true,
    isConflict: true,
    linkedPR: 'PR-271',
    labels: ['settings', 'basic-auth', 'production', 'sec-violation'],
    storyPoints: 3,
  },
  {
    id: 'ticket-010',
    key: 'WEB-051',
    title: '[DRAFT] Migrate user endpoints from Basic Auth to OAuth 2.0',
    description: 'Emergency remediation for SEC-007. Jack quietly started this branch after Marcus raised the audit concern informally. Not yet linked to SEC-007 ticket. Not escalated. Grace not informed.',
    status: 'in_progress',
    priority: 'critical',
    projectKey: 'WEB',
    epicKey: 'WEB-EPIC-003',
    assigneeId: 'u-008',
    reporterId: 'u-008',
    affectedTeams: ['Frontend', 'Security'],
    createdDaysAgo: 3,
    updatedDaysAgo: 0,
    isShadowDecision: true,
    linkedPR: 'PR-294',
    labels: ['oauth', 'remediation', 'draft', 'unescalated'],
    storyPoints: 8,
  },

  // ── INFRASTRUCTURE ─────────────────────────────────────────
  {
    id: 'ticket-011',
    key: 'INFRA-023',
    title: 'Evaluate Redis vs Memcached — recommend Memcached as standard',
    description: 'Infrastructure team evaluation completed. Recommendation: retain Memcached as company caching standard. Existing tooling, monitoring, and SLAs are built around Memcached. Redis adds operational overhead.',
    status: 'done',
    priority: 'medium',
    projectKey: 'INFRA',
    epicKey: 'INFRA-EPIC-004',
    assigneeId: 'u-012',
    reporterId: 'u-012',
    affectedTeams: ['Infrastructure', 'Backend Platform'],
    createdDaysAgo: 18,
    updatedDaysAgo: 15,
    isConflict: true,
    labels: ['caching', 'memcached', 'standards'],
    storyPoints: 5,
  },
  {
    id: 'ticket-012',
    key: 'INFRA-024',
    title: 'Infrastructure caching standards: formal policy documentation',
    description: 'Write and publish formal policy for caching technology selection. Currently in draft — Memcached preferred. Blocked pending resolution of CORE-078 Redis proposal. CTO decision needed.',
    status: 'blocked',
    priority: 'high',
    projectKey: 'INFRA',
    epicKey: 'INFRA-EPIC-004',
    assigneeId: 'u-013',
    reporterId: 'u-012',
    affectedTeams: ['Infrastructure', 'Backend Platform', 'Leadership'],
    createdDaysAgo: 10,
    updatedDaysAgo: 4,
    isConflict: true,
    labels: ['standards', 'policy', 'blocked', 'cto-decision'],
    storyPoints: 3,
  },
  {
    id: 'ticket-013',
    key: 'INFRA-025',
    title: 'Redis cluster Terraform configuration (blocked — not approved)',
    description: 'Carlos prepared Terraform configs for Redis cluster on AWS ElastiCache. Work is complete but deployment is blocked — INFRA-024 policy not yet updated to allow Redis.',
    status: 'blocked',
    priority: 'high',
    projectKey: 'INFRA',
    epicKey: 'INFRA-EPIC-004',
    assigneeId: 'u-013',
    reporterId: 'u-012',
    affectedTeams: ['Infrastructure'],
    createdDaysAgo: 10,
    updatedDaysAgo: 5,
    linkedPR: 'PR-045-infra',
    labels: ['terraform', 'redis', 'blocked'],
    storyPoints: 5,
  },

  // ── QA ─────────────────────────────────────────────────────
  {
    id: 'ticket-014',
    key: 'QA-034',
    title: 'Cache performance benchmark: Redis vs Memcached under prod load',
    description: 'Ran 72-hour load test simulating 50K concurrent users. Results: Redis P99 latency: 4ms. Memcached P99 latency: 7ms. Redis throughput 40% higher under burst conditions. Recommendation: Redis.',
    status: 'done',
    priority: 'high',
    projectKey: 'QA',
    assigneeId: 'u-017',
    reporterId: 'u-017',
    affectedTeams: ['QA', 'Backend Platform', 'Infrastructure'],
    createdDaysAgo: 15,
    updatedDaysAgo: 5,
    labels: ['performance', 'redis', 'memcached', 'benchmark'],
    storyPoints: 8,
  },
  {
    id: 'ticket-015',
    key: 'QA-037',
    title: 'Auth endpoint security regression test — Basic Auth endpoints',
    description: 'Security regression suite for WEB-045, WEB-046, WEB-047. Tests confirm Basic Auth is functional but insecure. Penetration test showed credentials visible in base64 headers. Filed alongside SEC-007.',
    status: 'done',
    priority: 'critical',
    projectKey: 'QA',
    assigneeId: 'u-018',
    reporterId: 'u-017',
    affectedTeams: ['QA', 'Security', 'Frontend'],
    createdDaysAgo: 5,
    updatedDaysAgo: 1,
    isConflict: true,
    labels: ['security', 'regression', 'pentest', 'basic-auth'],
    storyPoints: 5,
  },
];

// ─────────────────────────────────────────────────────────────
// GIT REPOSITORIES & PULL REQUESTS
// ─────────────────────────────────────────────────────────────

export const gitRepos = [
  {
    id: 'repo-001',
    name: 'nexus-backend',
    fullName: 'nexus-tech/nexus-backend',
    description: 'FastAPI payment processing backend — Python 3.12',
    language: 'Python',
    defaultBranch: 'main',
    teamId: 'team-001',
    openPRs: 3,
    lastActivity: '2 hours ago',
    stars: 24,
  },
  {
    id: 'repo-002',
    name: 'nexus-web',
    fullName: 'nexus-tech/nexus-web',
    description: 'Next.js 14 customer-facing web application',
    language: 'TypeScript',
    defaultBranch: 'main',
    teamId: 'team-002',
    openPRs: 2,
    lastActivity: '45 minutes ago',
    stars: 18,
  },
  {
    id: 'repo-003',
    name: 'nexus-infrastructure',
    fullName: 'nexus-tech/nexus-infrastructure',
    description: 'Terraform, Helm charts, and CI/CD pipeline config',
    language: 'HCL',
    defaultBranch: 'main',
    teamId: 'team-003',
    openPRs: 1,
    lastActivity: '5 hours ago',
    stars: 11,
  },
  {
    id: 'repo-004',
    name: 'nexus-security',
    fullName: 'nexus-tech/nexus-security',
    description: 'Security tooling, audit scripts, and policy configs',
    language: 'Python',
    defaultBranch: 'main',
    teamId: 'team-004',
    openPRs: 0,
    lastActivity: '1 day ago',
    stars: 6,
  },
];

export type PRStatus = 'open' | 'merged' | 'draft' | 'closed';

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  status: PRStatus;
  repoName: string;
  authorId: string;
  reviewerIds: string[];
  branch: string;
  targetBranch: string;
  createdDaysAgo: number;
  mergedDaysAgo?: number;
  additions: number;
  deletions: number;
  linkedTickets: string[];
  isShadowDecision?: boolean;
  isConflict?: boolean;
  reviewStatus: 'approved' | 'changes_requested' | 'pending' | 'merged';
  comments: number;
  labels?: string[];
}

export const pullRequests: PullRequest[] = [
  // nexus-backend PRs
  {
    id: 'pr-001',
    number: 289,
    title: 'feat: Redis caching layer for transaction queries',
    description: 'Implements Redis caching for high-frequency transaction lookups. P99 drops from 7ms → 4ms in staging. Uses Redis Cluster on ElastiCache. Requires INFRA approval to deploy to prod.',
    status: 'open',
    repoName: 'nexus-backend',
    authorId: 'u-004',
    reviewerIds: ['u-005', 'u-012'],
    branch: 'feat/redis-cache-layer',
    targetBranch: 'main',
    createdDaysAgo: 6,
    additions: 487,
    deletions: 112,
    linkedTickets: ['CORE-078', 'CORE-082'],
    isConflict: true,
    reviewStatus: 'changes_requested',
    comments: 14,
    labels: ['redis', 'performance', 'needs-infra-approval'],
  },
  {
    id: 'pr-002',
    number: 291,
    title: 'chore: Increase Memcached connection pool size to 50',
    description: 'Bumped Memcached connection pool from 10 → 50 to handle traffic spikes. Quick fix while caching architecture is being debated.',
    status: 'merged',
    repoName: 'nexus-backend',
    authorId: 'u-012',
    reviewerIds: ['u-005'],
    branch: 'fix/memcached-pool-size',
    targetBranch: 'main',
    createdDaysAgo: 7,
    mergedDaysAgo: 5,
    additions: 8,
    deletions: 3,
    linkedTickets: ['INFRA-023'],
    isConflict: true,
    reviewStatus: 'merged',
    comments: 3,
    labels: ['memcached', 'hotfix'],
  },
  {
    id: 'pr-003',
    number: 292,
    title: 'feat: Redis migration scripts for Memcached → Redis',
    description: 'Data migration tooling. Blocked: cannot run until infrastructure approves Redis. Scripts are ready and tested in dev.',
    status: 'open',
    repoName: 'nexus-backend',
    authorId: 'u-005',
    reviewerIds: ['u-004'],
    branch: 'feat/redis-migration',
    targetBranch: 'main',
    createdDaysAgo: 5,
    additions: 234,
    deletions: 0,
    linkedTickets: ['CORE-079'],
    isConflict: true,
    reviewStatus: 'pending',
    comments: 7,
    labels: ['redis', 'migration', 'blocked'],
  },

  // nexus-web PRs
  {
    id: 'pr-004',
    number: 267,
    title: 'feat: User profile authentication — /api/user-profile',
    description: 'Adds HTTP Basic Auth for the user profile endpoint. Fastest approach to meet sprint deadline. Review and approve.',
    status: 'merged',
    repoName: 'nexus-web',
    authorId: 'u-008',
    reviewerIds: ['u-009'],
    branch: 'feat/user-profile-auth',
    targetBranch: 'main',
    createdDaysAgo: 11,
    mergedDaysAgo: 9,
    additions: 156,
    deletions: 22,
    linkedTickets: ['WEB-045'],
    isShadowDecision: true,
    isConflict: true,
    reviewStatus: 'merged',
    comments: 5,
    labels: ['auth', 'basic-auth', 'production'],
  },
  {
    id: 'pr-005',
    number: 268,
    title: 'feat: Notifications API integration',
    description: 'Hooks up /api/notifications endpoint. Used Basic Auth matching PR #267 pattern for consistency.',
    status: 'merged',
    repoName: 'nexus-web',
    authorId: 'u-009',
    reviewerIds: ['u-008'],
    branch: 'feat/notifications-api',
    targetBranch: 'main',
    createdDaysAgo: 10,
    mergedDaysAgo: 8,
    additions: 98,
    deletions: 14,
    linkedTickets: ['WEB-046'],
    isShadowDecision: true,
    isConflict: true,
    reviewStatus: 'merged',
    comments: 2,
    labels: ['notifications', 'basic-auth', 'production'],
  },
  {
    id: 'pr-006',
    number: 271,
    title: 'feat: Settings page — /api/user-settings integration',
    description: 'Connects settings page to backend. Auth: Basic Auth (consistent with existing endpoints).',
    status: 'merged',
    repoName: 'nexus-web',
    authorId: 'u-010',
    reviewerIds: ['u-008'],
    branch: 'feat/settings-api',
    targetBranch: 'main',
    createdDaysAgo: 9,
    mergedDaysAgo: 7,
    additions: 203,
    deletions: 41,
    linkedTickets: ['WEB-047'],
    isShadowDecision: true,
    isConflict: true,
    reviewStatus: 'merged',
    comments: 4,
    labels: ['settings', 'basic-auth', 'production'],
  },
  {
    id: 'pr-007',
    number: 294,
    title: '[DRAFT] fix: Migrate user endpoints to OAuth 2.0',
    description: 'DRAFT — not ready for review. Emergency fix for SEC-007 violation. Replacing Basic Auth with OAuth 2.0 on all 3 affected endpoints. Not yet escalated to leadership.',
    status: 'draft',
    repoName: 'nexus-web',
    authorId: 'u-008',
    reviewerIds: [],
    branch: 'fix/oauth2-migration',
    targetBranch: 'main',
    createdDaysAgo: 2,
    additions: 312,
    deletions: 178,
    linkedTickets: ['WEB-051'],
    isShadowDecision: true,
    reviewStatus: 'pending',
    comments: 0,
    labels: ['oauth', 'remediation', 'draft', 'security'],
  },

  // nexus-infrastructure PRs
  {
    id: 'pr-008',
    number: 45,
    title: 'feat: Redis ElastiCache cluster — Terraform config',
    description: 'Adds AWS ElastiCache Redis cluster config via Terraform. Multi-AZ, encryption at rest. Blocked by INFRA-024 policy decision. Carlos ready to deploy on approval.',
    status: 'open',
    repoName: 'nexus-infrastructure',
    authorId: 'u-013',
    reviewerIds: ['u-012'],
    branch: 'feat/redis-elasticache',
    targetBranch: 'main',
    createdDaysAgo: 9,
    additions: 178,
    deletions: 0,
    linkedTickets: ['INFRA-025'],
    isConflict: true,
    reviewStatus: 'changes_requested',
    comments: 9,
    labels: ['terraform', 'redis', 'blocked', 'aws'],
  },
];

// ─────────────────────────────────────────────────────────────
// SHADOW DECISIONS ("What Grace Was Not Told")
// ─────────────────────────────────────────────────────────────

export const shadowDecisions = [
  {
    id: 'sd-001',
    title: 'Basic Auth deployed to 3 production endpoints',
    detectedDaysAgo: 0,
    madeByName: 'Jack Williams',
    madeById: 'u-008',
    involvedIds: ['u-008', 'u-009', 'u-010'],
    severity: 'critical' as const,
    description: 'Frontend team shipped Basic Auth on /api/user-profile, /api/notifications, and /api/user-settings without security review. Violates company policy SEC-STD-012 established by SEC-001.',
    linkedTickets: ['WEB-045', 'WEB-046', 'WEB-047'],
    linkedPRs: [267, 268, 271],
    detectedVia: 'Security Audit SEC-002',
    status: 'unresolved' as const,
    escalatedToCTO: false,
  },
  {
    id: 'sd-002',
    title: 'Jack quietly started OAuth remediation without escalating',
    detectedDaysAgo: 2,
    madeByName: 'Jack Williams',
    madeById: 'u-008',
    involvedIds: ['u-008'],
    severity: 'high' as const,
    description: 'Jack opened a draft PR (#294) to fix the auth violation but has not linked it to SEC-007, not informed Irene, and not escalated to Grace. The fix is in progress but invisible to leadership.',
    linkedTickets: ['WEB-051'],
    linkedPRs: [294],
    detectedVia: 'Git activity analysis',
    status: 'in_progress' as const,
    escalatedToCTO: false,
  },
  {
    id: 'sd-003',
    title: 'Bob merged Memcached pool increase — conflicting with Redis migration',
    detectedDaysAgo: 5,
    madeByName: 'Bob Martinez',
    madeById: 'u-012',
    involvedIds: ['u-012', 'u-005'],
    severity: 'medium' as const,
    description: 'Bob merged a Memcached optimization (PR #291) while Alice\'s Redis migration (PR #289) is actively in review. This signals DevOps commitment to Memcached even as CTO is being asked to approve Redis.',
    linkedTickets: ['INFRA-023', 'CORE-079'],
    linkedPRs: [291, 289],
    detectedVia: 'Cross-repo PR analysis',
    status: 'unresolved' as const,
    escalatedToCTO: false,
  },
];

// ─────────────────────────────────────────────────────────────
// SPRINT DATA
// ─────────────────────────────────────────────────────────────

export const currentSprint = {
  id: 'sprint-q1-03',
  name: 'Q1 Sprint 3 — Security & Performance',
  startDate: '2026-02-17',
  endDate: '2026-02-28',
  goal: 'Complete OAuth 2.0 rollout across all APIs and ship Redis caching to production',
  velocity: 42,
  committedPoints: 48,
  completedPoints: 31,
  teamId: 'team-001',
};

// ─────────────────────────────────────────────────────────────
// HELPER — find member by ID
// ─────────────────────────────────────────────────────────────

export const getMemberById = (id: string) => members.find(m => m.id === id);
export const getTeamById   = (id: string) => teams.find(t => t.id === id);
export const getPRsByRepo  = (repoName: string) => pullRequests.filter(pr => pr.repoName === repoName);
export const getTicketsByProject = (projectKey: string) => jiraTickets.filter(t => t.projectKey === projectKey);
