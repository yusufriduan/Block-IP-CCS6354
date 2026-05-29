"use client";

import { Header } from "../component/Header";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function credits(){

   const [connectedStatus, setConnectedStatus] = useState<String>("");

   useEffect(() => {
    const temp = localStorage.getItem("isConnected");
    if(temp != null){
        setConnectedStatus(temp);
    }
   }, [])

    return(
        <div>
            <Header 
            isConnected={ connectedStatus === "True"} 
            isNotAdmin={true} 
            isDashboard={false} 
            isRegister={false} 
            isCredit={true}>
            </Header>
            <div id="credits-section" className="h-screen justify-center items-center flex flex-col">
                <div id="top-section" className="flex flex-row items-center justify-center">
                    <div className="relative w-28 aspect-square mr-8">
                        <Image src="/images/nijikapoor.png" alt="nijikapoor" fill className="object-cover"></Image>
                    </div>
                    <h1 className="font-mono font-bold text-5xl tracking-wider underline">Credits</h1>
                </div>
                <div id="name-section" className="items-center flex flex-col font-mono font-semibold text-2xl mt-8">
                    <h1 className="m-4">Muhammad Yusuf bin Riduan ("yusufriduan")</h1>
                    <h1 className="m-4">Shawn Huang Qi Yang ("Mutton9558")</h1>
                    <h1 className="m-4">Syed Zaki Husain Wafa bin Syed Riyad Reza ("Szaki01")</h1>
                    <h1 className="m-4">Wan Wei Siang ("OrpheusJaso")</h1>
                </div>
            </div>
        </div>
    )
}