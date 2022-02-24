// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract POCPRoles is Initializable, AccessControlUpgradeable {
  event MinterAdded(bytes32 indexed daoId, address indexed account);
  event MinterRemoved(bytes32 indexed daoId, address indexed account);
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // mapping dao id -> {role_id -> role_data }
  mapping(bytes32 => RoleData) private _minters;


  function initialize() initializer public {
        __AccessControl_init();
        

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
        _grantRole(UPGRADER_ROLE, _msgSender());
    }

  modifier onlyMinter(bytes32 daoId, address account) {
    require(isMinter(daoId, account), "Not Minter");
    _;
  }

  function isMinter(bytes32 daoId, address account) public view returns (bool) {
    return _minters[daoId].members[account];
  }

  function addMinter(bytes32 daoId, address account)
    public
    onlyMinter(daoId, account)
  {
    _addMinter(daoId, account);
  }

  function removeMinter(bytes32 daoId, address account)
    public
    onlyMinter(daoId, account)
  {
    _removeMinter(daoId, account);
  }

  function _addMinter(bytes32 daoId, address account) internal {
    _minters[daoId].members[account] = true;
    emit MinterAdded(daoId, account);
  }

  function _removeMinter(bytes32 daoId, address account) internal {
    _minters[daoId].members[account] = false;
    emit MinterRemoved(daoId, account);
  }

  // For future extensions
  uint256[50] private ______gap;
}
