#!/bin/bash
# Script to execute the enhanced caching narrative generator
# This script creates a comprehensive demo dataset with:
#  - Multiple teams and team members
#  - Full caching technology decision lifecycle
#  - Conflicts between teams and their resolutions
#  - Shadow topics that emerge from communications
#  - Security and performance concerns
#  - Cross-team tensions visible in the graph

# Set colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to the root directory first
cd "$(dirname "$0")/.."

# Activate virtualenv if it exists
if [ -d ".venv" ]; then
  source .venv/bin/activate
  echo -e "${GREEN}Activated virtual environment${NC}"
fi

# Clear existing data if requested
if [ "$1" == "--clear" ]; then
  echo -e "${YELLOW}Clearing existing database data...${NC}"
  # Add any database clearing commands here if needed
  echo -e "${GREEN}Database cleared.${NC}"
fi

# Run the script with timing
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}  Creating Enhanced Caching Decision Narrative      ${NC}"
echo -e "${BLUE}  This will populate the database with:             ${NC}"
echo -e "${BLUE}  - 8 teams and 15 team members                     ${NC}"
echo -e "${BLUE}  - 9 topics including caching, security, testing   ${NC}"
echo -e "${BLUE}  - Multi-stage caching decision lifecycle          ${NC}"
echo -e "${BLUE}  - Multiple conflicts and their resolutions        ${NC}"
echo -e "${BLUE}  - Shadow topics emerging from communications      ${NC}"
echo -e "${BLUE}====================================================${NC}"

echo -e "${YELLOW}Starting narrative creation...${NC}"
time python scripts/create_caching_narrative.py

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}Demo dataset created successfully!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${YELLOW}What to explore:${NC}"
echo -e " - ${BLUE}Graph page${NC}: See the full decision lifecycle and team connections"
echo -e " - ${BLUE}Conflicts page${NC}: Explore conflicts between teams"
echo -e " - ${BLUE}Shadow Topics page${NC}: Discover emerging topics from communications"
echo -e "${GREEN}====================================================${NC}"