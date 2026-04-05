import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channel, destination, title, messageBody, scheduledAt } = body;

    // Basic validation
    if (!channel || !destination || !messageBody || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into notifications queue
    const { error: insertError } = await supabase.from('notifications').insert({
      user_id: session.user.id,
      channel,
      destination,
      title,
      body: messageBody,
      scheduled_at: scheduledAt,
      status: 'pending'
    });

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
