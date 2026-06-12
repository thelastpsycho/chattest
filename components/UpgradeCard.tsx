'use client';

import { RoomUpgrade } from '@/lib/types';
import { ROOM_UPGRADE_CATEGORIES } from '@/lib/catalog';

interface UpgradeCardProps {
  upgrade: RoomUpgrade;
  onUpdate: (upgrade: RoomUpgrade) => void;
  onSubmit: () => void;
}

export function UpgradeCard({ upgrade, onUpdate, onSubmit }: UpgradeCardProps) {
  return (
    <div className="bg-anvaya-white border border-anvaya-light-gray rounded-xl p-6 shadow-sm">
      <h3 className="text-lg mb-4">Room Upgrade</h3>

      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={upgrade.interested}
            onChange={(e) => {
              if (e.target.checked) {
                onUpdate({ interested: true, targetCategory: ROOM_UPGRADE_CATEGORIES[0] });
              } else {
                onUpdate({ interested: false, targetCategory: undefined });
              }
            }}
            className="w-5 h-5 rounded border-gray-300 text-anvaya-teal focus:ring-anvaya-teal"
          />
          <span className="font-medium">I&apos;m interested in a room upgrade</span>
        </label>
        <p className="text-sm text-gray-600 mt-2 ml-8">
          Our concierge will confirm availability and provide rates based on your current booking.
        </p>
      </div>

      {upgrade.interested && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Preferred room category:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ROOM_UPGRADE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onUpdate({ ...upgrade, targetCategory: category })}
                className={`px-4 py-3 rounded-lg text-left border-2 transition-all ${
                  upgrade.targetCategory === category
                    ? 'border-anvaya-teal bg-anvaya-teal text-white'
                    : 'border-anvaya-light-gray hover:border-anvaya-teal'
                }`}
              >
                <div className="font-medium">{category}</div>
                <div className="text-xs opacity-75 mt-1">Concierge to confirm rate</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        className="w-full bg-anvaya-teal text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Continue
      </button>
    </div>
  );
}
