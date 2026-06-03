import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CompaniesPage } from './companies.page';
import * as companiesApi from '../features/companies/companies.api';

vi.mock('../features/companies/companies.api');

function renderPage() {
  return render(
    <MemoryRouter>
      <CompaniesPage />
    </MemoryRouter>,
  );
}

test('affiche les entreprises retournées par l\'API', async () => {
  vi.mocked(companiesApi.listCompanies).mockResolvedValueOnce([
    { id: 1, name: 'Acme Corp', general_email: 'acme@acme.com', address: null, created_at: '' },
    { id: 2, name: 'Beta Inc', general_email: 'beta@beta.com', address: null, created_at: '' },
  ]);

  renderPage();

  expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  expect(screen.getByText('Beta Inc')).toBeInTheDocument();
});

test('affiche un message quand la liste est vide', async () => {
  vi.mocked(companiesApi.listCompanies).mockResolvedValueOnce([]);

  renderPage();

  expect(await screen.findByText('Aucune entreprise trouvée.')).toBeInTheDocument();
});

test('appelle listCompanies avec le terme de recherche saisi', async () => {
  vi.mocked(companiesApi.listCompanies).mockResolvedValue([]);

  renderPage();
  await screen.findByText('Aucune entreprise trouvée.');

  await userEvent.type(screen.getByPlaceholderText('Rechercher une entreprise...'), 'acme');

  await waitFor(() => {
    expect(companiesApi.listCompanies).toHaveBeenCalledWith('acme');
  });
});
