import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function POST(request: NextRequest){
    const isAdmin = request.cookies.get("admin_session");

    if(isAdmin){
        const { decision, tokenID, ipType, wallet } = await request.json();

        if(!decision){
            return NextResponse.json(
                {error: "No decision found!"},
                {status: 400}
            )
        }

        if(!tokenID){
            return NextResponse.json(
                {error: "No token ID found!"},
                {status: 400}
            )
        }

        if(!ipType){
            return NextResponse.json(
                {error: "No IP Type found!"},
                {status: 400}
            )
        }

        if(!wallet){
            return NextResponse.json(
                {error: "No wallet found!"},
                {status: 400}
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

            let lifespan;

            if(ipType == "Copyright"){
                lifespan = 70*365*24*60*60;
            } else if (ipType == "Trademark"){
                lifespan = 10*365*24*60*60;
            } else if (ipType == "Patent"){
                lifespan = 25*365*24*60*60;
            }
                
            try{

            } catch (e){
                return NextResponse.json(
                    {error: e},
                    {status: 500}
                )
            }
            if(decision === "Approve"){
                contract.mintVote(tokenID, lifespan, wallet);
                return NextResponse.json(
                    {response: "Successfully voted"},
                    {status: 200}
                )
            } else {
                // function to set voted to true
            }
        }
    } else {
        return NextResponse.json(
            {error: "User not authorised!"},
            {status: 500}
        )
    }
}