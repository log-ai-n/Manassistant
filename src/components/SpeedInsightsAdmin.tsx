import React, { useEffect, useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useAuth } from '../contexts/AuthContext';

// This is a private admin-only dashboard for viewing performance metrics
const SpeedInsightsAdmin: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in production, you'd fetch this from Vercel API
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setVitals({
        lcp: { value: 1.8, score: 'good' },
        fid: { value: 12, score: 'good' },
        cls: { value: 0.05, score: 'good' },
        ttfb: { value: 220, score: 'good' },
        fcp: { value: 1.2, score: 'good' }
      });
      setLoading(false);
    }, 1000);
  }, []);

  // Check if user is admin or owner
  const isAdmin = user?.role === 'owner' || user?.role === 'admin';

  if (!isAdmin) {
    return <div className="p-6 text-center">You don't have permission to access this page.</div>;
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Performance Dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">
          Real-time performance metrics for your application. Full details available in the Vercel dashboard.
        </p>
        
        {loading ? (
          <div className="animate-pulse text-center p-8">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
            <p className="mt-2">Loading performance data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">Largest Contentful Paint (LCP)</h3>
              <p className={`text-2xl font-bold ${getScoreColor(vitals.lcp.score)}`}>{vitals.lcp.value}s</p>
              <p className="text-xs text-gray-500 mt-1">Time to render largest content element</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">First Input Delay (FID)</h3>
              <p className={`text-2xl font-bold ${getScoreColor(vitals.fid.score)}`}>{vitals.fid.value}ms</p>
              <p className="text-xs text-gray-500 mt-1">Time before input responsiveness</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">Cumulative Layout Shift (CLS)</h3>
              <p className={`text-2xl font-bold ${getScoreColor(vitals.cls.score)}`}>{vitals.cls.value}</p>
              <p className="text-xs text-gray-500 mt-1">Measure of visual stability</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">Time to First Byte (TTFB)</h3>
              <p className={`text-2xl font-bold ${getScoreColor(vitals.ttfb.score)}`}>{vitals.ttfb.value}ms</p>
              <p className="text-xs text-gray-500 mt-1">Server response time</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">First Contentful Paint (FCP)</h3>
              <p className={`text-2xl font-bold ${getScoreColor(vitals.fcp.score)}`}>{vitals.fcp.value}s</p>
              <p className="text-xs text-gray-500 mt-1">Time to first content rendered</p>
            </div>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Admin Actions</h4>
          <div className="flex flex-wrap gap-2">
            <a 
              href="https://vercel.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Full Dashboard
            </a>
            <button
              onClick={() => alert('This would generate a full report in a real implementation')}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
      
      {/* This component is hidden but adds the Speed Insights tracking to your app */}
      <SpeedInsights />
    </div>
  );
};

export default SpeedInsightsAdmin; 