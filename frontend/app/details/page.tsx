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

const ipStatuses = ["Pending", "Active", "Revoked"];

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
                    <h1 className="m-2 font-mono grid grid-cols-2 gap-2 place-content-end items-center"><span className="text-2xl font-bold">Title:</span><span className="text-xl font-medium ml-1">{data.ipName}</span></h1>
                    <p className="m-2 font-mono grid grid-cols-2 gap-2 place-content-end items-center"><span className="text-2xl font-bold">IP Type:</span><span className="text-xl font-medium ml-1">{data.ipType}</span></p>
                    <p className="m-2 font-mono grid grid-cols-2 gap-2 place-content-end items-center"><span className="text-2xl font-bold">IP Status:</span><span className="text-xl font-medium ml-1">{data.ipExpiredDate < Math.floor(Date.now() / 1000) && data.ipExpiredDate != 0 ? "Expired" : ipStatuses[data.ipStatus]}</span></p>
                    <p className="m-2 font-mono grid grid-cols-2 gap-2 place-content-end items-center"><span className="text-2xl font-bold">Date Posted:</span><span className="text-xl font-medium ml-1">{new Date(data.ipPostedDate * 1000).toLocaleString()}</span></p>
                    <p className="m-2 font-mono grid grid-cols-2 gap-2 place-content-end items-center"><span className="text-2xl font-bold">Date Approved:</span><span className="text-xl font-medium ml-1">{data.ipApprovedDate == 0 ? "N/A" : new Date(data.ipApprovedDate * 1000).toLocaleString()}</span></p>
                    <p className="m-2 font-mono grid grid-cols-2 gap-2 place-content-end items-center"><span className="text-2xl font-bold">Date Expired:</span><span className="text-xl font-medium ml-1">{data.ipExpiredDate == 0 ? "N/A" : new Date(data.ipExpiredDate * 1000).toLocaleString()}</span></p>
                    <p className="m-2 font-mono grid grid-cols-2 gap-2 place-content-end items-center"><span className="text-2xl font-bold">Owner:</span><span className="text-xl font-medium ml-1">{data.owner}</span></p>
                </div>
              </div>
            </div> 
    </div>
  );
}