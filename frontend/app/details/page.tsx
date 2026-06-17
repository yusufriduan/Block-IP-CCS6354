"use client"

import { Header } from "../component/Header"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

interface DetailsData{
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

const ipStatuses = ["Pending", "Active", "Revoked", "Rejected"];

export default function Details(){

    const searchParams = useSearchParams();
    const dataParam = searchParams.get("data");
    let data: DetailsData;

    if(dataParam){
        try{
            data = JSON.parse(decodeURIComponent(dataParam)) as DetailsData;
        } catch (e) {
            console.log(e);
            return(
                <p>Unauthorized access</p>
            )
        }
    } else {
        return(
            <p>Unauthorized access</p>
        )
    }

    if(!data){
        return(
            <p>Unauthorized access</p>
        )
    }

    return(
    <div className="h-screen w-screen flex flex-col overflow-auto sm:overflow-hidden">
      <Header isDashboard={false} isRegister={false} isCredit={false}></Header>

            <div id="dashboard-ui" className="flex flex-col w-screen mt-8 h-screen justify-center items-center bg-background">
                <div id="overlay-content" className="relative mt-8 flex flex-col w-7/8 h-11/12 bg-secondary z-50 rounded-2xl">
                    <div className="h-full w-full mb-4 flex flex-col justify-center items-center">
                        <div className="relative h-48 w-48 aspect-square rounded-2xl overflow-hidden m-4">
                            <Image src={data.ipAsset} alt="example" fill className="object-cover" sizes="768px"></Image>
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <h1 className="font-mono text-2xl font-bold justify-self-end">Title:</h1>
                            <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipName}</p>
                            <p className="font-mono text-2xl font-bold justify-self-end">IP Type:</p>
                            <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipType}</p>
                            <p className="font-mono text-2xl font-bold justify-self-end">IP Status:</p>
                            <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipExpiredDate < Math.floor(Date.now() / 1000) && data.ipExpiredDate != 0 ? "Expired" : ipStatuses[data.ipStatus]}</p>
                            <p className="font-mono text-2xl font-bold justify-self-end">Date Posted:</p>
                            <p className="text-xl font-medium font-mono ml-1 justify-self-start">{new Date(data.ipPostedDate * 1000).toLocaleString()}</p>
                            <p className="font-mono text-2xl font-bold justify-self-end">Date Approved:</p>
                            <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipApprovedDate == 0 ? "N/A" : new Date(data.ipApprovedDate * 1000).toLocaleString()}</p>
                            <p className="font-mono text-2xl font-bold justify-self-end">Date Expired:</p>
                            <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipExpiredDate == 0 ? "N/A" : new Date(data.ipExpiredDate * 1000).toLocaleString()}</p>
                            <p className="font-mono text-2xl font-bold justify-self-end">Owner:</p>
                            <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.owner}</p>
                        </div>
                    </div>
                </div>
            </div> 
    </div>
  );
}