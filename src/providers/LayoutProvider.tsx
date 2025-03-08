'use client';

import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    walletLensOpen: boolean;
    setWalletLensOpen: React.Dispatch<React.SetStateAction<boolean>>;
    canAutoClose: boolean;
    setCanAutoClose: React.Dispatch<React.SetStateAction<boolean>>;
    audioIntensity: number;
    setAudioIntensity: React.Dispatch<React.SetStateAction<number>>;
    audioEl: HTMLAudioElement | null;
    handleWalletLensOpen: (state: boolean) => void;
    settingsIsOpen: boolean;
    setSettingsIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    // Canvas-related properties
    dashboardOpen: boolean;
    dashboardLayoutContent: ReactNode | null;
    setDashboardLayoutContent: React.Dispatch<
        React.SetStateAction<ReactNode | null>
    >;
    handleDashboardOpen: (state: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
                                                                      children,
                                                                  }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [walletLensOpen, setWalletLensOpen] = useState(false);
    const [canAutoClose, setCanAutoClose] = useState(false);
    const [audioIntensity, setAudioIntensity] = useState(0);
    const [settingsIsOpen, setSettingsIsOpen] = useState(false);
    // Canvas-related state
    const [dashboardOpen, setDashbordOpen] = useState(false);
    const [dashboardLayoutContent, setDashboardLayoutContent] =
        useState<ReactNode | null>(null);
    const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

    // Initialize the audio element on the client side only
    useEffect(() => {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.setAttribute('playsinline', 'true');
        setAudioEl(audio);
    }, []);

    const handleWalletLensOpen = (state: boolean) => {
        if (state) {
            setSidebarOpen(false);
            setWalletLensOpen(true);
            setCanAutoClose(true);
            // Close Canvas if it's open
            if (dashboardOpen) {
                handleDashboardOpen(false);
            }
        } else {
            if (!canAutoClose) {
                setSidebarOpen(true);
            }
            setWalletLensOpen(false);
        }
    };

    /**
     * Handler for opening and closing the Canvas component
     */
    const handleDashboardOpen = (state: boolean) => {
        if (state) {
            // Close wallet lens and collapse the side bar
            if (walletLensOpen) {
                setWalletLensOpen(false);
            }
            setSidebarOpen(false);
            setCanAutoClose(true);
            setDashbordOpen(true);
        } else {
            setDashbordOpen(false);
        }
    };

    return (
        <LayoutContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                walletLensOpen,
                setWalletLensOpen,
                canAutoClose,
                setCanAutoClose,
                audioIntensity,
                setAudioIntensity,
                audioEl,
                handleWalletLensOpen,
                settingsIsOpen,
                setSettingsIsOpen,
                // Canvas-related properties
                dashboardOpen,
                dashboardLayoutContent,
                setDashboardLayoutContent,
                handleDashboardOpen,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayoutContext = (): LayoutContextType => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayoutContext must be used within a LayoutProvider');
    }
    return context;
};