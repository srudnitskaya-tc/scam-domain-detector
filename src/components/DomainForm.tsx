'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface DomainFormProps {
  onSubmit: (domain: string) => void;
  loading: boolean;
}

export default function DomainForm({ onSubmit, loading }: DomainFormProps) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  const validateDomain = (domain: string): boolean => {
    // RFC 1035 and RFC 1123 compliant domain validation
    
    // Check overall length (max 253 characters for FQDN)
    if (domain.length > 253) {
      return false;
    }
    
    // Check minimum length
    if (domain.length < 4) { // minimum: a.co
      return false;
    }
    
    // Split into labels (parts separated by dots)
    const labels = domain.split('.');
    
    // Must have at least 2 labels (domain + TLD)
    if (labels.length < 2) {
      return false;
    }
    
    // Validate each label
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      
      // Each label must be 1-63 characters
      if (label.length < 1 || label.length > 63) {
        return false;
      }
      
      // Labels cannot start or end with hyphen
      if (label.startsWith('-') || label.endsWith('-')) {
        return false;
      }
      
      // Labels can only contain letters, numbers, and hyphens
      if (!/^[a-zA-Z0-9-]+$/.test(label)) {
        return false;
      }
      
      // First label (leftmost) can contain letters, numbers, and hyphens
      // TLD (rightmost) must start with a letter and contain only letters
      if (i === labels.length - 1) { // TLD
        if (!/^[a-zA-Z][a-zA-Z]*$/.test(label)) {
          return false;
        }
      }
    }
    
    // Check for valid TLD structure (last part must be at least 2 characters)
    const tld = labels[labels.length - 1];
    if (tld.length < 2) {
      return false;
    }
    
    // Additional checks for internationalized domain names (basic)
    // This regex allows for multi-level TLDs and proper domain structure
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    
    return domainRegex.test(domain);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }
    
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    if (!validateDomain(cleanDomain)) {
      setError('Please enter a valid domain name. Domain names can contain letters (a-z), numbers (0-9), hyphens (-), and must be 4-253 characters long with a valid TLD.');
      return;
    }
    
    onSubmit(cleanDomain);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="domain" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Domain Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                if (error) setError('');
              }}
              placeholder="example.com or my-site.co.uk"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg transition-colors ${
                error 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter a domain name without protocol. Allowed: letters (a-z), numbers (0-9), hyphens (-). 
            Examples: google.com, sub-domain.example.co.uk, test123.name.com.ru
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Search className="animate-spin h-5 w-5 mr-2" />
              Checking...
            </span>
          ) : (
            'Check Domain'
          )}
        </button>

        {/* Sample domains */}
        {!loading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Try these fraud detection examples (support scams, different TLDs, typosquatting):</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'walmarttechsupport.com',
                'amazoncustomersupport.com', 
                'paypal-help.com', 
                'apple-support.org',
                'microsoft-secure.com',
                'google-verify.net',
                'facebooklogin.com',
                'gooogle.com', 
                'my-new-domain.com'
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setDomain(example);
                    setError('');
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
