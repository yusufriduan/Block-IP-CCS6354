"use client";

import { Header } from "../component/Header";
import Dropdown from "../component/Dropdown";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import ConnectionFailFallback from "../component/ConnectionFailFallback";
import ConnectingInProgress from "../component/ConnectingInProgress";

export default function registerIP() {
    const [connectedStatus, setConnectedStatus] = useState<String>("");
    const [connectionFailed, setConnectionFailed] = useState<boolean>(false);
    const [wallet, setWallet] = useState<String>("");

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
                                    
                                <div className="box-border h-32 w-240 border-2 rounded-3xl border-secondary bg-secondary
                                flex flex-row items-center justify-center">
                                    <h1 className="font-mono font-bold text-4xl tracking-wider">Register Intellectual Property</h1>
                                </div>

                                <div id="content-section" className="m-10 box-border h-60 w-260 border-4 rounded-3xl border-secondary bg-secondary
                                grid grid-flow-row grid-cols-2 items-flex-start justify-flex-start grid-container">
                                    <div>
                                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-1">Intellectual Property Name</h1>
                                    </div>
                                    <div>
                                        <input type="text" id="Input IP Name" placeholder="IP Name"
                                            className="m-4 box-border h-10 w-100 border-2 rounded-3xl border-textbox bg-textbox row-start-1 hover:border-foreground
                                            px-4 py-3 font-mono text-xl tracking-wider place-content-center"
                                        >
                                        </input>
                                    </div>
                                    <div>
                                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-2">Register IP Type</h1>
                                    </div>
                                    <div>
                                        <div id="dropdown box" className="">
                                            <Dropdown />
                                        </div>
                                    </div>
                                    <div>
                                    <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-start">Intellectual Property</h1>
                                    </div>
                                    <div>
                                        <input type="file" hidden />
                                        <input type="file" id="Insert IP " placeholder=""
                                            className="m-3 h-10 w-100 font-mono text-sm border border-textbox rounded-3xl cursor-pointer
                                                        bg-textbox focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground
                                                        file:cursor-pointer file:border-0 file:py-3 file:px-3 file:mr-4
                                                        file:bg-background hover:file:bg-gray-200"
                                        >
                                        </input>
                                        <p className="m-6 mt-1 text-sm " id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                                    </div>

                                </div>

                                <div id="submit-section" className="m-1 flex flex-wrap item-center justify-end justify-items-end gap-40">
                                    <button id="submit-button" className="box-border h-10 w-30 border-4 border-radius rounded-3xl border-approve bg-approve hover:border-[#00EE00] hover:bg-[#00EE00]">
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
