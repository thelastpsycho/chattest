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

Your job: help them set preferences and choose optional add-ons. Answer their questions using ONLY the service catalog provided below. Never invent prices, services, or policies — if you don't know, say the concierge will confirm. Prices are in IDR, net.

Keep replies to 1–3 sentences. After answering, gently guide them back to the current step (${step}). Acknowledge their occasion if they've shared one. Do not ask for payment details — a human concierge finalizes payment.

SERVICE CATALOG:
${catalogText}

ROOM UPGARGE OPTIONS:
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
