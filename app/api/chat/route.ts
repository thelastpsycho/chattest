import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GuestState } from '@/lib/types';
import { SERVICE_CATALOG, ROOM_UPGRADE_CATEGORIES } from '@/lib/catalog';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

function buildSystemPrompt(state: GuestState): string {
  const firstName = state.name ? state.name.split(' ')[0] : 'Guest';
  const step = state.step;

  // Build catalog text
  const catalogText = SERVICE_CATALOG.map(service => {
    const priceText = service.price ? `IDR ${service.price.toLocaleString('id-ID')}` : 'Concierge to confirm';
    return `- ${service.name}: ${priceText}`;
  }).join('\n');

  const upgradeText = ROOM_UPGRADE_CATEGORIES.join(', ');

  return `You are the pre-arrival concierge for The Anvaya Beach Resort Bali, a five-star beachfront resort in Kuta. You are warm, concise, and genuinely helpful — like a great hotel concierge, never pushy or salesy. The guest's name is ${firstName} and they have a confirmed booking.

IMPORTANT: You CANNOT add services, confirm bookings, or submit requests through chat. You can only ANSWER QUESTIONS and GUIDE the guest. When they want to book something, tell them to use the selection forms/cards displayed below your message.

Your job: Answer questions about services using ONLY the catalog below. Never invent prices, services, or policies. When a guest wants to add a service or confirm their selections, direct them to click "Add" on the service cards or use the "Continue" / "Confirm and Send" buttons. Do NOT say you've "added" or "confirmed" anything — you can only provide information.

Keep replies to 1–2 sentences. Never pretend to take action.

SERVICE CATALOG:
${catalogText}

ROOM UPGRADE OPTIONS:
${upgradeText}

STAY PREFERENCES:
Bedding: King / Twin / No preference
Occasion: Honeymoon / Anniversary / Birthday / Family holiday / Business / Just relaxing / Other

Current step: ${step}`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, state } = await request.json();

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: buildSystemPrompt(state),
      },
      {
        role: 'user',
        content: message,
      },
    ];

    // Include recent transcript for context (last 10 messages)
    const recentTranscript = state.transcript.slice(-10);
    for (const msg of recentTranscript) {
      messages.push({
        role: msg.role === 'guest' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize. How can I help you today?';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
