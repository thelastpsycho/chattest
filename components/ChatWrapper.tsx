'use client';

import { Suspense } from 'react';
import Chat from './Chat';

export default function ChatWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--anvaya-sand)]">
        <div className="text-[var(--anvaya-teal)]">Loading...</div>
      </div>
    }>
      <Chat />
    </Suspense>
  );
}
