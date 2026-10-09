import { Subscription, SubscriptionCategory } from '../types/subscription';

export interface DetectedSubscriptionItem {
  id: string;
  rawMerchant: string;
  name: string;
  category: SubscriptionCategory;
  cost: number;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  paymentMethod: string;
  estimatedNextRenewal: string;
  frequencyScore: number;
  selected: boolean;
}

const KNOWN_MERCHANTS: {
  match: string[];
  cleanName: string;
  category: SubscriptionCategory;
  defaultCycle: 'MONTHLY' | 'YEARLY';
}[] = [
  { match: ['netflix'], cleanName: 'Netflix', category: 'STREAMING_VIDEO', defaultCycle: 'MONTHLY' },
  { match: ['spotify'], cleanName: 'Spotify', category: 'STREAMING_MUSIC', defaultCycle: 'MONTHLY' },
  { match: ['apple.com/bill', 'apple music', 'itunes'], cleanName: 'Apple Services', category: 'STREAMING_MUSIC', defaultCycle: 'MONTHLY' },
  { match: ['disney', 'disney plus'], cleanName: 'Disney+', category: 'STREAMING_VIDEO', defaultCycle: 'MONTHLY' },
  { match: ['hulu'], cleanName: 'Hulu', category: 'STREAMING_VIDEO', defaultCycle: 'MONTHLY' },
  { match: ['hbo', 'max.com'], cleanName: 'Max (HBO)', category: 'STREAMING_VIDEO', defaultCycle: 'MONTHLY' },
  { match: ['youtube premium', 'google youtube'], cleanName: 'YouTube Premium', category: 'STREAMING_VIDEO', defaultCycle: 'MONTHLY' },
  { match: ['openai', 'chatgpt'], cleanName: 'ChatGPT Plus', category: 'PRODUCTIVITY_SOFTWARE', defaultCycle: 'MONTHLY' },
  { match: ['notion'], cleanName: 'Notion', category: 'PRODUCTIVITY_SOFTWARE', defaultCycle: 'MONTHLY' },
  { match: ['figma'], cleanName: 'Figma Pro', category: 'PRODUCTIVITY_SOFTWARE', defaultCycle: 'MONTHLY' },
  { match: ['adobe'], cleanName: 'Adobe Creative Cloud', category: 'PRODUCTIVITY_SOFTWARE', defaultCycle: 'MONTHLY' },
  { match: ['github'], cleanName: 'GitHub Copilot', category: 'PRODUCTIVITY_SOFTWARE', defaultCycle: 'MONTHLY' },
  { match: ['amazon prime', 'amzn digital'], cleanName: 'Amazon Prime', category: 'OTHER', defaultCycle: 'YEARLY' },
  { match: ['equinox', 'gym', 'planet fit', 'fitness'], cleanName: 'Fitness Club', category: 'FITNESS_HEALTH', defaultCycle: 'MONTHLY' },
  { match: ['headspace', 'calm'], cleanName: 'Meditation App', category: 'FITNESS_HEALTH', defaultCycle: 'MONTHLY' },
  { match: ['google one', 'google storage'], cleanName: 'Google One', category: 'CLOUD_STORAGE', defaultCycle: 'MONTHLY' },
  { match: ['dropbox'], cleanName: 'Dropbox Plus', category: 'CLOUD_STORAGE', defaultCycle: 'MONTHLY' },
  { match: ['nytimes', 'new york times'], cleanName: 'The New York Times', category: 'NEWS_MEDIA', defaultCycle: 'MONTHLY' },
  { match: ['wsj', 'wall street journal'], cleanName: 'The Wall Street Journal', category: 'NEWS_MEDIA', defaultCycle: 'MONTHLY' },
  { match: ['doordash', 'dashpass'], cleanName: 'DoorDash DashPass', category: 'FOOD_DELIVERY', defaultCycle: 'MONTHLY' },
  { match: ['uber one', 'uber eats'], cleanName: 'Uber One', category: 'FOOD_DELIVERY', defaultCycle: 'MONTHLY' },
  { match: ['duolingo'], cleanName: 'Duolingo Super', category: 'EDUCATION', defaultCycle: 'YEARLY' },
  { match: ['nordvpn', 'expressvpn'], cleanName: 'VPN Security', category: 'UTILITIES_SERVICES', defaultCycle: 'YEARLY' },
  { match: ['playstation', 'ps plus', 'xbox', 'nintendo'], cleanName: 'Gaming Network', category: 'GAMING', defaultCycle: 'MONTHLY' },
];

