import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { available: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { available: false, error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(username)) {
      return NextResponse.json(
        { available: false, error: 'Username can only contain letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    if (username.startsWith('-') || username.endsWith('-')) {
      return NextResponse.json(
        { available: false, error: 'Username cannot start or end with a hyphen' },
        { status: 400 }
      );
    }

    // Check if username exists in database (custom_url column)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('profiles')
      .select('custom_url')
      .eq('custom_url', username)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      // For now, assume available if database error
      return NextResponse.json({ available: true });
    }

    // If data exists, username is taken
    const available = !data;

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { available: true }, // Default to available on error
      { status: 200 }
    );
  }
}
