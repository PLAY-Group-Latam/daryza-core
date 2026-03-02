import { useCallback } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = () => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

export function initializeTheme() {
    localStorage.setItem('appearance', 'light');
    setCookie('appearance', 'light');
    applyTheme();
}

export function useAppearance() {
    const updateAppearance = useCallback((mode: Appearance) => {
        if (mode !== 'light') {
            return;
        }
        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', 'light');

        // Store in cookie for SSR...
        setCookie('appearance', 'light');

        applyTheme();
    }, []);

    return { appearance: 'light' as Appearance, updateAppearance } as const;
}
