'use client';

import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

interface DomainCheckResult {
  domain: string;
  isAvailable: boolean;
  isFraudulent: boolean;
  reason?: string;
  canRegister: boolean;
}

interface ResultCardProps {
  result: DomainCheckResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const getStatusIcon = () => {
    if (result.canRegister) {
      return <CheckCircle className="h-12 w-12 text-green-600" />;
    } else if (result.isFraudulent) {
      return <Shield className="h-12 w-12 text-red-600" />;
    } else {
      return <XCircle className="h-12 w-12 text-orange-600" />;
    }
  };

  const getStatusText = () => {
    if (result.canRegister) {
      return "YES - Safe to Register";
    } else if (result.isFraudulent) {
      return "NO - Potential Fraud Detected";
    } else {
      return "NO - Cannot Register";
    }
  };

  const getStatusColor = () => {
    if (result.canRegister) {
      return "border-green-200 bg-green-50 dark:bg-green-900/20";
    } else if (result.isFraudulent) {
      return "border-red-200 bg-red-50 dark:bg-red-900/20";
    } else {
      return "border-orange-200 bg-orange-50 dark:bg-orange-900/20";
    }
  };

  return (
    <div className="mt-8">
      <div className={`rounded-xl shadow-lg p-6 sm:p-8 border-2 ${getStatusColor()}`}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getStatusText()}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 break-all">
            Domain: <span className="font-semibold">{result.domain}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-gray-800 rounded-lg gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Available for Registration</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium text-center ${
              result.isAvailable 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {result.isAvailable ? 'Available' : 'Taken'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-gray-800 rounded-lg gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Fraud Risk Assessment</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium text-center ${
              result.isFraudulent 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {result.isFraudulent ? 'High Risk' : 'Low Risk'}
            </span>
          </div>

          {result.reason && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Analysis Details</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{result.reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Final Recommendation
            </h3>
            <p className={`text-base sm:text-lg font-medium ${
              result.canRegister 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {result.canRegister 
                ? '✅ This domain appears safe to register' 
                : '❌ We recommend NOT registering this domain'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
