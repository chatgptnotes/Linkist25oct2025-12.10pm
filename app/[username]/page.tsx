'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import GitHubIcon from '@mui/icons-material/GitHub';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ShareIcon from '@mui/icons-material/Share';
import WorkIcon from '@mui/icons-material/Work';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MessageIcon from '@mui/icons-material/Message';
import SendIcon from '@mui/icons-material/Send';

// Icon aliases
const Mail = EmailIcon;
const Phone = PhoneIcon;
const MapPin = LocationOnIcon;
const Globe = LanguageIcon;
const Linkedin = LinkedInIcon;
const Twitter = XIcon;
const Instagram = InstagramIcon;
const Facebook = FacebookIcon;
const Youtube = YouTubeIcon;
const Github = GitHubIcon;
const Download = CloudDownloadIcon;
const Share2 = ShareIcon;
const Briefcase = WorkIcon;
const BookOpen = MenuBookIcon;
const MessageSquare = MessageIcon;
const Send = SendIcon;

interface ProfileData {
  username: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  company?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  github?: string;
}

export default function UsernameProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${username}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProfile(data.profile);
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    if (username) {
      loadProfile();
    }
  }, [username]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: profile?.fullName || username,
          text: `Check out ${profile?.fullName || username}'s profile on Linkist`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
      }
    } catch (error: any) {
      // Ignore AbortError (user cancelled share dialog)
      if (error.name === 'AbortError') {
        return;
      }
      // For other errors, fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy link:', clipboardError);
      }
    }
  };

  const handleDownloadVCard = () => {
    if (!profile) return;

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim()}
${profile.title ? `TITLE:${profile.title}` : ''}
${profile.company ? `ORG:${profile.company}` : ''}
${profile.phone ? `TEL:${profile.phone}` : ''}
${profile.email ? `EMAIL:${profile.email}` : ''}
${profile.website ? `URL:${profile.website}` : ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}.vcf`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            The profile &quot;{username}&quot; does not exist or has not been set up yet.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cover Image */}
      {profile.coverImage && (
        <div className="h-32 sm:h-48 md:h-64 relative">
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className={`${profile.coverImage ? '-mt-16 sm:-mt-20' : 'pt-6 sm:pt-8'} relative z-10`}>
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 sm:space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={displayName}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-white shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{displayName}</h1>
                {profile.title && (
                  <p className="text-lg sm:text-xl text-gray-600 mt-1 sm:mt-2">{profile.title}</p>
                )}
                {profile.company && (
                  <p className="text-base sm:text-lg text-gray-500 mt-1">{profile.company}</p>
                )}
                <div className="mt-2 sm:mt-3">
                  <p className="text-xs sm:text-sm text-gray-400 break-all">
                    linkist.com/{username}
                  </p>
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-4 sm:mt-6">
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base font-medium shadow-sm"
                    >
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Email
                    </a>
                  )}
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-sm sm:text-base font-medium shadow-sm"
                    >
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Call
                    </a>
                  )}
                  <button
                    onClick={handleDownloadVCard}
                    className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base font-medium"
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Save Contact
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base font-medium"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Share
                  </button>
                </div>

                {/* Social Links */}
                {(profile.linkedin || profile.twitter || profile.instagram || profile.facebook || profile.website || profile.github || profile.youtube) && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-4 sm:mt-5">
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition shadow-sm"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={profile.twitter.startsWith('http') ? profile.twitter : `https://${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition shadow-sm"
                        aria-label="Twitter/X"
                      >
                        <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    )}
                    {profile.instagram && (
                      <a
                        href={profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition shadow-sm"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    )}
                    {profile.facebook && (
                      <a
                        href={profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition shadow-sm"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    )}
                    {profile.youtube && (
                      <a
                        href={profile.youtube.startsWith('http') ? profile.youtube : `https://${profile.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition shadow-sm"
                        aria-label="YouTube"
                      >
                        <Youtube className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    )}
                    {profile.github && (
                      <a
                        href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition shadow-sm"
                        aria-label="GitHub"
                      >
                        <Github className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition shadow-sm"
                        aria-label="Website"
                      >
                        <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About</h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Quick Info */}
            {(profile.location || profile.email || profile.phone) && (
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {profile.location && (
                  <div className="flex items-center space-x-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{profile.location}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center space-x-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center space-x-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{profile.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact Form */}
          {profile.email && (
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mt-4 sm:mt-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Get in Touch</h2>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full bg-red-600 text-white py-3 sm:py-3.5 rounded-lg hover:bg-red-700 transition flex items-center justify-center text-sm sm:text-base font-medium shadow-sm"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Send Message
              </button>

              {showContactForm && (
                <form className="mt-4 sm:mt-6 space-y-3 sm:space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  alert('Contact form submitted! This would send an email in production.');
                }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <textarea
                    rows={4}
                    placeholder="Your Message"
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-3 sm:py-3.5 rounded-lg hover:bg-gray-800 transition flex items-center justify-center text-sm sm:text-base font-medium shadow-sm"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 sm:py-8 mt-8 sm:mt-12 px-4">
        <p className="text-gray-500 text-xs sm:text-sm">
          Powered by{' '}
          <a href="https://linkist.ai" className="text-red-600 hover:underline font-medium">
            Linkist
          </a>
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Get your own custom profile at Linkist
        </p>
      </div>
    </div>
  );
}
