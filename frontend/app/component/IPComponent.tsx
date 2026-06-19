"use client";

import Image from "next/image"
import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

interface IPComponentData{
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

interface IPComponentProp{
    data: IPComponentData;
    isAdmin: boolean;
    wallet: string;
}

const ipStatuses = ["Pending", "Active", "Revoked", "Rejected"];

export const IPComponent = ({data, isAdmin, wallet}: IPComponentProp) => {

    const router = useRouter();

    const [voteStatus, setVoteStatus] = useState<boolean>(false);
    const [totalAdmins, setTotalAdmins] = useState<number>(1);
    const [currentApprovalVotes, setCurrentApprovalVotes] = useState<number>(data.approvalVotes);
    const [revokeStatus, setRevokeStatus] = useState<boolean>(false);
    const [isApproving, setIsApproving] = useState<boolean>(false);
    const [isRejecting, setIsRejecting] = useState<boolean>(false);
    const [isRevoking, setIsRevoking] = useState<boolean>(false);
    const [disableButton, setDisableButton] = useState<boolean>(false);

    function handleOnClick(){
        const dataJson = JSON.stringify(data);
        router.push(`/details?data=${encodeURIComponent(dataJson)}`);
    }

    useEffect(() => {
        async function getHasVoted(tokenId: string, wallet: string) {
            const res = await fetch(`/api/getHasVoted?tokenId=${tokenId}&wallet=${wallet}`);
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
                console.log(res.totalAdmins);
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
    }, [])

    async function vote(decision: string, ipType: string, tokenId: number){
        setDisableButton(true);
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
                    setIsApproving(true);
                    const tx = await contract.mintVote(tokenId, lifespan);
                    await tx.wait();
                    setCurrentApprovalVotes(currentApprovalVotes+1);
                    setIsApproving(false);
                    data.approvalVotes++;
                } else if (decision == "Reject"){
                    setIsRejecting(true);
                    const tx = await contract.rejectVote(tokenId);
                    await tx.wait();
                    setIsRejecting(false);
                }

                window.location.reload();
            }

            setVoteStatus(true);
            alert("Successfully voted!");
        } catch (e) {
            alert("Voting failed! Check if you has sufficient ETH!");
        }
        setDisableButton(false);
    }

    async function revoke(tokenId: number){
        try {
            setDisableButton(true);
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

                setIsRevoking(true);
                const tx = await contract.revokeVote(tokenId);
                await tx.wait();
                setIsRevoking(false);
            }

            setRevokeStatus(true);
            alert("Successfully voted!");
        } catch (e) {
            alert("Transaction failed! Please check if you have enough ETH!");
        }
        setDisableButton(false);
        window.location.reload();
    }

    return(
        <div id="ip-component-container" className="flex flex-col h-48 w-72 bg-accent m-4 rounded-2xl cursor-pointer" onClick={handleOnClick}>
            <div id="ip-image" className="relative h-2/5 w-full top-0 left-0 rounded-t-2xl overflow-hidden">
                <Image src={data.ipAsset} alt="ip-asset" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" loading="eager"></Image>
            </div>
            <div id="ip-details" className="h-3/5 w-full flex flex-col items-start p-2">
                <h1 id="ip-title" className="font-mono font-semibold text-md">{data.ipName}</h1>
                <p className="font-mono text-xs">Type: {data.ipType}</p>
                <p className="font-mono text-xs">Status: <span className={(data.ipExpiredDate < Math.floor(Date.now() / 1000) && data.ipExpiredDate != 0 && ipStatuses[data.ipStatus] != "Revoked") ? "Expired" : ipStatuses[data.ipStatus]}>{(data.ipExpiredDate < Math.floor(Date.now() / 1000) && data.ipExpiredDate != 0 && ipStatuses[data.ipStatus] != "Revoked") ? "Expired" : ipStatuses[data.ipStatus]}</span></p>
                <p className="font-mono text-xs">Date Posted: {new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', hour12: true, timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(data.ipPostedDate*1000))}</p>
                <div className="w-full flex justify-center items-center">
                   {
                        isAdmin ? 
                            data.ipExpiredDate === 0 ? 
                                (
                                    voteStatus ? 
                                        <div id="progress-bar" className="w-4/5 bg-red-200 rounded-full h-8">
                                            <div className="bg-green-200 h-8 rounded-full flex items-center" style={{width: `${(data.approvalVotes / totalAdmins) * 100}%`}}>
                                                <p className="text-sm m-2">Total Votes: {data.approvalVotes}</p>
                                            </div>
                                        </div>
                                    :
                                    
                                    <div className="flex flex-row justify-center items-center w-full mt-1">
                                        <button disabled={disableButton} className="mr-4 h-6 w-20 bg-green-400 p-2 flex justify-center items-center rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={(e) => {e.stopPropagation(); vote("Approve", data.ipType, Number(data.tokenId))}}>{ isApproving ? "Approving..." : "Approve" }</button>
                                        <button disabled={disableButton} className="ml-4 h-6 w-20 bg-red-400 p-2 flex justify-center items-center rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={(e) => {e.stopPropagation(); vote("Reject", data.ipType, Number(data.tokenId))}}>{ isRejecting ? "Rejecting..." : "Reject" }</button>
                                    </div>
                                )
                            :
                            revokeStatus ? 
                                <div className="flex flex-row justify-center items-center w-full mt-1">
                                    <button className="ml-4 h-6 w-36 bg-gray-400 p-2 flex justify-center items-center rounded-lg cursor-not-allowed" disabled={true}>Voted to Revoke</button>
                                </div>
                            :
                                <div className="flex flex-row justify-center items-center w-full mt-1">
                                    <button disabled={disableButton} className="ml-4 h-6 w-20 bg-red-400 p-2 flex justify-center items-center rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={(e) => {e.stopPropagation(); revoke(Number(data.tokenId))}}>{ isRevoking ? "Revoking..." : "Revoke" }</button>
                                </div>
                        :
                        null
                    } 
                </div>
                
                
            </div>
        </div>
    )
}