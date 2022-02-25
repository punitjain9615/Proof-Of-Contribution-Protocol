// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./DAOManager.sol";
import "./POCPRoles.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

contract POCP is
  Initializable,
  ERC721Upgradeable,
  ERC721EnumerableUpgradeable,
  ERC721URIStorageUpgradeable,
  PausableUpgradeable,
  DAOManager,
  UUPSUpgradeable,
  POCPRoles
{
  address private _trustedForwarder;

  // approved badges
  // minted badges

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() initializer {}

  struct Badge {
    string ipfsUri;
    bytes32 daoUuid;
    address approvedBy;
    bool isMinted;
    uint256 mintIndex;
  }

  struct BadgeMap {
    mapping(uint256 => Badge) badgeMap;
    bool flag;
  }

  uint256 badgeCount;

  // claimer -> {approvedBadgeId : {  }}
  mapping(address => BadgeMap) private badges;

  function initialize(address trustedForwarder) public initializer {
    __ERC721_init("POCP", "POCP");
    __ERC721Enumerable_init();
    __ERC721URIStorage_init();
    __Pausable_init();
    __UUPSUpgradeable_init();
    POCPRoles.initialize();
    _trustedForwarder = trustedForwarder;
  }

  function pause() public onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function safeMint(address to, uint256 tokenId) public {
    _safeMint(to, tokenId);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  )
    internal
    override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    whenNotPaused
  {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(UPGRADER_ROLE)
  {}

  // The following functions are overrides required by Solidity.

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(
      ERC721Upgradeable,
      ERC721EnumerableUpgradeable,
      AccessControlUpgradeable
    )
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function approve(
    uint256 numberOfTokens,
    bytes32 daoUuid,
    string[] memory tokenURIs,
    address[] memory mintTo
  ) public onlyApprover(daoUuid, _msgSender()) whenNotPaused {
    address approver = _msgSender();
    uint256 badgeIndex = badgeCount;
    for (uint256 i = 0; i < numberOfTokens; i++) {
      Badge memory badge = Badge({
        ipfsUri: tokenURIs[i],
        daoUuid: daoUuid,
        approvedBy: approver,
        isMinted: false,
        mintIndex: 0
      });
      badges[mintTo[i]].badgeMap[badgeIndex] = badge;
    }
  }

  function mint(uint256 badgeId) public payable whenNotPaused {
    require(badges[_msgSender()].flag == true, "No approved badges");
    Badge memory badge = badges[_msgSender()].badgeMap[badgeId];
    require(badge.isMinted == false, "Badge already minted");
    uint256 mintIndex = totalSupply();
    _safeMint(_msgSender(), mintIndex);
    _setTokenURI(mintIndex, badge.ipfsUri);
  }

  function _burn(uint256 tokenId)
    internal
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
  {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  function isTrustedForwarder(address forwarder)
    public
    view
    virtual
    returns (bool)
  {
    return forwarder == _trustedForwarder;
  }

  function _msgSender()
    internal
    view
    override(ContextUpgradeable)
    returns (address sender)
  {
    if (isTrustedForwarder(msg.sender)) {
      // The assembly code is more direct than the Solidity version using `abi.decode`.
      assembly {
        sender := shr(96, calldataload(sub(calldatasize(), 20)))
      }
    } else {
      return super._msgSender();
    }
  }

  function _msgData()
    internal
    view
    override(ContextUpgradeable)
    returns (bytes calldata)
  {
    if (isTrustedForwarder(msg.sender)) {
      return msg.data[:msg.data.length - 20];
    } else {
      return super._msgData();
    }
  }
}
