"use client";

import Image from "next/image"
import "../globals.css";
import { useEffect, useState } from "react";

interface IPComponentData{
    ipName: string,
    ipType: string,
    ipPostedDate: number,
    ipApprovedDate: number,
    ipExpiredDate: number,
    ipStatus: number,
    tokenId: string,
    ipAsset: string,
    approvalVotes: number 
}

interface IPComponentProp{
    data: IPComponentData,
    isAdmin: boolean,
    wallet: string
}

const ipStatuses = ["Pending", "Active", "Revoked"];

export const IPComponent = ({data, isAdmin, wallet}: IPComponentProp) => {

    const [voteStatus, setVoteStatus] = useState<boolean>(false);
    const [totalAdmins, setTotalAdmins] = useState<number>(1);

    useEffect(() => {
        async function getHasVoted(tokenId: string, wallet: string) {
            if(isAdmin){
                const res = await fetch(`/api/getHasApproved?tokenId=${tokenId}&wallet=${wallet}`);
                const requestData = await res.json();
                if(requestData.hasVoted){
                    setVoteStatus(true);
                }

                const res2 = await fetch("/api/getTotalAdmins");
                const requestData2 = await res2.json();
                if(requestData2.totalAdmins){
                    setTotalAdmins(requestData2.totalAdmins);
                }
            }
        }
        
        getHasVoted(data.tokenId, wallet);
    }, [])

    return(
        <div className="flex flex-col h-48 w-72 bg-accent m-4 rounded-2xl cursor-pointer">
            <div id="ip-image" className="relative h-2/5 w-full top-0 left-0 rounded-t-2xl overflow-hidden">
                <Image src={data.ipAsset} alt="ip-asset" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" loading="eager"></Image>
            </div>
            <div id="ip-details" className="h-3/5 w-full flex flex-col items-start p-2">
                <h1 id="ip-title" className="font-mono font-semibold text-md">{data.ipName}</h1>
                <p className="font-mono text-xs">Type: {data.ipType}<span className="ml-1">...</span></p>
                <p className="font-mono text-xs">Status: <span className={data.ipExpiredDate < Math.floor(Date.now() / 1000) ? "Expired" : ipStatuses[data.ipStatus]}>{data.ipExpiredDate < Math.floor(Date.now() / 1000) ? "Expired" : ipStatuses[data.ipStatus]}</span></p>
                <p className="font-mono text-xs">Date Posted: {new Date(data.ipPostedDate*1000).toLocaleTimeString()}</p>
                {
                    isAdmin ? 
                        data.ipApprovedDate === 0 ? 
                            (
                                voteStatus ? 
                                    <div className="flex flex-row justify-center items-center w-full mt-1">
                                        <button className="mr-4 h-6 w-20 bg-green-400 p-2 flex justify-center items-center rounded-lg cursor-pointer">Approve</button>
                                        <button className="ml-4 h-6 w-20 bg-red-400 p-2 flex justify-center items-center rounded-lg cursor-pointer">Reject</button>
                                    </div>
                                :
                                <div id="progress-bar" className="w-4/5 bg-red-200 rounded-full h-8">
                                    <div className="bg-green-200 h-8 rounded-full" style={{width: `${data.approvalVotes / totalAdmins}`}}>
                                        <p>Total Votes: {data.approvalVotes}</p>
                                    </div>
                                </div>
                            )
                        :
                        <div className="flex flex-row justify-center items-center w-full mt-1">
                            <button className="ml-4 h-6 w-20 bg-red-400 p-2 flex justify-center items-center rounded-lg cursor-pointer">Revoke</button>
                        </div>
                    :
                    null
                }
                
            </div>
        </div>
    )
}