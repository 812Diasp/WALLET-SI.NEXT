'use client';

import { Provider } from 'react-redux';
import { store } from '../app/store/index';
import { useEffect } from 'react';
import {setTheme} from '../app/store/themeSlice'
import { useAppDispatch } from '../hooks'
// Компонент для инициализации темы
function ThemeInitializer() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Проверяем предпочтения пользователя и сохраненную тему
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            dispatch(setTheme(savedTheme as 'light' | 'dark'));
        } else if (prefersDark) {
            dispatch(setTheme('dark'));
        } else {
            dispatch(setTheme('light'));
        }
    }, [dispatch]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeInitializer />
            {children}
        </Provider>
    );
}