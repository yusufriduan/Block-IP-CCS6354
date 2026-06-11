import { NextResponse, type NextRequest } from "next/server";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function GET() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_SERVER_URL);

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if(contractAddress){
        const contract = new ethers.Contract(
            contractAddress,
            contractArtifact.abi, 
            provider
        );

        try {
            const nextTokenId = await contract._nextTokenId();
            const totalTokens = Number(nextTokenId);

            if (totalTokens === 0) return [];

            const promises = [];
            for (let i = 1; i <= totalTokens; i++) {
            promises.push(contract.ipInfos(i));
            }

            const rawResults = await Promise.all(promises);

            const allIPs = rawResults.map(async (intellectualProperty: any) => {
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
                        ipAsset: pinataData.asset_url || "N/A",
                        approvalVotes: Number(intellectualProperty.approvalVotes),
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
                        ipAsset: intellectualProperty.imageCID,
                        approvalVotes: Number(intellectualProperty.approvalVotes),
                    };
                }
            });

            const formattedList = await Promise.all(allIPs);

            return NextResponse.json(
                {ipList: formattedList},
                {status: 200}
            )
        } catch (error) {
            console.error("Error fetching all IP infos:", error);
            return NextResponse.json(
                {error: "Internal Server Error"},
                {status: 500}
            )
        }
    }
}