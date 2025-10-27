import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <div className="prompt-stock-float-btn" onClick={onClick}>
      <MessageSquare className="w-6 h-6 text-white" strokeWidth={2} />
    </div>
  );
};

