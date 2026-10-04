import React from 'react';

// StepIndicator shows the user’s progress through checkout steps
const STEPS = ['Cart Review', 'Review Order', 'Address', 'Payment'];

export default function StepIndicator({ currentStep = 0 }) {
  return (
    <div className="flex space-x-4 p-4">
      {STEPS.map((label, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={idx} className="flex-1 text-center">
            {/* Circle */}
            <div
              className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors
                ${isCompleted ? 'bg-blue-600 text-white' : isActive ? 'border-2 border-blue-600 text-blue-600' : 'border-2 border-gray-300 text-gray-300'}`}
            >
              {idx + 1}
            </div>
            {/* Label */}
            <div
              className={`mt-1 text-sm transition-colors
                ${isCompleted || isActive ? 'text-blue-600' : 'text-gray-500'}`}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
