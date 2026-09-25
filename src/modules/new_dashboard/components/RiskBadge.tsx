import React from 'react';
import { COLORS } from '../lib/constants';

interface RiskBadgeProps {
  level: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  let bgColor = COLORS.riskMedium;
  
  switch (level) {
    case 'Alto': bgColor = COLORS.riskHigh; break;
    case 'Medio alto': bgColor = COLORS.riskMediumHigh; break;
    case 'Medio': bgColor = COLORS.riskMedium; break;
    case 'Medio bajo': bgColor = COLORS.riskMediumLow; break;
    case 'Bajo': bgColor = COLORS.riskLow; break;
  }

  return (
    <span 
      className="px-3 py-1 text-xs font-semibold text-white rounded-md w-full block text-center shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      {level}
    </span>
  );
};

export default RiskBadge;