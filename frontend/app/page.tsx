"use client"

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Header } from "./component/Header";
import ConnectionFailFallback from "./component/ConnectionFailFallback";
import ConnectingInProgress from "./component/ConnectingInProgress";

export default function Home() {

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [walletAddress, setWalletAddress] = useState<String>("");

  useEffect(() => {
     localStorage.setItem("isConnected", "False");
    connectWallet();
  }, [])

  async function connectWallet(){
      try{
        if (!window.ethereum) {
            alert("MetaMask is not installed");
            setIsConnected(false);
            return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });


        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();;
        setWalletAddress(address);
        localStorage.setItem("isConnected", "True");
        setIsConnected(true);

        console.log("address: ", address);
        console.log("provider: ", provider);
        console.log("signer: ", signer);
      } catch (error){
          console.log("Error connecting wallet: ", error);
          setIsConnected(false);
      }
    }

  return (
    <div>
      <Header isConnected={isConnected} isDashboard={true} isRegister={false} isNotAdmin={true} isCredit={false}></Header>
      {
          isConnected === null ? <ConnectingInProgress></ConnectingInProgress>
          :
          (
            isConnected === true ?
            <div id="dashboard-ui" className="flex flex-col w-screen mt-24">
              <h1 className="ml-16 font-mono font-bold text-xl text-foreground">User {walletAddress}'s dashboard:</h1>
            </div> 
            : 
            <ConnectionFailFallback></ConnectionFailFallback>
        )
      }
    </div>
    
  );
}
