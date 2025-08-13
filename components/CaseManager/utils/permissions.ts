import { UserRole, Permission, CASE_PERMISSIONS } from '../types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export class PermissionService {
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const permissions = CASE_PERMISSIONS[userRole] as readonly string[];
    return permissions.includes(permission);
  }

  static canPerformAction(userRole: UserRole, action: string): boolean {
    return this.hasPermission(userRole, action as Permission);
  }

  static filterActions(userRole: UserRole, actions: string[]): string[] {
    return actions.filter(action => this.canPerformAction(userRole, action));
  }

  static getPermissionsTooltip(userRole: UserRole, permission: Permission): string | null {
    if (this.hasPermission(userRole, permission)) {
      return null;
    }
    return `This action requires ${permission.replace('_', ' ')} permission. Your role (${userRole}) doesn't have access.`;
  }
}

// Mock user service - replace with actual auth
export const getCurrentUser = (): User => {
  // This would typically come from your auth context
  return {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@lawfirm.com',
    role: 'Attorney' // This would be dynamic
  };
};

export const maskPII = (text: string, userRole: UserRole): string => {
  // Only mask for non-privileged roles
  if (['Administrator', 'Attorney'].includes(userRole)) {
    return text;
  }

  // Basic PII masking patterns
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX') // SSN
    .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, 'XX/XX/XXXX') // DOB
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX'); // Credit cards
};
