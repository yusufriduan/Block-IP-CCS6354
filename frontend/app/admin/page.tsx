'use client'
import { Header } from "../component/Header";
import ConnectionFailFallback from "../component/ConnectionFailFallback";
import ConnectingInProgress from "../component/ConnectingInProgress";
import { IPComponent } from "../component/IPComponent";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function admin() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [walletStartAddress, setWalletStartAddress] = useState<String>("");
    const [walletEndAddress, setWalletEndAddress] = useState<String>("");
    const [walletMidStartAddress, setWalletMidStartAddress] = useState<String>("");
    const [walletMidEndAddress, setWalletMidEndAddress] = useState<String>("");
    const [walletFullAddress, setWalletFullAddress] = useState<string>("");
    const [approvedIPs, setApprovedIPs] = useState<ipInfo[]>([]);
    const [pendingIPs, setPendingIPs] = useState<ipInfo[]>([]);
    const [curPointerApproved, setCurPointerApproved] = useState<number>(1);
    const [curPointerPending, setCurPointerPending] = useState<number>(1);
    const [loadingIPs, setLoadingIPs] = useState<boolean>(true)

    interface ipInfo{
        ipName: string;
        ipDescription: string;
        ipType: string;
        ipPostedDate: number;
        ipApprovedDate: number;
        ipExpiredDate: number;
        ipStatus: number;
        tokenId: string;
        ipAsset: string;
        approvalVotes: number;
        owner: string;
    }

    useEffect(() => {
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
                    setWalletFullAddress(address);
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

            // 3. Load the IPs!
            getAllSystemIPs();
        };

        initializeDashboard();
      
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
        }
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

        setLoadingIPs(false);
    }

    return (
        <div className="min-h-screen max-w-100vw flex flex-col relative overflow-x-hidden">
        <Header isDashboard={true} isRegister={false} isCredit={false}></Header>
        { isConnected === null ? <ConnectingInProgress></ConnectingInProgress> :
            (
                isConnected === true ?
                <div id="dashboard-ui" className="flex flex-col w-full mt-8 min-h-screen justify-center items-center">
                <video autoPlay loop muted playsInline className="absolute inset-0 top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-10">
                    <source src="/videos/food-video.mp4" type="video/mp4"></source>
                </video>

                <div id="overlay-content" className="relative flex flex-col w-full max-w-7xl min-h-[80vh] bg-background/30 z-50 backdrop-blur-md rounded-2xl p-6">
                    <h1 className="text-xl text-shadow-white text-shadow-xs font-mono tracking-wide font-bold mt-4 mb-2 ml-14 text-foreground max-w-full hyphens-auto md:hyphens-none">
                    User <span className="inline-block">{walletStartAddress}</span><span className="block sm:inline-block">{walletMidStartAddress}</span><span className="block sm:inline-block">{walletMidEndAddress}</span><span className="block md:inline-block">{walletEndAddress}&apos;s</span> dashboard
                    </h1>
                    
                    <div className="flex flex-col justify-start h-full gap-2 flex-1">
                        <div className="flex flex-wrap flex-1 w-full h-full bg-background/30 rounded-2xl shadow-lg p-4">
                            <p className="font-mono text-md text-foreground ml-14 mb-2 text-shadow-white text-shadow-xs">All Approved Intellectual Properties:</p>
                            <div className="h-full w-full mb-4 flex justify-center items-center">
                                {
                                approvedIPs && approvedIPs.length > 0 ? 
                                    <>
                                        <div className="h-full w-11/12 rounded-2xl bg-secondary/10 backdrop-blur-none grid grid-cols-3 place-items-center">
                                            {approvedIPs.slice((curPointerApproved-1) * 3, ((curPointerApproved-1) * 3) + 3).map((ip, index) => (
                                                <IPComponent data={ip} isAdmin={true} wallet={walletFullAddress} key={ip.tokenId || index}/>
                                            ))} 
                                        </div>
                                        {approvedIPs.length > 6 && (
                                            <div className="flex flex-row w-full justify-center items-center">
                                                <div className="grid grid-cols-3 place-items-center bg-background p-1 mb-2">
                                                    <button disabled={curPointerApproved === 1} id="back-btn" onClick={() => setCurPointerApproved(curPointerApproved-1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">back</button>
                                                    <p>{curPointerApproved}</p>
                                                    <button disabled={curPointerApproved === Math.ceil(approvedIPs.length/3)} id="next-btn" onClick={() => setCurPointerApproved(curPointerApproved+1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">next</button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                    :
                                    <div className="flex justify-center items-center flex-col">
                                        <p className="font-bold font-mono text-3xl text-foreground text-shadow-white text-shadow-xs">{ loadingIPs ? "Fetching IPs..." : "No IP has been requested yet." }</p>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="flex flex-wrap flex-1 w-full h-full bg-background/30 rounded-2xl shadow-lg p-4">
                            <p className="font-mono text-md text-foreground ml-14 mb-2 text-shadow-white text-shadow-xs"> Intellectual Property Awaiting Approval:</p>
                            <div className="h-full w-full mb-4 flex justify-center items-center">
                                {
                                pendingIPs && pendingIPs.length > 0 ? 
                                    <>
                                        <div className="h-full w-11/12 rounded-2xl bg-secondary/10 backdrop-blur-none grid grid-cols-3 grid-rows-1 place-items-center">
                                            {pendingIPs.slice((curPointerPending-1) * 6, ((curPointerPending-1) * 6) + 6).map((ip, index) => (
                                                <IPComponent data={ip} isAdmin={true} wallet={walletFullAddress} key={ip.tokenId || index}/>
                                            ))}
                                        </div>
                                        {pendingIPs.length > 6 && (
                                            <div className="flex flex-row w-full justify-center items-center">
                                                <div className="grid grid-cols-3 grid-rows-1 place-items-center bg-background p-1 mb-2">
                                                    <button disabled={curPointerPending === 1} id="back-btn" onClick={() => setCurPointerPending(curPointerPending-1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">back</button>
                                                    <p>{curPointerPending}</p>
                                                    <button disabled={curPointerPending === Math.ceil(pendingIPs.length/3)} id="next-btn" onClick={() => setCurPointerPending(curPointerPending+1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">next</button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                    :
                                    <div className="flex justify-center items-center flex-col">
                                    <p className="font-bold font-mono text-3xl text-foreground text-shadow-white text-shadow-xs">{ loadingIPs ? "Fetching IPs..." : "No IP has been requested yet." }</p>
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