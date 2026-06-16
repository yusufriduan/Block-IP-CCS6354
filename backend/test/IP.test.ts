import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("IP Voting and Registry Contract", function () {
  
  // Setup Fixture: Deploys a fresh contract for every test execution
  async function deployIPFixture() {
    // Simulating the DAO environment with multiple admins and a standard user
    const [masterAdmin, shawn, weiSiang, regularUser] = await ethers.getSigners();
    
    const IPFactory = await ethers.getContractFactory("IP");
    const ipContract = await IPFactory.deploy();
    
    const mintFee = ethers.parseEther("0.01");
    const defaultLifespan = 365 * 24 * 60 * 60; // 1 Year in seconds

    return { ipContract, masterAdmin, shawn, weiSiang, regularUser, mintFee, defaultLifespan };
  }

  describe("1. Deployment & Access Control", function () {
    it("Should set the deployer as Master and Admin, and totalAdmins to 1", async function () {
      const { ipContract, masterAdmin } = await loadFixture(deployIPFixture);
      
      const adminRole = await ipContract.ADMIN_ROLE();
      expect(await ipContract.hasRole(adminRole, masterAdmin.address)).to.be.true;
      expect(await ipContract.totalAdmins()).to.equal(1n);
    });

    it("Should allow Master Admin to add new admins securely", async function () {
      const { ipContract, masterAdmin, shawn, weiSiang } = await loadFixture(deployIPFixture);
      
      await ipContract.connect(masterAdmin).addAdmin(shawn.address);
      await ipContract.connect(masterAdmin).addAdmin(weiSiang.address);
      
      expect(await ipContract.totalAdmins()).to.equal(3n);
    });
  });

  describe("2. Minting & Soulbound Mechanics", function () {
    it("Should mint a pending IP and lock the image CID", async function () {
      const { ipContract, regularUser, mintFee } = await loadFixture(deployIPFixture);
      
      const imageCID = ethers.keccak256(ethers.toUtf8Bytes("image_1"));
      
      await expect(
        ipContract.connect(regularUser).mint(regularUser.address, imageCID, "meta_1", { value: mintFee })
      ).to.emit(ipContract, "Transfer");

      const ipData = await ipContract.ipInfos(1);
      expect(ipData.status).to.equal(0n); // 0 = Pending
      
      // Plagiarism check: Minting the same CID should fail
      await expect(
        ipContract.connect(regularUser).mint(regularUser.address, imageCID, "meta_2", { value: mintFee })
      ).to.be.revertedWith("This image asset has already been registered globally!");
    });

    it("Should prevent transferring the IP NFT (Soulbound)", async function () {
      const { ipContract, regularUser, shawn, mintFee } = await loadFixture(deployIPFixture);
      const imageCID = ethers.keccak256(ethers.toUtf8Bytes("image_soulbound"));
      
      await ipContract.connect(regularUser).mint(regularUser.address, imageCID, "meta_sb", { value: mintFee });

      // Attempting to send the NFT to Shawn's wallet should crash
      await expect(
        ipContract.connect(regularUser).transferFrom(regularUser.address, shawn.address, 1)
      ).to.be.revertedWith("Error: IP Records are non-transferable");
    });
  });

  describe("3. DAO Governance: 50% Thresholds & Cross-Checking", function () {
    it("Should approve an IP when exactly 50% or more admins vote", async function () {
      const { ipContract, masterAdmin, shawn, weiSiang, regularUser, mintFee, defaultLifespan } = await loadFixture(deployIPFixture);
      
      // Setup 3 Admins total
      await ipContract.connect(masterAdmin).addAdmin(shawn.address);
      await ipContract.connect(masterAdmin).addAdmin(weiSiang.address);

      const imageCID = ethers.keccak256(ethers.toUtf8Bytes("image_approve"));
      await ipContract.connect(regularUser).mint(regularUser.address, imageCID, "meta_a", { value: mintFee });

      // Vote 1 (33% - Not enough)
      await ipContract.connect(masterAdmin).mintVote(1, defaultLifespan);
      let ipData = await ipContract.ipInfos(1);
      expect(ipData.status).to.equal(0n); // Still Pending

      // Vote 2 (66% - Passes the 50% exact threshold!)
      await ipContract.connect(shawn).mintVote(1, defaultLifespan);
      ipData = await ipContract.ipInfos(1);
      
      expect(ipData.status).to.equal(1n); // 1 = Active
      expect(await ipContract.isValidIP(1)).to.be.true;
    });

    it("Should reject an IP and prevent cross-voting", async function () {
      const { ipContract, masterAdmin, shawn, weiSiang, regularUser, mintFee, defaultLifespan } = await loadFixture(deployIPFixture);
      
      await ipContract.connect(masterAdmin).addAdmin(shawn.address);
      await ipContract.connect(masterAdmin).addAdmin(weiSiang.address);

      const imageCID = ethers.keccak256(ethers.toUtf8Bytes("image_reject"));
      await ipContract.connect(regularUser).mint(regularUser.address, imageCID, "meta_r", { value: mintFee });

      // Shawn votes to Reject
      await ipContract.connect(shawn).rejectVote(1);
      
      // CROSS-CHECK TEST: Shawn changes his mind and tries to Approve. Should fail!
      await expect(
        ipContract.connect(shawn).mintVote(1, defaultLifespan)
      ).to.be.revertedWith("Admin has already voted to reject");

      // Wei Siang casts the final Reject vote
      await ipContract.connect(weiSiang).rejectVote(1);
      
      const ipData = await ipContract.ipInfos(1);
      expect(ipData.status).to.equal(3n); // 3 = Rejected
    });
  });

  describe("4. Revocation", function () {
    it("Should allow admins to revoke an Active IP", async function () {
      const { ipContract, masterAdmin, shawn, weiSiang, regularUser, mintFee, defaultLifespan } = await loadFixture(deployIPFixture);
      
      await ipContract.connect(masterAdmin).addAdmin(shawn.address);
      await ipContract.connect(masterAdmin).addAdmin(weiSiang.address);

      // Mint and fast-track to Active
      const imageCID = ethers.keccak256(ethers.toUtf8Bytes("image_revoke"));
      await ipContract.connect(regularUser).mint(regularUser.address, imageCID, "meta_rev", { value: mintFee });
      await ipContract.connect(masterAdmin).mintVote(1, defaultLifespan);
      await ipContract.connect(shawn).mintVote(1, defaultLifespan);

      // Now we revoke it
      await ipContract.connect(weiSiang).revokeVote(1);
      await ipContract.connect(shawn).revokeVote(1);

      const ipData = await ipContract.ipInfos(1);
      expect(ipData.status).to.equal(2n); // 2 = Revoked
      expect(await ipContract.isValidIP(1)).to.be.false;
    });
  });

  describe("5. Protocol Treasury", function () {
    it("Should allow ONLY the Master Admin to withdraw minting fees", async function () {
      const { ipContract, masterAdmin, regularUser, mintFee } = await loadFixture(deployIPFixture);
      
      // User pays 0.01 ETH to mint
      const imageCID = ethers.keccak256(ethers.toUtf8Bytes("image_money"));
      await ipContract.connect(regularUser).mint(regularUser.address, imageCID, "meta_m", { value: mintFee });

      // Hacker tries to steal it
      await expect(
        ipContract.connect(regularUser).withdraw()
      ).to.be.reverted; 

      // Master Admin withdraws it successfully
      const initialBalance = await ethers.provider.getBalance(masterAdmin.address);
      const tx = await ipContract.connect(masterAdmin).withdraw();
      const receipt = await tx.wait();
      
      // Calculate exact gas costs to ensure the math adds up precisely
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;
      const finalBalance = await ethers.provider.getBalance(masterAdmin.address);
      
      expect(finalBalance).to.equal(initialBalance + mintFee - gasSpent);
    });
  });
});