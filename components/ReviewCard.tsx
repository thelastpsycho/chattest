'use client';

import { GuestState } from '@/lib/types';
import { SERVICE_CATALOG } from '@/lib/catalog';
import { formatIDR } from '@/lib/money';
import { FlowStep } from '@/lib/types';

interface ReviewCardProps {
  state: GuestState;
  onEditStep: (step: FlowStep) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewCard({ state, onEditStep, onSubmit, isSubmitting }: ReviewCardProps) {
  const { preferences, services, upgrade } = state;

  const subtotal = services
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.lineTotal, 0);

  const selectedServices = services.filter(s => s.selected);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--anvaya-white)] border border-[var(--anvaya-light-gray)] rounded-xl p-6 shadow-sm">
        <h3 className="text-lg mb-4">Review Your Selections</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please review everything before sending. You can go back to any section to make changes.
        </p>

        {/* Stay Preferences */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Stay Preferences</h4>
            <button
              type="button"
              onClick={() => onEditStep('preferences')}
              className="text-sm text-[var(--anvaya-teal)] hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="pl-4 space-y-1 text-sm">
            <div><span className="text-gray-600">Bedding:</span> {preferences.bedding}</div>
            <div><span className="text-gray-600">Dietary:</span> {preferences.dietary || 'None'}</div>
            <div>
              <span className="text-gray-600">Occasion:</span> {preferences.occasion}
              {preferences.occasionOther && ` (${preferences.occasionOther})`}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Requested Services</h4>
            <button
              type="button"
              onClick={() => onEditStep('services')}
              className="text-sm text-[var(--anvaya-teal)] hover:underline"
            >
              Edit
            </button>
          </div>
          {selectedServices.length > 0 ? (
            <div className="pl-4 space-y-3">
              {selectedServices.map((selection) => {
                const catalog = SERVICE_CATALOG.find(c => c.id === selection.serviceId);
                if (!catalog) return null;

                const valuesText = Object.entries(selection.values)
                  .map(([key, value]) => {
                    const field = catalog.captureFields.find(f => f.key === key);
                    const label = field?.label || key;
                    return `${label}: ${value}`;
                  })
                  .join(' · ');

                return (
                  <div key={selection.serviceId} className="border-b border-[var(--anvaya-light-gray)] pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{catalog.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{valuesText}</div>
                      </div>
                      <div className="font-semibold">
                        {catalog.price ? formatIDR(selection.lineTotal) : 'Concierge to confirm'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 italic pl-4">No services selected</div>
          )}
        </div>

        {/* Room Upgrade */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Room Upgrade</h4>
            <button
              type="button"
              onClick={() => onEditStep('upgrade')}
              className="text-sm text-[var(--anvaya-teal)] hover:underline"
            >
              Edit
            </button>
          </div>
          {upgrade.interested ? (
            <div className="pl-4 text-sm">
              <div className="font-medium">Interested in upgrading to:</div>
              <div className="text-[var(--anvaya-teal)] mt-1">{upgrade.targetCategory || 'Not specified'}</div>
              <div className="text-xs text-gray-600 mt-1">Concierge to confirm availability and rate</div>
            </div>
          ) : (
            <div className="text-gray-500 italic pl-4">Not requested</div>
          )}
        </div>

        {/* Subtotal */}
        <div className="bg-[#f0fdfa] border border-[var(--anvaya-teal)] rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-lg">Estimated Subtotal:</span>
            <span className="font-bold text-2xl">{formatIDR(subtotal)}</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Final pricing will be confirmed by our concierge. Some services may be subject to availability.
          </p>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-[var(--anvaya-teal)] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending...' : 'Confirm & Send'}
      </button>
    </div>
  );
}
