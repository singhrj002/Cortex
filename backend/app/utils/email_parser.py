"""
Email parser utility for parsing raw email text into structured format.
Supports Enron email dataset format and standard email formats.
"""

import email
import hashlib
import re
from datetime import datetime
from typing import Dict, List, Optional
from email.utils import parseaddr, parsedate_to_datetime


def parse_email_text(raw_text: str) -> Dict:
    """
    Parse raw email text into structured format.

    Args:
        raw_text: Raw email text with headers and body

    Returns:
        Dictionary with parsed email fields
    """
    try:
        # Parse using Python's email library
        msg = email.message_from_string(raw_text)

        # Extract basic fields
        sender = extract_email_address(msg.get("From", ""))
        to_recipients = extract_email_addresses(msg.get("To", ""))
        cc_recipients = extract_email_addresses(msg.get("Cc", ""))
        bcc_recipients = extract_email_addresses(msg.get("Bcc", ""))
        subject = msg.get("Subject", "")

        # Extract timestamp
        date_str = msg.get("Date")
        timestamp = None
        if date_str:
            try:
                timestamp = parsedate_to_datetime(date_str)
            except Exception:
                # Fallback: try manual parsing for Enron format
                timestamp = parse_enron_date(date_str)

        # Extract body
        body = extract_body(msg)

        # Clean body
        body_cleaned = clean_email_body(body)

        # Generate content hash for deduplication
        content_hash = generate_content_hash(sender, subject, body_cleaned)

        return {
            "sender": sender,
            "recipients": to_recipients,
            "cc": cc_recipients,
            "bcc": bcc_recipients,
            "subject": subject,
            "body_text": body_cleaned,
            "timestamp": timestamp,
            "content_hash": content_hash,
            "raw_metadata": {
                "message_id": msg.get("Message-ID"),
                "in_reply_to": msg.get("In-Reply-To"),
                "references": msg.get("References"),
            }
        }
    except Exception as e:
        # Fallback to simple parsing for malformed emails
        return parse_simple_email(raw_text)


def extract_email_address(address_str: str) -> str:
    """Extract email address from 'Name <email@domain.com>' format."""
    if not address_str:
        return ""

    name, email_addr = parseaddr(address_str)
    return email_addr.lower().strip() if email_addr else address_str.lower().strip()


def extract_email_addresses(address_str: str) -> List[str]:
    """Extract multiple email addresses from comma-separated string."""
    if not address_str:
        return []

    addresses = []
    for addr in address_str.split(","):
        email_addr = extract_email_address(addr.strip())
        if email_addr:
            addresses.append(email_addr)

    return addresses


def extract_body(msg: email.message.Message) -> str:
    """Extract text body from email message."""
    body = ""

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            if content_type == "text/plain":
                try:
                    body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                    break
                except Exception:
                    continue
    else:
        try:
            body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
        except Exception:
            body = str(msg.get_payload())

    return body


def clean_email_body(body: str) -> str:
    """Clean email body by removing forwarding artifacts and extra whitespace."""
    if not body:
        return ""

    # Remove common email artifacts
    body = re.sub(r'-+\s*Original Message\s*-+', '', body, flags=re.IGNORECASE)
    body = re.sub(r'-+\s*Forwarded by.*?-+', '', body, flags=re.IGNORECASE)
    body = re.sub(r'From:.*?Sent:.*?To:.*?Subject:', '', body, flags=re.DOTALL | re.IGNORECASE, count=1)

    # Remove excessive newlines
    body = re.sub(r'\n{3,}', '\n\n', body)

    # Remove leading/trailing whitespace
    body = body.strip()

    return body


def parse_enron_date(date_str: str) -> Optional[datetime]:
    """Parse Enron-specific date formats."""
    # Common Enron formats:
    # Mon, 14 May 2001 16:39:00 -0700 (PDT)
    # 14 May 2001 16:39:00 -0700

    if not date_str:
        return None

    # Try common formats
    formats = [
        "%a, %d %b %Y %H:%M:%S %z",
        "%d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S",
        "%d %b %Y %H:%M:%S",
    ]

    # Remove timezone name in parentheses
    date_str_clean = re.sub(r'\s*\([A-Z]{2,4}\)\s*$', '', date_str)

    for fmt in formats:
        try:
            return datetime.strptime(date_str_clean.strip(), fmt)
        except ValueError:
            continue

    return None


def parse_simple_email(raw_text: str) -> Dict:
    """
    Simple fallback parser for malformed emails.
    Extracts fields using regex patterns.
    """
    result = {
        "sender": "",
        "recipients": [],
        "cc": [],
        "bcc": [],
        "subject": "",
        "body_text": raw_text,
        "timestamp": None,
        "content_hash": generate_content_hash("", "", raw_text),
        "raw_metadata": {}
    }

    # Try to extract From
    from_match = re.search(r'^From:\s*(.+)$', raw_text, re.MULTILINE | re.IGNORECASE)
    if from_match:
        result["sender"] = extract_email_address(from_match.group(1))

    # Try to extract To
    to_match = re.search(r'^To:\s*(.+)$', raw_text, re.MULTILINE | re.IGNORECASE)
    if to_match:
        result["recipients"] = extract_email_addresses(to_match.group(1))

    # Try to extract Subject
    subject_match = re.search(r'^Subject:\s*(.+)$', raw_text, re.MULTILINE | re.IGNORECASE)
    if subject_match:
        result["subject"] = subject_match.group(1).strip()

    # Try to extract Date
    date_match = re.search(r'^Date:\s*(.+)$', raw_text, re.MULTILINE | re.IGNORECASE)
    if date_match:
        result["timestamp"] = parse_enron_date(date_match.group(1))

    return result


def generate_content_hash(sender: str, subject: str, body: str) -> str:
    """
    Generate SHA256 hash for email content.
    Used for deduplication.
    """
    content = f"{sender}|{subject}|{body}"
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def extract_person_name(address_str: str) -> Optional[str]:
    """Extract person's name from 'Name <email@domain.com>' format."""
    if not address_str:
        return None

    name, email_addr = parseaddr(address_str)

    # Clean name
    if name:
        name = name.strip().strip('"').strip("'")
        if name and name != email_addr:
            return name

    # Fallback: extract name from email
    if email_addr:
        username = email_addr.split('@')[0]
        # Convert john.doe to John Doe
        name_parts = username.replace('.', ' ').replace('_', ' ').split()
        return ' '.join(part.capitalize() for part in name_parts)

    return None
