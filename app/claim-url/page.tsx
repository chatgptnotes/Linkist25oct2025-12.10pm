'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';

const CheckCircle = CheckCircleIcon;
const Info = InfoIcon;
const Person = PersonIcon;

export default function ClaimURLPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fullName, setFullName] = useState('Jane Doe');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('UX/UI Design Lead');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Get user info from localStorage if available
    const orderData = localStorage.getItem('lastCompletedOrder');
    if (orderData) {
      const order = JSON.parse(orderData);
      if (order.cardConfig?.fullName) {
        setFullName(order.cardConfig.fullName);

        // Split full name into first and last name
        const nameParts = order.cardConfig.fullName.split(' ');
        const first = nameParts[0] || '';
        const last = nameParts.slice(1).join(' ') || '';
        setFirstName(first);
        setLastName(last);
      }

      // Get email
      if (order.shipping?.email || order.email) {
        setEmail(order.shipping?.email || order.email);
      }

      // Generate username suggestion from first and last name
      const nameParts = (order.cardConfig?.fullName || '').split(' ');
      if (nameParts.length >= 2) {
        const suggestedUsername = nameParts
          .map(part => part.toLowerCase())
          .join('-')
          .replace(/[^a-z0-9-]/g, '');

        if (suggestedUsername && suggestedUsername.length >= 3) {
          setUsername(suggestedUsername);
          handleUsernameChange(suggestedUsername);
        }
      }
    }
  }, []);

  const generateSuggestions = (baseUsername: string, first: string, last: string) => {
    const suggestions: string[] = [];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const currentYear = new Date().getFullYear();

    // Add number suffix
    suggestions.push(`${baseUsername}${randomNum}`);
    suggestions.push(`${baseUsername}-${randomNum}`);

    // Add year
    suggestions.push(`${baseUsername}${currentYear}`);

    // First name + random number
    if (first) {
      suggestions.push(`${first.toLowerCase()}${randomNum}`);
      suggestions.push(`${first.toLowerCase()}-${last.toLowerCase()}`);
    }

    // Add "official" or "real"
    suggestions.push(`${baseUsername}-official`);

    // Return first 5 unique suggestions
    return [...new Set(suggestions)].slice(0, 5);
  };

  const validateUsername = (value: string) => {
    // Must be between 3 and 30 characters
    if (value.length < 3 || value.length > 30) {
      return 'Must be between 3 and 30 characters.';
    }

    // Can only contain letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'Can only contain letters (a-z), numbers (0-9), and hyphens (-).';
    }

    // Cannot start or end with a hyphen
    if (value.startsWith('-') || value.endsWith('-')) {
      return 'Cannot start or end with a hyphen.';
    }

    return '';
  };

  const handleUsernameChange = async (value: string) => {
    const lowercaseValue = value.toLowerCase();
    setUsername(lowercaseValue);
    setIsAvailable(false);
    setErrorMessage('');

    if (!lowercaseValue) {
      return;
    }

    const validationError = validateUsername(lowercaseValue);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Check availability
    setIsChecking(true);
    try {
      const response = await fetch('/api/claim-url/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: lowercaseValue }),
      });

      const data = await response.json();
      if (data.available) {
        setIsAvailable(true);
        setErrorMessage('');
        setSuggestions([]);
      } else {
        setIsAvailable(false);
        setErrorMessage('This username is already taken.');

        // Generate alternative suggestions
        const alternativeSuggestions = generateSuggestions(lowercaseValue, firstName, lastName);
        setSuggestions(alternativeSuggestions);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      // For now, assume available if API fails
      setIsAvailable(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveURL = async () => {
    if (!username || !isAvailable || errorMessage) {
      return;
    }

    try {
      const response = await fetch('/api/claim-url/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          email
        }),
      });

      if (response.ok) {
        // Store the claimed username in localStorage
        localStorage.setItem('claimedUsername', username);
        // Redirect to profile builder
        router.push('/profiles/builder');
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to save username');
      }
    } catch (error) {
      console.error('Error saving username:', error);
      setErrorMessage('Failed to save username. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Claim URL Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Claim Your Unique URL
          </h1>
          <p className="text-gray-600 mb-8">
            Your Linkist URL is your personal digital handshake. Make it memorable.
          </p>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your public profile URL
            </label>
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
              <span className="bg-gray-100 text-gray-600 px-4 py-3 text-sm font-medium border-r border-gray-300">
                linkist.com/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="jane-doe"
                className="flex-1 px-4 py-3 text-gray-900 outline-none"
              />
              {isAvailable && username && !errorMessage && (
                <div className="px-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              )}
            </div>

            {/* Name Suggestion Hint */}
            {firstName && lastName && (
              <p className="text-gray-500 text-xs mt-2">
                Suggested based on your name: {firstName} {lastName}
              </p>
            )}

            {/* Success Message */}
            {isAvailable && username && !errorMessage && (
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Sweet! linkist.com/{username} is available.
              </p>
            )}

            {/* Error Message */}
            {errorMessage && (
              <p className="text-red-600 text-sm mt-2">
                {errorMessage}
              </p>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Try these available usernames:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleUsernameChange(suggestion)}
                      className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Message */}
            {isChecking && (
              <p className="text-gray-500 text-sm mt-2">
                Checking availability...
              </p>
            )}
          </div>

          {/* URL Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm mb-2">URL Guidelines</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Must be between 3 and 30 characters.</li>
                  <li>• Can only contain letters (a-z), numbers (0-9), and hyphens (-).</li>
                  <li>• Cannot start or end with a hyphen.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Claim URL Button */}
          <button
            onClick={handleSaveURL}
            disabled={!isAvailable || !username || !!errorMessage}
            style={{ backgroundColor: '#dc2626' }}
            className="w-full py-4 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Claim URL
          </button>
        </div>
      </div>
    </div>
  );
}
