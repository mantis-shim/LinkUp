import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProfilePage from './+page.svelte';

describe('ProfilePage Component', () => {
    it('AC1: displays user name, last name, email, and city', () => {
        const mockData = {
            dbStatus: 'Connected',
            user: {
                id: 1,
                username: 'testuser',
                first_name: 'Vardenis',
                last_name: 'Pavardenis',
                email: 'vardenis@example.com',
                city: 'Vilnius'
            },
            activities: [],
            category: 'created'
        };

        const { getByText } = render(ProfilePage, { props: { data: mockData } });

        expect(getByText('Vardenis Pavardenis')).toBeTruthy();
        expect(getByText('vardenis@example.com · Vilnius')).toBeTruthy();
    });

    it('AC3: displays informational card when user is not found', () => {
        const mockData = {
            dbStatus: 'Error',
            user: null,
            activities: [],
            category: 'created'
        };

        const { getByText } = render(ProfilePage, { props: { data: mockData } });

        expect(getByText('Vartotojas nerastas')).toBeTruthy();
        expect(getByText('Ieškomas profilis neegzistuoja.')).toBeTruthy();
    });
});
