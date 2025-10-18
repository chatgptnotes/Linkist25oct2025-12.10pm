'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import Logo from './Logo';
import UserProfileDropdown from './UserProfileDropdown';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'sonner';

// Icon aliases
const LogOut = LogoutIcon;

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Check if current route is admin-related
  const isAdminRoute = pathname.startsWith('/admin') ||
                       pathname.startsWith('/admin-login') ||
                       pathname.startsWith('/admin-access');

  // Check if current route is an authentication page (login, register, verify)
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/verify-login') ||
                     pathname.startsWith('/verify-mobile') ||
                     pathname.startsWith('/verify-email');

  // Check if current route is an inner page (checkout flow, account, etc.)
  const isInnerPage = pathname.startsWith('/checkout') ||
                      pathname.startsWith('/confirm-payment') ||
                      pathname.startsWith('/thank-you') ||
                      pathname.startsWith('/account') ||
                      pathname.startsWith('/profile-dashboard') ||
                      pathname.startsWith('/verify-email') ||
                      pathname.startsWith('/nfc/') ||
                      pathname.startsWith('/product-selection') ||
                      pathname.startsWith('/choose-plan') ||
                      pathname.startsWith('/welcome-to-linkist') ||
                      pathname.startsWith('/verify-mobile') ||
                      pathname.startsWith('/verify-login') ||
                      pathname.startsWith('/login') ||
                      pathname.startsWith('/profiles/preview') ||
                      pathname.startsWith('/profiles/builder') ||
                      pathname.startsWith('/claim-url');

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        } else if (response.status === 401) {
          // User not authenticated - this is expected, not an error
          setUserData(null);
        } else {
          // Other errors
          setUserData(null);
        }
      } catch (error) {
        // Network or other errors - silently handle
        setUserData(null);
      }
    };

    // Check onboarding status from localStorage
    const userOnboarded = localStorage.getItem('userOnboarded') === 'true';
    setIsOnboarded(userOnboarded);

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('userOnboarded');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('session');
      localStorage.removeItem('claimedUsername');
      localStorage.removeItem('profileUrl');
      localStorage.removeItem('productSelection');
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('orderConfirmation');

      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });

      // Clear cookies
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Show success message
      toast.success('Logged out successfully!');

      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  // For admin routes, render children without navbar/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For inner pages, render with simple header (only logo + logout after onboarding)
  if (isInnerPage) {
    // Special case: claim-url and profiles/preview pages have their own logo header, don't add header from layout
    if (pathname.startsWith('/claim-url') || pathname.startsWith('/profiles/preview')) {
      return <>{children}</>;
    }

    // Only show logout on these pages (after user has completed onboarding)
    const showLogout = pathname.startsWith('/product-selection') ||
                       pathname.startsWith('/nfc/') ||
                       pathname.startsWith('/account') ||
                       pathname.startsWith('/profile-dashboard') ||
                       pathname.startsWith('/checkout') ||
                       pathname.startsWith('/confirm-payment') ||
                       pathname.startsWith('/profiles/preview') ||
                       pathname.startsWith('/profiles/builder');

    // Show footer on profile pages
    const showFooter = pathname.startsWith('/profiles/preview') ||
                       pathname.startsWith('/profiles/builder');

    return (
      <>
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
            <Link href="/">
              <Logo width={100} height={32} noLink={true} variant="light" />
            </Link>
            {userData && !isAuthPage && showLogout && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-semibold">
                    {userData.first_name && userData.last_name
                      ? `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase()
                      : userData.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-700">
                    {userData.first_name && userData.last_name
                      ? `${userData.first_name} ${userData.last_name}`
                      : userData.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="pt-16 flex-grow min-h-0">
          {children}
        </main>
        {showFooter && <Footer />}
      </>
    );
  }

  // Check if it's the landing or home page (which has its own footer and navbar)
  const isLandingPage = pathname === '/';

  // Check if it's a dynamic username route (e.g., /bhu-bala)
  // Username routes are single-level paths that don't match any known routes
  const knownRoutes = ['/admin', '/api', '/checkout', '/confirm-payment', '/thank-you', '/account',
                       '/profile-dashboard', '/verify-email', '/nfc', '/product-selection', '/choose-plan',
                       '/welcome-to-linkist', '/verify-mobile', '/verify-login', '/login', '/register',
                       '/profiles', '/claim-url', '/help', '/contact', '/about', '/pricing', '/features',
                       '/founding-member', '/templates', '/new-card', '/_next', '/favicon'];

  const isUsernameRoute = pathname !== '/' &&
                          !pathname.includes('/', 1) && // Single level route (no additional slashes)
                          !knownRoutes.some(route => pathname.startsWith(route));

  // For username routes, render children only (page has its own header)
  if (isUsernameRoute) {
    return <>{children}</>;
  }

  // For normal routes, render with navbar and footer (except landing/home page)
  return (
    <>
      {!isLandingPage && <Navbar />}
      <main className={`${!isLandingPage ? 'pt-16' : ''} flex-grow min-h-0`}>
        {children}
      </main>
      {!isLandingPage && <Footer />}
    </>
  );
}