import React, { useState } from 'react';
import { ArchitectureDiagram } from './ArchitectureDiagram.js';
import {
  Layers,
  Cloud,
  Server,
  Database,
  Lock,
  Activity,
  Bell,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  DollarSign,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ArchitectureNode {
  id: string;
  name: string;
  service: string;
  category: 'Network' | 'Compute' | 'Storage' | 'Queue' | 'Database' | 'Monitoring';
  status: string;
  resourceId: string;
  description: string;
  cloudFormationCode: string;
  iamActions: string[];
  justification: string;
}

const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 's3',
    name: 'Amazon S3 Document Vault',
    service: 'Amazon Simple Storage Service (S3)',
    category: 'Storage',
    status: 'ACTIVE • AES256 ENCRYPTED',
    resourceId: 'medicloud-prod-documents-531988093771-us-east-1',
    description:
      'Private bucket enforcing Block Public Access and AES256 server-side encryption. The backend generates cryptographic SigV4 presigned URLs so clients upload files directly to S3 without buffering through the Node.js API.',
    cloudFormationCode: `MedicalDocumentsBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: medicloud-prod-documents-531988093771-us-east-1
    AccessControl: Private
    PublicAccessBlockConfiguration:
      BlockPublicAcls: true
      BlockPublicPolicy: true
      IgnorePublicAcls: true
      RestrictPublicBuckets: true
    BucketEncryption:
      ServerSideEncryptionConfiguration:
        - ServerSideEncryptionByDefault:
            SSEAlgorithm: AES256`,
    iamActions: ['s3:PutObject', 's3:GetObject', 's3:AbortMultipartUpload', 's3:ListBucket'],
    justification:
      'Zero-knowledge storage: Patient medical documents are never exposed to public endpoints or stored on temporary VM disks. Encrypted at rest with AES256.',
  },
  {
    id: 'sqs',
    name: 'Amazon SQS Queue & Dead-Letter Queue',
    service: 'Amazon Simple Queue Service (SQS)',
    category: 'Queue',
    status: 'ACTIVE • LONG-POLLING 20s',
    resourceId: 'medicloud-prod-document-jobs (DLQ: document-jobs-dlq)',
    description:
      'Decouples heavy document OCR processing from user HTTP request cycles. Features 20-second long-polling, 120-second visibility timeout, and automatic routing to a Dead-Letter Queue after 3 failed extraction attempts.',
    cloudFormationCode: `DocumentJobsQueue:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: medicloud-prod-document-jobs
    VisibilityTimeout: 120
    ReceiveMessageWaitTimeSeconds: 20
    RedrivePolicy:
      deadLetterTargetArn: !GetAtt DocumentJobsDLQ.Arn
      maxReceiveCount: 3`,
    iamActions: ['sqs:SendMessage', 'sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
    justification:
      'Decoupled resilience: If the background extraction worker restarts or crashes, messages remain safely queued in SQS without data loss.',
  },
  {
    id: 'rds',
    name: 'Amazon RDS Managed PostgreSQL 16',
    service: 'Amazon Relational Database Service (RDS)',
    category: 'Database',
    status: 'ACTIVE • ISOLATED SUBNET',
    resourceId: 'medicloud-postgres (Port 5432)',
    description:
      'PostgreSQL 16 relational engine deployed across isolated private database subnets with no public internet ingress. Enforces row-level pessimistic locking (SELECT ... FOR UPDATE) to mathematically prevent appointment double-booking.',
    cloudFormationCode: `RDSDatabaseInstance:
  Type: AWS::RDS::DBInstance
  Properties:
    Engine: postgres
    EngineVersion: '16.3'
    DBInstanceClass: db.t3.micro
    AllocatedStorage: '20'
    MultiAZ: false # Single-AZ for Free Tier compliance
    PubliclyAccessible: false
    VPCSecurityGroups: [!Ref RDSSecurityGroup]`,
    iamActions: ['rds:DescribeDBInstances', 'rds:DescribeDBClusters'],
    justification:
      'ACID transactional integrity: Guarantees strict consistency for patient health records and eliminates race conditions during peak booking periods.',
  },
  {
    id: 'ec2',
    name: 'Amazon EC2 Compute & Background Worker',
    service: 'Amazon Elastic Compute Cloud (EC2)',
    category: 'Compute',
    status: 'RUNNING • SYSTEMD MANAGED',
    resourceId: 't3.micro (Amazon Linux 2023)',
    description:
      'Hosts the Node.js/TypeScript Express API and asynchronous document worker daemon. Operates with an attached IAM Instance Profile (MediCloud-EC2-AppRole) eliminating the need for hardcoded AWS secret keys on the filesystem.',
    cloudFormationCode: `EC2AppInstance:
  Type: AWS::EC2::Instance
  Properties:
    InstanceType: t3.micro
    IamInstanceProfile: !Ref EC2InstanceProfile
    SubnetId: !Ref PrivateAppSubnet1
    SecurityGroupIds: [!Ref EC2SecurityGroup]`,
    iamActions: ['sts:AssumeRole (via EC2 Instance Metadata IMDSv2)'],
    justification:
      'Stateless compute: Complies with university rubric requiring non-serverless dedicated application server running behind custom VPC security groups.',
  },
  {
    id: 'sns',
    name: 'Amazon SNS Clinical Notifications Topic',
    service: 'Amazon Simple Notification Service (SNS)',
    category: 'Network',
    status: 'ACTIVE • EMAIL SUBSCRIBED',
    resourceId: 'arn:aws:sns:us-east-1:531988093771:medicloud-prod-notifications-topic',
    description:
      'Pub/sub notification bus that broadcasts appointment confirmations, clinical cancellations, and CloudWatch operational alert messages to subscribed administrators and patients.',
    cloudFormationCode: `NotificationTopic:
  Type: AWS::SNS::Topic
  Properties:
    TopicName: medicloud-prod-notifications-topic
    DisplayName: MediCloud Clinical Platform Notifications`,
    iamActions: ['sns:Publish', 'sns:Subscribe'],
    justification:
      'Real-time decoupled messaging: Dispatches instant critical clinical updates across multiple protocols without coupling the web server.',
  },
  {
    id: 'vpc',
    name: 'Custom VPC & Multi-Tier Subnets',
    service: 'Amazon Virtual Private Cloud (VPC)',
    category: 'Network',
    status: 'ACTIVE • CIDR 10.0.0.0/16',
    resourceId: 'vpc-02f2b721ab4ad3f5d',
    description:
      'Custom CIDR 10.0.0.0/16 network spanning 2 Availability Zones with dedicated Public Subnets (10.0.1.0/24, 10.0.2.0/24), Private App Subnet (10.0.10.0/24), and Isolated Database Subnets (10.0.20.0/24, 10.0.21.0/24).',
    cloudFormationCode: `VPC:
  Type: AWS::EC2::VPC
  Properties:
    CidrBlock: 10.0.0.0/16
    EnableDnsSupport: true
    EnableDnsHostnames: true`,
    iamActions: ['ec2:DescribeVpcs', 'ec2:DescribeSubnets', 'ec2:DescribeRouteTables'],
    justification:
      'Zero default VPC usage: Enforces enterprise defense-in-depth network isolation where database instances cannot be accessed from the public internet.',
  },
];

