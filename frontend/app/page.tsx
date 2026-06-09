"use client"

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Header } from "./component/Header";
import ConnectionFailFallback from "./component/ConnectionFailFallback";
import ConnectingInProgress from "./component/ConnectingInProgress";
import { IPComponent } from "./component/IPComponent";

export default function Home() {

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [walletStartAddress, setWalletStartAddress] = useState<String>("");
  const [walletEndAddress, setWalletEndAddress] = useState<String>("");
  const [walletMidStartAddress, setWalletMidStartAddress] = useState<String>("");
  const [walletMidEndAddress, setWalletMidEndAddress] = useState<String>("");
  const [totalPage, setTotalPage] = useState<number>(2);
  const [curPointer, setCurPointer] = useState<number>(1);
  const [isAdmin, setAdmin] = useState<boolean | null>(null);

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
        setWalletStartAddress(address.slice(0, 10));
        setWalletMidStartAddress(address.slice(10,20));
        setWalletMidEndAddress(address.slice(20,30));
        setWalletEndAddress(address.slice(30));
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
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header isConnected={isConnected} isDashboard={true} isRegister={false} isNotAdmin={true} isCredit={false}></Header>
      {
          isConnected === null ? <ConnectingInProgress></ConnectingInProgress>
          :
          (
            isConnected === true ?
            <div id="dashboard-ui" className="flex flex-col w-screen mt-8 h-screen justify-center items-center">
              <video autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-10">
                <source src="/videos/food-video.mp4" type="video/mp4"></source>
              </video>

              <div id="overlay-content" className="relative mt-8 flex flex-col w-7/8 h-7/8 bg-background/30 z-50 backdrop-blur-md rounded-2xl">
                <h1 className="text-xl text-shadow-white text-shadow-xs font-mono tracking-wide font-bold mt-4 mb-2 ml-14 text-foreground max-w-full hyphens-auto md:hyphens-none">
                  User <span className="inline-block">{walletStartAddress}</span><span className="block sm:inline-block">{walletMidStartAddress}</span><span className="block sm:inline-block">{walletMidEndAddress}</span><span className="block md:inline-block">{walletEndAddress}&apos;s</span> dashboard
                </h1>
                
            isAdmin == true ? 
            (
                <p className="font-mono text-md text-foreground ml-14 mb-2 text-shadow-white text-shadow-xs">My Intellectual Property:</p>
                <div className="flex flex-row w-full justify-center items-center">
                  <div className="grid grid-cols-3 place-items-center bg-background p-1 mb-2">
                    <button disabled={curPointer === 1} id="back-btn" onClick={() => setCurPointer(curPointer-1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">back</button>
                    <p>{curPointer}</p>
                    <button disabled={curPointer === totalPage} id="next-btn" onClick={() => setCurPointer(curPointer+1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">next</button>
                  </div>             
                </div>
                <div className="h-full w-full mb-4 flex justify-center items-center">
                  <div className="h-full w-11/12 rounded-2xl bg-secondary/10 backdrop-blur-none grid grid-cols-3 grid-rows-2 place-items-center">
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                  </div>
                </div>
                )
                :(
                   <p className="font-mono text-md text-foreground ml-14 mb-2 text-shadow-white text-shadow-xs">My Intellectual Property:</p>
                <div className="flex flex-row w-full justify-center items-center">
                  <div className="grid grid-cols-3 place-items-center bg-background p-1 mb-2">
                    <button disabled={curPointer === 1} id="back-btn" onClick={() => setCurPointer(curPointer-1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">back</button>
                    <p>{curPointer}</p>
                    <button disabled={curPointer === totalPage} id="next-btn" onClick={() => setCurPointer(curPointer+1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">next</button>
                  </div>             
                </div>
                <div className="h-full w-full mb-4 flex justify-center items-center">
                  <div className="h-full w-11/12 rounded-2xl bg-secondary/10 backdrop-blur-none grid grid-cols-3 grid-rows-2 place-items-center">
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                    <IPComponent />
                  </div>
                </div>
                )
              </div>
            </div> 
            : 
            <ConnectionFailFallback></ConnectionFailFallback>
        )
      }
    </div>
    
  );
}
