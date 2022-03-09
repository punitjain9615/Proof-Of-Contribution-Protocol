// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DAOManager {
  mapping(uint256 => bytes32) public daos;
  mapping(uint256 => string) public daosName;

  uint private id;

  function _registerDAO(string memory daoName) internal returns(bytes32) {
    bytes32 daoUuid = keccak256(abi.encodePacked(daoName, block.number));
    uint256 currentID = id;
    daos[id] = daoUuid;
    daosName[id] = daoName;
    id++; 
    return daos[currentID];
  }
  function _getDaoUuid(uint256 _id) internal view returns(bytes32) {
    return daos[_id];
  }
  function _getDaoName(uint256 _id) internal view returns(string memory) {
    return daosName[_id];
  }
}
