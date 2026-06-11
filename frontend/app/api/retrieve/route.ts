import { NextResponse, type NextRequest } from "next/server";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function GET(request: NextRequest){
    try{
        const {searchParams} = new URL(request.url);
        const wallet = searchParams.get("wallet");

        if (!wallet) {
            return NextResponse.json(
                { error: "Missing required query parameter: clientId" },
                { status: 400 }
            );
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_SERVER_URL);

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if(contractAddress){
            const contract = new ethers.Contract(
                contractAddress,
                contractArtifact.abi, 
                provider
            );

            // first pull all ips from smart contract with their dynamic metadata
            const intellectualPropertyList = await contract.getUserIPs(wallet);
            const ipPromises = intellectualPropertyList.map(async (intellectualProperty: any) => {
                try {
                    const metadataURI = await contract.tokenURI(intellectualProperty.tokenId);
                    const metadataUrl = metadataURI.replace("ipfs://", process.env.NEXT_PUBLIC_PINATA_GATEWAY);
                    
                    const response = await fetch(metadataUrl);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch metadata from Pinata: ${response.statusText}`);
                    }

                    const pinataData = await response.json();
                    
                    return {
                        ipName: pinataData.ipName || "Unnamed Asset",
                        ipDescription: pinataData.ipDescription || "No description provided",
                        ipType: pinataData.ipType || "No type selected",
                        ipPostedDate: pinataData.ipPostedDate || "N/A",
                        ipApprovedDate: Number(intellectualProperty.dateApproved),
                        ipExpiredDate: Number(intellectualProperty.dateExpired),
                        ipStatus: Number(intellectualProperty.status),
                        tokenId: intellectualProperty.tokenId.toString(),
                        ipAsset: pinataData.asset_url || "N/A"
                    };

                } catch (error) {
                    console.error(`Error processing asset data inside loop:`, error);

                    return {
                        ipName: "Error Loading Data",
                        ipDescription: "Could not retrieve cloud file metadata matching this token.",
                        ipType: "Error loading type",
                        ipPostedDate: "N/A",
                        ipApprovedDate: Number(intellectualProperty.dateApproved),
                        ipExpiredDate: Number(intellectualProperty.dateExpired),
                        ipStatus: Number(intellectualProperty.status),
                        tokenId: intellectualProperty.tokenId.toString(),
                        ipAsset: intellectualProperty.imageCID
                    };
                }
            });

            // Fire all fetches in parallel. Resolves instantly instead of sequentially slowing down
            const formattedList = await Promise.all(ipPromises);
            console.log("Cleaned Array:", formattedList);
            return NextResponse.json(
                {ipList: formattedList},
                {status: 200}
            )
        }

    } catch (e) {
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        )
    }
}