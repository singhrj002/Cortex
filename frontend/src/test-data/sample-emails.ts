export interface Attachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  url?: string;
}

export interface EmailMessage {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: Array<{
    name: string;
    email: string;
  }>;
  cc?: Array<{
    name: string;
    email: string;
  }>;
  bcc?: Array<{
    name: string;
    email: string;
  }>;
  subject: string;
  body: {
    text: string;
    html?: string;
  };
  date: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  folder: string;
  attachments: Attachment[];
  threadId?: string;
  importance: 'high' | 'normal' | 'low';
}

export const sampleEmails: EmailMessage[] = [
  {
    id: 'e001',
    from: {
      name: 'John Smith',
      email: 'john.smith@acme.com'
    },
    to: [
      {
        name: 'Alice Chen',
        email: 'alice.chen@company.com'
      }
    ],
    cc: [
      {
        name: 'Product Team',
        email: 'product@company.com'
      }
    ],
    subject: 'Project Alpha Status Update - Q1 2026',
    body: {
      text: `Hi Alice,

I wanted to provide you with the latest status update for Project Alpha.

Current progress:
- Frontend redesign: 85% complete
- Backend API refactoring: 75% complete
- Database migration: 90% complete
- Integration tests: 50% complete

Key achievements this week:
1. Successfully migrated 3 out of 4 database shards with zero downtime
2. Fixed 28 critical bugs identified during QA testing
3. Implemented the new dashboard analytics module

Challenges:
- We're experiencing some performance issues with the new search functionality
- The third-party payment gateway integration is taking longer than expected

Next steps:
1. Complete the remaining database shard migration by Feb 15
2. Resolve performance issues with the search functionality
3. Finalize integration with the payment gateway
4. Begin comprehensive system testing

Please let me know if you have any questions or concerns.

Best regards,
John Smith
Senior Project Manager
ACME Corporation
Phone: +1 (555) 123-4567`,
      html: `<div>
        <p>Hi Alice,</p>
        <p>I wanted to provide you with the latest status update for <strong>Project Alpha</strong>.</p>
        <h3>Current progress:</h3>
        <ul>
          <li>Frontend redesign: <span style="color: green;">85% complete</span></li>
          <li>Backend API refactoring: <span style="color: orange;">75% complete</span></li>
          <li>Database migration: <span style="color: green;">90% complete</span></li>
          <li>Integration tests: <span style="color: red;">50% complete</span></li>
        </ul>
        <h3>Key achievements this week:</h3>
        <ol>
          <li>Successfully migrated 3 out of 4 database shards with zero downtime</li>
          <li>Fixed 28 critical bugs identified during QA testing</li>
          <li>Implemented the new dashboard analytics module</li>
        </ol>
        <h3>Challenges:</h3>
        <ul>
          <li>We're experiencing some performance issues with the new search functionality</li>
          <li>The third-party payment gateway integration is taking longer than expected</li>
        </ul>
        <h3>Next steps:</h3>
        <ol>
          <li>Complete the remaining database shard migration by Feb 15</li>
          <li>Resolve performance issues with the search functionality</li>
          <li>Finalize integration with the payment gateway</li>
          <li>Begin comprehensive system testing</li>
        </ol>
        <p>Please let me know if you have any questions or concerns.</p>
        <p>Best regards,<br>
        John Smith<br>
        Senior Project Manager<br>
        ACME Corporation<br>
        Phone: +1 (555) 123-4567</p>
      </div>`
    },
    date: '2026-02-07T14:35:00Z',
    read: false,
    starred: true,
    labels: ['work', 'important', 'project-alpha'],
    folder: 'inbox',
    attachments: [
      {
        id: 'att001',
        filename: 'Project_Alpha_Status_Report_Q1_2026.pdf',
        size: 2456789,
        contentType: 'application/pdf',
        url: '/attachments/att001'
      },
      {
        id: 'att002',
        filename: 'Project_Timeline_Updated.xlsx',
        size: 1234567,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '/attachments/att002'
      }
    ],
    threadId: 'thread001',
    importance: 'high'
  },
  {
    id: 'e002',
    from: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@partner.org'
    },
    to: [
      {
        name: 'Alice Chen',
        email: 'alice.chen@company.com'
      }
    ],
    subject: 'Partnership Opportunity - New Market Expansion',
    body: {
      text: `Hello Alice,

I hope this email finds you well. I'm reaching out to discuss an exciting partnership opportunity between our organizations.

As you may know, Partner Organization is planning to expand into the Asian market in Q3 2026, and we believe that a strategic partnership with Company would be mutually beneficial. Your expertise in the region combined with our product offerings could create significant value for both our customers and stakeholders.

Key benefits of the partnership:
- Accelerated market entry for both organizations
- Shared resources and reduced operational costs
- Cross-promotion opportunities
- Combined technology stack advantages

I've attached a detailed proposal for your review. The document includes market analysis, potential partnership models, and projected financial outcomes.

Would you be available for a virtual meeting next week to discuss this further? I'm flexible on Tuesday and Thursday between 10 AM and 2 PM EST.

Looking forward to your response.

Best regards,
Sarah Johnson
Business Development Director
Partner Organization
sarah.johnson@partner.org
+1 (555) 987-6543`,
      html: `<div>
        <p>Hello Alice,</p>
        <p>I hope this email finds you well. I'm reaching out to discuss an exciting partnership opportunity between our organizations.</p>
        <p>As you may know, <em>Partner Organization</em> is planning to expand into the Asian market in Q3 2026, and we believe that a strategic partnership with <em>Company</em> would be mutually beneficial. Your expertise in the region combined with our product offerings could create significant value for both our customers and stakeholders.</p>
        <h3>Key benefits of the partnership:</h3>
        <ul>
          <li>Accelerated market entry for both organizations</li>
          <li>Shared resources and reduced operational costs</li>
          <li>Cross-promotion opportunities</li>
          <li>Combined technology stack advantages</li>
        </ul>
        <p>I've attached a detailed proposal for your review. The document includes market analysis, potential partnership models, and projected financial outcomes.</p>
        <p>Would you be available for a virtual meeting next week to discuss this further? I'm flexible on Tuesday and Thursday between 10 AM and 2 PM EST.</p>
        <p>Looking forward to your response.</p>
        <p>Best regards,<br>
        Sarah Johnson<br>
        Business Development Director<br>
        Partner Organization<br>
        sarah.johnson@partner.org<br>
        +1 (555) 987-6543</p>
      </div>`
    },
    date: '2026-02-06T09:15:00Z',
    read: true,
    starred: false,
    labels: ['partnership', 'business-development', 'important'],
    folder: 'inbox',
    attachments: [
      {
        id: 'att003',
        filename: 'Partnership_Proposal_2026.pdf',
        size: 3456789,
        contentType: 'application/pdf',
        url: '/attachments/att003'
      },
      {
        id: 'att004',
        filename: 'Market_Analysis_Asia_2026.pptx',
        size: 2345678,
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        url: '/attachments/att004'
      }
    ],
    threadId: 'thread002',
    importance: 'high'
  },
  {
    id: 'e003',
    from: {
      name: 'Tech Newsletter',
      email: 'newsletter@tech-weekly.com'
    },
    to: [
      {
        name: 'Subscribers',
        email: 'subscribers@tech-weekly.com'
      }
    ],
    subject: 'This Week in Tech: AI Breakthroughs, Quantum Computing, and More',
    body: {
      text: `THIS WEEK IN TECH
February 5, 2026

TOP STORIES

1. REVOLUTIONARY AI MODEL BREAKS REASONING BARRIERS
Researchers at OpenMind Labs have unveiled a new AI model that demonstrates unprecedented reasoning capabilities. The model, named "LogicNet-7", successfully solved complex mathematical proofs and demonstrated causal reasoning abilities that closely mirror human cognitive processes. Industry experts suggest this could be a significant step toward artificial general intelligence.

2. QUANTUM COMPUTING REACHES COMMERCIAL MILESTONE
QuantumWave Technologies announced the first commercially viable quantum computer with 1,000+ stable qubits. The system, priced at $15 million, is already being deployed in pharmaceutical research, cryptography, and climate modeling applications. This development is expected to accelerate quantum adoption across industries.

3. GLOBAL TECH REGULATION FRAMEWORK PROPOSED
The International Technology Coalition (ITC) has proposed a comprehensive global framework for technology regulation. The proposal addresses AI ethics, data privacy, platform accountability, and digital market competition. Representatives from 42 countries have expressed support for the initiative.

4. NEUROMORPHIC CHIPS SET NEW EFFICIENCY RECORDS
BrainSilicon's new neuromorphic chip performs AI tasks while consuming 95% less energy than conventional processors. The technology mimics the brain's neural structure and shows promise for edge computing applications, potentially extending battery life in mobile devices by up to 300%.

5. CLIMATE TECH INVESTMENT REACHES $500 BILLION
Global investment in climate technology has surpassed $500 billion annually, with carbon capture, alternative energy storage, and sustainable agriculture technologies leading the growth. Analysts project this market to reach $1.5 trillion by 2030.

---

UPCOMING EVENTS

- World Technology Summit: March 15-18, Singapore
- AI Ethics Conference: March 25-27, Zurich
- Quantum Computing Expo: April 10-12, San Francisco

---

MARKET UPDATES

- Tech Index: ↑ 3.2% this week
- AI Sector: ↑ 5.7%
- Quantum Computing: ↑ 8.3%
- Cybersecurity: ↑ 2.1%
- Biotech: ↓ 1.3%

---

Unsubscribe: If you'd like to stop receiving this newsletter, click here.
Privacy Policy: We value your privacy. Read our policy here.`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h1 style="color: #2c3e50;">THIS WEEK IN TECH</h1>
        <p style="color: #7f8c8d;">February 5, 2026</p>
        
        <h2 style="color: #2980b9;">TOP STORIES</h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">1. REVOLUTIONARY AI MODEL BREAKS REASONING BARRIERS</h3>
          <p>Researchers at OpenMind Labs have unveiled a new AI model that demonstrates unprecedented reasoning capabilities. The model, named "LogicNet-7", successfully solved complex mathematical proofs and demonstrated causal reasoning abilities that closely mirror human cognitive processes. Industry experts suggest this could be a significant step toward artificial general intelligence.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">2. QUANTUM COMPUTING REACHES COMMERCIAL MILESTONE</h3>
          <p>QuantumWave Technologies announced the first commercially viable quantum computer with 1,000+ stable qubits. The system, priced at $15 million, is already being deployed in pharmaceutical research, cryptography, and climate modeling applications. This development is expected to accelerate quantum adoption across industries.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">3. GLOBAL TECH REGULATION FRAMEWORK PROPOSED</h3>
          <p>The International Technology Coalition (ITC) has proposed a comprehensive global framework for technology regulation. The proposal addresses AI ethics, data privacy, platform accountability, and digital market competition. Representatives from 42 countries have expressed support for the initiative.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">4. NEUROMORPHIC CHIPS SET NEW EFFICIENCY RECORDS</h3>
          <p>BrainSilicon's new neuromorphic chip performs AI tasks while consuming 95% less energy than conventional processors. The technology mimics the brain's neural structure and shows promise for edge computing applications, potentially extending battery life in mobile devices by up to 300%.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">5. CLIMATE TECH INVESTMENT REACHES $500 BILLION</h3>
          <p>Global investment in climate technology has surpassed $500 billion annually, with carbon capture, alternative energy storage, and sustainable agriculture technologies leading the growth. Analysts project this market to reach $1.5 trillion by 2030.</p>
        </div>
        
        <hr style="border: 1px solid #ecf0f1; margin: 30px 0;" />
        
        <h2 style="color: #2980b9;">UPCOMING EVENTS</h2>
        <ul>
          <li>World Technology Summit: March 15-18, Singapore</li>
          <li>AI Ethics Conference: March 25-27, Zurich</li>
          <li>Quantum Computing Expo: April 10-12, San Francisco</li>
        </ul>
        
        <hr style="border: 1px solid #ecf0f1; margin: 30px 0;" />
        
        <h2 style="color: #2980b9;">MARKET UPDATES</h2>
        <ul>
          <li>Tech Index: <span style="color: green;">↑ 3.2%</span> this week</li>
          <li>AI Sector: <span style="color: green;">↑ 5.7%</span></li>
          <li>Quantum Computing: <span style="color: green;">↑ 8.3%</span></li>
          <li>Cybersecurity: <span style="color: green;">↑ 2.1%</span></li>
          <li>Biotech: <span style="color: red;">↓ 1.3%</span></li>
        </ul>
        
        <hr style="border: 1px solid #ecf0f1; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #7f8c8d;">
          Unsubscribe: If you'd like to stop receiving this newsletter, <a href="#">click here</a>.<br>
          Privacy Policy: We value your privacy. Read our policy <a href="#">here</a>.
        </p>
      </div>`
    },
    date: '2026-02-05T08:00:00Z',
    read: true,
    starred: false,
    labels: ['newsletter', 'tech'],
    folder: 'newsletters',
    attachments: [],
    importance: 'normal'
  },
  {
    id: 'e004',
    from: {
      name: 'Michael Brown',
      email: 'michael.brown@company.com'
    },
    to: [
      {
        name: 'Alice Chen',
        email: 'alice.chen@company.com'
      }
    ],
    subject: 'Urgent: Security Incident Report - Action Required',
    body: {
      text: `SECURITY INCIDENT NOTIFICATION
CLASSIFICATION: CONFIDENTIAL

Dear Alice,

I'm writing to inform you about a security incident that was detected by our monitoring systems at 02:35 UTC today. Our security team has identified suspicious activity that may indicate unauthorized access attempts to our customer database.

INCIDENT DETAILS:
- Timestamp: 2026-02-06 02:35:12 UTC
- Target: Customer Database (us-east-db-cluster)
- Nature: Multiple failed authentication attempts followed by a successful login
- Origin: IP address: 185.126.xxx.xxx (Location: Eastern Europe)
- Current Status: The suspicious session has been terminated and the affected account locked

ACTIONS TAKEN SO FAR:
1. Terminated all active sessions for the affected service accounts
2. Implemented temporary IP blocking rules for the suspicious sources
3. Increased logging and monitoring across all database clusters
4. Notified the InfoSec team who have begun an investigation

REQUIRED ACTIONS FROM YOU:
1. Approve the emergency access protocol for the InfoSec team (form attached)
2. Authorize the temporary shutdown of external database access if deemed necessary
3. Prepare for a possible emergency executive briefing if the investigation uncovers a confirmed breach

We will provide hourly updates as the situation develops. Please acknowledge receipt of this email at your earliest convenience.

Regards,
Michael Brown
Chief Information Security Officer
Company

CONFIDENTIALITY NOTICE: This communication contains sensitive information and is intended only for the named recipient. If you received this in error, please notify the sender immediately and delete all copies.`,
      html: `<div style="font-family: Arial, sans-serif;">
        <div style="background-color: #f8d7da; padding: 10px; border: 1px solid #f5c6cb; margin-bottom: 20px;">
          <h2 style="color: #721c24;">SECURITY INCIDENT NOTIFICATION</h2>
          <p style="color: #721c24;"><strong>CLASSIFICATION: CONFIDENTIAL</strong></p>
        </div>
        
        <p>Dear Alice,</p>
        
        <p>I'm writing to inform you about a security incident that was detected by our monitoring systems at 02:35 UTC today. Our security team has identified suspicious activity that may indicate unauthorized access attempts to our customer database.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0;">
          <h3>INCIDENT DETAILS:</h3>
          <ul>
            <li><strong>Timestamp:</strong> 2026-02-06 02:35:12 UTC</li>
            <li><strong>Target:</strong> Customer Database (us-east-db-cluster)</li>
            <li><strong>Nature:</strong> Multiple failed authentication attempts followed by a successful login</li>
            <li><strong>Origin:</strong> IP address: 185.126.xxx.xxx (Location: Eastern Europe)</li>
            <li><strong>Current Status:</strong> The suspicious session has been terminated and the affected account locked</li>
          </ul>
        </div>
        
        <h3>ACTIONS TAKEN SO FAR:</h3>
        <ol>
          <li>Terminated all active sessions for the affected service accounts</li>
          <li>Implemented temporary IP blocking rules for the suspicious sources</li>
          <li>Increased logging and monitoring across all database clusters</li>
          <li>Notified the InfoSec team who have begun an investigation</li>
        </ol>
        
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3>REQUIRED ACTIONS FROM YOU:</h3>
          <ol>
            <li>Approve the emergency access protocol for the InfoSec team (form attached)</li>
            <li>Authorize the temporary shutdown of external database access if deemed necessary</li>
            <li>Prepare for a possible emergency executive briefing if the investigation uncovers a confirmed breach</li>
          </ol>
        </div>
        
        <p>We will provide hourly updates as the situation develops. Please acknowledge receipt of this email at your earliest convenience.</p>
        
        <p>
          Regards,<br>
          Michael Brown<br>
          Chief Information Security Officer<br>
          Company
        </p>
        
        <div style="font-size: 11px; color: #6c757d; border-top: 1px solid #dee2e6; margin-top: 30px; padding-top: 10px;">
          <p><strong>CONFIDENTIALITY NOTICE:</strong> This communication contains sensitive information and is intended only for the named recipient. If you received this in error, please notify the sender immediately and delete all copies.</p>
        </div>
      </div>`
    },
    date: '2026-02-06T03:15:00Z',
    read: false,
    starred: false,
    labels: ['work', 'security', 'urgent'],
    folder: 'inbox',
    attachments: [
      {
        id: 'att005',
        filename: 'Emergency_Access_Authorization_Form.pdf',
        size: 567890,
        contentType: 'application/pdf',
        url: '/attachments/att005'
      },
      {
        id: 'att006',
        filename: 'Security_Incident_Initial_Report.docx',
        size: 789012,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '/attachments/att006'
      }
    ],
    threadId: 'thread003',
    importance: 'high'
  },
  {
    id: 'e005',
    from: {
      name: 'HR Department',
      email: 'hr@company.com'
    },
    to: [
      {
        name: 'All Employees',
        email: 'employees@company.com'
      }
    ],
    subject: 'Annual Performance Review Process - 2026',
    body: {
      text: `Dear Colleagues,

This email provides information about the upcoming annual performance review process for 2026.

SCHEDULE:
- Self-assessment submission: February 20-28, 2026
- Manager reviews: March 1-15, 2026
- Review discussions: March 16-31, 2026
- Performance ratings finalized: April 10, 2026
- Compensation adjustments effective: May 1, 2026

WHAT'S NEW THIS YEAR:
- We've simplified the assessment form based on your feedback
- Added a new "Career Aspirations" section
- Introduced an optional peer feedback component

ACTION REQUIRED:
1. Complete your self-assessment in Workday by February 28
2. Submit 3-5 peer feedback requests by February 15 (optional)
3. Update your career goals and development plan

RESOURCES:
- Performance review guidelines and FAQs are available on the HR portal
- Review workshops will be held in each office (schedule attached)
- For questions, contact your HR Business Partner

We believe that this process is valuable for your professional development and for ensuring that your contributions are appropriately recognized. Your thoughtful participation is greatly appreciated.

Best regards,
HR Department`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Annual Performance Review Process - 2026</h2>
        
        <p>Dear Colleagues,</p>
        
        <p>This email provides information about the upcoming annual performance review process for 2026.</p>
        
        <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0;">
          <h3>SCHEDULE:</h3>
          <ul>
            <li>Self-assessment submission: February 20-28, 2026</li>
            <li>Manager reviews: March 1-15, 2026</li>
            <li>Review discussions: March 16-31, 2026</li>
            <li>Performance ratings finalized: April 10, 2026</li>
            <li>Compensation adjustments effective: May 1, 2026</li>
          </ul>
        </div>
        
        <h3>WHAT'S NEW THIS YEAR:</h3>
        <ul>
          <li>We've simplified the assessment form based on your feedback</li>
          <li>Added a new "Career Aspirations" section</li>
          <li>Introduced an optional peer feedback component</li>
        </ul>
        
        <div style="border-left: 4px solid #4a86e8; padding-left: 15px; margin: 20px 0;">
          <h3>ACTION REQUIRED:</h3>
          <ol>
            <li>Complete your self-assessment in Workday by February 28</li>
            <li>Submit 3-5 peer feedback requests by February 15 (optional)</li>
            <li>Update your career goals and development plan</li>
          </ol>
        </div>
        
        <h3>RESOURCES:</h3>
        <ul>
          <li>Performance review guidelines and FAQs are available on the <a href="#">HR portal</a></li>
          <li>Review workshops will be held in each office (schedule attached)</li>
          <li>For questions, contact your HR Business Partner</li>
        </ul>
        
        <p>We believe that this process is valuable for your professional development and for ensuring that your contributions are appropriately recognized. Your thoughtful participation is greatly appreciated.</p>
        
        <p>
          Best regards,<br>
          HR Department
        </p>
      </div>`
    },
    date: '2026-02-05T15:30:00Z',
    read: true,
    starred: false,
    labels: ['work', 'hr'],
    folder: 'inbox',
    attachments: [
      {
        id: 'att007',
        filename: 'Performance_Review_Guidelines_2026.pdf',
        size: 1234567,
        contentType: 'application/pdf',
        url: '/attachments/att007'
      },
      {
        id: 'att008',
        filename: 'Review_Workshop_Schedule.xlsx',
        size: 345678,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '/attachments/att008'
      }
    ],
    threadId: 'thread004',
    importance: 'normal'
  }
];

