'use client';

import { SERVICE_CATALOG, calculateLineTotal, validateServiceSelection } from '@/lib/catalog';
import { ServiceSelection, CaptureField } from '@/lib/types';
import { formatIDR } from '@/lib/money';
import { useState } from 'react';
import { TimeSelector } from '@/components/TimeSelector';

interface ServicesCardProps {
  services: ServiceSelection[];
  onUpdate: (services: ServiceSelection[]) => void;
  onSubmit: () => void;
}

export function ServicesCard({ services, onUpdate, onSubmit }: ServicesCardProps) {
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleService = (serviceId: number) => {
    const existing = services.find(s => s.serviceId === serviceId);
    if (existing) {
      onUpdate(services.filter(s => s.serviceId !== serviceId));
    } else {
      const catalog = SERVICE_CATALOG.find(s => s.id === serviceId);
      if (catalog) {
        const initialValues: Record<string, string | number> = {};
        catalog.captureFields.forEach(field => {
          if (field.type === 'quantity') {
            initialValues[field.key] = (field as any).default || 1;
          } else if (field.type === 'select' && field.options && field.options.length > 0) {
            initialValues[field.key] = field.options[0]; // Default to first option
          } else {
            initialValues[field.key] = '';
          }
        });
        const initialLineTotal = calculateLineTotal(serviceId, initialValues);
        onUpdate([
          ...services,
          {
            serviceId,
            selected: true,
            values: initialValues,
            lineTotal: initialLineTotal,
          },
        ]);
      }
    }
  };

  const updateServiceValue = (serviceId: number, key: string, value: string | number) => {
    const updated = services.map(s => {
      if (s.serviceId !== serviceId) return s;

      const newValues = { ...s.values, [key]: value };
      const lineTotal = calculateLineTotal(serviceId, newValues);

      // Validate
      const validation = validateServiceSelection(serviceId, newValues);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, [serviceId]: validation.error || '' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[serviceId];
          return newErrors;
        });
      }

      return { ...s, values: newValues, lineTotal };
    });
    onUpdate(updated);
  };

  const subtotal = services
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.lineTotal, 0);

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-[var(--anvaya-white)] border border-[var(--anvaya-light-gray)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg">Add-On Services</h3>
            <p className="text-sm text-gray-600">
              {services.filter(s => s.selected).length > 0
                ? `${services.filter(s => s.selected).length} service${services.filter(s => s.selected).length > 1 ? 's' : ''} selected`
                : 'Select services to enhance your stay'
              }
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 rounded-lg border border-[var(--anvaya-light-gray)] hover:border-[var(--anvaya-teal)] transition-colors flex items-center gap-2"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
            <span className="text-lg">{isExpanded ? '−' : '+'}</span>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {SERVICE_CATALOG.map((catalog) => {
              const selection = services.find(s => s.serviceId === catalog.id);
              const isSelected = !!selection;

              return (
                <div
                  key={catalog.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    isSelected
                      ? 'border-[var(--anvaya-teal)] bg-[#f0fdfa]'
                      : 'border-[var(--anvaya-light-gray)] hover:border-[var(--anvaya-teal)]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-base">{catalog.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {catalog.price ? formatIDR(catalog.price) : 'Concierge to confirm'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleService(catalog.id)}
                      className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-[var(--anvaya-teal)] text-white'
                          : 'bg-[var(--anvaya-light-gray)] hover:bg-[var(--anvaya-teal)] hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </div>

                  {isSelected && selection && (
                    <div className="mt-4 pt-4 border-t border-[var(--anvaya-light-gray)] space-y-3">
                      {catalog.captureFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium mb-1">
                            {field.label}
                            {field.type === 'pax' && field.note && (
                              <span className="text-xs text-gray-500 ml-2">({field.note})</span>
                            )}
                          </label>
                          {field.type === 'quantity' && (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = (selection.values[field.key] as number) || field.min || 1;
                                  const min = field.min || 1;
                                  if (current > min) {
                                    updateServiceValue(catalog.id, field.key, current - 1);
                                  }
                                }}
                                className="w-10 h-10 rounded-lg border-2 border-[var(--anvaya-light-gray)] hover:border-[var(--anvaya-teal)] font-medium text-lg disabled:opacity-50"
                                disabled={(selection.values[field.key] as number) <= (field.min || 1)}
                              >
                                −
                              </button>
                              <span className="text-lg font-medium w-12 text-center">
                                {selection.values[field.key] as number}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = (selection.values[field.key] as number) || 1;
                                  const max = field.max || 99;
                                  if (current < max) {
                                    updateServiceValue(catalog.id, field.key, current + 1);
                                  }
                                }}
                                className="w-10 h-10 rounded-lg border-2 border-[var(--anvaya-light-gray)] hover:border-[var(--anvaya-teal)] font-medium text-lg disabled:opacity-50"
                                disabled={(selection.values[field.key] as number) >= (field.max || 99)}
                              >
                                +
                              </button>
                            </div>
                          )}
                          {field.type === 'date' && (
                            <input
                              type="date"
                              value={selection.values[field.key] as string}
                              onChange={(e) => updateServiceValue(catalog.id, field.key, e.target.value)}
                              className="w-full px-3 py-2 border border-[var(--anvaya-light-gray)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--anvaya-teal)]"
                            />
                          )}
                          {field.type === 'time' && catalog.id === 3 && field.key === 'time' ? (
                            <TimeSelector
                              value={selection.values[field.key] as string}
                              onChange={(value) => updateServiceValue(catalog.id, field.key, value)}
                            />
                          ) : field.type === 'time' && (
                            <input
                              type="time"
                              value={selection.values[field.key] as string}
                              onChange={(e) => updateServiceValue(catalog.id, field.key, e.target.value)}
                              className="w-full px-3 py-2 border border-[var(--anvaya-light-gray)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--anvaya-teal)]"
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              value={selection.values[field.key] as string}
                              onChange={(e) => updateServiceValue(catalog.id, field.key, e.target.value)}
                              className="w-full px-3 py-2 border border-[var(--anvaya-light-gray)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--anvaya-teal)] bg-white"
                            >
                              {field.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}
                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder={field.optional ? '(optional)' : ''}
                              value={selection.values[field.key] as string}
                              onChange={(e) => updateServiceValue(catalog.id, field.key, e.target.value)}
                              className="w-full px-3 py-2 border border-[var(--anvaya-light-gray)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--anvaya-teal)]"
                            />
                          )}
                          {field.type === 'pax' && (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = (selection.values[field.key] as number) || field.min || 1;
                                  const min = field.min || 1;
                                  if (current > min) {
                                    updateServiceValue(catalog.id, field.key, current - 1);
                                  }
                                }}
                                className="w-10 h-10 rounded-lg border-2 border-[var(--anvaya-light-gray)] hover:border-[var(--anvaya-teal)] font-medium text-lg disabled:opacity-50"
                                disabled={(selection.values[field.key] as number) <= (field.min || 1)}
                              >
                                −
                              </button>
                              <span className="text-lg font-medium w-12 text-center">
                                {selection.values[field.key] as number} guests
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = (selection.values[field.key] as number) || 1;
                                  const max = field.max || 20;
                                  if (current < max) {
                                    updateServiceValue(catalog.id, field.key, current + 1);
                                  }
                                }}
                                className="w-10 h-10 rounded-lg border-2 border-[var(--anvaya-light-gray)] hover:border-[var(--anvaya-teal)] font-medium text-lg disabled:opacity-50"
                                disabled={(selection.values[field.key] as number) >= (field.max || 20)}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {(catalog.price || (selection.lineTotal !== undefined && selection.lineTotal > 0)) && (
                        <div className="flex justify-between items-center pt-3 border-t border-[var(--anvaya-light-gray)]">
                          <span className="font-medium">Line total:</span>
                          <span className="font-semibold text-lg">{formatIDR(selection.lineTotal)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subtotal */}
      <div className="bg-[var(--anvaya-white)] border border-[var(--anvaya-teal)] rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium text-lg">Subtotal:</span>
          <span className="font-bold text-2xl">{formatIDR(subtotal)}</span>
        </div>
      </div>

      {/* Errors */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Please correct the following errors before continuing:
          <ul className="mt-2 list-disc list-inside">
            {Object.entries(errors).map(([id, error]) => (
              <li key={id}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={hasErrors}
        className="w-full bg-[var(--anvaya-teal)] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
