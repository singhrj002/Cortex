# Email Ingestion Utilities

This directory contains utilities for email data ingestion to test and populate the AI Chief of Staff system.

## Available Ingestion Methods

### 1. Enron Dataset Ingestion

The `enron_email_ingestion.py` script processes the Enron email dataset and ingests it into the system. The Enron dataset is a large collection of real corporate emails made public during legal investigations.

#### Usage

```bash
# Basic usage
python -m app.utils.enron_email_ingestion --path /path/to/enron/maildir

# Process only a subset of emails
python -m app.utils.enron_email_ingestion --path /path/to/enron/maildir --limit 100

# Process emails from specific users
python -m app.utils.enron_email_ingestion --path /path/to/enron/maildir --user lay-k,skilling-j

# Save parsed emails to a JSON file for inspection
python -m app.utils.enron_email_ingestion --path /path/to/enron/maildir --limit 50 --output ./output/parsed_emails.json
```

#### How It Works

1. The script traverses the Enron maildir directory structure
2. For each email file found, it:
   - Parses the email using Python's `email` module
   - Extracts headers, body, and metadata
   - Creates an event in the system using the `EventType.EMAIL` type
   - Stores all relevant metadata including sender, recipients, and folder information

#### Tips for Enron Dataset

- The full dataset contains over 500,000 emails, so using the `--limit` flag is recommended for testing
- Some common notable users in the dataset: `lay-k`, `skilling-j`, `fastow-a`, `kaminski-v`
- The directory structure is typically: `/path/to/maildir/[username]/[folder]/[email_file]`

### 2. Sample Email Dataset

The frontend includes a TypeScript file with sample emails for testing: `ai-chief-of-staff/frontend/src/test-data/sample-emails.ts`

This file provides:
- Structured email data with TypeScript interfaces
- Five realistic sample business emails
- A utility function to generate RFC 5322 formatted email strings
- Raw email strings ready for ingestion

## Integrating with Email Providers

To integrate with real email providers (Gmail, Outlook, etc.), you would need to:

1. Create appropriate OAuth2 authentication flows
2. Use the provider's API or IMAP/POP3 to fetch emails
3. Process emails similar to how the Enron ingestion script does
4. Store the emails as events in the system

## Troubleshooting

### Common Issues

- **Character Encoding Problems**: Some Enron emails contain non-UTF-8 characters. The script uses error handling to manage this.
- **Missing Fields**: Not all emails have complete headers. The script gracefully handles missing fields.
- **Large Dataset Size**: For production use, consider implementing batch processing or async workers for large datasets.

### Logging

The script logs processing information. To change the log level:

```python
import logging
logging.basicConfig(level=logging.DEBUG)  # Change to DEBUG for more detailed information
```

## Next Steps

Potential improvements to the ingestion system:
- Add support for email threading/conversations
- Implement email categorization and importance ranking
- Create webhook endpoints for real-time email ingestion
- Add support for other email dataset formats