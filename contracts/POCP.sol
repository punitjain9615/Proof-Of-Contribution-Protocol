// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
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
  EIP712Upgradeable,
  POCPRoles {
  address private _trustedForwarder;

  // constructor() initializer {}

  struct NFTVoucher {
    uint256 tokenId;
    uint256 minPrice;
    string uri;
    address approvedFor;
    bytes signature;
  }

  string private constant SIGNING_DOMAIN = "POCP";
  string private constant SIGNATURE_VERSION = "1";

  function initialize(address trustedForwarder) public initializer {
    __ERC721_init("POCP", "POCP");
    __ERC721Enumerable_init();
    __ERC721URIStorage_init();
    __Pausable_init();
    __UUPSUpgradeable_init();
    __EIP712_init(SIGNING_DOMAIN, SIGNATURE_VERSION);
    __POCPRoles_init();
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

  function register(string memory daoName) public whenNotPaused returns (bytes32) {
    bytes32 daoUuid = _registerDAO(daoName);
    return daoUuid;
  }

  function getDaoName(bytes32 daoUuid) public view whenNotPaused returns(string memory) {
    string memory daoName = _getDaoName(daoUuid);
    return daoName;
  }

  function claim(NFTVoucher calldata voucher) public payable whenNotPaused returns (uint256){
    address signer = _verify(voucher);

    // require(hasRole(MINTER_ROLE, signer), "Signature invalid or unauthorized");
    require(voucher.approvedFor == _msgSender(), "Not approved for this address");
    _mint(signer, voucher.tokenId);
    _setTokenURI(voucher.tokenId, voucher.uri);    
    _transfer(signer, _msgSender(), voucher.tokenId);
    return voucher.tokenId;
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


  // VOUCHER FUNCTIONS

  function _hash(NFTVoucher calldata voucher) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("NFTVoucher(uint256 tokenId,uint256 minPrice,string uri)"),
      voucher.tokenId,
      voucher.minPrice,
      keccak256(bytes(voucher.uri)),
      voucher.approvedFor
    )));
  }

  function getChainID() external view returns (uint256) {
    uint256 id;
    assembly {
        id := chainid()
    }
    return id;
  }

  function _verify(NFTVoucher calldata voucher) internal view returns (address) {
    bytes32 digest = _hash(voucher);
    return ECDSA.recover(digest, voucher.signature);
  }

  function isTrustedForwarder(address forwarder)
    public
    view
    virtual
    returns (bool)
  {
    return forwarder == _trustedForwarder;
  }


  // PROXY FUNCTIONS

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