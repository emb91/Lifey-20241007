import React from 'react';
import { Button } from './ui/Button';

interface RegenerateButtonProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
  showButton: boolean;
  disabled: boolean;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({ 
  onRegenerate, 
  isRegenerating, 
  disabled 
}) => {
  return (
    <Button
      onClick={onRegenerate}
      disabled={disabled}
    >
      {isRegenerating ? "Regenerating..." : "Regenerate"}
    </Button>
  );
};

export default RegenerateButton;