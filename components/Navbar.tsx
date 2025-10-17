'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { toast } from 'sonner';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isAuthenticated);
          if (data.isAuthenticated && data.user) {
            setUserData({
              email: data.user.email,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
            });
          }
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Clear localStorage
      localStorage.removeItem('userOnboarded');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('session');
      localStorage.removeItem('claimedUsername');
      localStorage.removeItem('profileUrl');

      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });

      // Update state
      setIsLoggedIn(false);
      setUserData(null);

      // Show success message
      toast.success('Logged out successfully!');

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 h-14 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Logo width={140} height={45} variant="light" />

        {/* Logout Button - Only show if user is logged in */}
        {isLoggedIn && (
          <div className="flex items-center gap-3">
            {/* User Info */}
            {userData && (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-semibold">
                  {userData.firstName && userData.lastName
                    ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
                    : userData.email?.[0].toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-700">
                  {userData.firstName && userData.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData.email?.split('@')[0] || 'User'}
                </span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Logging out...</span>
                </div>
              ) : (
                'Logout'
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
