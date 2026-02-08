import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SeedDataPage from '../pages/SeedDataPage';

const mockNavigate = jest.fn();
const mockSeed = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

jest.mock('../components/layout/AppLayout', () => ({
    AppLayout: ({ children }) => <div>{children}</div>
}));

jest.mock('../services/api', () => ({
    configAPI: {
        seedComprehensiveDemoData: (...args) => mockSeed(...args)
    }
}));

describe('SeedDataPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to /app/dashboard after successful seed', async () => {
        mockSeed.mockResolvedValue({
            sites: [{ site_id: 'site-1' }],
            equipment_count: 10,
            gps_readings: 10,
            haul_cycles: 10,
            blast_patterns: 2,
            shifts: 4,
            load_tickets: 100,
            prism_readings: 20
        });

        render(<SeedDataPage />);

        fireEvent.click(screen.getByRole('button', { name: /start seeding/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /view dashboard/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /view dashboard/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard');
    });
});

