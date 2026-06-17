"use client";

import Image from "next/image"
import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

interface IPComponentData{
    ipName: string,
    ipDescription: string,
    ipType: string,
    ipPostedDate: number,
    ipApprovedDate: number,
    ipExpiredDate: number,
    ipStatus: number,
    tokenId: string,
    ipAsset: string,
    approvalVotes: number,
    owner: string 
}

interface IPComponentProp{
    data: IPComponentData,
    isAdmin: boolean,
    wallet: string
}

const ipStatuses = ["Pending", "Active", "Revoked", "Rejected"];

export const IPComponent = ({data, isAdmin, wallet}: IPComponentProp) => {

    const router = useRouter();

    const [voteStatus, setVoteStatus] = useState<boolean>(false);
    const [totalAdmins, setTotalAdmins] = useState<number>(1);
    const [currentExpiredDate, setCurrentExpiredDate] = useState<number>(data.ipExpiredDate);
    const [currentApprovalVotes, setCurrentApprovalVotes] = useState<number>(data.approvalVotes);
    const [isRejected, setIsRejected] = useState<boolean>(ipStatuses[data.ipStatus] === "Rejected");
    const [revokeStatus, setRevokeStatus] = useState<boolean>(false);
    const [isRevoked, setIsRevoked] = useState<boolean>(ipStatuses[data.ipStatus] == "Revoked");

    function handleOnClick(){
        const dataJson = JSON.stringify(data);
        router.push(`/details?data=${encodeURIComponent(dataJson)}`);
    }

    useEffect(() => {
        async function getHasVoted(tokenId: string, wallet: string) {
            const res = await fetch(`/api/getHasApproved?tokenId=${tokenId}&wallet=${wallet}`);
            const requestData = await res.json();
            if(requestData.hasVoted){
                setVoteStatus(true);
            }
        }
        
        async function getHasRevoked(tokenId: string, wallet: string){
            const req = await fetch(`/api/getVotedForRevoke?tokenId=${tokenId}&wallet=${wallet}`);
            const res = await req.json();
            if(res.getHasRevoked){
                setRevokeStatus(true);
            }
        }

        async function getTotalAdmins(){
            const req = await fetch("/api/getTotalAdmins");
            const res = await req.json();
            if(res.totalAdmins){
                setTotalAdmins(res.totalAdmins);
            }
        }

        if(isAdmin){
            getTotalAdmins();
            if(data.ipExpiredDate === 0){
                getHasVoted(data.tokenId, wallet);
            } else {
                if(data.ipApprovedDate != 0){
                    getHasRevoked(data.tokenId, wallet);
                } 
            }
        }
        

        const ipContainer = document.querySelector("#ip-component-container") as HTMLDivElement;
        ipContainer.addEventListener('click', handleOnClick);
    }, [])

    async function vote(decision: string, ipType: string, tokenId: number){
        let lifespan;

        if(ipType == "Copyright"){
            lifespan = 70*365*24*60*60;
        } else if (ipType == "Trademark"){
            lifespan = 10*365*24*60*60;
        } else if (ipType == "Patent"){
            lifespan = 25*365*24*60*60;
        }


        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
        
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

            if(signer && contractAddress){
                const contract = new ethers.Contract(
                    contractAddress,
                    contractArtifact.abi,
                    signer
                );

                if(decision == "Approve"){
                    await contract.mintVote(tokenId, lifespan);
                    setCurrentApprovalVotes(currentApprovalVotes+1);
                    data.approvalVotes++;
                } else if (decision == "Reject"){
                    await contract.rejectVote(tokenId);
                    setIsRejected(true);
                }

                // check if the ip is rejected or approved on sc
                const ipInfo = await contract.ipInfos(tokenId);
                data.ipExpiredDate = Number(ipInfo.dateExpired);
                setCurrentExpiredDate(data.ipExpiredDate);
                setIsRejected(ipStatuses[ipInfo.ipStatus] === "Rejected")
            }

            setVoteStatus(true);
            alert("Successfully voted!");
        } catch (e) {
            alert("Admin has already voted before!");
        }
    }

    async function revoke(tokenId: number){
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
        
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

            if(signer && contractAddress){
                const contract = new ethers.Contract(
                    contractAddress,
                    contractArtifact.abi,
                    signer
                );

                await contract.revokeVote(tokenId);

                // check if the ip is rejected or approved on sc
                const ipInfo = await contract.ipInfos(tokenId);
                setIsRevoked(ipStatuses[ipInfo.ipStatus] === "Revoked")
            }

            setRevokeStatus(true);
            alert("Successfully voted!");
        } catch (e) {
            alert("Admin has already voted before!");
        }
    }

    return(
        <div id="ip-component-container" className="flex flex-col h-48 w-72 bg-accent m-4 rounded-2xl cursor-pointer">
            <div id="ip-image" className="relative h-2/5 w-full top-0 left-0 rounded-t-2xl overflow-hidden">
                <Image src={data.ipAsset} alt="ip-asset" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" loading="eager"></Image>
            </div>
            <div id="ip-details" className="h-3/5 w-full flex flex-col items-start p-2">
                <h1 id="ip-title" className="font-mono font-semibold text-md">{data.ipName}</h1>
                <p className="font-mono text-xs">Type: {data.ipType}</p>
                <p className="font-mono text-xs">Status: <span className={(data.ipExpiredDate < Math.floor(Date.now() / 1000) && data.ipExpiredDate != 0) ? "Expired" : ipStatuses[data.ipStatus]}>{(data.ipExpiredDate < Math.floor(Date.now() / 1000) && data.ipExpiredDate != 0) ? "Expired" : ipStatuses[data.ipStatus]}</span></p>
                <p className="font-mono text-xs">Date Posted: {new Date(data.ipPostedDate*1000).toLocaleString()}</p>
                {
                    isAdmin ? 
                        currentExpiredDate === 0 ? 
                            (
                                voteStatus ? 
                                    <div id="progress-bar" className="w-4/5 bg-red-200 rounded-full h-8">
                                        <div className="bg-green-200 h-8 rounded-full" style={{width: `${data.approvalVotes / totalAdmins}`}}>
                                            <p>Total Votes: {data.approvalVotes}</p>
                                        </div>
                                    </div>
                                :
                                
                                <div className="flex flex-row justify-center items-center w-full mt-1">
                                    <button className="mr-4 h-6 w-20 bg-green-400 p-2 flex justify-center items-center rounded-lg cursor-pointer" onClick={() => {vote("Approve", data.ipType, Number(data.tokenId))}}>Approve</button>
                                    <button className="ml-4 h-6 w-20 bg-red-400 p-2 flex justify-center items-center rounded-lg cursor-pointer" onClick={() => {vote("Reject", data.ipType, Number(data.tokenId))}}>Reject</button>
                                </div>
                            )
                        :
                        isRejected ? null :
                        (
                            isRevoked ? null :
                                revokeStatus ? 
                                    <div className="flex flex-row justify-center items-center w-full mt-1">
                                        <button className="ml-4 h-6 w-20 bg-gray-400 p-2 flex justify-center items-center rounded-lg cursor-pointer">Voted to Revoke</button>
                                    </div>
                                :
                                    <div className="flex flex-row justify-center items-center w-full mt-1">
                                        <button className="ml-4 h-6 w-20 bg-red-400 p-2 flex justify-center items-center rounded-lg cursor-pointer" onClick={() => {revoke(Number(data.tokenId))}}>Revoke</button>
                                    </div>
                        )
                    :
                    null
                }
                
            </div>
        </div>
    )
}