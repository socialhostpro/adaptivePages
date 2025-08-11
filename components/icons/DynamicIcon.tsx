import React from 'react';
import * as icons from 'lucide-react';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  iconName: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, ...props }) => {
  const IconComponent = icons[iconName as keyof typeof icons] as React.ElementType;

  if (!IconComponent) {
    // Return a default icon or null if the icon name is not found
    return <icons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};

export default DynamicIcon;