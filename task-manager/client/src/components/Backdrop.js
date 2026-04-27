import React, { useEffect } from 'react';

const Backdrop = ({ isOpen, onClick, zIndex = 30 }) => {
  // Prevent body scroll when backdrop is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press to close backdrop
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClick();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClick]);

  if (!isOpen) return null;

  // Map z-index number to Tailwind class
  const getZIndexClass = (zIndexValue) => {
    switch(zIndexValue) {
      case 10: return 'z-10';
      case 20: return 'z-20';
      case 30: return 'z-30';
      case 40: return 'z-40';
      case 50: return 'z-50';
      default: return 'z-30';
    }
  };

  return (
    <div
      className={`fixed inset-0 ${getZIndexClass(zIndex)}`}
      onClick={onClick}
      aria-hidden="true"
    >
      {/* Semi-transparent backdrop with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-slate-900/20 backdrop-blur-sm" />
      
      {/* Subtle animated overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 opacity-50" />
      </div>
    </div>
  );
};

export default Backdrop;