"use client"

import Image from "next/image"
import { Header } from "../component/Header"
import { useEffect, useState } from "react"

export default function RegisterAdmin(){
    const [newAdmin, setNewAdmin] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [alreadyAdded, setAlreadyAdded] = useState<boolean>(false);

    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            console.log("Wallet changed detected!", accounts);
            
            fetch('/api/logout', { method: 'POST' })
                .then(() => {
                    localStorage.setItem("walletAddress", "");
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

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        setAlreadyAdded(false);

        setIsSubmitting(true);
        const req = await fetch("/api/addNewAdmin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newAdmin: newAdmin })
        })

        const res = await req.json();

        if(res.error == "Admin already added"){
            setAlreadyAdded(true);
        }

        if(res.success){
            alert("Admin Successfully Added!");
        }

        setIsSubmitting(false);
        setNewAdmin("");
    }

    return(
        <div className="relative w-screen h-screen m-0 p-0 box-border">
            <Image src="/images/register_admin_bg.jpg" alt="register-admin-bg" fill className="object-cover" sizes="100vw"></Image>
            <Header isCredit={false} isDashboard={false} isRegister={true}></Header>
            <div className="h-full w-full flex justify-center items-center">
                <form id="admin-form-cont" onSubmit={handleSubmit} className="relative mt-16 bg-secondary/10 h-4/5 w-4/5 backdrop-blur-2xl flex flex-col justify-center items-center">
                    <h1 className="font-mono text-5xl font-semibold mb-16">Register Admin</h1>
                    <p className="font-mono text-lg text-red-600 mb-4" hidden={!alreadyAdded}>Admin already added before!</p>
                    <div className="flex flex-row items-center ">
                        <p className="font-mono text-xl">New Admin Wallet:</p>
                        <input disabled={isSubmitting} id="new-admin" placeholder="Enter a wallet" value={newAdmin} onChange={(e) => {setNewAdmin(e.target.value)}} className="ml-8 w-96 bg-textbox p-1 pl-4 placeholder-white rounded-2xl cursor-pointer text-white font-mono disabled:text-gray-400 disabled:cursor-not-allowed"></input>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="box-border h-10 w-36 mt-16 font-mono cursor-pointer border-4 border-radius rounded-3xl border-approve bg-approve hover:border-[#00EE00] hover:bg-[#00EE00] disabled:opacity-50 disabled:bg-gray-400"
                    >
                        Submit
                    </button>
                </form>
            </div>
            
        </div>
    )
}