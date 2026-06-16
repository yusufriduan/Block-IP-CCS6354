import { NextRequest, NextResponse } from "next/server";
import contractArtifact from "@/lib/contracts/IP.json";
import { ethers } from "ethers";

export async function  POST(request: NextRequest) {
    try{

        const isOwner = request.cookies.get("owner_session");

        if(!isOwner){
            return NextResponse.json(
                { error: "User not Owner" },
                { status: 400 }
            )
        }

        const body = await request.json();
        const { newAdmin } = body;

        if(!newAdmin){
            return NextResponse.json(
                { error: "No Wallet Received" },
                { status: 400 }
            )
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_SERVER_URL);

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if(contractAddress){
            const contract = new ethers.Contract(
                contractAddress,
                contractArtifact.abi, 
                provider
            );

            await contract.addAdmin(newAdmin);
            return NextResponse.json(
                { success: "Admin successfully added" },
                { status: 200 }
            )
        }
    }  catch (e) {
        return NextResponse.json(
            { error: "Admin already added", errorMsg: e },
            { status: 400 }
        )
    }
}