import { NextResponse, type NextRequest } from "next/server";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function GET(request: NextRequest) {
    try{
        const { searchParams } = new URL(request.url);
        const tokenId = searchParams.get("tokenId");
        const wallet = searchParams.get("wallet");

        if(!tokenId){
            return NextResponse.json(
                {error: "No ip token found"},
                {status: 400}
            )
        }

        if(!wallet){
            return NextResponse.json(
                {error: "No wallet found"},
                {status: 400}
            )
        }

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
                const hasRevoked = await contract.hasRevokeVoted(tokenId, wallet);
                return NextResponse.json(
                    {hasRevoked: hasRevoked},
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
    } catch (e) {

    }
}