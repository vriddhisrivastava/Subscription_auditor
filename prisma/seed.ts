import { Subscription } from '../src/types/subscription';

export const INITIAL_USER_ID = 'usr_default_demo';

export const SEED_SUBSCRIPTIONS: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: INITIAL_USER_ID,
    name: 'Netflix Premium (4K)',
    category: 'STREAMING_VIDEO',
    cost: 649.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-02',
    paymentMethod: 'HDFC Regalia Gold •••• 4821',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-24', // 2 days ago
    previousCost: 549.00, // price increase
    notes: 'Family 4K plan. Shared with home TV.',
    websiteUrl: 'https://netflix.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Disney+ Hotstar Premium',
    category: 'STREAMING_VIDEO',
    cost: 299.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-08',
    paymentMethod: 'UPI Autopay (GPay)',
    status: 'ACTIVE',
    lastUsedDate: '2026-08-05', // 52 days ago -> UNUSED FLAG!
    previousCost: 299.00,
    notes: 'Subscribed for cricket/movies, barely opened recently.',
    websiteUrl: 'https://hotstar.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Spotify Premium Individual',
    category: 'STREAMING_MUSIC',
    cost: 119.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-09-29', // 3 days renewal!
    paymentMethod: 'ICICI Amazon Pay •••• 3004',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-26', // used today
    previousCost: 99.00,
    notes: 'Daily music listening & podcasts.',
    websiteUrl: 'https://spotify.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Apple Music Individual',
    category: 'STREAMING_MUSIC',
    cost: 99.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-15',
    paymentMethod: 'Apple ID Funds',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-02', // 24 days ago -> DUPLICATE WITH SPOTIFY!
    previousCost: 99.00,
    notes: 'Standalone Apple Music duplicating Spotify listening.',
    websiteUrl: 'https://music.apple.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'ChatGPT Plus',
    category: 'PRODUCTIVITY_SOFTWARE',
    cost: 1999.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-12',
    paymentMethod: 'HDFC Regalia Gold •••• 4821',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-26', // used today
    previousCost: 1999.00,
    notes: 'Daily coding, research, writing assistant.',
    websiteUrl: 'https://chat.openai.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Notion Plus',
    category: 'PRODUCTIVITY_SOFTWARE',
    cost: 850.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-05',
    paymentMethod: 'SBI Cashback •••• 1940',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-21',
    previousCost: 680.00, // Price hike! (₹680 -> ₹850)
    notes: 'Workspace & project documentation.',
    websiteUrl: 'https://notion.so',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Headspace Mindfulness',
    category: 'FITNESS_HEALTH',
    cost: 1499.00,
    currency: 'INR',
    billingCycle: 'YEARLY',
    nextRenewalDate: '2026-09-29', // 3 days away!
    trialEndsDate: '2026-09-29',
    paymentMethod: 'UPI Autopay (PhonePe)',
    status: 'TRIAL', // TRIAL EXPIRING SOON!
    lastUsedDate: '2026-09-18',
    previousCost: null,
    notes: '14-day free trial ending soon! Will bill ₹1,499/yr unless cancelled.',
    websiteUrl: 'https://headspace.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Cultpass Elite / Gym Membership',
    category: 'FITNESS_HEALTH',
    cost: 2499.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-01', // in 5 days
    paymentMethod: 'ICICI Amazon Pay •••• 3004',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-25',
    previousCost: 2199.00, // Price hike (₹2,199 -> ₹2,499)
    notes: 'Monthly fitness center access.',
    websiteUrl: 'https://cult.fit',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'The Economic Times Prime',
    category: 'NEWS_MEDIA',
    cost: 399.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-18',
    paymentMethod: 'Paytm Wallet',
    status: 'ACTIVE',
    lastUsedDate: '2026-06-12', // 106 days ago -> UNUSED ZOMBIE SUBSCRIPTION!
    previousCost: 99.00, // Promotional rate expired (₹99 -> ₹399)
    notes: 'Initial promo ended; bumped to full monthly rate without noticing.',
    websiteUrl: 'https://economictimes.indiatimes.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'GitHub Copilot Individual',
    category: 'PRODUCTIVITY_SOFTWARE',
    cost: 829.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-15',
    paymentMethod: 'HDFC Regalia Gold •••• 4821',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-25',
    previousCost: 829.00,
    notes: 'IDE AI code completion.',
    websiteUrl: 'https://github.com/features/copilot',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Duolingo Super',
    category: 'EDUCATION',
    cost: 1999.00,
    currency: 'INR',
    billingCycle: 'YEARLY',
    nextRenewalDate: '2026-11-20',
    paymentMethod: 'UPI Autopay (GPay)',
    status: 'ACTIVE',
    lastUsedDate: '2026-07-15', // 73 days ago -> UNUSED!
    previousCost: 1999.00,
    notes: 'Language learning streak broke in July.',
    websiteUrl: 'https://duolingo.com',
  },
  {
    userId: INITIAL_USER_ID,
    name: 'Google One 2TB + AI Premium',
    category: 'CLOUD_STORAGE',
    cost: 650.00,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: '2026-10-10',
    paymentMethod: 'Google Play Billing',
    status: 'ACTIVE',
    lastUsedDate: '2026-09-26',
    previousCost: 650.00,
    notes: 'Family cloud storage + Drive backup.',
    websiteUrl: 'https://one.google.com',
  }
];

export async function seedDatabase(targetStorage?: any) {
  console.log(`Seeding ${SEED_SUBSCRIPTIONS.length} sample subscriptions for user ${INITIAL_USER_ID}...`);
  return SEED_SUBSCRIPTIONS;
}
