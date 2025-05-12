import React from 'react';

interface CompanyLogoProps {
  logoUrl: string | null;
  companyName?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ 
  logoUrl, 
  companyName = 'Company', 
  size = 'medium',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-8 w-8';
      case 'large':
        return 'h-16 w-16';
      case 'medium':
      default:
        return 'h-12 w-12';
    }
  };
  
  if (!logoUrl) {
    // Display initials or default icon if no logo
    const initials = companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
      
    return (
      <div className={`${getSizeClasses()} flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-bold ${className}`}>
        {initials}
      </div>
    );
  }
  
  return (
    <img 
      src={logoUrl} 
      alt={`${companyName} logo`} 
      className={`${getSizeClasses()} object-contain rounded-full bg-gray-50 ${className}`}
    />
  );
};

export default CompanyLogo; 