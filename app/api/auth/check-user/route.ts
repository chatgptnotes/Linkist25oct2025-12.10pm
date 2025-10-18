import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, mobile } = body;

    // Must provide either email or mobile
    if (!email && !mobile) {
      return NextResponse.json(
        { success: false, error: 'Email or mobile number is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let exists = false;

    // Check if email exists
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const { data: emailUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (emailUser) {
        exists = true;
      }
    }

    // Check if mobile exists
    if (mobile && !exists) {
      const normalizedMobile = mobile.replace(/\s/g, ''); // Remove spaces
      const { data: mobileUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', normalizedMobile)
        .single();

      if (mobileUser) {
        exists = true;
      }
    }

    return NextResponse.json({
      success: true,
      exists,
      message: exists
        ? 'User already exists. Please login.'
        : 'User does not exist. You can proceed with registration.'
    });

  } catch (error) {
    console.error('❌ Check user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check user existence' },
      { status: 500 }
    );
  }
}
