# OAuth 2.0 vs Basic Auth Conflict Script

This script adds a critical authentication conflict between the Security Team and Frontend Team to your database.

## What It Creates

### Claims
1. **OAuth Requirement Claim** (by Security Team)
   - "Security team requires OAuth 2.0 for all API authentication"
   - Confidence: 95%
   - Polarity: Assertive
   - Standard: SEC-STD-012

2. **Basic Auth Implementation Claim** (by Frontend Team)
   - "Frontend team implemented Basic Auth for API endpoints"
   - Confidence: 90%
   - Polarity: Neutral
   - Endpoints: user-profile, settings

### Events
1. **Slack Message** (8 days ago)
   - From: Jack Williams (Frontend Lead)
   - "We've implemented Basic Auth for the new API endpoints..."

2. **Email** (5 days ago)
   - From: Irene Garcia (Security Engineer)
   - Subject: "RE: API Authentication Standards"
   - Critical security concern raised

### Conflict
- **Type**: Claim Conflict
- **Status**: Open
- **Severity**: Critical
- **Description**: "Security team requires OAuth 2.0, but Frontend team implemented Basic Auth"
- **Affected Teams**: Security Team, Frontend Team

### People
- Irene Garcia (Security Engineer) - Security Team
- Jack Williams (Frontend Lead) - Frontend Team

### Neo4j Relationships
- Person → Team (MEMBER_OF)
- Person → Claim (MADE_CLAIM)
- Person → Event (SENT)
- Claim → Topic (RELATES_TO)
- Claim → Team (AFFECTS)
- Claim → Claim (CONTRADICTS)

## How to Run

### Prerequisites
1. Ensure PostgreSQL is running
2. Ensure Neo4j is running
3. Database migrations are up to date

### Run the Script

From the backend directory:

```bash
cd /Users/Raj.Singh/test_build/ai-chief-of-staff/backend
python scripts/add_auth_conflict.py
```

Or make it executable and run directly:

```bash
cd /Users/Raj.Singh/test_build/ai-chief-of-staff/backend/scripts
./add_auth_conflict.py
```

### Expected Output

```
Starting OAuth 2.0 vs Basic Auth conflict creation...
Created Basic Auth implementation event
Created Basic Auth claim: Frontend team implemented Basic Auth for API endpoints
Created OAuth requirement event
Created OAuth claim: Security team requires OAuth 2.0 for all API authentication
Created authentication conflict: Security team requires OAuth 2.0, but Frontend team implemented Basic Auth

✅ Successfully created OAuth 2.0 vs Basic Auth conflict!
   - Security Team Claim: Security team requires OAuth 2.0 for all API authentication
   - Frontend Team Claim: Frontend team implemented Basic Auth for API endpoints
   - Conflict Status: open
   - Severity: critical
   - Affected Teams: Security Team, Frontend Team
```

## Verification

### Check PostgreSQL
```sql
-- Check claims
SELECT * FROM claims WHERE claim_key IN ('oauth_required_for_apis', 'basic_auth_implementation');

-- Check conflict
SELECT * FROM conflicts WHERE description LIKE '%OAuth%';

-- Check events
SELECT * FROM events WHERE body_text LIKE '%Basic Auth%' OR body_text LIKE '%OAuth%';
```

### Check Neo4j
```cypher
// Find the claims
MATCH (c:Claim)
WHERE c.claim_key IN ['oauth_required_for_apis', 'basic_auth_implementation']
RETURN c;

// Find contradiction relationship
MATCH (c1:Claim)-[r:CONTRADICTS]->(c2:Claim)
WHERE c1.claim_key = 'oauth_required_for_apis'
RETURN c1, r, c2;

// Find all relationships
MATCH (p:Person)-[:MADE_CLAIM]->(c:Claim)-[:RELATES_TO]->(t:Topic)
WHERE c.claim_key IN ['oauth_required_for_apis', 'basic_auth_implementation']
RETURN p, c, t;
```

### Check Frontend
1. Navigate to `http://localhost:3000/conflicts`
2. Look for "API Authentication Method" conflict
3. Click "View Details" to see the conflict information
4. Click "Take Action" to see suggested resolution actions

## Integration with Main Narrative

This script can be run independently or as part of the main caching narrative. The entities it creates (teams, people, topics) will be reused if they already exist, making it safe to run multiple times.

## Cleanup

To remove the conflict (if needed):

```sql
-- Remove from PostgreSQL
DELETE FROM conflicts WHERE description LIKE '%OAuth%';
DELETE FROM claims WHERE claim_key IN ('oauth_required_for_apis', 'basic_auth_implementation');
DELETE FROM events WHERE body_text LIKE '%Basic Auth%' OR body_text LIKE '%OAuth%';
```

```cypher
// Remove from Neo4j
MATCH (c:Claim)
WHERE c.claim_key IN ['oauth_required_for_apis', 'basic_auth_implementation']
DETACH DELETE c;
```
