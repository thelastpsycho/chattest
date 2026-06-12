'use client';

import { Preferences } from '@/lib/types';

interface PreferencesCardProps {
  preferences: Preferences;
  onUpdate: (preferences: Preferences) => void;
  onSubmit: () => void;
}

export function PreferencesCard({ preferences, onUpdate, onSubmit }: PreferencesCardProps) {
  return (
    <div className="bg-anvaya-white border border-anvaya-light-gray rounded-xl p-6 shadow-sm">
      <h3 className="text-lg mb-4">Your Stay Preferences</h3>

      {/* Bedding Type */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Bedding Type</label>
        <div className="flex flex-wrap gap-3">
          {['King', 'Twin', 'No preference'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onUpdate({ ...preferences, bedding: option as Preferences['bedding'] })}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                preferences.bedding === option
                  ? 'border-anvaya-teal bg-anvaya-teal text-white'
                  : 'border-anvaya-light-gray hover:border-anvaya-teal'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary/Allergies */}
      <div className="mb-5">
        <label htmlFor="dietary" className="block text-sm font-medium mb-2">
          Allergies / Dietary Requirements <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          id="dietary"
          placeholder="e.g. nut allergy, vegetarian, no pork"
          value={preferences.dietary}
          onChange={(e) => onUpdate({ ...preferences, dietary: e.target.value })}
          className="w-full px-3 py-2 border border-anvaya-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-anvaya-teal resize-none"
          rows={2}
        />
      </div>

      {/* Occasion */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Occasion</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['Honeymoon', 'Anniversary', 'Birthday', 'Family holiday', 'Business', 'Just relaxing', 'Other'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onUpdate({ ...preferences, occasion: option, occasionOther: '' })}
              className={`px-3 py-2 rounded-lg text-sm border-2 transition-all ${
                preferences.occasion === option
                  ? 'border-anvaya-teal bg-anvaya-teal text-white'
                  : 'border-anvaya-light-gray hover:border-anvaya-teal'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {preferences.occasion === 'Other' && (
          <input
            type="text"
            placeholder="Please specify"
            value={preferences.occasionOther || ''}
            onChange={(e) => onUpdate({ ...preferences, occasionOther: e.target.value })}
            className="w-full px-3 py-2 border border-anvaya-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-anvaya-teal"
          />
        )}
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-anvaya-teal text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Continue
      </button>
    </div>
  );
}
