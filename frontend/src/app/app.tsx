import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/app-layout';
import { HomePage } from '../pages/home.page';
import { CompaniesPage } from '../pages/companies.page';
import { OffersPage } from '../pages/offers.page';
import { AdminCompanyFormPage } from '../pages/admin-company-form.page';
import { AdminCompanyDetailPage } from '../pages/admin-company-detail.page';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="admin/companies/new" element={<AdminCompanyFormPage />} />
          <Route path="admin/companies/:id" element={<AdminCompanyDetailPage />} />
          <Route path="*" element={<p>Page non trouvée.</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
