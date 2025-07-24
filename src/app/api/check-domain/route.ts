import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const DomainSchema = z.object({
  domain: z.string()
    .min(4, 'Domain must be at least 4 characters long')
    .max(253, 'Domain cannot exceed 253 characters')
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Invalid domain format. Use letters, numbers, and hyphens only.'
    )
});

// Common TLDs that Tucows offers (sample list including multi-level TLDs)
const TUCOWS_TLDS = [
  // Single-level TLDs
  '.com', '.net', '.org', '.info', '.biz', '.name', '.mobi', '.tv', '.cc', '.co', 
  '.me', '.io', '.ai', '.app', '.dev', '.online', '.store', '.tech', '.website',
  // Multi-level TLDs
  '.co.uk', '.com.au', '.com.br', '.com.ru', '.co.jp', '.co.za', '.co.in',
  '.com.mx', '.com.ar', '.com.pe', '.com.co', '.com.ve', '.com.ec',
  '.org.uk', '.net.au', '.gov.uk', '.edu.au', '.ac.uk', '.org.za'
];

// Sample legitimate companies data (in a real app, this would be in the database)
const LEGITIMATE_COMPANIES = [
  { name: 'Google', domains: ['google.com', 'gmail.com', 'youtube.com', 'googleblog.com'] },
  { name: 'Apple', domains: ['apple.com', 'icloud.com', 'itunes.com', 'appstore.com'] },
  { name: 'Microsoft', domains: ['microsoft.com', 'outlook.com', 'office.com', 'xbox.com'] },
  { name: 'Amazon', domains: ['amazon.com', 'aws.com', 'prime.com', 'alexa.com'] },
  { name: 'Meta', domains: ['facebook.com', 'instagram.com', 'whatsapp.com', 'meta.com'] },
  { name: 'Twitter', domains: ['twitter.com', 'x.com'] },
  { name: 'PayPal', domains: ['paypal.com', 'paypalobjects.com'] },
  { name: 'Netflix', domains: ['netflix.com', 'netflixstudios.com'] },
  { name: 'Spotify', domains: ['spotify.com', 'spotifycdn.com'] },
  { name: 'Tesla', domains: ['tesla.com', 'teslamotors.com'] },
  { name: 'Walmart', domains: ['walmart.com', 'walmartlabs.com'] },
  { name: 'Target', domains: ['target.com'] },
  { name: 'Best Buy', domains: ['bestbuy.com'] },
  { name: 'Home Depot', domains: ['homedepot.com'] },
  // Crypto platforms
  { name: 'Coinbase', domains: ['coinbase.com', 'coinbasepro.com'] },
  { name: 'Binance', domains: ['binance.com', 'binance.us'] },
  { name: 'Kraken', domains: ['kraken.com'] },
  { name: 'Gemini', domains: ['gemini.com'] },
  { name: 'Atomic Wallet', domains: ['atomicwallet.io'] },
  { name: 'MetaMask', domains: ['metamask.io'] },
  { name: 'Trust Wallet', domains: ['trustwallet.com'] },
  { name: 'Exodus', domains: ['exodus.com'] },
  { name: 'Ledger', domains: ['ledger.com'] },
  { name: 'Trezor', domains: ['trezor.io'] },
  { name: 'Crypto.com', domains: ['crypto.com'] },
  { name: 'KuCoin', domains: ['kucoin.com'] },
  { name: 'Huobi', domains: ['huobi.com'] },
  { name: 'OKX', domains: ['okx.com'] },
  // Banks
  { name: 'JPMorgan Chase', domains: ['chase.com', 'jpmorganmarkets.com'] },
  { name: 'Bank of America', domains: ['bankofamerica.com', 'bofa.com'] },
  { name: 'Wells Fargo', domains: ['wellsfargo.com'] },
  { name: 'Citibank', domains: ['citibank.com', 'citi.com'] },
  // International companies with multi-level TLDs
  { name: 'BBC', domains: ['bbc.co.uk', 'bbc.com'] },
  { name: 'Tesco', domains: ['tesco.com', 'tesco.co.uk'] },
  { name: 'Vodafone UK', domains: ['vodafone.co.uk', 'vodafone.com'] },
  { name: 'Commonwealth Bank', domains: ['commbank.com.au'] },
  { name: 'Sberbank', domains: ['sberbank.ru', 'sberbank.com'] },
  { name: 'Mail.ru', domains: ['mail.ru'] },
];

