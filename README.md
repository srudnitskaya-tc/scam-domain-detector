# Scam Domain Detector

A Next.js TypeScript application that helps prevent fraudulent domain registrations by checking domain availability and detecting suspicious patterns that may impersonate legitimate companies.

## Features

- **Domain Availability Check**: Verify if domains are already registered
- **TLD Validation**: Filter by Tucows-offered TLDs
- **Fraud Detection**: Compare against database of legitimate businesses including:
  - Fortune 500 companies
  - Major tech companies
  - Banks and financial institutions
  - Cryptocurrency exchanges
  - Trading platforms
  - Retail stores
  - Airlines and streaming services
- **Pattern Matching**: Detect typosquatting, homograph attacks, and suspicious domain variations
- **Binary Response System**: Clear YES/NO recommendation for domain registration eligibility

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **API**: Next.js API routes
- **Icons**: Lucide React
- **Validation**: Zod

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up the database**:
```bash
npm run db:seed
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)** with your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with legitimate companies
- `npm run db:studio` - Open Prisma Studio

## How It Works

1. **Input**: User enters a domain name (e.g., "gooogle.com")
2. **TLD Check**: Validates if the TLD is supported by Tucows
3. **Availability Check**: Simulates checking if domain is already registered
4. **Fraud Detection**: Analyzes domain against database of legitimate companies using:
   - Exact domain matching with different TLDs
   - Typosquatting detection (character substitutions, additions)
   - Homograph attack detection (look-alike characters)
   - Levenshtein distance for similarity matching
5. **Result**: Returns YES (safe to register) or NO (potential fraud detected)

## Database Schema

- **LegitimateCompany**: Stores company names, domains, and categories
- **TucowsTLD**: Available TLDs with pricing information
- **DomainCheck**: Logs all domain checks for analysis

## Example Fraud Detection

The system detects various fraud patterns:
- `gooogle.com` → Flagged as similar to Google's domain
- `paypaI.com` → Flagged for homograph attack (capital I instead of lowercase l)
- `facebook-login.com` → Flagged for adding suspicious terms to legitimate brand

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
