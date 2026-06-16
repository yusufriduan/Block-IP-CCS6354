"use client";

import { Header } from "../component/Header";
import Dropdown from "../component/Dropdown";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import ConnectionFailFallback from "../component/ConnectionFailFallback";
import ConnectingInProgress from "../component/ConnectingInProgress";
import contractArtifact from "@/lib/contracts/IP.json";
import { useRouter } from 'next/navigation';

export default function RegisterIP() {
    const [connectedStatus, setConnectedStatus] = useState<boolean>(false);
    const [connectionFailed, setConnectionFailed] = useState<boolean>(false);
    const [wallet, setWallet] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);

    // form data
    const [ipName, setIpName] = useState("");
    const [ipType, setIpType] = useState("");
    const [ipFile, setIpFile] = useState<File | null>(null);
    const [ipDesc, setIpDesc] = useState("");

    const router = useRouter();

    useEffect(() => {
        async function init(){
            const wallet = await connectWallet();
            try {
                const isAdminData = await fetch("/api/adminAuth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wallet: wallet }),
                    credentials: "include",
                });
                const isAdminJson = await isAdminData.json();
                if (isAdminJson.redirect) {
                    router.push(isAdminJson.redirect);
                }
            } catch (error) {
                console.error("Failed to check admin status", error);
            }
        }
        
        init();

        const handleAccountsChanged = (accounts: string[]) => {
            console.log("Wallet changed detected!", accounts);
            
            fetch('/api/logout', { method: 'POST' })
                .then(() => {
                    setWallet("");
                    setSigner(null);
                    setConnectedStatus(false);

                    router.push("/");
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
    }, []);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!wallet) {
            alert("No wallet address detected. Please connect MetaMask first.");
            return;
        }

        setIsSubmitting(true);

        if (ipName.replace(/\s/g, '') !== "" && ipType !== "" && ipFile !== null) {
            if (ipFile.type === "image/jpeg" || ipFile.type === "image/png") {
                
                const formData = new FormData();
                formData.append("name", ipName);
                formData.append("description", ipDesc);
                formData.append("type", ipType);
                formData.append("asset", ipFile);
                formData.append("wallet", wallet);

                try {
                    const res = await fetch("/api/upload", {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || "Failed uploading files to Pinata");
                    }

                const assetCID = data.assetCID;
                const metadataCID = data.metadataCID;
                const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
                if (!contractAddress) {
                    throw new Error("Target contract configuration address missing.");
                }

                if(signer != null){
                    const contract = new ethers.Contract(
                        contractAddress,
                        contractArtifact.abi,
                        signer
                    );

                    const requiredFee = ethers.parseEther("0.01");

                    const assetCIDHash = ethers.keccak256(ethers.toUtf8Bytes(assetCID));
                    const tx = await contract.mint(wallet, assetCIDHash, metadataCID, { value: requiredFee });
                    await tx.wait();
                    alert("IP Successfully added >w<")
                    handleClear();
                } else {
                    alert("Please refresh the page to reconnect your wallet.")
                }

                } catch (exception) {
                    console.log("Some error occurred: ", exception);
                    alert("Network error occurred during upload.");
                }

            } else {
                alert("Please only enter PNG or JPG/JPEG!");
            }
        } else {
            alert("Please enter all relevant information!");
        }

        setIsSubmitting(false);
    };

    const handleClear = () => {
        setIpName("");
        setIpType("");
        setIpDesc("");
        setIpFile(null);
    };

    async function connectWallet() {
        try {
            if (!window.ethereum) {
                alert("MetaMask is not installed");
                setConnectionFailed(true);
                return null;
            }

            // Always request accounts dynamically to ensure connection is live
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            
            if (accounts && accounts.length > 0) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();

                setWallet(address);
                setSigner(signer);
                setConnectionFailed(false);
                setConnectedStatus(true);
                return address;
            } else {
                setConnectionFailed(true);
                return null;
            }
        } catch (error) {
            console.log("Error connecting wallet: ", error);
            setConnectionFailed(true);
            return null;
        }
    }

    return (
        <>
            {connectionFailed ? (
                <ConnectionFailFallback />
            ) : connectedStatus === false  ? (
                <ConnectingInProgress />
            ) : (
                <div>
                    <Header
                        isConnected={connectedStatus}
                        isDashboard={false}
                        isRegister={true}
                        isCredit={false}
                    />
                    <form onSubmit={handleSubmit} id="register-section" className="h-screen justify-center items-center flex flex-col place-content-center">

                        <div className="box-border h-30 w-240 border-2 rounded-3xl border-secondary bg-secondary flex flex-row items-center justify-center">
                            <h1 className="font-mono font-bold text-4xl tracking-wider">Register Intellectual Property</h1>
                        </div>

                        <div id="content-section" className="m-10 box-border h-80 w-260 border-4 rounded-3xl border-secondary bg-secondary grid grid-flow-row grid-cols-2 items-flex-start justify-flex-start grid-container">
                            <div>
                                <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-1">Intellectual Property Name</h1>
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    value={ipName}
                                    placeholder="IP Name"
                                    className="m-4 box-border h-10 w-100 border-2 rounded-3xl border-textbox bg-textbox row-start-1 hover:border-foreground px-4 py-3 font-mono text-xl tracking-wider place-content-center"
                                    onChange={(e) => setIpName(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-2">Register IP Type</h1>
                            </div>
                            <div>
                                <div id="dropdown box">
                                    <Dropdown changeTypeFunction={(e) => setIpType(e)} />
                                </div>
                            </div>

                            <div>
                                <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-1">Intellectual Property Description</h1>
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    value={ipDesc}
                                    placeholder="IP Description"
                                    className="m-4 box-border h-10 w-100 border-2 rounded-3xl border-textbox bg-textbox row-start-1 hover:border-foreground px-4 py-3 font-mono text-xl tracking-wider place-content-center"
                                    onChange={(e) => setIpDesc(e.target.value)}
                                />
                            </div>

                            <div>
                                <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-start">Intellectual Property File</h1>
                            </div>
                            <div>
                                <input 
                                    type="file" 
                                    id="insert_ip" 
                                    className="m-3 h-10 w-100 font-mono text-sm border border-textbox rounded-3xl cursor-pointer bg-textbox focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground file:cursor-pointer file:border-0 file:py-3 file:px-3 file:mr-4 file:bg-background hover:file:bg-gray-200"
                                    onChange={(e) => setIpFile(e.target.files?.[0] ?? null)}
                                />
                                <p className="m-6 mt-1 text-sm" id="file_input_help">PNG or JPG(MAX. 800x400px).</p>
                            </div>
                        </div>

                        <div id="submit-section" className="flex flex-wrap item-center justify-end justify-items-end gap-40">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="box-border h-10 w-30 border-4 border-radius rounded-3xl border-approve bg-approve hover:border-[#00EE00] hover:bg-[#00EE00] disabled:opacity-50"
                            >
                                <h1 className="font-mono text-xl tracking-wider">{isSubmitting ? "Submitting..." : "Submit"}</h1>
                            </button>

                            <button 
                                type="button" 
                                onClick={handleClear}
                                className="box-border h-10 w-40 border-4 border-radius rounded-3xl border-reject bg-reject hover:border-[#E90000] hover:bg-[#E90000]"
                            >
                                <h1 className="font-mono text-xl tracking-wider">Clear All</h1>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}