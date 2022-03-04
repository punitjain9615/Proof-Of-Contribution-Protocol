// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract POCPRoles is Initializable, AccessControlUpgradeable {
  event ApproverAdded(bytes32 indexed daoId, address indexed account);
  event ApproverRemoved(bytes32 indexed daoId, address indexed account);
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

  // mapping dao id -> {role_id -> role_data }
  mapping(bytes32 => RoleData) private _approvers;

  function __POCPRoles_init() public initializer {
    __AccessControl_init();
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _grantRole(PAUSER_ROLE, _msgSender());
    _grantRole(UPGRADER_ROLE, _msgSender());
  }

  modifier onlyApprover(bytes32 daoUuid, address account) {
    require(isApprover(daoUuid, account), "Not Approver");
    _;
  }

  function isApprover(bytes32 daoUuid, address account)
    public
    view
    returns (bool)
  {
    return _approvers[daoUuid].members[account];
  }

  function addApprover(bytes32 daoUuid, address account)
    public
    onlyApprover(daoUuid, account)
  {
    _addApprover(daoUuid, account);
  }

  function removeApprover(bytes32 daoUuid, address account)
    public
    onlyApprover(daoUuid, account)
  {
    _removeApprover(daoUuid, account);
  }

  function _addApprover(bytes32 daoUuid, address account) internal {
    _approvers[daoUuid].members[account] = true;
    emit ApproverAdded(daoUuid, account);
  }

  function _removeApprover(bytes32 daoUuid, address account) internal {
    _approvers[daoUuid].members[account] = false;
    emit ApproverRemoved(daoUuid, account);
  }

  // For future extensions
  uint256[50] private ______gap;
}
