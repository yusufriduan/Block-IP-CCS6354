import { NextResponse, type NextRequest } from "next/server";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function GET(request: NextRequest){
    try{
        const adminCookie = request.cookies.get("admin_session");
        if(adminCookie){
            const provider = new ethers.JsonRpcProvider(process.env.RPC_SERVER_URL);

            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

            if(contractAddress){
                const contract = new ethers.Contract(
                    contractAddress,
                    contractArtifact.abi, 
                    provider
                );
                const adminCount = await contract.totalAdmins();
                return NextResponse.json(
                    {totalAdmins: Number(adminCount)},
                    {status: 200}
                )
            } else {
                return NextResponse.json(
                    {error: "Could not get contract"},
                    {status: 500}
                )
            }
        } else {
            return NextResponse.json(
                {error: "User not authorised"},
                {status: 400}
            )
        }
    } catch {
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        )
    }
}