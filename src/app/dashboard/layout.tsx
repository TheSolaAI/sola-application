'use client'
import {WalletProvider} from "@/providers/WalletProvider";
import {usePrivy} from "@privy-io/react-auth";
import {useUserHandler} from "@/store/UserHandler";
import {useEffect} from "react";
import {LayoutProvider} from "@/providers/LayoutProvider";
import MasterLayout from "@/app/dashboard/_components/MasterLayout";

export default function DashboardLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {

    /**
     * Global State Management
     */
    const { authenticated, ready } = usePrivy();
    const { login } = useUserHandler();

    /**
     * Add any code here that needs to run when the user has completed authentication
     */
    useEffect(() => {
        const init = async () => {
            if (authenticated && ready) {
                await login(); // check function documentation for more details
            }
        };
        init();
    }, [authenticated, ready, login]);

    return (
        <WalletProvider isAuthenticated={authenticated && ready}>
            <LayoutProvider>
                <MasterLayout>
                    {children}
                </MasterLayout>
            </LayoutProvider>
        </WalletProvider>
    );
}
