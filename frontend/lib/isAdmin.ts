import { ethers } from "ethers";
import contractArtifact from "@/lib/contracts/IP.json";

export async function getIsAdmin(wallet: String){
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

            const adminHash = ethers.id("ADMIN_ROLE");
            const isAdmin = await contract.hasRole(adminHash, wallet);
            return isAdmin;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
    
}