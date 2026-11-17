import React from 'react';

export interface AccessibilityIconProps {
  className?: string;
}

/**
 * Universal Human Accessibility Icon (Outstretched arms, spread legs figure)
 * Replaces wheelchair symbol with the universal person access icon.
 */
export const AccessibilityIcon: React.FC<AccessibilityIconProps> = ({
  className = 'w-4 h-4',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="12" cy="4.2" r="2.4" fill="currentColor" />

      {/* Outstretched Arms (subtle upward tilt, rounded caps) */}
      <path
        d="M3.8 8.8C7.6 7.8 12 7.8 12 7.8C12 7.8 16.4 7.8 20.2 8.8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Torso */}
      <path
        d="M12 8.2V14.6"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Inverted-V Legs (spread apart with rounded caps) */}
      <path
        d="M7.8 21.2L11 14.5L13 14.5L16.2 21.2"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
