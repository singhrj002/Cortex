# Scripts

This directory contains utility scripts for the AI Chief of Staff backend.

## Available Scripts

### Setup Team Data (`setup_teams.sh` / `create_team_data.py`)

Creates sample team data with relationships for graph visualization:

- Creates three teams: Backend Team, Infra Team, and Product Team
- Creates three people: Alice Chen, Bob Smith, and Carol Jones
- Assigns each person to a team with proper relationships:
  - Alice → Backend Team
  - Bob → Infra Team
  - Carol → Product Team

This addresses the issue where relationships were missing in the graph visualization. The script creates both:

1. PostgreSQL database entries for teams and persons
2. Neo4j graph nodes and relationships with explicit MEMBER_OF relationships

#### Usage

```bash
# From the backend directory
./scripts/setup_teams.sh

# Or run the Python script directly
python scripts/create_team_data.py
```

### Create Enhanced Caching Decision Narrative (`run_caching_narrative.sh` / `create_caching_narrative.py`)

Creates a comprehensive narrative dataset that showcases the full capabilities of the AI Chief of Staff platform:

#### The Enhanced Demo Dataset

The narrative now populates the system with:

- **8 teams**: Backend, Frontend, Infrastructure, Product, Data, Security, QA, and Leadership
- **15 people**: Team members across all departments with realistic relationships
- **9 topics**: Including caching, security, testing, monitoring, and scaling
- **Multiple conflicts**: Standards conflicts, security concerns, and performance issues
- **Shadow topics**: Monitoring and testing standards discussions without formal decisions
- **Team tensions**: Communication patterns and relationships between teams

#### The 6-Stage Caching Narrative:

1. **Initial Awareness**: Alice makes a claim about testing Redis for caching
2. **First Decision**: Backend team decides to use Redis for caching
3. **Decision Evolves**: Decision is updated to switch from Redis to Memcached due to operational concerns
4. **Conflict Emerges**:
   - Infra team flags violation of Redis standard
   - Security team raises authentication concerns
   - QA team reports performance degradation
5. **Resolution**: CTO makes executive decision approving Memcached with conditions and tasks
6. **Meta-insights**:
   - Communication tensions between teams
   - Decision churn in caching topic
   - Shadow topics emerging from discussions

This creates a rich graph demonstrating:
- Decision versioning and evolution through multiple stages
- Multiple conflicts between teams with different focuses
- Resolution mechanisms and task creation
- Shadow topics detection from informal communications
- Cross-team relationships and tension patterns

#### Usage

```bash
# From the backend directory
./scripts/run_caching_narrative.sh

# Clear existing data first (if needed)
./scripts/run_caching_narrative.sh --clear

# Or run the Python script directly
python scripts/create_caching_narrative.py
```

#### Exploring the Demo Data

After running the script, you can explore the demo data through:

- **Graph page**: Visualize the full decision lifecycle, team connections, and relationships
- **Conflicts page**: See detected conflicts, their status, and resolution paths
- **Shadow Topics page**: Discover topics emerging from communications without formal decisions
- **Decisions page**: View the decision versioning and evolution of the caching strategy

### Ingest Sample Emails (`ingest_sample_emails.py`)

Loads sample email data into the system for testing and demo purposes.

```bash
python scripts/ingest_sample_emails.py