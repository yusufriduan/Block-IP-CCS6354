import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("IP Voting and Registry Contract", function () {
  
  // Setup Fixture: Deploys a fresh contract for every test execution
  async function deployIPFixture() {
    const [masterAdmin, admin2, user1, user2] = await ethers.getSigners();

    const IPFactory = await ethers.getContractFactory("IP");
    const ipContract = await IPFactory.deploy();

    const mintFee = ethers.parseEther("0.01");

    return { ipContract, masterAdmin, admin2, user1, user2, mintFee };
  }

  describe("Deployment", function () {
    it("Should set the deployer as Master and Admin, and totalAdmins to 1", async function () {
      const { ipContract, masterAdmin } = await loadFixture(deployIPFixture);
      
      const adminRole = await ipContract.ADMIN_ROLE();
      expect(await ipContract.hasRole(adminRole, masterAdmin.address)).to.be.true;
      expect(await ipContract.totalAdmins()).to.equal(1n);
    });
  });

  describe("Minting & Duplicate Protection", function () {
    it("Should revert if the minting fee is not paid", async function () {
      const { ipContract, user1 } = await loadFixture(deployIPFixture);
      
      await expect(
        ipContract.connect(user1).mint(user1.address, "image_hash_1", "meta_hash_1")
      ).to.be.revertedWith("Insufficient minting fee");
    });

    it("Should successfully mint and set status to Pending", async function () {
      const { ipContract, user1, mintFee } = await loadFixture(deployIPFixture);
      
      await ipContract.connect(user1).mint(user1.address, "unique_image_cid", "metadata_cid", { value: mintFee });
      
      const ipData = await ipContract.ipInfos(1);
      expect(ipData.imageCID).to.equal("unique_image_cid");
      expect(ipData.status).to.equal(0n); // 0 corresponds to IPStatus.Pending
      expect(ipData.approvalVotes).to.equal(0n);
    });

    it("Should block duplicate image assets from being registered (Plagiarism Check)", async function () {
      const { ipContract, user1, user2, mintFee } = await loadFixture(deployIPFixture);
      
      // First legitimate registration
      await ipContract.connect(user1).mint(user1.address, "shared_image_cid", "meta_1", { value: mintFee });
      
      // Second malicious attempt with the same image content
      await expect(
        ipContract.connect(user2).mint(user2.address, "shared_image_cid", "meta_2", { value: mintFee })
      ).to.be.revertedWith("This image asset has already been registered globally!");
    });
  });

  describe("DAO Governance & Expiration", function () {
    const lifespan = 365 * 24 * 60 * 60; // 30 days in seconds
    it("Should process votes and dynamically activate asset timeline boundaries", async function () {
      const { ipContract, masterAdmin, admin2, user1, mintFee } = await loadFixture(deployIPFixture);
      
      // Setup: Add an admin and mint a pending asset
      await ipContract.connect(masterAdmin).addAdmin(admin2.address);
      await ipContract.connect(user1).mint(user1.address, "image_xyz", "meta_xyz", { value: mintFee });

      // Initially, the IP should be invalid because it is Pending
      expect(await ipContract.isValidIP(1)).to.be.false;

      // Vote 1 (Master Admin)
      await ipContract.connect(masterAdmin).vote(1, lifespan);
      let ipData = await ipContract.ipInfos(1);
      expect(ipData.status).to.equal(0n); // Still Pending

      // Vote 2 (Admin 2) -> Reaches majority consensus (> 2/2)
      await ipContract.connect(admin2).vote(1, lifespan);
      ipData = await ipContract.ipInfos(1);
      
      expect(ipData.status).to.equal(1n); // Changes to Active
      expect(ipData.dateApproved).to.be.greaterThan(0n);
      expect(ipData.dateExpired).to.be.greaterThan(blockTimestampPlaceholder());
      
      // Real-time helper should now validate enforcement status as true
      expect(await ipContract.isValidIP(1)).to.be.true;
    });

    it("Should prevent double voting profiles", async function () {
      const { ipContract, masterAdmin, admin2, user1, mintFee } = await loadFixture(deployIPFixture);
      
      await ipContract.connect(masterAdmin).addAdmin(admin2.address);
      await ipContract.connect(user1).mint(user1.address, "image_abc", "meta_abc", { value: mintFee });
      
      await ipContract.connect(masterAdmin).vote(1, lifespan);
      
      await expect(
        ipContract.connect(masterAdmin).vote(1, lifespan)
      ).to.be.revertedWith("Admin has already voted on this IP");
    });
  });

  describe("System Security Parameters", function () {
    it("Should enforce Soulbound mechanics against transit vectors", async function () {
      const { ipContract, user1, user2, mintFee } = await loadFixture(deployIPFixture);
      
      await ipContract.connect(user1).mint(user1.address, "image_sbt", "meta_sbt", { value: mintFee });
      
      await expect(
        ipContract.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Error: IP Records are non-transferable");
    });

    it("Should allow master to securely clear out accumulated protocol value", async function () {
      const { ipContract, masterAdmin, user1, mintFee } = await loadFixture(deployIPFixture);
      
      await ipContract.connect(user1).mint(user1.address, "image_finance", "meta_finance", { value: mintFee });
      
      const initialBalance = await ethers.provider.getBalance(masterAdmin.address);
      const tx = await ipContract.connect(masterAdmin).withdraw();
      const receipt = await tx.wait();
      
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;
      const finalBalance = await ethers.provider.getBalance(masterAdmin.address);

      expect(finalBalance).to.equal(initialBalance - gasSpent + mintFee);
    });
  });
});

// Helper utility to keep checks uniform
function blockTimestampPlaceholder() {
  return BigInt(Math.floor(Date.now() / 1000) - 10000);
}