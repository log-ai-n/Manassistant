import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Here you would typically make an API call to add to waitlist
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect or show success message
      alert('Thank you! You have been added to our waitlist.');
      setPhoneNumber('');
    } catch (err) {
      setError('Failed to join waitlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <div className="flex-1"></div> {/* Empty div for spacing */}
        <div className="flex-1 flex justify-center">
          {/* Logo will be centered */}
        </div>
        <div className="flex-1 flex justify-end">
          <button 
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            onClick={() => navigate('/register')}
          >
            Apply for Early Access
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        {/* Logo and Brand */}
        <div className="mb-8 flex items-center">
          <ChefHat className="h-12 w-12 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">Manassistant</h1>
        </div>

        {/* Hero Text */}
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Restaurant Training Operations
        </h2>
        <h3 className="text-5xl font-bold text-blue-600 mb-8">
          Made Simple with AI
        </h3>

        <p className="text-lg text-gray-600 mb-12 max-w-2xl">
          AI-Powered Tools to Boost Efficiency, Reduce Errors, and Streamline Training
        </p>

        {/* Waitlist Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="flex">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Join the Waitlist'}
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mb-8">
          New to Manassistant? <a href="/register" className="text-blue-600 hover:underline">Create a restaurant account</a>
        </p>
      </main>

      {/* Feature Cards */}
      <section className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {/* Feature Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="bg-blue-100 h-12 w-12 flex items-center justify-center rounded-md mb-4">
            <span className="text-blue-600 text-xl">🍽️</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Allergenie</h3>
          <p className="text-sm text-gray-500 mb-2">Expected Release: March 2024</p>
          <p className="mb-4">Ensure allergen safety for restaurants with AI</p>
          <a href="#learn-more" className="text-blue-600 text-sm hover:underline">
            Learn more about AI allergen management →
          </a>
        </div>

        {/* Feature Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="bg-blue-100 h-12 w-12 flex items-center justify-center rounded-md mb-4">
            <span className="text-blue-600 text-xl">⭐</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Review Hub</h3>
          <p className="text-sm text-gray-500 mb-2">Expected Release: April 2024</p>
          <p className="mb-4">Track server performance with AI-powered customer reviews</p>
          <a href="#learn-more" className="text-blue-600 text-sm hover:underline">
            Learn more about AI review tracking →
          </a>
        </div>

        {/* Feature Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="bg-blue-100 h-12 w-12 flex items-center justify-center rounded-md mb-4">
            <span className="text-blue-600 text-xl">📊</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Store LogAI</h3>
          <p className="text-sm text-gray-500 mb-2">Expected Release: May 2024</p>
          <p className="mb-4">Streamline restaurant logs with AI insights</p>
          <a href="#learn-more" className="text-blue-600 text-sm hover:underline">
            Learn more about AI restaurant logging →
          </a>
        </div>
      </section>

      {/* Footer Contact */}
      <footer className="w-full p-4 flex justify-center mb-8">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Contact Sales
        </button>
      </footer>
    </div>
  );
};

export default LandingPage; 