// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Intellectual Property (IP) Contract
/// @author Yusuf Riduan
/// @notice A contract for managing intellectual property rights with an optimized hybrid storage pattern
contract IP is ERC721URIStorage, AccessControl, ReentrancyGuard {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public totalAdmins;
    
    uint256 private _nextTokenId;
    uint256 public mintFee = 0.01 ether;

    enum IPStatus { Pending, Active, Revoked }

    // On-Chain Storage Struct: Only holds properties critical to runtime logic/validation
    struct IPInfo {
        uint256 tokenId;
        bytes32 imageCID;      // Cryptographic anchor used for instant reverse-lookups & duplicate checks
        uint256 dateApproved; // Dynamic administrative checkpoint timestamp
        uint256 dateExpired;  // Lifecycle timeline gatekeeper 
        IPStatus status;      // Active state gatekeeper
        uint256 approvalVotes; // Active DAO governance mechanism
    }

    mapping(uint256 => IPInfo) public ipInfos;
    mapping(bytes32 => uint256) public imageToTokenId;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    constructor() ERC721("IntellectualProperty", "IP") {
            _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
            _grantRole(ADMIN_ROLE, msg.sender);
            totalAdmins = 1;
    }

    

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Adds a new admin for voting on IP approvals
    /// @param newAdmin new Wallet Address to be assigned as admin
    function addAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!hasRole(ADMIN_ROLE, newAdmin), "Wallet is already an admin");
        _grantRole(ADMIN_ROLE, newAdmin);
        totalAdmins++;
    }

    /// @notice Mints a new IP token using the optimized hybrid data split
    /// @param to IP creator wallet address
    /// @param imageCID The raw IPFS hash of the visual asset/file 
    /// @param metadataCID The IPFS hash pointing to the static JSON payload (Title, Description, IP Type, Date Posted)
    function mint(
        address to, 
        bytes32 imageCID, 
        string memory metadataCID
    ) public payable nonReentrant returns (uint256) {
        require(msg.value >= mintFee, "Insufficient minting fee");
        
        // O(1) Constant-Time Protection against plagiarized/duplicate canvas content
        require(imageToTokenId[imageCID] == 0, "This image asset has already been registered globally!");

        _nextTokenId++;
        uint256 currentTokenId = _nextTokenId;
        
        // Execute base minting mechanics
        _mint(to, currentTokenId);
        
        // OpenZeppelin writes the Metadata CID to its internal hidden mapping automatically
        _setTokenURI(currentTokenId, string.concat("ipfs://", metadataCID));

        // Initialize active runtime properties natively on-chain
        ipInfos[currentTokenId] = IPInfo({
            tokenId: currentTokenId,
            imageCID: imageCID,
            dateApproved: 0,
            dateExpired: 0,
            status: IPStatus.Pending,
            approvalVotes: 0
        });

        // Globally lock this Image CID to this Token ID 
        imageToTokenId[imageCID] = currentTokenId;

        return currentTokenId;
    }

    /// @notice Allows admins to vote on a pending IP
    /// @param tokenId NFT ID to vote
    /// @param lifespan The duration for which the IP will remain active
    function vote(uint256 tokenId, uint256 lifespan) public onlyRole(ADMIN_ROLE) {
        require(ipInfos[tokenId].status == IPStatus.Pending, "IP must be pending to vote");
        require(!hasVoted[tokenId][msg.sender], "Admin has already voted on this IP");
        
        hasVoted[tokenId][msg.sender] = true;
        ipInfos[tokenId].approvalVotes++;

        if (ipInfos[tokenId].approvalVotes > (totalAdmins / 2)) {
            ipInfos[tokenId].dateApproved = block.timestamp;
            ipInfos[tokenId].dateExpired = block.timestamp + lifespan;
            ipInfos[tokenId].status = IPStatus.Active;
        }
    }


    /// @notice Fetches all IPs owned by a user
    /// @dev Leverages ERC-721 base methods alongside custom runtime struct assembly
    /// @param user User Wallet address
    function getUserIPs(address user) public view returns (IPInfo[] memory) {
        uint256 userBalance = balanceOf(user);
        IPInfo[] memory userIPs = new IPInfo[](userBalance);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _nextTokenId; i++) {
            // Evaluates OpenZeppelin's internal _owners array natively
            if (_ownerOf(i) == user) {
                userIPs[index] = ipInfos[i];
                index++;
            }
        }
        return userIPs;
    }

    /// @notice Revokes an IP, changing its status to Revoked
    /// @param tokenId NFT ID to be revoked
    function revoke(uint256 tokenId) public onlyRole(ADMIN_ROLE) {
        require(ipInfos[tokenId].status == IPStatus.Active, "IP must be active to revoke");
        require(block.timestamp < ipInfos[tokenId].dateExpired, "IP already expired");
        
        ipInfos[tokenId].status = IPStatus.Revoked;
    }

    /// @notice Real-time validation helper to assess live registry enforcement status
    /// @param tokenId NFT ID to evaluate
    function isValidIP(uint256 tokenId) public view returns (bool) {
        IPInfo memory ip = ipInfos[tokenId];
        if (ip.status != IPStatus.Active) return false;
        if (block.timestamp > ip.dateExpired) return false;
        return true;
    }

    /// @notice Overrides standard transfer behavior to make NFT non-transferable after minting (Soulbound)
    /// @dev Block transfers unless it's initial mint (from address(0)) or burning (to address(0))
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Error: IP Records are non-transferable");
        return super._update(to, tokenId, auth);
    }

    /// @notice Standard administration withdrawal function to pull protocol treasury value
    function withdraw() public onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH available to withdraw");
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}