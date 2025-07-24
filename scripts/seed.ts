import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

const LEGITIMATE_COMPANIES = [
  // Tech Giants
  { name: 'Google', domains: JSON.stringify(['google.com', 'gmail.com', 'youtube.com', 'googleblog.com']), category: 'tech' },
  { name: 'Apple', domains: JSON.stringify(['apple.com', 'icloud.com', 'itunes.com', 'appstore.com']), category: 'tech' },
  { name: 'Microsoft', domains: JSON.stringify(['microsoft.com', 'outlook.com', 'office.com', 'xbox.com']), category: 'tech' },
  { name: 'Amazon', domains: JSON.stringify(['amazon.com', 'aws.com', 'prime.com', 'alexa.com']), category: 'tech' },
  { name: 'Meta', domains: JSON.stringify(['facebook.com', 'instagram.com', 'whatsapp.com', 'meta.com']), category: 'tech' },
  
  // Fortune 500 Companies
  { name: 'Walmart', domains: JSON.stringify(['walmart.com', 'walmartlabs.com']), category: 'fortune500' },
  { name: 'ExxonMobil', domains: JSON.stringify(['exxonmobil.com']), category: 'fortune500' },
  { name: 'Berkshire Hathaway', domains: JSON.stringify(['berkshirehathaway.com']), category: 'fortune500' },
  { name: 'UnitedHealth Group', domains: JSON.stringify(['unitedhealthgroup.com', 'uhg.com']), category: 'fortune500' },
  { name: 'McKesson', domains: JSON.stringify(['mckesson.com']), category: 'fortune500' },
  
  // Banks
  { name: 'JPMorgan Chase', domains: JSON.stringify(['chase.com', 'jpmorganmarkets.com', 'jpmorgan.com']), category: 'bank' },
  { name: 'Bank of America', domains: JSON.stringify(['bankofamerica.com', 'bofa.com']), category: 'bank' },
  { name: 'Wells Fargo', domains: JSON.stringify(['wellsfargo.com']), category: 'bank' },
  { name: 'Citibank', domains: JSON.stringify(['citibank.com', 'citi.com']), category: 'bank' },
  { name: 'Goldman Sachs', domains: JSON.stringify(['goldmansachs.com', 'gs.com']), category: 'bank' },
  
  // Crypto Exchanges
  { name: 'Coinbase', domains: JSON.stringify(['coinbase.com', 'coinbasepro.com']), category: 'crypto' },
  { name: 'Binance', domains: JSON.stringify(['binance.com', 'binance.us']), category: 'crypto' },
  { name: 'Kraken', domains: JSON.stringify(['kraken.com']), category: 'crypto' },
  { name: 'Gemini', domains: JSON.stringify(['gemini.com']), category: 'crypto' },
  { name: 'Crypto.com', domains: JSON.stringify(['crypto.com']), category: 'crypto' },
  { name: 'KuCoin', domains: JSON.stringify(['kucoin.com']), category: 'crypto' },
  { name: 'Huobi', domains: JSON.stringify(['huobi.com']), category: 'crypto' },
  { name: 'OKX', domains: JSON.stringify(['okx.com']), category: 'crypto' },
  
  // Crypto Wallets
  { name: 'Atomic Wallet', domains: JSON.stringify(['atomicwallet.io']), category: 'crypto' },
  { name: 'MetaMask', domains: JSON.stringify(['metamask.io']), category: 'crypto' },
  { name: 'Trust Wallet', domains: JSON.stringify(['trustwallet.com']), category: 'crypto' },
  { name: 'Exodus', domains: JSON.stringify(['exodus.com']), category: 'crypto' },
  { name: 'Ledger', domains: JSON.stringify(['ledger.com']), category: 'crypto' },
  { name: 'Trezor', domains: JSON.stringify(['trezor.io']), category: 'crypto' },
  
  // Trading Platforms
  { name: 'E*TRADE', domains: JSON.stringify(['etrade.com']), category: 'trading' },
  { name: 'Charles Schwab', domains: JSON.stringify(['schwab.com']), category: 'trading' },
  { name: 'Fidelity', domains: JSON.stringify(['fidelity.com']), category: 'trading' },
  { name: 'TD Ameritrade', domains: JSON.stringify(['tdameritrade.com']), category: 'trading' },
  { name: 'Robinhood', domains: JSON.stringify(['robinhood.com']), category: 'trading' },
  
  // Retail Stores
  { name: 'Target', domains: JSON.stringify(['target.com']), category: 'retail' },
  { name: 'Home Depot', domains: JSON.stringify(['homedepot.com']), category: 'retail' },
  { name: 'Costco', domains: JSON.stringify(['costco.com']), category: 'retail' },
  { name: 'Best Buy', domains: JSON.stringify(['bestbuy.com']), category: 'retail' },
  { name: 'Nike', domains: JSON.stringify(['nike.com']), category: 'retail' },
  
  // Airlines
  { name: 'American Airlines', domains: JSON.stringify(['aa.com', 'americanairlines.com']), category: 'airline' },
  { name: 'Delta Air Lines', domains: JSON.stringify(['delta.com']), category: 'airline' },
  { name: 'United Airlines', domains: JSON.stringify(['united.com']), category: 'airline' },
  { name: 'Southwest Airlines', domains: JSON.stringify(['southwest.com']), category: 'airline' },
  
  // Streaming Services
  { name: 'Netflix', domains: JSON.stringify(['netflix.com']), category: 'streaming' },
  { name: 'Disney+', domains: JSON.stringify(['disneyplus.com', 'disney.com']), category: 'streaming' },
  { name: 'HBO Max', domains: JSON.stringify(['hbomax.com']), category: 'streaming' },
  { name: 'Spotify', domains: JSON.stringify(['spotify.com']), category: 'streaming' },
];

const TUCOWS_TLDS = [
  { tld: '.com', price: 12.99 },
  { tld: '.net', price: 14.99 },
  { tld: '.org', price: 14.99 },
  { tld: '.info', price: 19.99 },
  { tld: '.biz', price: 19.99 },
  { tld: '.name', price: 9.99 },
  { tld: '.mobi', price: 24.99 },
  { tld: '.tv', price: 39.99 },
  { tld: '.cc', price: 29.99 },
  { tld: '.co', price: 32.99 },
  { tld: '.me', price: 19.99 },
  { tld: '.io', price: 59.99 },
  { tld: '.ai', price: 199.99 },
  { tld: '.app', price: 19.99 },
  { tld: '.dev', price: 19.99 },
  { tld: '.online', price: 39.99 },
  { tld: '.store', price: 59.99 },
  { tld: '.tech', price: 54.99 },
  { tld: '.website', price: 24.99 },
];

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clear existing data
  await prisma.domainCheck.deleteMany();
  await prisma.tucowsTLD.deleteMany();
  await prisma.legitimateCompany.deleteMany();
  
  console.log('🗑️  Cleared existing data');
  
  // Seed legitimate companies
  for (const company of LEGITIMATE_COMPANIES) {
    await prisma.legitimateCompany.create({
      data: company
    });
  }
  
  console.log(`✅ Seeded ${LEGITIMATE_COMPANIES.length} legitimate companies`);
  
  // Seed Tucows TLDs
  for (const tld of TUCOWS_TLDS) {
    await prisma.tucowsTLD.create({
      data: tld
    });
  }
  
  console.log(`✅ Seeded ${TUCOWS_TLDS.length} Tucows TLDs`);
  
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
