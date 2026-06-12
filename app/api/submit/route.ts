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

    console.log('Submit request received for:', state.name, state.email);

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

    // Send email
    const transporter = createTransporter();
    const leadEmailAddr = process.env.LEAD_EMAIL || 'reservations@anvayabali.com';
    const fromEmail = process.env.SMTP_FROM || 'concierge@anvayabali.com';

    console.log('Sending email to:', leadEmailAddr, 'from:', fromEmail);

    await transporter.sendMail({
      from: fromEmail,
      to: leadEmailAddr,
      subject: `New pre-arrival request — ${state.name}`,
      html: htmlBody,
    });

    console.log('Email sent successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Provide more specific error message
    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Connection timeout - check SMTP host and port';
      } else if (error.message.includes('EAUTH')) {
        errorMessage = 'Authentication failed - check SMTP credentials';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused - SMTP server not reachable';
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
