// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DAOManager {
  mapping(bytes32 => bytes32) public daos;

  function _registerDAO(bytes32 daoName) internal returns(bytes32){
    bytes32 daoUuid = keccak256(abi.encodePacked(daoName, block.number));
    daos[daoUuid] = daoName;
    return daoUuid;
  }
}
