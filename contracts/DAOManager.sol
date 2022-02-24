// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IGnosis {
  function isOwner(address owner) external view returns (bool);
}

contract DAOManager {
  mapping(bytes32 => bytes32) public daos;

  function _verifyGnosis(address gnosisContract) internal view returns (bool) {
    bool isOwner = IGnosis(gnosisContract).isOwner(msg.sender);
    return isOwner;
  }

  function _registerDAO(address gnosisContract, bytes32 daoName) internal {
    require(
      _verifyGnosis(gnosisContract),
      "Sender is not owner of Gnosis Contract"
    );
    bytes32 daoUuid = keccak256(abi.encodePacked(daoName));
    daos[daoUuid] = daoName;
  }
}
