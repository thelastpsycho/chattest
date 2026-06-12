// Guest and session state
export interface GuestState {
  name: string;
  email: string;
  step: FlowStep;
  preferences: Preferences;
  services: ServiceSelection[];
  upgrade: RoomUpgrade;
  transcript: ChatMessage[];
  startedAt: string;
}

export type FlowStep =
  | 'greeting'
  | 'preferences'
  | 'services'
  | 'upgrade'
  | 'review'
  | 'submitted';

export interface Preferences {
  bedding: 'King' | 'Twin' | 'No preference';
  dietary: string;
  occasion: 'Honeymoon' | 'Anniversary' | 'Birthday' | 'Family holiday' | 'Business' | 'Just relaxing' | 'Other';
  occasionOther?: string;
}

// Service catalog and selection
export interface ServiceCatalog {
  id: number;
  name: string;
  price: number | null; // null = "Concierge to confirm"
  captureFields: CaptureField[];
}

export type CaptureField =
  | { type: 'quantity'; label: string; key: string; min?: number; max?: number; default: number; optional?: boolean }
  | { type: 'date'; label: string; key: string }
  | { type: 'time'; label: string; key: string }
  | { type: 'select'; label: string; key: string; options: string[] }
  | { type: 'text'; label: string; key: string; optional?: boolean }
  | { type: 'pax'; label: string; key: string; min?: number; max?: number; note?: string };

export interface ServiceSelection {
  serviceId: number;
  selected: boolean;
  values: Record<string, string | number>;
  lineTotal: number;
}

// Room upgrade
export interface RoomUpgrade {
  interested: boolean;
  targetCategory?: string;
}

// Chat messages
export interface ChatMessage {
  role: 'guest' | 'assistant';
  content: string;
  timestamp: string;
}

// Email lead
export interface LeadEmail {
  guest: { name: string; email: string; timestamp: string };
  preferences: Preferences;
  services: ServiceSelection[];
  upgrade: RoomUpgrade;
  subtotal: number;
  transcript: ChatMessage[];
}