function extractDomainParts(domain: string) {
  const parts = domain.toLowerCase().split('.');
  if (parts.length < 2) return null;
  
  // Handle multi-level TLDs like .co.uk, .com.au, .com.ru, etc.
  const commonMultiLevelTlds = [
    'co.uk', 'com.au', 'com.br', 'com.ru', 'co.jp', 'co.za', 'co.in',
    'com.mx', 'com.ar', 'com.pe', 'com.co', 'com.ve', 'com.ec',
    'org.uk', 'net.au', 'gov.uk', 'edu.au', 'ac.uk', 'org.za'
  ];
  
  let tld = '';
  let sld = '';
  let subdomain = '';
  
  // Check for multi-level TLD first
  for (const multiTld of commonMultiLevelTlds) {
    const multiTldParts = multiTld.split('.');
    if (parts.length >= multiTldParts.length + 1) {
      const domainEnding = parts.slice(-multiTldParts.length).join('.');
      if (domainEnding === multiTld) {
        tld = '.' + multiTld;
        sld = parts[parts.length - multiTldParts.length - 1];
        subdomain = parts.length > multiTldParts.length + 1 
          ? parts.slice(0, -(multiTldParts.length + 1)).join('.') 
          : '';
        break;
      }
    }
  }
  
  // If no multi-level TLD found, use single-level TLD
  if (!tld) {
    tld = '.' + parts.slice(-1)[0];
    sld = parts.slice(-2, -1)[0];
    subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : '';
  }
  
  return { tld, sld, subdomain, fullDomain: domain.toLowerCase() };
}

