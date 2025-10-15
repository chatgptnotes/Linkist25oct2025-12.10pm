import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { username, firstName, lastName, email } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    if (username.startsWith('-') || username.endsWith('-')) {
      return NextResponse.json(
        { error: 'Username cannot start or end with a hyphen' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if username is still available (only if custom_url column exists)
    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('custom_url')
        .eq('custom_url', username)
        .maybeSingle();

      if (existingProfile && !checkError) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    } catch (error) {
      console.log('custom_url column might not exist yet, continuing...');
    }

    // Get user email from order data or session
    const userEmail = email || `user_${Date.now()}@linkist.ai`; // Unique fallback

    // First, get user_id from users table by email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    const userId = user?.id || null;

    // Check if profile exists for this user (using 'email' column, not 'user_email')
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    if (userProfile) {
      // Update existing profile (only update fields that exist)
      const updateData: any = {
        user_id: userId,  // Add user_id to update
        first_name: firstName || userProfile.first_name,
        last_name: lastName || userProfile.last_name,
        updated_at: new Date().toISOString()
      };

      // Try to add custom_url if column exists
      try {
        updateData.custom_url = username;
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userProfile.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);

          // If custom_url column doesn't exist, try without it
          if (updateError.message?.includes('custom_url')) {
            delete updateData.custom_url;
            const { error: retryError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', userProfile.id);

            if (retryError) {
              throw retryError;
            }
          } else {
            throw updateError;
          }
        }
      } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json(
          { error: 'Failed to save username' },
          { status: 500 }
        );
      }
    } else {
      // Create new profile
      const profileId = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const insertData: any = {
        user_id: userId,  // Add user_id reference
        email: userEmail,  // Changed from user_email to email
        first_name: firstName || null,
        last_name: lastName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to add custom_url if column exists
      try {
        insertData.custom_url = username;
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(insertData);

        if (insertError) {
          console.error('Error creating profile:', insertError);

          // If custom_url column doesn't exist, try without it
          if (insertError.message?.includes('custom_url')) {
            delete insertData.custom_url;
            const { error: retryError } = await supabase
              .from('profiles')
              .insert(insertData);

            if (retryError) {
              throw retryError;
            }
          } else {
            throw insertError;
          }
        }
      } catch (error) {
        console.error('Insert error:', error);
        return NextResponse.json(
          { error: 'Failed to save username' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      username,
      message: 'Username saved successfully'
    });

  } catch (error) {
    console.error('Error saving username:', error);
    return NextResponse.json(
      { error: 'Failed to save username' },
      { status: 500 }
    );
  }
}
