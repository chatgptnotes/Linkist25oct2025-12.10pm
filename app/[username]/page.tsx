'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'qrcode';
import Logo from '@/components/Logo';
import {
  CheckCircle,
  Email,
  Phone,
  Work,
  Business,
  LinkedIn,
  Instagram,
  Facebook,
  Twitter,
  GitHub,
  YouTube,
  Language,
  LocationOn,
  Star,
  Link as LinkIcon,
  ContentCopy,
  QrCode2,
  CloudDownload
} from '@mui/icons-material';

interface ProfileData {
  firstName: string;
  lastName: string;
  primaryEmail: string;
  secondaryEmail: string;
  mobileNumber: string;
  whatsappNumber: string;
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  companyAddress: string;
  companyLogo: string | null;
  industry: string;
  subDomain: string;
  skills: string[];
  professionalSummary: string;
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  behanceUrl: string;
  dribbbleUrl: string;
  githubUrl: string;
  youtubeUrl: string;
  // Basic Information toggles
  showEmailPublicly: boolean;
  showMobilePublicly: boolean;
  showWhatsappPublicly: boolean;
  // Professional Information toggles
  showJobTitle: boolean;
  showCompanyName: boolean;
  showCompanyWebsite: boolean;
  showCompanyAddress: boolean;
  showIndustry: boolean;
  showSkills: boolean;
  // Social Media toggles
  showLinkedin: boolean;
  showInstagram: boolean;
  showFacebook: boolean;
  showTwitter: boolean;
  showBehance: boolean;
  showDribbble: boolean;
  showGithub: boolean;
  showYoutube: boolean;
  // Media toggles
  profilePhoto: string | null;
  backgroundImage: string | null;
  showProfilePhoto: boolean;
  showBackgroundImage: boolean;
}

