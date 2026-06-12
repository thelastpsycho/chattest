import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { GuestState } from '@/lib/types';
import { buildLeadEmail } from '@/lib/email';

// Create SMTP transporter
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('SMTP Config:', { host, port, user, hasPass: !!pass });

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    // Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: false, // Only for testing - remove in production
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const state: GuestState = await request.json();

    console.log('=== SUBMIT REQUEST START ===');
    console.log('Guest:', state.name, state.email);
    console.log('Skip SMTP:', process.env.SKIP_SMTP === 'true');
    console.log('Has SMTP credentials:', !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
    console.log('SMTP Host:', process.env.SMTP_HOST, 'Port:', process.env.SMTP_PORT);

    // Calculate subtotal
    const subtotal = state.services
      .filter(s => s.selected)
      .reduce((sum, s) => sum + s.lineTotal, 0);

    // Build lead email
    const leadEmail = {
      guest: {
        name: state.name,
        email: state.email,
        timestamp: new Date().toISOString(),
      },
      preferences: state.preferences,
      services: state.services,
      upgrade: state.upgrade,
      subtotal,
      transcript: state.transcript,
    };

    const htmlBody = buildLeadEmail(leadEmail);

    // Test mode: skip email sending
    if (process.env.SKIP_SMTP === 'true') {
      console.log('⚠️ SKIP_SMTP=true - Email would be sent to:', process.env.LEAD_EMAIL);
      console.log('📧 Email content (first 500 chars):', htmlBody.substring(0, 500) + '...');
      console.log('=== SUBMIT SUCCESS (TEST MODE) ===');
      return NextResponse.json({ success: true, testMode: true });
    }

    // Send email
    const transporter = createTransporter();
    const leadEmailAddr = process.env.LEAD_EMAIL || 'reservations@anvayabali.com';
    const fromEmail = process.env.SMTP_FROM || 'concierge@anvayabali.com';

    console.log('Attempting to send email to:', leadEmailAddr);

    // Send email with timeout
    await Promise.race([
      transporter.sendMail({
        from: fromEmail,
        to: leadEmailAddr,
        subject: `New pre-arrival request — ${state.name}`,
        html: htmlBody,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email timeout after 15 seconds')), 15000)
      ),
    ]);

    console.log('✓ Email sent successfully');
    console.log('=== SUBMIT REQUEST END ===');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('=== SUBMIT ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('=== END SUBMIT ERROR ===');

    // Provide more specific error message
    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        errorMessage = 'Connection timeout - SMTP server not responding';
      } else if (error.message.includes('EAUTH')) {
        errorMessage = 'Authentication failed - check SMTP credentials';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused - SMTP server not reachable';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host not found - check SMTP_HOST';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
