# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js TypeScript project for a **Scam Domain Detector** that helps prevent fraudulent domain registrations. The application provides:

1. **Domain Availability Check**:
   - Verify TLD existence
   - Filter by Tucows-offered TLDs
   - Check if domain is already registered

2. **Fraud Detection**:
   - Database of legitimate businesses (Fortune 500, crypto sites, banks, trading platforms)
   - Pattern matching for suspicious domain variations
   - Binary response system (YES/NO for registration eligibility)

## Technical Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: To be determined (likely PostgreSQL or SQLite)
- **Domain API**: Integration with domain registration APIs
- **UI**: Modern, responsive design with Tailwind CSS

## Key Features to Implement

- Domain input form with validation
- Real-time availability checking
- Fraud detection algorithm
- Results display with clear YES/NO indicators
- Admin panel for managing legitimate business database
- API integrations for domain checking services

## Development Guidelines

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Implement proper error handling
- Use Tailwind for styling
- Write clean, documented code
- Consider security implications for fraud detection
