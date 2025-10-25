import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch profile by custom_url
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('custom_url', username)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Transform database profile to frontend format
    const socialLinks = profile.social_links || {};
    const preferences = profile.preferences || {};

    const profileData = {
      username: profile.custom_url,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email?.split('@')[0] || '',
      title: profile.job_title || '',
      company: profile.company_name || profile.company || '',
      bio: profile.professional_summary || '',
      profileImage: profile.profile_photo_url || profile.avatar_url || '',
      coverImage: profile.background_image_url || '',
      companyLogo: profile.company_logo_url || '',
      email: profile.primary_email || profile.email || '',
      phone: profile.mobile_number || profile.phone_number || '',
      website: profile.company_website || '',
      location: profile.company_address || '',
      linkedin: socialLinks.linkedin || '',
      twitter: socialLinks.twitter || '',
      instagram: socialLinks.instagram || '',
      facebook: socialLinks.facebook || '',
      youtube: socialLinks.youtube || '',
      github: socialLinks.github || '',
      skills: profile.skills || [],
      industry: profile.industry || '',
      // Include visibility preferences
      preferences: preferences,
    };

    // Track profile view (optional - add analytics here)
    // You can add view tracking logic here if needed

    return NextResponse.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