function checkForFraud(domain: string): { isFraudulent: boolean; reason?: string } {
  const domainParts = extractDomainParts(domain);
  if (!domainParts) return { isFraudulent: false };
  
  const { sld, tld, fullDomain } = domainParts;
  
  // Check against legitimate companies
  for (const company of LEGITIMATE_COMPANIES) {
    for (const legitDomain of company.domains) {
      const legitParts = extractDomainParts(legitDomain);
      if (!legitParts) continue;
      
      const legitSld = legitParts.sld;
      const legitTld = legitParts.tld;
      
      // HIGH PRIORITY: Exact domain name match with different TLD
      if (sld === legitSld && tld !== legitTld) {
        return {
          isFraudulent: true,
          reason: `FRAUD ALERT: Domain "${sld}" belongs to ${company.name} (official domain: "${legitDomain}"). Using a different TLD "${tld}" instead of "${legitTld}" is a common fraud technique to impersonate legitimate businesses.`
        };
      }
      
      // HIGH PRIORITY: Business name + suspicious additional words
      const suspiciousWords = [
        'support', 'help', 'tech', 'service', 'customer', 'care', 'assist', 'call',
        'secure', 'safety', 'protection', 'verify', 'account', 'login', 'signin',
        'official', 'portal', 'center', 'desk', 'team', 'agent', 'advisor',
        'billing', 'payment', 'refund', 'claim', 'settlement', 'resolution',
        'update', 'renewal', 'upgrade', 'premium', 'pro', 'plus',
        'alert', 'notice', 'warning', 'urgent', 'important', 'critical',
        'techsupport', 'helpdesk', 'customercare', 'customersupport', 'callcenter',
        'onlinesupport', 'livesupport', 'techhelp', 'servicedesk', 'supportcenter'
      ];
      
      for (const suspiciousWord of suspiciousWords) {
        // Check patterns like: walmart + support, paypal + help, walmarttechsupport, etc.
        if (sld === legitSld + suspiciousWord || sld === suspiciousWord + legitSld) {
          return {
            isFraudulent: true,
            reason: `FRAUD ALERT: Domain "${sld}" appears to impersonate ${company.name} by adding "${suspiciousWord}" to their name. Legitimate companies rarely use such domain patterns. Official domain: "${legitDomain}". This is commonly used in tech support scams and phishing.`
          };
        }
        
        // Check with hyphens: walmart-support, paypal-help, etc.
        if (sld === legitSld + '-' + suspiciousWord || sld === suspiciousWord + '-' + legitSld) {
          return {
            isFraudulent: true,
            reason: `FRAUD ALERT: Domain "${sld}" appears to impersonate ${company.name} by adding "-${suspiciousWord}" to their name. This is a common fraud technique. Official domain: "${legitDomain}".`
          };
        }
        
        // Check with numbers: walmart2support, paypal24help, etc.
        const numberVariations = ['1', '2', '24', '247', '365'];
        for (const num of numberVariations) {
          if (sld === legitSld + num + suspiciousWord || sld === legitSld + suspiciousWord + num) {
            return {
              isFraudulent: true,
              reason: `FRAUD ALERT: Domain "${sld}" appears to impersonate ${company.name} by combining their name with numbers and "${suspiciousWord}". This is typically used in scam operations. Official domain: "${legitDomain}".`
            };
          }
        }
      }
      
      // Additional pattern check: company name contained within a longer suspicious domain
      // This catches cases like walmarttechsupport.com, amazoncustomersupport.com, etc.
      if (sld.includes(legitSld) && sld !== legitSld) {
        const beforeCompany = sld.substring(0, sld.indexOf(legitSld));
        const afterCompany = sld.substring(sld.indexOf(legitSld) + legitSld.length);
        
        // Check if what's added before or after contains suspicious terms
        const suspiciousTerms = [
          'support', 'help', 'tech', 'service', 'customer', 'care', 'assist', 'call',
          'secure', 'safety', 'protection', 'verify', 'account', 'login', 'signin',
          'official', 'portal', 'center', 'desk', 'team', 'agent', 'advisor',
          'billing', 'payment', 'refund', 'claim', 'settlement', 'resolution',
          'update', 'renewal', 'upgrade', 'premium', 'pro', 'plus',
          'alert', 'notice', 'warning', 'urgent', 'important', 'critical',
          'techsupport', 'helpdesk', 'customercare', 'customersupport', 'callcenter',
          'onlinesupport', 'livesupport', 'techhelp', 'servicedesk', 'supportcenter',
          'usa', 'us', 'online', 'web', 'net', 'digital', 'store', 'shop', 'mall'
        ];
        
        for (const term of suspiciousTerms) {
          if (beforeCompany.includes(term) || afterCompany.includes(term)) {
            return {
              isFraudulent: true,
              reason: `FRAUD ALERT: Domain "${sld}" appears to impersonate ${company.name} by embedding their name within a suspicious domain pattern. The added text "${beforeCompany || afterCompany}" suggests this may be a scam operation. Official domain: "${legitDomain}".`
            };
          }
        }
        
        // Flag any domain that contains the company name but isn't the official domain
        // This is more aggressive but helps catch sophisticated impersonation attempts
        return {
          isFraudulent: true,
          reason: `POTENTIAL FRAUD: Domain "${sld}" contains the name of ${company.name} but is not their official domain. This could be an impersonation attempt. Official domain: "${legitDomain}". Please verify authenticity before proceeding.`
        };
      }
      
      // Check for exact match (shouldn't happen for available domains, but good to catch)
      if (fullDomain === legitDomain.toLowerCase()) {
        return {
          isFraudulent: true,
          reason: `This is the official domain of ${company.name}. If this shows as available, there may be an error in availability checking.`
        };
      }
      
      // Check for similar domain with suspicious variations (typosquatting)
      if (isSimilarDomain(sld, legitSld)) {
        return {
          isFraudulent: true,
          reason: `Domain name is very similar to ${company.name}'s official domain "${legitDomain}". This appears to be a typosquatting attempt designed to deceive users.`
        };
      }
    }
  }
  
  // Additional check: Look for common variations of well-known domain patterns
  const suspiciousPatterns = [
    // Variations of popular services
    { pattern: /^(gmail|g00gle|g0ogle|goog1e|googIe)$/, company: 'Google', legitimate: 'gmail.com / google.com' },
    { pattern: /^(facebok|faceb00k|facebook1|facebοοk)$/, company: 'Meta', legitimate: 'facebook.com' },
    { pattern: /^(paypaI|paypa1|paypaII|раypal)$/, company: 'PayPal', legitimate: 'paypal.com' },
    { pattern: /^(amazοn|amaz0n|amazon1|amаzon)$/, company: 'Amazon', legitimate: 'amazon.com' },
    { pattern: /^(micrοsoft|micr0soft|microsoft1|miсrosoft)$/, company: 'Microsoft', legitimate: 'microsoft.com' },
    { pattern: /^(app1e|аpple|apple1|appIe)$/, company: 'Apple', legitimate: 'apple.com' },
  ];
  
  for (const { pattern, company, legitimate } of suspiciousPatterns) {
    if (pattern.test(sld)) {
      return {
        isFraudulent: true,
        reason: `Domain name "${sld}" appears to be impersonating ${company} (legitimate domain: ${legitimate}). This uses character substitution or similar techniques commonly used in fraud.`
      };
    }
  }
  
  return { isFraudulent: false };
}

