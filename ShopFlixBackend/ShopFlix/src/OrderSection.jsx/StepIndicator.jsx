// StepIndicator.jsx
import React from 'react';

const StepIndicator = ({ currentStep }) => {
  // Define each step’s label (and optionally, an icon or route)
  const steps = [
    { label: 'Browse' },
    { label: 'Cart Review' },
    { label: 'Delivery' },
    { label: 'Payment' },
  ];

  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={step.label} className="flex items-center">
            {/* Circle */}
            <div
              className={`flex items-center justify-center rounded-full w-8 h-8 text-white 
                ${isCompleted ? 'bg-blue-600' : isActive ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              {stepNumber}
            </div>

            {/* Step Label */}
            <div className="ml-2 mr-4">
              <span className={`text-sm font-medium 
                ${isCompleted || isActive ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {step.label}
              </span>
            </div>

            {/* Separator Line (except for the last step) */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
