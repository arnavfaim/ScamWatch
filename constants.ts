
export const SCAM_CATEGORIES = [
  'Phishing',
  'Crypto Investment',
  'Romance Scam',
  'Marketplace Fraud',
  'Tech Support',
  'Impersonation',
  'Employment Scam',
  'Other'
];

export const PLATFORMS = [
  'WhatsApp',
  'Telegram',
  'Facebook',
  'Instagram',
  'X (Twitter)',
  'Discord',
  'LinkedIn',
  'Email',
  'Website',
  'Phone/SMS',
  'Other'
];

export const INITIAL_REPORTS = [
  {
    id: '1',
    title: 'Fake Crypto Recovery Agent',
    scammerName: 'Blockchain Specialist Alex',
    scammerHandle: '@alex_recovery_pro',
    scammerContact: 'alex@block-recovery.com',
    platform: 'Telegram',
    category: 'Crypto Investment',
    description: 'Claimed he could recover my lost funds from a previous scam if I paid an upfront "gas fee" of $500. After payment, he blocked me.',
    proofUrls: ['https://picsum.photos/400/300?random=1'],
    status: 'approved',
    riskLevel: 'high',
    upvotes: 12,
    flags: 0,
    reporterId: 'u1',
    createdAt: Date.now() - 86400000,
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Jane Doe', text: 'This same guy contacted me yesterday! Be careful.', timestamp: Date.now() - 43200000 }
    ],
    aiSummary: 'This appears to be a classic "Recovery Room" scam targeting previous victims of fraud.'
  },
  {
    id: '2',
    title: 'Phishing Email - Netflix Payment',
    scammerContact: 'support@nefflix-billing.com',
    platform: 'Email',
    category: 'Phishing',
    description: 'Received an email saying my membership was cancelled and I need to update my credit card info on a fake site.',
    proofUrls: ['https://picsum.photos/400/300?random=2'],
    status: 'pending',
    riskLevel: 'medium',
    upvotes: 5,
    flags: 0,
    reporterId: 'u3',
    createdAt: Date.now() - 172800000,
    comments: [],
  }
];
