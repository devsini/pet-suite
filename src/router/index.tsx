import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import CustomersPage from '@/features/customers/pages/CustomersPage';
import CreateCustomerPage from '@/features/customers/pages/CreateCustomerPage';
import CustomerDetailPage from '@/features/customers/pages/CustomerDetailPage';
import EditCustomerPage from '@/features/customers/pages/EditCustomerPage';
import PetsPage from '@/features/pets/pages/PetsPage';
import CreatePetPage from '@/features/pets/pages/CreatePetPage';
import PetProfilePage from '@/features/pets/pages/PetProfilePage';
import EditPetPage from '@/features/pets/pages/EditPetPage';
import AppointmentsPage from '@/features/appointments/pages/AppointmentsPage';
import AppointmentCalendarPage from '@/features/appointments/pages/AppointmentCalendarPage';
import CreateAppointmentPage from '@/features/appointments/pages/CreateAppointmentPage';
import AppointmentDetailPage from '@/features/appointments/pages/AppointmentDetailPage';
import MedicalRecordsPage from '@/features/medical-records/pages/MedicalRecordsPage';
import CreateMedicalRecordPage from '@/features/medical-records/pages/CreateMedicalRecordPage';
import MedicalRecordDetailPage from '@/features/medical-records/pages/MedicalRecordDetailPage';
import VaccinationsPage from '@/features/vaccinations/pages/VaccinationsPage';
import CreateVaccinationPage from '@/features/vaccinations/pages/CreateVaccinationPage';
import VaccinationDetailPage from '@/features/vaccinations/pages/VaccinationDetailPage';
import MonitoringPage from '@/features/monitoring/pages/MonitoringPage';
import CreateMonitoringPage from '@/features/monitoring/pages/CreateMonitoringPage';
import MonitoringDetailPage from '@/features/monitoring/pages/MonitoringDetailPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { RoleGuard } from '@/features/auth/RoleGuard';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<AuthGuard><AppShell /></AuthGuard>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="staff/customers" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CustomersPage /></RoleGuard>} />
        <Route path="staff/customers/create" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CreateCustomerPage /></RoleGuard>} />
        <Route path="staff/customers/:id" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CustomerDetailPage /></RoleGuard>} />
        <Route path="staff/customers/:id/edit" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><EditCustomerPage /></RoleGuard>} />
        <Route path="staff/pets" element={<RoleGuard allowedRoles={[ 'owner', 'staff', 'customer' ]}><PetsPage /></RoleGuard>} />
        <Route path="staff/pets/create" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><CreatePetPage /></RoleGuard>} />
        <Route path="staff/pets/:id" element={<RoleGuard allowedRoles={[ 'owner', 'staff', 'customer' ]}><PetProfilePage /></RoleGuard>} />
        <Route path="staff/pets/:id/edit" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><EditPetPage /></RoleGuard>} />
        <Route path="staff/appointments" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><AppointmentsPage /></RoleGuard>} />
        <Route path="staff/appointments/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><CreateAppointmentPage /></RoleGuard>} />
        <Route path="staff/appointments/calendar" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><AppointmentCalendarPage /></RoleGuard>} />
        <Route path="staff/appointments/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><AppointmentDetailPage /></RoleGuard>} />
        <Route path="staff/inventory" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><InventoryPage /></RoleGuard>} />
        <Route path="staff/invoices" element={<RoleGuard allowedRoles={[ 'owner', 'staff' ]}><InvoicesPage /></RoleGuard>} />
        <Route path="doctor/medical-records" element={<RoleGuard allowedRoles={[ 'owner', 'doctor' ]}><MedicalRecordsPage /></RoleGuard>} />
        <Route path="doctor/medical-records/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor' ]}><CreateMedicalRecordPage /></RoleGuard>} />
        <Route path="doctor/medical-records/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor' ]}><MedicalRecordDetailPage /></RoleGuard>} />
        <Route path="staff/vaccinations" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><VaccinationsPage /></RoleGuard>} />
        <Route path="staff/vaccinations/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><CreateVaccinationPage /></RoleGuard>} />
        <Route path="staff/vaccinations/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><VaccinationDetailPage /></RoleGuard>} />
        <Route path="staff/monitoring" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><MonitoringPage /></RoleGuard>} />
        <Route path="staff/monitoring/create" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><CreateMonitoringPage /></RoleGuard>} />
        <Route path="staff/monitoring/:id" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff' ]}><MonitoringDetailPage /></RoleGuard>} />
        <Route path="profile" element={<RoleGuard allowedRoles={[ 'owner', 'doctor', 'staff', 'customer' ]}><ProfilePage /></RoleGuard>} />
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
