import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channel, destination, title, messageBody, scheduledAt, mediaId, mediaType } = body;

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
      status: 'pending' // Default status
    });

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Also trace it conceptually back to the media for history
    // We could save it in watch_logs or just a separate API if we queried later

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
