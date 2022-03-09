// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DAOManager {
  mapping(bytes32 => string) public daos;

  function _registerDAO(string memory daoName) internal returns(bytes32){
    bytes32 daoUuid = keccak256(abi.encodePacked(daoName, block.number));
    daos[daoUuid] = daoName;
    return daoUuid;
  }
  function _getDaoName(bytes32 daoUuid) internal view returns (string memory) {
    string memory daoName =  daos[daoUuid];
    return daoName;
  }
}