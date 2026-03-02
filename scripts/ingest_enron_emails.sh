#!/bin/bash

# Script to ingest Enron emails into the AI Chief of Staff system
# This is a convenience wrapper around the enron_email_ingestion.py utility

# Default values
DATASET_PATH=""
LIMIT=""
USERS=""
OUTPUT=""

# Display usage information
function show_usage {
    echo "Enron Email Dataset Ingestion Tool"
    echo ""
    echo "This script ingests emails from the Enron dataset into the AI Chief of Staff system."
    echo ""
    echo "Usage: $0 --path /path/to/enron/maildir [options]"
    echo ""
    echo "Options:"
    echo "  --path PATH      Path to the Enron maildir (required)"
    echo "  --limit N        Maximum number of emails to process"
    echo "  --user USERS     Comma-separated list of specific users to process"
    echo "  --output FILE    Save parsed emails to a JSON file"
    echo "  --help           Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --path /data/enron/maildir"
    echo "  $0 --path /data/enron/maildir --limit 100"
    echo "  $0 --path /data/enron/maildir --user lay-k,skilling-j"
    echo ""
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --path)
            DATASET_PATH="$2"
            shift
            shift
            ;;
        --limit)
            LIMIT="$2"
            shift
            shift
            ;;
        --user)
            USERS="$2"
            shift
            shift
            ;;
        --output)
            OUTPUT="$2"
            shift
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if path is provided
if [ -z "$DATASET_PATH" ]; then
    echo "Error: Dataset path is required"
    show_usage
    exit 1
fi

# Check if path exists
if [ ! -d "$DATASET_PATH" ]; then
    echo "Error: Dataset path does not exist: $DATASET_PATH"
    exit 1
fi

# Construct the Python command
CMD="python -m app.utils.enron_email_ingestion --path $DATASET_PATH"

if [ ! -z "$LIMIT" ]; then
    CMD="$CMD --limit $LIMIT"
fi

if [ ! -z "$USERS" ]; then
    CMD="$CMD --user $USERS"
fi

if [ ! -z "$OUTPUT" ]; then
    CMD="$CMD --output $OUTPUT"
fi

# Navigate to the project root to ensure correct module imports
cd "$(dirname "$0")/.." || exit 1

echo "Starting Enron email ingestion..."
echo "Command: $CMD"
echo ""

# Execute the Python script
eval $CMD

exit $?