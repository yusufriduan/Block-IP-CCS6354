// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Intellectual Property (IP) Contract
/// @author Yusuf Riduan
/// @notice A contract for managing intellectual property rights
contract IP is ERC721URIStorage, Ownable {
    
    uint256 private _nextTokenId;

    enum IPStatus { Pending, Active, Revoked }

    struct IPInfo {
        uint256 tokenId;
        address creator;
        uint256 datePosted;
        uint256 dateApproved;
        string ipType;
        string tokenURI;
        IPStatus status;
    }

    
    mapping(uint256 => IPInfo) public ipInfos;

    constructor()
        ERC721("IntellectualProperty", "IP")
        Ownable(msg.sender) {}

    /// @notice Mints a new IP token
    /// @param to IP creator wallet address
    /// @param ipType  Classification of IP (e.g., patent, trademark, copyright)
    /// @param tokenURI IPFS metadata link (contains the image and title)
    function mint(address to, string memory ipType, string memory tokenURI) public returns (uint256) {
        _nextTokenId++;
        uint256 currentTokenId = _nextTokenId;
        _mint(to, currentTokenId);
        _setTokenURI(currentTokenId, tokenURI);
        ipInfos[currentTokenId] = IPInfo({
            tokenId: currentTokenId,
            creator: to,
            datePosted: block.timestamp,
            dateApproved: 0,
            ipType: ipType,
            tokenURI: tokenURI,
            status: IPStatus.Pending
        });
        return currentTokenId;
    }

    /// @notice Fetches all IPs owned by a user
    /// @param user User Wallet address
    function getUserIPs(address user) public view returns (IPInfo[] memory) {
        uint256 userBalance = balanceOf(user);
        IPInfo[] memory userIPs = new IPInfo[](userBalance);
        uint256 index = 0;
        for (uint256 i = 1; i <= _nextTokenId; i++) {
            if (_ownerOf(i) == user) {
                userIPs[index] = ipInfos[i];
                index++;
            }
        }
        return userIPs;
    }

    /// @notice Approves an IP, setting approval timestamp
    /// @param tokenId NFT ID to be approve
    function approve(uint256 tokenId) public onlyOwner {
        require(ipInfos[tokenId].status == IPStatus.Pending, "IP must be pending to approve");
        ipInfos[tokenId].dateApproved = block.timestamp;
        ipInfos[tokenId].status = IPStatus.Active;
    }

    /// @notice Revokes an IP, changing its status to Revoked
    /// @param tokenId NFT ID to be revoked
    function revoke(uint256 tokenId) public onlyOwner {
        require(ipInfos[tokenId].status == IPStatus.Active, "IP must be active to revoke");
        ipInfos[tokenId].status = IPStatus.Revoked;
    }

    /// @notice Overrides standard transfer behavior to make NFT non-transferable after minting
    /// @dev Block transfers unless it's initial mint (from address(0))
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "Error: IP Records are non-transferable");
        return super._update(to, tokenId, auth);
    }
}