function isSimilarDomain(input: string, legitimate: string): boolean {
  // Check for common typosquatting patterns
  if (input === legitimate) return false; // Exact match is handled separately
  
  // Homograph/character substitution
  const substitutions: { [key: string]: string[] } = {
    'o': ['0', 'ο', 'о'], // Latin o, digit 0, Greek omicron, Cyrillic o
    'a': ['α', 'а'], // Latin a, Greek alpha, Cyrillic a
    'e': ['е'], // Latin e, Cyrillic e
    'i': ['1', 'l', 'і'], // Latin i, digit 1, Latin l, Cyrillic i
    'l': ['1', 'i', 'І'], // Latin l, digit 1, Latin i, Cyrillic I
  };
  
  // Check for character substitutions
  for (const [original, variants] of Object.entries(substitutions)) {
    for (const variant of variants) {
      if (input.includes(variant) && legitimate.includes(original)) {
        const normalized = input.replace(new RegExp(variant, 'g'), original);
        if (normalized === legitimate) return true;
      }
    }
  }
  
  // Check for common additions/insertions
  const commonAdditions = ['-', '_', '1', '2', '0', 'app', 'web', 'secure', 'login', 'official'];
  
  for (const addition of commonAdditions) {
    if (input === legitimate + addition || input === addition + legitimate) {
      return true;
    }
  }
  
  // Levenshtein distance check for very similar domains
  if (levenshteinDistance(input, legitimate) <= 2 && Math.abs(input.length - legitimate.length) <= 2) {
    return true;
  }
  
  return false;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function checkDomainAvailability(domain: string): Promise<boolean> {
  // In a real production environment, you would use a proper domain availability API like:
  // - Tucows API
  // - GoDaddy API  
  // - Namecheap API
  // - WHOIS service
  
  // For this demo, we'll check if the domain responds to HTTP requests
  // If it responds, it's likely registered and in use
  try {
    // Try both HTTP and HTTPS
    const urls = [`https://${domain}`, `http://${domain}`];
    
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(url, {
          method: 'HEAD', // Use HEAD to minimize data transfer
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DomainChecker/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        // If we get any response (even errors like 404, 403, etc.), 
        // it means the domain is registered and has a server
        if (response.status >= 200 && response.status < 600) {
          return false; // Domain is taken/registered
        }
      } catch (fetchError) {
        // Continue to next URL or fall through to DNS check
        continue;
      }
    }
    
    // If HTTP requests fail, try a basic DNS resolution check
    // This is a simplified approach - in production you'd use proper DNS libraries
    try {
      const dnsUrl = `https://dns.google/resolve?name=${domain}&type=A`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const dnsResponse = await fetch(dnsUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json();
        // If DNS returns answers, the domain likely exists
        if (dnsData.Answer && dnsData.Answer.length > 0) {
          return false; // Domain is registered
        }
      }
    } catch (dnsError) {
      // DNS check failed, continue with fallback
    }
    
    // Fallback: check against our known taken domains list
    const definitivelyTakenDomains = [
      // Major tech companies
      'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com',
      'twitter.com', 'x.com', 'instagram.com', 'youtube.com', 'linkedin.com', 'reddit.com',
      'netflix.com', 'spotify.com', 'tesla.com',
      // Crypto platforms
      'coinbase.com', 'binance.com', 'kraken.com', 'gemini.com', 'atomicwallet.io',
      'metamask.io', 'trustwallet.com', 'exodus.com', 'ledger.com', 'trezor.io',
      'crypto.com', 'kucoin.com', 'huobi.com', 'okx.com',
      // Banks
      'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citibank.com', 'citi.com',
      // PayPal
      'paypal.com',
      // Other common domains
      'github.com', 'stackoverflow.com', 'wordpress.com', 'adobe.com', 'nvidia.com',
      'intel.com', 'amd.com', 'oracle.com', 'salesforce.com', 'zoom.us'
    ];
    
    // Also check against all domains in our legitimate companies list
    for (const company of LEGITIMATE_COMPANIES) {
      for (const legitDomain of company.domains) {
        definitivelyTakenDomains.push(legitDomain.toLowerCase());
      }
    }
    
    const isDomainInKnownList = definitivelyTakenDomains.includes(domain.toLowerCase());
    
    // Return true (available) only if domain is not in our known list
    // For unknown domains, we assume they might be available
    return !isDomainInKnownList;
    
  } catch (error) {
    console.error('Error checking domain availability:', error);
    // In case of any error, default to checking against known list
    const definitivelyTakenDomains = LEGITIMATE_COMPANIES.flatMap(company => 
      company.domains.map(d => d.toLowerCase())
    );
    return !definitivelyTakenDomains.includes(domain.toLowerCase());
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain } = DomainSchema.parse(body);
    
    // Extract TLD and check if it's supported by Tucows
    const domainParts = extractDomainParts(domain);
    if (!domainParts) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }
    
    const { tld } = domainParts;
    if (!TUCOWS_TLDS.includes(tld)) {
      return NextResponse.json({
        domain,
        isAvailable: false,
        isFraudulent: false,
        canRegister: false,
        reason: `TLD "${tld}" is not supported by Tucows. Supported TLDs: ${TUCOWS_TLDS.join(', ')}`
      });
    }
    
    // Check domain availability
    const isAvailable = await checkDomainAvailability(domain);
    
    // Check for fraud
    const { isFraudulent, reason: fraudReason } = checkForFraud(domain);
    
    // Determine if domain can be registered
    const canRegister = isAvailable && !isFraudulent;
    
    let reason = fraudReason;
    if (!isAvailable && !fraudReason) {
      reason = 'Domain is already registered by another party.';
    }
    
    // Log the check to database
    try {
      await prisma.domainCheck.create({
        data: {
          domain,
          isAvailable,
          isFraudulent,
          reason: reason || null
        }
      });
    } catch (error) {
      console.error('Failed to log domain check:', error);
      // Continue without failing the request
    }
    
    return NextResponse.json({
      domain,
      isAvailable,
      isFraudulent,
      canRegister,
      reason
    });
    
  } catch (error) {
    console.error('Domain check error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
