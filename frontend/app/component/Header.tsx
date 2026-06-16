"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import admin from "../admin/page";

interface headerProps {
    isConnected: boolean | null;
    isDashboard: boolean;
    isRegister: boolean;
    isCredit: boolean;
}

export const Header = ({isConnected, isDashboard, isRegister, isCredit} : headerProps) => {

    const [isNotAdmin, setIsNotAdmin] = useState<boolean>(true);

    useEffect(() => {
        async function adminCheck(){
            const res = await fetch("/api/isAdmin");
            const json = await res.json();

            if(json.isAdmin){
                setIsNotAdmin(false);
            } else {
                setIsNotAdmin(true);
            }
        }
        
        adminCheck();
    }, [])

    return (
        <div className="w-screen absolute h-16 bg-accent">
            <div id="header-left" className="relative float-left ml-16 h-full flex items-center">
                <h1 className="font-mono text-4xl tracking-wider font-semibold">BlockIP</h1>
            </div>
            <div id="header-right" className="relative float-end mr-16 h-full flex flex-row items-center">
                
                {isConnected && isNotAdmin && !isRegister && (
                    <div className="group">
                        <Link href="/registerIP" className="relative mr-8 font-mono text-xl font-semibold cursor-pointer">
                            Register IP
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </Link>
                    </div>
                )}

                {isConnected && isNotAdmin && !isDashboard && (
                    <div className="group">
                        <Link href="/" className="relative mr-8 font-mono text-xl font-semibold cursor-pointer">
                            Dashboard
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </Link>
                    </div>
                )}

                {isConnected && !isNotAdmin && !isDashboard && (
                    <div className="group">
                        <Link href="/admin" className="relative mr-8 font-mono text-xl font-semibold cursor-pointer">
                            Admin Dashboard
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </Link>
                    </div>
                )}

                {isConnected && !isNotAdmin && !isRegister && (
                    <div className="group">
                        <Link href="/admin_register" className="relative mr-8 font-mono text-xl font-semibold cursor-pointer">
                            Register Admins
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </Link>
                    </div>
                )}

                {isConnected && !isCredit && (
                    <div className="group">
                        <Link href="/credits" className="relative mr-8 font-mono text-xl font-semibold cursor-pointer">
                            Credits
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};