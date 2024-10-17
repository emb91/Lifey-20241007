// components/ui/icons.tsx

import { FC } from 'react';
import { 
  HomeIcon, 
  UserIcon, 
  CogIcon, 
  BellIcon, 
  // Add more icons as needed
} from '@heroicons/react/outline';

interface IconProps {
  className?: string;
}

export const Icons: Record<string, FC<IconProps>> = {
  Home: ({ className }) => <HomeIcon className={className} />,
  User: ({ className }) => <UserIcon className={className} />,
  Settings: ({ className }) => <CogIcon className={className} />,
  Notifications: ({ className }) => <BellIcon className={className} />,
  // Add more icons here
};