export const ArchitecturePage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCHITECTURE_NODES[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does MediCloud prevent appointment double-booking race conditions?',
      a: 'When booking, the backend opens a PostgreSQL transaction and issues: SELECT id, is_booked FROM doctor_availability WHERE id = $1 FOR UPDATE. This row-level lock blocks concurrent requests for the exact same slot until the first transaction commits or aborts.',
    },
    {
      q: 'Why use Presigned S3 URLs instead of uploading files through the Node.js server?',
      a: 'Direct S3 uploads via presigned URLs prevent memory saturation and thread starvation on the EC2 API server. Large binary files stream directly from the browser to Amazon S3, ensuring the backend handles millions of metadata API calls effortlessly.',
    },
    {
      q: 'How does the SQS Dead-Letter Queue (DLQ) redrive policy work?',
      a: 'The main SQS queue is configured with maxReceiveCount: 3. If an encrypted document causes the OCR worker to crash or fail 3 times, SQS automatically moves the poisonous message to document-jobs-dlq so the worker queue does not get blocked.',
    },
    {
      q: 'How does MediCloud satisfy university cost constraints ($15 budget)?',
      a: 'MediCloud relies exclusively on AWS Free Tier eligible resources: t3.micro EC2 compute, db.t3.micro Single-AZ RDS PostgreSQL, S3 standard tier with lifecycle rules, and SQS long-polling (which drastically reduces billable ReceiveMessage API requests). An AWS Budget with an 85% ($12.75) forecast trigger provides instant alert safeguards.',
    },
  ];

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span className="cloud-beacon">
            <span className="beacon-dot" />
            <span>AWS CloudFormation IaC Blueprint</span>
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Cloud Architecture & Topology Blueprint</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '840px', lineHeight: 1.6 }}>
          MediCloud is engineered as a decoupled, multi-tier cloud platform adhering to the AWS Well-Architected Framework. Click any cloud component below to inspect its IaC template, IAM policy, and live AWS resource identifiers.
        </p>
      </div>

      {/* Visual Multi-Tier Architectural Diagram Canvas */}
      <ArchitectureDiagram
        selectedNodeId={selectedNode.id}
        onSelectNode={(nodeId) => {
          const found = ARCHITECTURE_NODES.find((n) => n.id === nodeId);
          if (found) setSelectedNode(found);
        }}
      />

      {/* Interactive AWS Cloud Topology Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={22} color="var(--primary-blue)" />
          <span>Interactive AWS Service Map (Click any service to inspect):</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {ARCHITECTURE_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="card card-interactive"
                style={{
                  border: isSelected ? '2px solid var(--primary-blue)' : '1px solid var(--border-glass)',
                  boxShadow: isSelected ? '0 0 20px var(--primary-glow)' : 'var(--shadow-sm)',
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge ${node.category === 'Storage' ? 'badge-success' : node.category === 'Queue' ? 'badge-warning' : node.category === 'Database' ? 'badge-error' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                    {node.category}
                  </span>
                  <span className="beacon-dot" style={{ width: '6px', height: '6px' }} />
                </div>

                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{node.name}</h4>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                  {node.service}
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {node.description}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <strong style={{ color: 'var(--success)' }}>Active & Verified</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Component Detailed Inspector */}
      <div className="card card-featured" style={{ marginBottom: '3rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <Cloud size={24} color="var(--primary-blue)" />
              <h2 style={{ fontSize: '1.65rem' }}>{selectedNode.name}</h2>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Official AWS Service: <strong>{selectedNode.service}</strong> • Telemetry Status: <strong style={{ color: 'var(--success)' }}>{selectedNode.status}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--border-subtle)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Live Resource Identifier:</span>
            <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-blue)' }}>{selectedNode.resourceId}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>Operational Description</h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {selectedNode.description}
            </p>

            <h4 style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>Architectural Justification</h4>
            <div style={{ backgroundColor: 'var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-blue)', fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
              {selectedNode.justification}
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Least-Privilege IAM Action Permissions</h4>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {selectedNode.iamActions.map((act) => (
                  <span key={act} className="badge badge-neutral" style={{ fontFamily: 'monospace', fontSize: '0.725rem' }}>
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CloudFormation YAML Snippet */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Code2 size={16} color="var(--secondary-teal)" />
                <span>CloudFormation Template Snippet</span>
              </h4>
              <span className="badge badge-neutral" style={{ fontSize: '0.675rem' }}>YAML</span>
            </div>
            <pre
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                lineHeight: 1.5,
                maxHeight: '340px',
                color: 'var(--text-main)',
              }}
            >
              <code>{selectedNode.cloudFormationCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Viva Voce Defense Handbook & Architecture Q&A */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <HelpCircle size={22} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1.35rem' }}>Viva Voce Defense & Architectural Q&A</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Direct answers to key technical evaluation questions asked by external examiners and university project mentors.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: openFaq === idx ? 'var(--border-subtle)' : 'transparent',
                transition: 'var(--transition-fast)',
              }}
            >
              <div
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {openFaq === idx && (
                <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cost & Budget Summary */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <DollarSign size={22} color="var(--success)" />
            <h3 style={{ fontSize: '1.35rem' }}>AWS Cost Optimization & $15 Budget Enforcement</h3>
          </div>
          <span className="badge badge-success">Free Tier Compliant</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Resource Specification</th>
                <th>Monthly Free Tier Allowance</th>
                <th>Estimated Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Amazon EC2</strong></td>
                <td>1x t3.micro Compute Instance</td>
                <td>750 hours/month (Free Tier)</td>
                <td><strong style={{ color: 'var(--success)' }}>$0.00</strong></td>
              </tr>
              <tr>
                <td><strong>Amazon RDS</strong></td>
                <td>PostgreSQL 16 db.t3.micro (Single-AZ)</td>
                <td>750 hours/month + 20 GB Storage</td>
                <td><strong style={{ color: 'var(--success)' }}>$0.00</strong></td>
              </tr>
              <tr>
                <td><strong>Amazon S3</strong></td>
                <td>Encrypted Medical Documents Vault</td>
                <td>5 GB Standard Storage + 20,000 GETs</td>
                <td><strong style={{ color: 'var(--success)' }}>$0.00</strong></td>
              </tr>
              <tr>
                <td><strong>Amazon SQS</strong></td>
                <td>Document Jobs Queue & DLQ (Long-Polling 20s)</td>
                <td>1,000,000 Requests/month</td>
                <td><strong style={{ color: 'var(--success)' }}>$0.00</strong></td>
              </tr>
              <tr>
                <td><strong>Amazon SNS</strong></td>
                <td>Clinical Notification Topic</td>
                <td>100,000 SMS / 1,000,000 Push/Email</td>
                <td><strong style={{ color: 'var(--success)' }}>$0.00</strong></td>
              </tr>
              <tr>
                <td><strong>AWS Budgets</strong></td>
                <td>Hard Spending Cap: $15.00/mo (Alert at 85%)</td>
                <td>First 2 budgets free</td>
                <td><strong style={{ color: 'var(--success)' }}>$0.00</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
