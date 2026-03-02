#!/bin/bash
# Simple script to execute the team creation script

# Navigate to the root directory first
cd "$(dirname "$0")/.."

# Activate virtualenv if it exists
if [ -d ".venv" ]; then
  source .venv/bin/activate
  echo "Activated virtual environment"
fi

# Run the script
echo "Creating team data..."
python scripts/create_team_data.py

echo "Done!"