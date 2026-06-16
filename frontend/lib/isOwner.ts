import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function getIsOwner(wallet: String){
    if(!wallet){
        return false;
    }
    
    try{
        const provider = new ethers.JsonRpcProvider(process.env.RPC_SERVER_URL);

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if(contractAddress){
            const contract = new ethers.Contract(
                contractAddress,
                contractArtifact.abi, 
                provider
            );

            const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
            const isOwner = await contract.hasRole(DEFAULT_ADMIN_ROLE, wallet);
            return isOwner;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
    
}