"""
Enron Email Dataset Ingestion Utility

This script processes emails from the Enron dataset and ingests them into the system.
The Enron dataset is a large database of emails that were made public during the investigation
of the Enron corporation.

Usage:
    python -m app.utils.enron_email_ingestion --path /path/to/enron/maildir [--limit 100] [--user user1,user2]
"""

import os
import email
import argparse
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
import json
from pathlib import Path

from app.models.event import EventType
from app.services.event_service import create_event
from app.schemas.event import EventCreate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def parse_email_file(file_path: str) -> Dict[str, Any]:
    """
    Parse an email file from the Enron dataset.
    
    Args:
        file_path: Path to the email file
        
    Returns:
        Dict containing the parsed email data
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            msg_content = f.read()
        
        msg = email.message_from_string(msg_content)
        
        # Extract email headers
        headers = {
            'message_id': msg.get('Message-ID', ''),
            'date': msg.get('Date', ''),
            'from': msg.get('From', ''),
            'to': msg.get('To', ''),
            'subject': msg.get('Subject', ''),
            'cc': msg.get('Cc', ''),
            'bcc': msg.get('Bcc', ''),
        }
        
        # Extract email body
        body = ''
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get('Content-Disposition', ''))
                
                # Skip attachments
                if 'attachment' in content_disposition:
                    continue
                
                if content_type == 'text/plain' and 'attachment' not in content_disposition:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body = payload.decode('utf-8', errors='ignore')
                        break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode('utf-8', errors='ignore')
        
        # Parse the file path to extract additional metadata
        path_parts = file_path.split(os.sep)
        user = path_parts[-3] if len(path_parts) >= 3 else 'unknown'
        folder = path_parts[-2] if len(path_parts) >= 2 else 'unknown'
        
        # Extract date
        date_str = headers['date']
        try:
            parsed_date = email.utils.parsedate_to_datetime(date_str)
            iso_date = parsed_date.isoformat() if parsed_date else None
        except:
            iso_date = None
            
        # Construct the email data
        email_data = {
            'user': user,
            'folder': folder,
            'message_id': headers['message_id'],
            'date': iso_date,
            'from': headers['from'],
            'to': headers['to'],
            'cc': headers['cc'],
            'bcc': headers['bcc'],
            'subject': headers['subject'],
            'body': body,
            'raw_headers': {k: v for k, v in msg.items()},
            'source': 'enron_dataset',
            'original_file': file_path
        }
        
        return email_data
    
    except Exception as e:
        logger.error(f"Error parsing email file {file_path}: {str(e)}")
        return {}

def get_email_files(
    dataset_path: str, 
    limit: Optional[int] = None,
    users: Optional[List[str]] = None
) -> List[str]:
    """
    Get a list of email files from the Enron dataset.
    
    Args:
        dataset_path: Path to the Enron dataset
        limit: Maximum number of emails to process
        users: List of specific users to process
        
    Returns:
        List of file paths to email files
    """
    email_files = []
    
    try:
        # If specific users are provided, only process those
        if users:
            for user in users:
                user_dir = os.path.join(dataset_path, user)
                if os.path.isdir(user_dir):
                    for root, _, files in os.walk(user_dir):
                        for file in files:
                            if not file.startswith('.'):  # Skip hidden files
                                email_files.append(os.path.join(root, file))
                                if limit and len(email_files) >= limit:
                                    return email_files
                else:
                    logger.warning(f"User directory not found: {user_dir}")
        else:
            # Process all users
            for user_dir in os.listdir(dataset_path):
                user_path = os.path.join(dataset_path, user_dir)
                if os.path.isdir(user_path):
                    for root, _, files in os.walk(user_path):
                        for file in files:
                            if not file.startswith('.'):  # Skip hidden files
                                email_files.append(os.path.join(root, file))
                                if limit and len(email_files) >= limit:
                                    return email_files
    
    except Exception as e:
        logger.error(f"Error listing email files: {str(e)}")
    
    return email_files

def process_and_ingest_emails(
    dataset_path: str,
    limit: Optional[int] = None,
    users: Optional[List[str]] = None,
    output_file: Optional[str] = None
) -> Tuple[int, int]:
    """
    Process and ingest emails from the Enron dataset.
    
    Args:
        dataset_path: Path to the Enron dataset
        limit: Maximum number of emails to process
        users: List of specific users to process
        output_file: Optional file path to save the parsed emails as JSON
        
    Returns:
        Tuple containing (total_emails_processed, successfully_ingested)
    """
    logger.info(f"Starting Enron dataset ingestion from: {dataset_path}")
    
    email_files = get_email_files(dataset_path, limit, users)
    total_files = len(email_files)
    logger.info(f"Found {total_files} email files to process")
    
    processed_emails = []
    successful_count = 0
    
    for i, file_path in enumerate(email_files):
        if i % 100 == 0:
            logger.info(f"Processing email {i+1}/{total_files}")
        
        email_data = parse_email_file(file_path)
        if email_data:
            processed_emails.append(email_data)
            
            # Create an event for each email
            try:
                event_data = EventCreate(
                    event_type=EventType.EMAIL,
                    title=email_data.get('subject', 'No Subject'),
                    content=email_data.get('body', ''),
                    metadata={
                        'from': email_data.get('from', ''),
                        'to': email_data.get('to', ''),
                        'cc': email_data.get('cc', ''),
                        'date': email_data.get('date'),
                        'message_id': email_data.get('message_id', ''),
                        'folder': email_data.get('folder', ''),
                        'user': email_data.get('user', ''),
                        'source': 'enron_dataset'
                    }
                )
                
                # Create the event in the database
                create_event(event_data)
                successful_count += 1
                
            except Exception as e:
                logger.error(f"Error creating event for email {file_path}: {str(e)}")
    
    logger.info(f"Completed processing {len(processed_emails)} emails")
    logger.info(f"Successfully ingested {successful_count} emails into the system")
    
    # Save to output file if specified
    if output_file:
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(processed_emails, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved parsed emails to {output_file}")
    
    return total_files, successful_count

def main():
    parser = argparse.ArgumentParser(description='Ingest emails from the Enron dataset')
    parser.add_argument('--path', required=True, help='Path to the Enron maildir')
    parser.add_argument('--limit', type=int, help='Maximum number of emails to process')
    parser.add_argument('--user', help='Comma-separated list of specific users to process')
    parser.add_argument('--output', help='Path to output file for parsed emails (JSON)')
    
    args = parser.parse_args()
    
    users = args.user.split(',') if args.user else None
    
    total, successful = process_and_ingest_emails(
        args.path,
        limit=args.limit,
        users=users,
        output_file=args.output
    )
    
    print(f"Processed {total} emails, successfully ingested {successful}.")

if __name__ == "__main__":
    main()