export default function ProfilePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    // Set custom URL based on username from URL params
    if (username) {
      const baseUrl = window.location.origin;
      setCustomUrl(`${baseUrl}/${username}`);
    }

    const fetchProfileData = async () => {
      try {
        console.log('🔍 Fetching profile data for username:', username);

        // Fetch profile from database using username from URL
        const profileResponse = await fetch(`/api/profile/${username}`);

        if (!profileResponse.ok) {
          console.log('⚠️ Profile not found for username:', username);
          setLoading(false);
          return;
        }

        const data = await profileResponse.json();
        console.log('📦 Profile API response:', data);

        if (data.success && data.profile) {
          const dbProfile = data.profile;
          console.log('✅ Found profile in database for username:', username);

          // Map API response to ProfileData format
          const prefs = dbProfile.preferences || {};

          const mappedProfile: ProfileData = {
            firstName: dbProfile.firstName || '',
            lastName: dbProfile.lastName || '',
            primaryEmail: dbProfile.email || '',
            secondaryEmail: '',
            mobileNumber: dbProfile.phone || '',
            whatsappNumber: '',
            jobTitle: dbProfile.title || '',
            companyName: dbProfile.company || '',
            companyWebsite: dbProfile.website || '',
            companyAddress: dbProfile.location || '',
            companyLogo: dbProfile.companyLogo || null,
            industry: dbProfile.industry || '',
            subDomain: '',
            skills: dbProfile.skills || [],
            professionalSummary: dbProfile.bio || '',
            linkedinUrl: dbProfile.linkedin || '',
            instagramUrl: dbProfile.instagram || '',
            facebookUrl: dbProfile.facebook || '',
            twitterUrl: dbProfile.twitter || '',
            behanceUrl: '',
            dribbbleUrl: '',
            githubUrl: dbProfile.github || '',
            youtubeUrl: dbProfile.youtube || '',
            // Read toggle values from saved preferences
            showEmailPublicly: prefs.showEmailPublicly ?? true,
            showMobilePublicly: prefs.showMobilePublicly ?? true,
            showWhatsappPublicly: prefs.showWhatsappPublicly ?? false,
            showJobTitle: prefs.showJobTitle ?? true,
            showCompanyName: prefs.showCompanyName ?? true,
            showCompanyWebsite: prefs.showCompanyWebsite ?? true,
            showCompanyAddress: prefs.showCompanyAddress ?? true,
            showIndustry: prefs.showIndustry ?? true,
            showSkills: prefs.showSkills ?? true,
            showLinkedin: prefs.showLinkedin ?? false,
            showInstagram: prefs.showInstagram ?? false,
            showFacebook: prefs.showFacebook ?? false,
            showTwitter: prefs.showTwitter ?? false,
            showBehance: prefs.showBehance ?? false,
            showDribbble: prefs.showDribbble ?? false,
            showGithub: prefs.showGithub ?? false,
            showYoutube: prefs.showYoutube ?? false,
            profilePhoto: dbProfile.profileImage || null,
            backgroundImage: dbProfile.coverImage || null,
            showProfilePhoto: prefs.showProfilePhoto ?? true,
            showBackgroundImage: prefs.showBackgroundImage ?? true,
          };

          console.log('✅ Mapped profile data for preview');
          setProfileData(mappedProfile);
        }
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  // Generate QR Code when custom URL is set
  useEffect(() => {
    const generateQrCode = async () => {
      if (!customUrl) return;

      try {
        const qrDataUrl = await QRCode.toDataURL(customUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (customUrl) {
      generateQrCode();
    }
  }, [customUrl]);

  const handleCopyUrl = async () => {
    if (!customUrl) return;

    try {
      await navigator.clipboard.writeText(customUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeUrl) return;

    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `profile-qr-code.png`;
    a.click();
  };

  const handleShareQrCode = async () => {
    if (!qrCodeUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Profile QR Code',
          text: `Scan this QR code to view my profile: ${customUrl}`
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(customUrl);
        alert('QR code sharing not supported. URL copied to clipboard!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing QR code:', error);
        alert('Failed to share QR code');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple Logo-only Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <Logo width={140} height={45} variant="light" />
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">
              The profile <span className="font-semibold">/{username}</span> doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Logo-only Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <Logo width={140} height={45} variant="light" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Background Image */}
          {profileData.showBackgroundImage && profileData.backgroundImage ? (
            <div className="h-24 sm:h-32 relative">
              <img src={profileData.backgroundImage} alt="Background" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-24 sm:h-32 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400"></div>
          )}

          <div className="px-6 sm:px-8 pb-8">
            {/* Profile Section */}
            <div className="flex items-start gap-4 sm:gap-6 -mt-12 sm:-mt-16">
              {/* Left Column - Profile Photo & Info */}
              <div className="flex-1">
                {/* Profile Photo */}
                {profileData.showProfilePhoto && (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 sm:border-6 border-blue-500 bg-white overflow-hidden shadow-xl relative z-10 mb-4">
                    {profileData.profilePhoto ? (
                      <img src={profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                        {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Name */}
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 capitalize">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                 {/* Job Title */}
                 {profileData.showJobTitle && profileData.jobTitle && (
                  <p className="text-sm sm:text-base text-gray-700 mb-2">
                    {profileData.jobTitle}
                    {profileData.showCompanyName && profileData.companyName && ` @${profileData.companyName}`}
                  </p>
                )}
                {/* Company & Industry */}
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                  {profileData.showCompanyName && profileData.companyName && profileData.showIndustry && profileData.industry && (
                    <p>
                      {profileData.companyName} - {profileData.industry}
                    </p>
                  )}
                  {profileData.subDomain && (
                    <p>{profileData.subDomain}</p>
                  )}
                </div>
              </div>

              {/* Company Logo - Right side */}
              {profileData.companyLogo && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg p-2 shadow-md flex-shrink-0 relative z-0">
                  <img src={profileData.companyLogo} alt="Company Logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6 sm:my-8"></div>

            {/* Professional Summary Section */}
            {profileData.professionalSummary && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Professional Summary</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify">{profileData.professionalSummary}</p>
              </div>
            )}

            {/* Contact Information Section */}
            <div id="contact-section" className="mb-8 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Contact Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div>
                  <div className="space-y-3">
                    {profileData.showEmailPublicly && profileData.primaryEmail && (
                      <div className="flex items-start gap-3">
                        <Email className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <a href={`mailto:${profileData.primaryEmail}`} className="text-sm text-gray-700 hover:text-blue-600 break-all">
                          {profileData.primaryEmail}
                        </a>
                      </div>
                    )}
                    {profileData.showMobilePublicly && profileData.mobileNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <a href={`tel:${profileData.mobileNumber}`} className="text-sm text-gray-700 hover:text-blue-600">
                          {profileData.mobileNumber}
                        </a>
                      </div>
                    )}
                    {profileData.showCompanyWebsite && profileData.companyWebsite && (
                      <div className="flex items-start gap-3">
                        <Language className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <a href={profileData.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                          {profileData.companyWebsite}
                        </a>
                      </div>
                    )}
                    {profileData.showCompanyAddress && profileData.companyAddress && (
                      <div className="flex items-start gap-3">
                        <LocationOn className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{profileData.companyAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Skills */}
                <div>
                  {profileData.showSkills && profileData.skills && profileData.skills.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>



            {/* Social Media Links */}
            {(profileData.showLinkedin || profileData.showInstagram || profileData.showFacebook ||
              profileData.showTwitter || profileData.showGithub || profileData.showYoutube) && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Social Profiles</h3>
                <div className="flex flex-wrap gap-3">
                  {profileData.showLinkedin && profileData.linkedinUrl && (
                    <a
                      href={profileData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                    >
                      <LinkedIn className="w-5 h-5" />
                      LinkedIn
                    </a>
                  )}
                  {profileData.showInstagram && profileData.instagramUrl && (
                    <a
                      href={profileData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-pink-600 hover:bg-pink-50 hover:text-pink-600 transition-colors text-sm"
                    >
                      <Instagram className="w-5 h-5" />
                      Instagram
                    </a>
                  )}
                  {profileData.showFacebook && profileData.facebookUrl && (
                    <a
                      href={profileData.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                    >
                      <Facebook className="w-5 h-5" />
                      Facebook
                    </a>
                  )}
                  {profileData.showTwitter && profileData.twitterUrl && (
                    <a
                      href={profileData.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-900 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm"
                    >
                      <Twitter className="w-5 h-5" />
                      X
                    </a>
                  )}
                  {profileData.showGithub && profileData.githubUrl && (
                    <a
                      href={profileData.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-900 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm"
                    >
                      <GitHub className="w-5 h-5" />
                      GitHub
                    </a>
                  )}
                  {profileData.showYoutube && profileData.youtubeUrl && (
                    <a
                      href={profileData.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-red-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
                    >
                      <YouTube className="w-5 h-5" />
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrCode && qrCodeUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          onClick={() => setShowQrCode(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Profile QR Code</h3>
              <button
                onClick={() => setShowQrCode(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col items-center">
              <img
                src={qrCodeUrl}
                alt="Profile QR Code"
                className="w-64 h-64 border-2 border-blue-300 rounded-lg bg-white p-4"
              />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Scan this QR code to visit this profile
              </p>

              <div className="flex gap-3 mt-6 w-full">
                <button
                  onClick={handleDownloadQrCode}
                  className="flex-1 px-4 py-3 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium border-2 border-red-600"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <CloudDownload className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={handleShareQrCode}
                  className="flex-1 px-4 py-3 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium border-2 border-red-600"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <Star className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
