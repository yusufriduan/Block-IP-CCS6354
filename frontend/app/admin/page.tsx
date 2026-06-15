"use client"

import { useEffect } from "react"

export default function admin(){

    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            console.log("Wallet changed detected!", accounts);
            
            fetch('/api/logout', { method: 'POST' })
                .then(() => {
                window.location.reload();
                })
                .catch(err => console.error("Logout failed during account change", err));
            };

            const provider = window.ethereum;
            if (provider) {
            provider.on('accountsChanged', handleAccountsChanged);
            } else {
            const handleLoad = () => {
                if (window.ethereum) {
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                }
            };
            window.addEventListener('load', handleLoad);
        }

        return () => {
            const provider = window.ethereum;
            if (provider && provider.removeListener) {
                provider.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, [])

    return(
        <div>
            <h1>test</h1>
        </div>
    )
}