'use client';

import { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import DomainForm from '@/components/DomainForm';
import ResultCard from '@/components/ResultCard';

interface DomainCheckResult {
  domain: string;
  isAvailable: boolean;
  isFraudulent: boolean;
  reason?: string;
  canRegister: boolean;
}

export default function Home() {
  const [result, setResult] = useState<DomainCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDomainCheck = async (domain: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data);
    } catch (error) {
      console.error('Error checking domain:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-2 sm:mb-0 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Scam Domain Detector
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Protect your business from fraudulent domain registrations. Check domain availability 
            and detect suspicious patterns that may impersonate legitimate companies.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <DomainForm onSubmit={handleDomainCheck} loading={loading} />
          
          {loading && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-6 py-3 text-blue-600 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Search className="animate-spin h-5 w-5 mr-2" />
                Analyzing domain...
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-6 py-3 text-red-600 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-5 w-5 mr-2" />
                Error: {error}
              </div>
            </div>
          )}
          
          {result && <ResultCard result={result} />}
        </div>

        {/* Features */}
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Availability Check</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Verify TLD existence and check if domains are already registered
            </p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fraud Detection</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Compare against database of legitimate businesses and detect suspicious patterns
            </p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg sm:col-span-2 lg:col-span-1">
            <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tucows Integration</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Filter by available TLDs offered through Tucows registry
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            © 2025 Scam Domain Detector. Built with Next.js, TypeScript, and Tailwind CSS.
          </p>
          <p className="text-xs mt-2">
            This tool helps identify potentially fraudulent domains. Always verify domain legitimacy through multiple sources.
          </p>
        </footer>
      </div>
    </div>
  );
}
