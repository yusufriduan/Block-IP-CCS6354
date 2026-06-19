"use client"

import { Header } from "../component/Header"
import { Suspense } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

interface DetailsData {
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

const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "N/A";
    const d = new Date(timestamp * 1000).toLocaleString();
    return d.slice(0, 16) + d.slice(-2);
};

function DetailsContent() {
    const searchParams = useSearchParams();
    const dataParam = searchParams.get("data");

    const data = useMemo<DetailsData | null>(() => {
        if (!dataParam) return null;
        try {
            return JSON.parse(decodeURIComponent(dataParam)) as DetailsData;
        } catch (e) {
            console.log(e);
            return null;
        }
    }, [dataParam]);

    if (!data) return <p className="p-4 text-center">Unauthorized access</p>;

    const ipPostedDate = formatDate(data.ipPostedDate);
    const ipApprovedDate = formatDate(data.ipApprovedDate);
    const ipExpiredDate = formatDate(data.ipExpiredDate);

    return (
        <div id="dashboard-ui" className="flex flex-col w-screen mt-8 h-screen justify-center items-center bg-background">
            <div id="overlay-content" className="relative mt-8 flex flex-col w-7/8 h-11/12 bg-secondary z-50 rounded-2xl">
                <div className="h-full w-full mb-4 flex flex-col justify-center items-center">
                    <div className="relative h-48 w-48 aspect-square rounded-2xl overflow-hidden m-4 cursor-pointer">
                        <Image src={data.ipAsset} title={data.ipName} alt="example" fill className="object-cover" sizes="768px" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <h1 className="font-mono text-2xl font-bold justify-self-end">Title:</h1>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipName}</p>
                        <p className="font-mono text-2xl font-bold justify-self-end">IP Description:</p>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipDescription}</p>
                        <p className="font-mono text-2xl font-bold justify-self-end">IP Type:</p>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.ipType}</p>
                        <p className="font-mono text-2xl font-bold justify-self-end">IP Status:</p>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">
                            {data.ipExpiredDate < Math.floor(Date.now() / 1000) && data.ipExpiredDate !== 0 && ipStatuses[data.ipStatus] != "Revoked"
                                ? "Expired"
                                : ipStatuses[data.ipStatus]}
                        </p>
                        <p className="font-mono text-2xl font-bold justify-self-end">Date Posted:</p>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">{ipPostedDate}</p>
                        <p className="font-mono text-2xl font-bold justify-self-end">Date Approved:</p>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">{ipApprovedDate}</p>
                        <p className="font-mono text-2xl font-bold justify-self-end">Date Expired:</p>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">{ipExpiredDate}</p>
                        <p className="font-mono text-2xl font-bold justify-self-end">Owner:</p>
                        <p className="text-xl font-medium font-mono ml-1 justify-self-start">{data.owner.slice(0, 5) + "..." + data.owner.slice(-3)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Details() {
    return (
        <div className="h-screen max-w-screen flex flex-col overflow-auto sm:overflow-hidden">
            <Header isDashboard={false} isRegister={false} isCredit={false} />
            <Suspense fallback={<p className="text-center mt-12">Loading...</p>}>
                <DetailsContent />
            </Suspense>
        </div>
    );
}
