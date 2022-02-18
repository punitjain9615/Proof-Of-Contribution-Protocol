// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

interface IGnosis {
  function isOwner(address owner) external view returns (bool);
}

abstract contract DAOManager is Initializable, ERC721Upgradeable {
  mapping(address => string) public daos;
  mapping(address => string) public daoContributionSchemas;

  function __DAOManager_init() internal onlyInitializing {}

  function _verifyGnosis(address gnosisContract) internal returns (bool) {
    bool isOwner = IGnosis(gnosisContract).isOwner(msg.sender);
    return isOwner;
  }

  function _registerDAO(address gnosisContract, string memory daoName, string memory daoContributionSchema)
    internal
  {
    require(_verifyGnosis(gnosisContract), "Sender is not owner of Gnosis Contract");
    daos[gnosisContract] = daoName;
    daoContributionSchemas[gnosisContract] = daoContributionSchema;
  }
}
