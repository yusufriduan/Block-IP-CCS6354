'use client'
import Link from "next/dist/client/link";
import { Header } from "../component/Header";
import ConnectionFailFallback from "../component/ConnectionFailFallback";
import ConnectingInProgress from "../component/ConnectingInProgress";
import { IPComponent } from "../component/IPComponent";
import { getIsAdmin } from "@/lib/isAdmin";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function admin() {
    const router = useRouter();
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [fullWalletAddress, setFullWalletAddress] = useState<string>("");
    const [walletStartAddress, setWalletStartAddress] = useState<String>("");
    const [walletEndAddress, setWalletEndAddress] = useState<String>("");
    const [walletMidStartAddress, setWalletMidStartAddress] = useState<String>("");
    const [walletMidEndAddress, setWalletMidEndAddress] = useState<String>("");
    const [totalPage, setTotalPage] = useState<number>(1);
    const [approvedIPs, setApprovedIPs] = useState<ipInfo[]>([]);
    const [pendingIPs, setPendingIPs] = useState<ipInfo[]>([]);
    const [curPointerApproved, setCurPointerApproved] = useState<number>(1);
    const [curPointerPending, setCurPointerPending] = useState<number>(1);

    interface ipInfo{
        ipName: string,
        ipDescription: string,
        ipType: string,
        ipPostedDate: number,
        ipApprovedDate: number,
        ipExpiredDate: number,
        ipStatus: number,
        tokenId: string,
        ipAsset: string,
        approvalVotes: number
    }

    useEffect(() => {
        localStorage.setItem("isConnected", "False");
        localStorage.setItem("walletAddress", "");

        // The cleaner async wrapper function
        const initializeDashboard = async () => {

            async function connectWallet(){
                try{
                    if (!window.ethereum) {
                        alert("MetaMask is not installed");
                        setIsConnected(false);
                        return null;
                    }

                    await window.ethereum.request({ method: "eth_requestAccounts" });


                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    setWalletStartAddress(address.slice(0, 10));
                    setWalletMidStartAddress(address.slice(10,20));
                    setWalletMidEndAddress(address.slice(20,30));
                    setWalletEndAddress(address.slice(30));
                    localStorage.setItem("isConnected", "True");
                    localStorage.setItem("walletAddress", address);
                    setIsConnected(true);

                    return address;
                } catch (error){
                    console.log("Error connecting wallet: ", error);
                    setIsConnected(false);
                    return null;
                }
            }
            // 1. Wait for connection
            const fullAddress = await connectWallet();
            
            // Stop if it fails
            if (!fullAddress) return;

            // 2. Check Admin Status
            try {
                const isAdminData = await fetch("/api/adminAuth", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({wallet: fullAddress}),
                    credentials: "include",
                });
                const isAdminJson = await isAdminData.json();
                
                if (isAdminJson.redirect) {
                    router.push(isAdminJson.redirect);
                    return; // Stop execution if redirecting
                }
            } catch (error) {
                console.error("Failed to check admin status", error);
            }

            // 3. Load the IPs!
            getAllSystemIPs();
        };

        initializeDashboard();
    }, []);

    async function getAllSystemIPs(){
        const ipList = await fetch("/api/retrieveAll");
        const ipListJson = await ipList.json();
        if(ipListJson.error){
            console.log("Error: ", ipListJson.error);
        } else if(ipListJson.ipList){
            const approved = ipListJson.ipList.filter((ip: ipInfo) => ip.ipStatus === 1);
            const pending = ipListJson.ipList.filter((ip: ipInfo) => ip.ipStatus === 0);
            setApprovedIPs(approved);
            setPendingIPs(pending);
        }
    }

    

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
        <Header isConnected={isConnected} isDashboard={true} isRegister={true} isNotAdmin={true} isCredit={false}></Header>
        { isConnected === null ? <ConnectingInProgress></ConnectingInProgress> :
            (
                isConnected === true ?
                <div id="dashboard-ui" className="flex flex-col w-screen mt-8 h-screen justify-center items-center">
                <video autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-10">
                    <source src="/videos/food-video.mp4" type="video/mp4"></source>
                </video>

                <div id="overlay-content" className="relative mt-8 flex flex-col w-7/8 h-11/12 bg-background/30 z-50 backdrop-blur-md rounded-2xl">
                    <h1 className="text-xl text-shadow-white text-shadow-xs font-mono tracking-wide font-bold mt-4 mb-2 ml-14 text-foreground max-w-full hyphens-auto md:hyphens-none">
                    User <span className="inline-block">{walletStartAddress}</span><span className="block sm:inline-block">{walletMidStartAddress}</span><span className="block sm:inline-block">{walletMidEndAddress}</span><span className="block md:inline-block">{walletEndAddress}&apos;s</span> dashboard
                    </h1>
                    
                    <div className="flex flex-col justify-between h-full gap-2">
                        <div className="flex flex-wrap w-full h-1/2 bg-background/30 rounded-2xl shadow-lg p-4">
                            <p className="font-mono text-md text-foreground ml-14 mb-2 text-shadow-white text-shadow-xs">All Approved Intellectual Properties:</p>
                            <div className="h-full w-full mb-4 flex justify-center items-center">
                                {
                                approvedIPs && approvedIPs.length > 0 ? 
                                    <div className="h-full w-11/12 rounded-2xl bg-secondary/10 backdrop-blur-none grid grid-cols-3 grid-rows-2 place-items-center">
                                    <div className="flex flex-row w-full justify-center items-center">
                                        <div className="grid grid-cols-3 place-items-center bg-background p-1 mb-2">
                                        <button disabled={curPointerApproved === 1} id="back-btn" onClick={() => setCurPointerApproved(curPointerApproved-1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">back</button>
                                        <p>{curPointerApproved}</p>
                                        <button disabled={curPointerApproved === Math.ceil(approvedIPs.length/6)} id="next-btn" onClick={() => setCurPointerApproved(curPointerApproved+1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">next</button>
                                        </div>             
                                    </div>
                                    {approvedIPs.slice((curPointerApproved-1) * 6, ((curPointerApproved-1) * 6) + 6).map((ip, index) => (
                                        <IPComponent data={ip} isAdmin={true} key={ip.tokenId || index}/>
                                    ))} 
                                    </div>
                                    :
                                    <div className="flex justify-center items-center flex-col">
                                        <p className="font-bold font-mono text-3xl text-foreground text-shadow-white text-shadow-xs">No IP has been requested yet.</p>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="flex flex-wrap w-full h-1/2 bg-background/30 rounded-2xl shadow-lg p-4">
                            <p className="font-mono text-md text-foreground ml-14 mb-2 text-shadow-white text-shadow-xs"> Intellectual Property Awaiting Approval:</p>
                            <div className="h-full w-full mb-4 flex justify-center items-center">
                                {
                                pendingIPs && pendingIPs.length > 0 ? 
                                    <div className="h-full w-11/12 rounded-2xl bg-secondary/10 backdrop-blur-none grid grid-cols-3 grid-rows-2 place-items-center">
                                    <div className="flex flex-row w-full justify-center items-center">
                                        <div className="grid grid-cols-3 place-items-center bg-background p-1 mb-2">
                                        <button disabled={curPointerPending === 1} id="back-btn" onClick={() => setCurPointerPending(curPointerPending-1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">back</button>
                                        <p>{curPointerPending}</p>
                                        <button disabled={curPointerPending === Math.ceil(pendingIPs.length/6)} id="next-btn" onClick={() => setCurPointerPending(curPointerPending+1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">next</button>
                                        </div>             
                                    </div>
                                    {pendingIPs.slice((curPointerPending-1) * 6, ((curPointerPending-1) * 6) + 6).map((ip, index) => (
                                        <IPComponent data={ip} isAdmin={true} key={ip.tokenId || index}/>
                                    ))} 
                                    </div>
                                    :
                                    <div className="flex justify-center items-center flex-col">
                                    <p className="font-bold font-mono text-3xl text-foreground text-shadow-white text-shadow-xs">No IP has been requested yet.</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                </div> 
                : 
                <ConnectionFailFallback></ConnectionFailFallback>
            )
        }
        </div>
    );
}