import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from '../context/role-context';
import { AppLayout } from '../components/app-layout';
import { HomePage } from '../pages/home.page';
import { CompaniesPage } from '../pages/companies.page';
import { OffersPage } from '../pages/offers.page';
import { AdminCompanyFormPage } from '../pages/admin-company-form.page';
import { AdminCompanyDetailPage } from '../pages/admin-company-detail.page';
import { RoleSelectPage } from '../pages/role-select.page';

function RoleGate({ children }: { children: ReactNode }) {
  const { role } = useRole();
  if (!role) return <Navigate to="/select-role" replace />;
  return <>{children}</>;
}

function RequireWrite({ children }: { children: ReactNode }) {
  const { role } = useRole();
  if (role === 'lecteur') return <Navigate to="/companies" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/select-role" element={<RoleSelectPage />} />
      <Route
        path="/"
        element={
          <RoleGate>
            <AppLayout />
          </RoleGate>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="admin/companies/new" element={<RequireWrite><AdminCompanyFormPage /></RequireWrite>} />
        <Route path="admin/companies/:id" element={<AdminCompanyDetailPage />} />
        <Route path="*" element={<p>Page non trouvée.</p>} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <AppRoutes />
      </RoleProvider>
    </BrowserRouter>
  );
}
