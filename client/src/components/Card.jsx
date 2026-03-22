import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
  const hoverClass = hoverEffect ? 'feature-card' : '';
  return (
    <div className={`glass-panel ${hoverClass} ${className}`} style={{ padding: '2rem' }} {...props}>
      {children}
    </div>
  );
};

export default Card;
