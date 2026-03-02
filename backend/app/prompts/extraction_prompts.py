"""
Prompt templates for LLM-based extraction of organizational knowledge.
"""

EXTRACTION_SYSTEM_PROMPT = """You are an expert at analyzing organizational communications and extracting structured knowledge.

Your task is to analyze email communications and identify:
1. **Decisions**: Any commitments, choices, or resolutions made by individuals or teams
2. **Tasks**: Action items, to-dos, or work assignments
3. **Claims**: Factual statements or assertions made by individuals

For each entity you extract, provide:
- High confidence score (0.0-1.0) based on clarity and explicitness
- Evidence from the email (quote relevant text)
- Key attributes (who, what, when, why)

Be conservative - only extract entities that are clearly present. If something is ambiguous, give it a lower confidence score.
"""

EXTRACTION_USER_PROMPT_TEMPLATE = """Analyze the following email and extract decisions, tasks, and claims.

**Email Metadata:**
From: {sender}
To: {recipients}
Subject: {subject}
Date: {timestamp}

**Email Content:**
{body}

Extract the following in JSON format:

```json
{{
  "decisions": [
    {{
      "title": "Brief decision title",
      "summary": "What was decided",
      "rationale": "Why this decision was made (if mentioned)",
      "scope": "Who/what is affected",
      "decision_key_hint": "suggested_stable_key",
      "owner_email": "email@example.com",
      "decided_by_emails": ["email1@example.com", "email2@example.com"],
      "confidence": 0.85,
      "evidence": "Quote from email showing this decision"
    }}
  ],
  "tasks": [
    {{
      "title": "Brief task description",
      "description": "Detailed task description if available",
      "assignee_email": "email@example.com",
      "due_date": "2024-12-31T23:59:59" or null,
      "priority": "low|normal|high|urgent",
      "confidence": 0.75,
      "evidence": "Quote showing this task"
    }}
  ],
  "claims": [
    {{
      "text": "The exact claim or statement made",
      "claim_key_hint": "suggested_stable_key",
      "claimant_email": "email@example.com",
      "polarity": "positive|negative|neutral",
      "confidence": 0.90,
      "evidence": "Quote from email"
    }}
  ],
  "topics": [
    {{
      "name": "Topic name",
      "keywords": ["keyword1", "keyword2"]
    }}
  ],
  "signals": {{
    "urgency": "low|normal|high|urgent",
    "decision_signal": true,
    "conflict_signal": false,
    "requires_followup": false
  }}
}}
```

Guidelines:
- decision_key_hint: Create a stable, lowercase snake_case identifier (e.g., "use_postgres_for_analytics")
- claim_key_hint: Similar stable identifier for claims
- Confidence: Be honest about uncertainty
- Evidence: Quote the specific text that supports your extraction
- Only extract what is explicitly or very clearly implied in the email
- Empty arrays are acceptable if nothing found
"""

FEW_SHOT_EXAMPLES = [
    {
        "email": """From: alice@company.com
To: team@company.com
Subject: Database Decision

After reviewing the options, we're going to use PostgreSQL for the analytics platform.
It has better support for complex queries and our team already has experience with it.

Bob, can you start the migration plan by end of week?
""",
        "extraction": {
            "decisions": [
                {
                    "title": "Use PostgreSQL for analytics platform",
                    "summary": "Team decided to use PostgreSQL as the database for the analytics platform",
                    "rationale": "Better support for complex queries and team has existing experience",
                    "scope": "Analytics platform",
                    "decision_key_hint": "analytics_db_postgres",
                    "owner_email": "alice@company.com",
                    "decided_by_emails": ["alice@company.com"],
                    "confidence": 0.95,
                    "evidence": "we're going to use PostgreSQL for the analytics platform"
                }
            ],
            "tasks": [
                {
                    "title": "Create migration plan for PostgreSQL",
                    "description": "Start the migration plan for moving to PostgreSQL",
                    "assignee_email": "bob@company.com",
                    "due_date": None,
                    "priority": "normal",
                    "confidence": 0.85,
                    "evidence": "Bob, can you start the migration plan by end of week?"
                }
            ],
            "claims": [
                {
                    "text": "PostgreSQL has better support for complex queries",
                    "claim_key_hint": "postgres_complex_query_support",
                    "claimant_email": "alice@company.com",
                    "polarity": "positive",
                    "confidence": 0.90,
                    "evidence": "It has better support for complex queries"
                }
            ],
            "topics": [
                {"name": "Database", "keywords": ["PostgreSQL", "analytics", "migration"]},
                {"name": "Infrastructure", "keywords": ["database", "platform"]}
            ],
            "signals": {
                "urgency": "normal",
                "decision_signal": True,
                "conflict_signal": False,
                "requires_followup": True
            }
        }
    }
]


def create_extraction_prompt(
    sender: str,
    recipients: list,
    subject: str,
    timestamp: str,
    body: str
) -> str:
    """
    Create extraction prompt from email components.

    Args:
        sender: Sender email address
        recipients: List of recipient emails
        subject: Email subject line
        timestamp: Email timestamp as string
        body: Email body text

    Returns:
        Formatted prompt string
    """
    recipients_str = ", ".join(recipients) if recipients else "N/A"

    return EXTRACTION_USER_PROMPT_TEMPLATE.format(
        sender=sender,
        recipients=recipients_str,
        subject=subject or "N/A",
        timestamp=timestamp,
        body=body[:4000]  # Limit body length to avoid token limits
    )


def get_extraction_messages(
    sender: str,
    recipients: list,
    subject: str,
    timestamp: str,
    body: str
) -> list:
    """
    Get messages array for OpenAI API call.

    Args:
        sender: Sender email address
        recipients: List of recipient emails
        subject: Email subject line
        timestamp: Email timestamp as string
        body: Email body text

    Returns:
        List of message dictionaries for OpenAI API
    """
    return [
        {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
        {"role": "user", "content": create_extraction_prompt(sender, recipients, subject, timestamp, body)}
    ]
