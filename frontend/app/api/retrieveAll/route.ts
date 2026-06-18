import { NextResponse} from "next/server";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function GET() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_SERVER_URL);

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;

    if(contractAddress && METAMASK_PRIVATE_KEY){
        const signer = new ethers.Wallet(METAMASK_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(
            contractAddress,
            contractArtifact.abi, 
            signer
        );

        try {

            const rawResults = await contract.getAllIPs();
            

            const allIPs = rawResults.map(async (intellectualProperty: any) => {
                try {
                    const metadataURI = await contract.tokenURI(intellectualProperty.tokenId);
                    const owner = await contract.ownerOf(intellectualProperty.tokenId);
                    const cleanGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY?.endsWith('/') 
                        ? process.env.NEXT_PUBLIC_PINATA_GATEWAY 
                        : `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/`;
                    const cid = metadataURI.replace("ipfs://", "");
                    const metadataUrl = `https://${cleanGateway}ipfs/${cid}`;

                    const response = await fetch(metadataUrl);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch metadata from Pinata: ${response.statusText}`);
                    }

                    const pinataData = await response.json();
                    
                    return {
                        ipName: pinataData.ipName || "Unnamed Asset",
                        ipDescription: pinataData.ipDescription || "N/A",   
                        ipType: pinataData.ipType || "No type selected",
                        ipPostedDate: pinataData.ipPostedDate || "N/A",
                        ipApprovedDate: Number(intellectualProperty.dateApproved),
                        ipExpiredDate: Number(intellectualProperty.dateExpired),
                        ipStatus: Number(intellectualProperty.status),
                        tokenId: intellectualProperty.tokenId.toString(),
                        ipAsset: `https://${pinataData.asset_url}` || "N/A",
                        approvalVotes: Number(intellectualProperty.approvalVotes),
                        owner: owner
                    };

                } catch (error) {
                    console.error(`Error processing asset data inside loop:`, error);

                    return {
                        ipName: "Error Loading Data",
                        ipDescription: "Error loading Data",
                        ipType: "Error loading type",
                        ipPostedDate: "N/A",
                        ipApprovedDate: Number(intellectualProperty.dateApproved),
                        ipExpiredDate: Number(intellectualProperty.dateExpired),
                        ipStatus: Number(intellectualProperty.status),
                        tokenId: intellectualProperty.tokenId.toString(),
                        ipAsset: '/images/example.jpg',
                        approvalVotes: Number(intellectualProperty.approvalVotes),
                        owner: null
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