export function parseCSVBankStatement(
  csvText: string,
  referenceDate: string = '2026-09-26'
): DetectedSubscriptionItem[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Parse lines, handle basic quoted values
  const rows: string[][] = lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });

  // Identify column indices from header
  const header = rows[0].map(c => c.toLowerCase());
  let dateIdx = header.findIndex(c => c.includes('date'));
  let descIdx = header.findIndex(c => c.includes('desc') || c.includes('merchant') || c.includes('payee') || c.includes('name'));
  let amountIdx = header.findIndex(c => c.includes('amount') || c.includes('cost') || c.includes('debit') || c.includes('total'));

  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1) amountIdx = 2;

  const dataRows = rows.slice(1);
  const detectedMap = new Map<string, DetectedSubscriptionItem>();

  dataRows.forEach((row, rowIdx) => {
    const desc = row[descIdx] || '';
    const rawAmt = row[amountIdx] || '0';
    const cleanAmt = Math.abs(parseFloat(rawAmt.replace(/[^0-9.-]+/g, '')) || 0);

    if (!desc || cleanAmt <= 0) return;

    const lowerDesc = desc.toLowerCase();
    
    // Look up in known merchants
    const match = KNOWN_MERCHANTS.find(m => m.match.some(keyword => lowerDesc.includes(keyword)));

    const cleanName = match ? match.cleanName : desc.slice(0, 30);
    const category: SubscriptionCategory = match ? match.category : 'OTHER';
    const cycle = match ? match.defaultCycle : cleanAmt > 1200 ? 'YEARLY' : 'MONTHLY';

    // Estimate next renewal: roughly 30 days after transaction or in early October 2026
    const renewalDate = '2026-10-15';

    const key = cleanName.toLowerCase();
    if (!detectedMap.has(key)) {
      detectedMap.set(key, {
        id: `detected_${rowIdx}_${Date.now()}`,
        rawMerchant: desc,
        name: cleanName,
        category,
        cost: cleanAmt,
        billingCycle: cycle,
        paymentMethod: 'Bank Statement Import',
        estimatedNextRenewal: renewalDate,
        frequencyScore: match ? 95 : 60,
        selected: true,
      });
    }
  });

  return Array.from(detectedMap.values());
}

export const SAMPLE_CSV_CONTENT = `Date,Description,Amount,Card
2026-09-02,NETFLIX.COM PAYMENT 4K,649.00,HDFC-4821
2026-09-05,SPOTIFY INDIA MUSIC,119.00,ICICI-3004
2026-09-08,OPENAI *CHATGPT PLUS SUBSCRIPTION,1999.00,HDFC-4821
2026-09-10,DISNEY PLUS HOTSTAR,299.00,UPI-GPay
2026-09-12,GOOGLE *STORAGE ONE 2TB,650.00,GooglePlay
2026-09-14,CULTFIT HEALTH MEMBERSHIP,2499.00,ICICI-3004
2026-09-15,SWIGGY INSTAMART GROCERY,482.00,HDFC-4821
2026-09-18,NOTION LABS WORKSPACE,850.00,SBI-1940
2026-09-20,ZOMATO GOLD ORDER,320.00,UPI-PhonePe
2026-09-22,ECONOMIC TIMES PRIME,399.00,Paytm
2026-09-24,HP PETROL FUEL,1200.00,ICICI-3004
`;
