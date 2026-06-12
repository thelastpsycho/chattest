'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { GuestState, ChatMessage, FlowStep, Preferences, ServiceSelection, RoomUpgrade } from '@/lib/types';

// Components
import { MessageBubble } from '@/components/MessageBubble';
import { PreferencesCard } from '@/components/PreferencesCard';
import { ServicesCard } from '@/components/ServicesCard';
import { UpgradeCard } from '@/components/UpgradeCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Composer } from '@/components/Composer';

export default function Chat() {
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize state from URL params
  const [state, setState] = useState<GuestState>(() => {
    const name = searchParams.get('name') || '';
    const email = searchParams.get('email') || '';

    return {
      name,
      email,
      step: name && email ? 'preferences' : 'greeting',
      preferences: {
        bedding: 'No preference',
        dietary: '',
        occasion: 'Just relaxing',
        occasionOther: '',
      },
      services: [],
      upgrade: { interested: false },
      transcript: [],
      startedAt: new Date().toISOString(),
    };
  });

  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showNameEmailForm, setShowNameEmailForm] = useState(!state.name || !state.email);
  const [nameEmailInput, setNameEmailInput] = useState({ name: state.name, email: state.email });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.transcript, isAiTyping]);

  // Initial greeting
  useEffect(() => {
    if (state.step === 'greeting' && state.transcript.length === 0) {
      const firstName = state.name ? state.name.split(' ')[0] : '';
      const greeting = firstName
        ? `Welcome to The Anvaya Beach Resort Bali, ${firstName}! I'm your personal concierge and I'll help you prepare for your upcoming stay. This takes about 2 minutes. Let's get started!`
        : `Welcome to The Anvaya Beach Resort Bali! I'm your personal concierge. To get started, could you please share your name and email address?`;

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          transcript: [...prev.transcript, {
            role: 'assistant',
            content: greeting,
            timestamp: new Date().toISOString(),
          }],
        }));
      }, 500);
    }
  }, [state.step, state.name, state.transcript.length]);

  const handleSendMessage = async (content: string) => {
    const guestMessage: ChatMessage = {
      role: 'guest',
      content,
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      transcript: [...prev.transcript, guestMessage],
    }));

    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          state: {
            ...state,
            transcript: [...state.transcript, guestMessage],
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      setState(prev => ({
        ...prev,
        transcript: [...prev.transcript, {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        }],
      }));
    } catch (error) {
      console.error('AI chat error:', error);
      setState(prev => ({
        ...prev,
        transcript: [...prev.transcript, {
          role: 'assistant',
          content: 'I apologize for the technical difficulty. Please try again.',
          timestamp: new Date().toISOString(),
        }],
      }));
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleNameEmailSubmit = () => {
    const { name, email } = nameEmailInput;
    if (!name.trim() || !email.trim()) return;

    setState(prev => ({
      ...prev,
      name: name.trim(),
      email: email.trim(),
      step: 'preferences',
      transcript: [...prev.transcript, {
        role: 'guest',
        content: `My name is ${name.trim()} and my email is ${email.trim()}`,
        timestamp: new Date().toISOString(),
      }],
    }));
    setShowNameEmailForm(false);

    // AI acknowledges and moves to preferences
    setTimeout(() => {
      const firstName = name.split(' ')[0];
      setState(prev => ({
        ...prev,
        transcript: [...prev.transcript, {
          role: 'assistant',
          content: `Thank you, ${firstName}! Now let's set up your stay preferences. Please fill out the form below to help us prepare for your arrival.`,
          timestamp: new Date().toISOString(),
        }],
      }));
    }, 500);
  };

  const handlePreferencesSubmit = (preferences: Preferences) => {
    setState(prev => ({ ...prev, preferences, step: 'services' }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        transcript: [...prev.transcript, {
          role: 'assistant',
          content: `Perfect! I've noted your preferences. Now, would you like to add any services to enhance your stay? Browse the options below, or feel free to ask me any questions.`,
          timestamp: new Date().toISOString(),
        }],
      }));
    }, 500);
  };

  const handleServicesSubmit = () => {
    setState(prev => ({ ...prev, step: 'upgrade' }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        transcript: [...prev.transcript, {
          role: 'assistant',
          content: `Great selections! Now, are you interested in a room upgrade? Our team can confirm availability and rates for you.`,
          timestamp: new Date().toISOString(),
        }],
      }));
    }, 500);
  };

  const handleUpgradeSubmit = (upgrade: RoomUpgrade) => {
    setState(prev => ({ ...prev, upgrade, step: 'review' }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        transcript: [...prev.transcript, {
          role: 'assistant',
          content: `Excellent! Please review your selections below. When you're ready, confirm and send — our concierge team will follow up to finalize everything.`,
          timestamp: new Date().toISOString(),
        }],
      }));
    }, 500);
  };

  const handleEditStep = (step: FlowStep) => {
    setState(prev => ({ ...prev, step }));
  };

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setState(prev => ({ ...prev, step: 'submitted' }));

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          transcript: [...prev.transcript, {
            role: 'assistant',
            content: `Thank you, ${state.name.split(' ')[0]}! Your request has been sent to our concierge team. We'll follow up shortly to confirm availability and finalize payment. Have a wonderful stay!`,
            timestamp: new Date().toISOString(),
          }],
        }));
      }, 500);
    } catch (error) {
      console.error('Submit error:', error);
      alert('There was an error sending your request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--anvaya-sand)]">
      {/* Header */}
      <header className="bg-[var(--anvaya-white)] border-b border-[var(--anvaya-light-gray)] py-4 px-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-[var(--anvaya-teal)]">The Anvaya Concierge</h1>
          <p className="text-sm text-gray-600">Pre-Arrival Chat</p>
        </div>
      </header>

      {/* Main chat area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pb-32">
        {/* Messages */}
        <div className="space-y-4 mb-6">
          {state.transcript.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          {isAiTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-[var(--anvaya-white)] border border-[var(--anvaya-light-gray)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Inline cards based on step */}
        {state.step === 'greeting' && showNameEmailForm && (
          <div className="bg-[var(--anvaya-white)] border border-[var(--anvaya-light-gray)] rounded-xl p-6 shadow-sm mb-4">
            <h3 className="text-lg mb-4">Let's get started</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  id="name"
                  value={nameEmailInput.name}
                  onChange={(e) => setNameEmailInput(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 border border-[var(--anvaya-light-gray)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--anvaya-teal)]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={nameEmailInput.email}
                  onChange={(e) => setNameEmailInput(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 border border-[var(--anvaya-light-gray)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--anvaya-teal)]"
                />
              </div>
              <button
                onClick={handleNameEmailSubmit}
                disabled={!nameEmailInput.name.trim() || !nameEmailInput.email.trim()}
                className="w-full bg-[var(--anvaya-teal)] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Chat
              </button>
            </div>
          </div>
        )}

        {state.step === 'preferences' && (
          <div className="mb-4">
            <PreferencesCard
              preferences={state.preferences}
              onUpdate={(prefs) => setState(prev => ({ ...prev, preferences: prefs }))}
              onSubmit={() => handlePreferencesSubmit(state.preferences)}
            />
          </div>
        )}

        {state.step === 'services' && (
          <div className="mb-4">
            <ServicesCard
              services={state.services}
              onUpdate={(services) => setState(prev => ({ ...prev, services }))}
              onSubmit={handleServicesSubmit}
            />
          </div>
        )}

        {state.step === 'upgrade' && (
          <div className="mb-4">
            <UpgradeCard
              upgrade={state.upgrade}
              onUpdate={(upgrade) => handleUpgradeSubmit(upgrade)}
              onSubmit={() => handleUpgradeSubmit(state.upgrade)}
            />
          </div>
        )}

        {state.step === 'review' && (
          <div className="mb-4">
            <ReviewCard
              state={state}
              onEditStep={handleEditStep}
              onSubmit={handleFinalSubmit}
              isSubmitting={false}
            />
          </div>
        )}

        {state.step === 'submitted' && (
          <div className="bg-[var(--anvaya-white)] border-2 border-[var(--anvaya-teal)] rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-[var(--anvaya-teal)] mb-2">Request Sent!</h3>
            <p className="text-gray-600">
              Our concierge team will follow up shortly to confirm your selections and finalize payment.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Thank you for choosing The Anvaya Beach Resort Bali. We look forward to welcoming you!
            </p>
          </div>
        )}
      </main>

      {/* Composer - always available for free-text */}
      {state.step !== 'submitted' && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--anvaya-white)] border-t border-[var(--anvaya-light-gray)] p-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <Composer
              onSend={handleSendMessage}
              disabled={isAiTyping}
              placeholder="Ask me anything about your stay..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
