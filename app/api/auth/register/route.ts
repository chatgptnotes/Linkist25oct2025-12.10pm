import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { rateLimitMiddleware, RateLimits } from '@/lib/rate-limit';
import { SupabaseUserStore } from '@/lib/supabase-user-store';
import { linkProfileToUser } from '@/lib/profile-users-helpers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, RateLimits.auth);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    console.log('📝 Registration attempt:', { firstName, lastName, email, phone });

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Password is optional (system uses OTP-based authentication)

    const normalizedEmail = email.toLowerCase();

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists with this email
    const { data: existingEmailUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingEmailUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check if user already exists with this phone number (if provided)
    if (phone && phone.trim() !== '') {
      const { data: existingPhoneUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', phone)
        .single();

      if (existingPhoneUser) {
        return NextResponse.json(
          { success: false, error: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Check if user is eligible for founding member status
    const now = new Date();
    const { data: launchDateSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'founding_member_launch_date')
      .single();

    const { data: endDateSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'founding_member_end_date')
      .single();

    let isFoundingMember = false;
    if (launchDateSetting && endDateSetting) {
      const launchDate = new Date(launchDateSetting.value as string);
      const endDate = new Date(endDateSetting.value as string);
      isFoundingMember = now >= launchDate && now <= endDate;
    }

    // Get founding member plan from request body or localStorage (passed from founding member page)
    const foundingMemberPlan = body.foundingMemberPlan || null;

    // Insert new user (no password_hash - system uses OTP-based authentication)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || null,
        role: 'user',
        email_verified: false,
        mobile_verified: false,
        is_founding_member: isFoundingMember,
        founding_member_since: isFoundingMember ? now.toISOString() : null,
        founding_member_plan: isFoundingMember && foundingMemberPlan ? foundingMemberPlan : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    console.log('✅ User registered successfully:', normalizedEmail);

    // Create profile for the new user and link via profile_users
    try {
      console.log('📝 Creating profile for user:', newUser.id);
      const profile = await SupabaseUserStore.createOrUpdateProfile(newUser.id, {
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      });
      console.log('✅ Profile created successfully:', profile.id);

      // Link profile to user via profile_users junction table
      try {
        await linkProfileToUser(profile.id, newUser.id);
        console.log('✅ Profile linked to user via profile_users');
      } catch (linkError) {
        console.error('⚠️ Profile linking failed (may already be linked):', linkError);
        // Non-critical - trigger might have already linked it
      }
    } catch (profileError) {
      console.error('⚠️ Profile creation failed (non-critical):', profileError);
      // Don't fail registration if profile creation fails
      // User can still login and profile will be created later
    }

    // Return success with user data and set userEmail cookie for OTP verification
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        phone: newUser.phone_number,
        role: newUser.role,
      }
    });

    // Set userEmail cookie for OTP verification to enable auto-login
    response.cookies.set('userEmail', newUser.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30, // 30 minutes (enough time to verify OTP)
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
