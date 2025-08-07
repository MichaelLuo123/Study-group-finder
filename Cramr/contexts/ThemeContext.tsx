import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

interface ThemeContextProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) =>{
    const systemTheme = Appearance.getColorScheme();
    const [isDarkMode, setIsDarkMode] = useState<boolean>( systemTheme === "dark");

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    const setDarkMode = (value: boolean) => {
        setIsDarkMode(value)
    }

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({colorScheme}) => {
            setIsDarkMode(colorScheme ==="dark")
        });

        return () => subscription.remove();
    }, []);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if(!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
}