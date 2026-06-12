import { ReactNode } from 'react';
import { RoleGuard } from './RoleGuard';

interface RoleRouteProps {
  children: ReactNode;
}

export function OwnerRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['owner']}>{children}</RoleGuard>;
}

export function DoctorRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['owner', 'doctor']}>{children}</RoleGuard>;
}

export function StaffRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['owner', 'staff']}>{children}</RoleGuard>;
}

export function StaffDoctorRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['owner', 'doctor', 'staff']}>{children}</RoleGuard>;
}

export function StaffCustomerRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['owner', 'staff', 'customer']}>{children}</RoleGuard>;
}

export function CustomerRoute({ children }: RoleRouteProps) {
  return <RoleGuard allowedRoles={['customer']}>{children}</RoleGuard>;
}
