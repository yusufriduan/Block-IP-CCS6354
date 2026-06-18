import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function POST(request: NextRequest) {
    try{
        const payload = await request.formData();
        // asset
        const file: File | null = payload.get("asset") as unknown as File;
        if (!file) {
            return NextResponse.json({ error: "Missing asset file" }, { status: 400 });
        }
        const assetUpload = await pinata.upload.public.file(file);

        // metadata.json
        const name = payload.get("name")?.toString() || "N/A";
        const description = payload.get("description")?.toString() || "N/A";
        const type = payload.get("type")?.toString() || "N/A";

        const staticMetadata = {
            ipName: name,
            ipDescription: description,
            ipType: type,
            ipPostedDate: Math.floor(Date.now() / 1000),
            asset_url: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${assetUpload.cid}`
        }

        const metadataUpload = await pinata.upload.public.json(staticMetadata);
        const wallet = payload.get("wallet");

        if (!wallet) {
            return NextResponse.json(
                { error: "Missing required query parameter: wallet" },
                { status: 400 }
            );
        }
        
        return NextResponse.json({ 
            success: true, 
            metadataCID: metadataUpload.cid,
            assetCID: assetUpload.cid
        }, { status: 200 });
        
    } catch (e) {
        return NextResponse.json(
            { error: `Internal Server Error: ${e}` },
            { status: 500 }
        )
    }    
}