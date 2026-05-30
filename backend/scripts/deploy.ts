import { ethers } from "hardhat";

async function main() {
    const IPContract = await ethers.getContractFactory("IP");
    const ipContract = await IPContract.deploy();
    await ipContract.waitForDeployment();
    console.log("IP Contract deployed to:", await ipContract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});