// Utility function to generate an RFC 5322 compliant email string
export const generateRfc5322Email = (email: EmailMessage): string => {
  const formatAddresses = (contacts: Array<{ name: string; email: string }>) => {
    return contacts.map(contact => `${contact.name} <${contact.email}>`).join(', ');
  };
  
  // Format the date according to RFC 5322
  const date = new Date(email.date);
  const dateStr = date.toUTCString();
  
  // Build the headers
  let headers = '';
  headers += `From: ${formatAddresses([email.from])}\r\n`;
  headers += `To: ${formatAddresses(email.to)}\r\n`;
  
  if (email.cc && email.cc.length > 0) {
    headers += `Cc: ${formatAddresses(email.cc)}\r\n`;
  }
  
  headers += `Subject: ${email.subject}\r\n`;
  headers += `Date: ${dateStr}\r\n`;
  headers += `Message-ID: <${email.id}@example.com>\r\n`;
  
  if (email.threadId) {
    headers += `References: <${email.threadId}@example.com>\r\n`;
    headers += `In-Reply-To: <${email.threadId}@example.com>\r\n`;
  }
  
  headers += `X-Priority: ${email.importance === 'high' ? '1' : email.importance === 'low' ? '5' : '3'}\r\n`;
  headers += `X-Starred: ${email.starred ? 'yes' : 'no'}\r\n`;
  headers += `X-Labels: ${email.labels.join(', ')}\r\n`;
  
  // Add MIME headers for multipart messages
  const boundary = `==boundary_${Math.random().toString(36).substr(2, 10)}`;
  headers += `MIME-Version: 1.0\r\n`;
  headers += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
  
  // Start the message body
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Type: multipart/alternative; boundary="alt_${boundary}"\r\n\r\n`;
  
  // Plain text part
  body += `--alt_${boundary}\r\n`;
  body += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
  body += `${email.body.text}\r\n\r\n`;
  
  // HTML part (if available)
  if (email.body.html) {
    body += `--alt_${boundary}\r\n`;
    body += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
    body += `${email.body.html}\r\n\r\n`;
  }
  
  body += `--alt_${boundary}--\r\n\r\n`;
  
  // Attachments
  if (email.attachments.length > 0) {
    email.attachments.forEach(attachment => {
      body += `--${boundary}\r\n`;
      body += `Content-Type: ${attachment.contentType}; name="${attachment.filename}"\r\n`;
      body += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
      body += `Content-Transfer-Encoding: base64\r\n\r\n`;
      body += `[Base64 encoded content for ${attachment.filename}]\r\n\r\n`;
    });
  }
  
  // End the message
  body += `--${boundary}--\r\n`;
  
  return headers + body;
};

// Example of raw email format for ingestion testing
export const rawEmails: string[] = sampleEmails.map(email => generateRfc5322Email(email));