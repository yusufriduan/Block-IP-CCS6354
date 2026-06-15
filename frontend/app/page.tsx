"use client"

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Header } from "./component/Header";
import ConnectionFailFallback from "./component/ConnectionFailFallback";
import ConnectingInProgress from "./component/ConnectingInProgress";
import { IPComponent } from "./component/IPComponent";
import { getIsAdmin } from "@/lib/isAdmin";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [walletStartAddress, setWalletStartAddress] = useState<String>("");
  const [walletEndAddress, setWalletEndAddress] = useState<String>("");
  const [walletMidStartAddress, setWalletMidStartAddress] = useState<String>("");
  const [walletMidEndAddress, setWalletMidEndAddress] = useState<String>("");
  const [fullAddress, setFullAddress] = useState("");
  const [totalPage, setTotalPage] = useState<number>(1);
  const [curPointer, setCurPointer] = useState<number>(1);
  const [ipDataList, setIpList] = useState<ipInfo[]>();

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

    const init = async () => {
      const fullAddress = await connectWallet();
      if (!fullAddress) return;

      setFullAddress(fullAddress);

      try {
        const isAdminData = await fetch("/api/adminAuth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: fullAddress }),
          credentials: "include",
        });
        const isAdminJson = await isAdminData.json();
        if (isAdminJson.redirect) {
          router.push(isAdminJson.redirect);
        }
      } catch (error) {
        console.error("Failed to check admin status", error);
      }

      await getIPs(fullAddress);
    };

    init();

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Wallet changed detected!", accounts);
      
      fetch('/api/logout', { method: 'POST' })
        .then(() => {
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
  }, []);

  async function getIPs(fullAddress: String){
    const ipData =  await fetch(`/api/retrieve?wallet=${fullAddress}`);
    const ipDataJson = await ipData.json();
    if(ipDataJson.error){
      console.log("Error: ", ipDataJson.error);
    } else {
      setIpList(ipDataJson.ipList);
      if(ipDataJson.ipList){
        setTotalPage(Math.ceil(ipDataJson.ipList.length/6));
      }
    }  
  }

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

              <div id="overlay-content" className="relative mt-8 flex flex-col w-7/8 h-11/12 bg-background/30 z-50 backdrop-blur-md rounded-2xl">
                <h1 className="text-xl text-shadow-white text-shadow-xs font-mono tracking-wide font-bold mt-4 mb-2 ml-14 text-foreground max-w-full hyphens-auto md:hyphens-none">
                  User <span className="inline-block">{walletStartAddress}</span><span className="block sm:inline-block">{walletMidStartAddress}</span><span className="block sm:inline-block">{walletMidEndAddress}</span><span className="block md:inline-block">{walletEndAddress}&apos;s</span> dashboard
                </h1>
                  
                <p className="font-mono text-md text-foreground ml-14 mb-2 text-shadow-white text-shadow-xs">My Intellectual Property:</p>
                <div className="h-full w-full mb-4 flex justify-center items-center">
                    {
                      ipDataList && ipDataList.length > 0 ? 
                      <div className="w-11/12">
                        
                          <div className="h-full w-full rounded-2xl bg-secondary/10 backdrop-blur-none grid grid-cols-3 grid-rows-2 place-items-center">
                          {ipDataList.slice((curPointer-1) * 6, ((curPointer-1) * 6) + 6).map((ip, index) => (
                            <IPComponent data={ip} isAdmin={false} wallet={fullAddress} key={ip.tokenId || index}/>
                          ))} 
                        </div>
                        <div className="flex flex-row w-full justify-center items-center">
                            <div className="grid grid-cols-3 place-items-center bg-background p-1 mt-2">
                              <button disabled={curPointer === 1} id="back-btn" onClick={() => setCurPointer(curPointer-1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">back</button>
                              <p>{curPointer}</p>
                              <button disabled={curPointer === totalPage} id="next-btn" onClick={() => setCurPointer(curPointer+1)} className="cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400">next</button>
                            </div>             
                          </div>
                      </div>
                        
                        :
                        <div className="flex justify-center items-center flex-col">
                          <p className="font-bold font-mono text-3xl text-foreground text-shadow-white text-shadow-xs">Begin Protecting Your IP Now!</p>
                          <Link href={'/registerIP'} className="mt-4 p-4 bg-background rounded-2xl font-mono text-foreground shadow-sm shadow-black cursor-pointer transition-transform delay-150 duration-300 ease-out hover:scale-110">REGISTER NOW!</Link>
                        </div>
                    }
                </div>
                {/* )
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
                  </div>
                </div>
                ) */}
              </div>
            </div> 
            : 
            <ConnectionFailFallback></ConnectionFailFallback>
        )
      }
    </div>
    
  );
}
