"use client";

import { Header } from "../component/Header";
import Dropdown from "../component/Dropdown";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import ConnectionFailFallback from "../component/ConnectionFailFallback";
import ConnectingInProgress from "../component/ConnectingInProgress";
import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints";

export default function registerIP() {
    const [connectedStatus, setConnectedStatus] = useState<String>("");
    const [connectionFailed, setConnectionFailed] = useState<boolean>(false);
    const [wallet, setWallet] = useState<String>("");

    // form data
    const [ipName, setIpName] = useState("");
    const [ipType, setIpType] = useState("");
    const [ipFile, setIpFile] = useState<File | null>(null);
    const [ipDesc, setIpDesc] = useState("");

    useEffect(() => {
        const temp = localStorage.getItem("isConnected");
        if (temp != null) {
            setConnectedStatus(temp);
        }

        connectWallet();
        
    }, [])

    async function connectWallet(){
        try{
            let address = localStorage.getItem("walletAddress");
            if(address === "" || !address ){
                if (!window.ethereum) {
                    alert("MetaMask is not installed");
                    setConnectionFailed(true);
                    return null;
                }

                await window.ethereum.request({ method: "eth_requestAccounts" });


                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                address = await signer.getAddress();
                
                if(address != null){
                    setWallet(address);
                    setConnectedStatus("True");
                    localStorage.setItem("isConnected", "True");
                    localStorage.setItem("walletAddress", address);
                }
            }
            return address;
        } catch (error){
            console.log("Error connecting wallet: ", error);
            setConnectionFailed(true);
            return null;
        }
    }

    async function handleSubmit(e: EventTarget){
        const button = e as HTMLButtonElement;
        if(button){
            button.disabled=true;
            if(ipName.replace(/\s/g, '') != "" && ipType != "" && ipFile != null){
                if(ipFile.type === "image/jpeg" || ipFile.type === "image/png"){
                    // call to sc
                    
                } else {
                    alert("Please only enter PNG or JPG/JPEG!");
                }
            } else {
                alert("Please enter all relevant information!")
            }
        } else {
            console.log("No button found what")
        }
    }

    return (
        <>
            {
                connectionFailed ? <ConnectionFailFallback /> 
                    :
                    (
                        connectedStatus !== "True" ?
                        <ConnectingInProgress />
                        :
                        <div>
                            <Header
                                isConnected={connectedStatus === "True"}
                                isNotAdmin={true}
                                isDashboard={false}
                                isRegister={true}
                                isCredit={false}>
                            </Header>
                            <div id="register-section" className="h-screen justify-center items-center flex flex-col place-content-center">
                                    
                                <div className="box-border h-30 w-240 border-2 rounded-3xl border-secondary bg-secondary
                                flex flex-row items-center justify-center">
                                    <h1 className="font-mono font-bold text-4xl tracking-wider">Register Intellectual Property</h1>
                                </div>

                                <div id="content-section" className="m-10 box-border h-80 w-260 border-4 rounded-3xl border-secondary bg-secondary
                                grid grid-flow-row grid-cols-2 items-flex-start justify-flex-start grid-container">
                                    <div>
                                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-1">Intellectual Property Name</h1>
                                    </div>
                                    <div>
                                        <input type="text" id="input_ip_name" placeholder="IP Name"
                                            className="m-4 box-border h-10 w-100 border-2 rounded-3xl border-textbox bg-textbox row-start-1 hover:border-foreground
                                            px-4 py-3 font-mono text-xl tracking-wider place-content-center"
                                            onChange={(e) => setIpName(e.target.value)}
                                        >
                                        </input>
                                    </div>
                                    <div>
                                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-2">Register IP Type</h1>
                                    </div>
                                    <div>
                                        <div id="dropdown box" className="">
                                            <Dropdown changeTypeFunction={(e) => setIpType(e)} />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-1">Intellectual Property Desccription</h1>
                                    </div>
                                    <div>
                                        <input type="text" id="input_ip_description" placeholder="IP Description"
                                            className="m-4 box-border h-10 w-100 border-2 rounded-3xl border-textbox bg-textbox row-start-1 hover:border-foreground
                                            px-4 py-3 font-mono text-xl tracking-wider place-content-center"
                                            onChange={(e) => setIpDesc(e.target.value)}
                                        >
                                        </input>
                                    </div>
                                    <div>
                                    <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-start">Intellectual Property</h1>
                                    </div>
                                    <div>
                                        <input type="file" hidden />
                                        <input type="file" id="insert_ip" placeholder=""
                                            className="m-3 h-10 w-100 font-mono text-sm border border-textbox rounded-3xl cursor-pointer
                                                        bg-textbox focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground
                                                        file:cursor-pointer file:border-0 file:py-3 file:px-3 file:mr-4
                                                        file:bg-background hover:file:bg-gray-200"
                                            onChange={(e) => setIpFile(e.target.files?.[0] ?? null)}
                                        >
                                        </input>
                                        <p className="m-6 mt-1 text-sm " id="file_input_help">PNG or JPG(MAX. 800x400px).</p>
                                    </div>
                                
                                </div>

                                <div id="submit-section" className=" flex flex-wrap item-center justify-end justify-items-end gap-40">
                                    <button id="submit-button" onClick={(e) => handleSubmit(e.target)} className="box-border h-10 w-30 border-4 border-radius rounded-3xl border-approve bg-approve hover:border-[#00EE00] hover:bg-[#00EE00]">
                                        <h1 className="font-mono text-xl tracking-wider">Submit</h1>
                                    </button>
                            
                                    <button dir="rtl" id="clear-button" className="box-border h-10 w-40 border-4 border-radius rounded-3xl border-reject bg-reject hover:border-[#E90000] hover:bg-[#E90000]">
                                        <h1 className="font-mono text-xl tracking-wider">Clear All</h1>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                
            }
        </> 
    )
}
