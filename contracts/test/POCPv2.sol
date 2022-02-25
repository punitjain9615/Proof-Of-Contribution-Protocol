// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../POCP.sol";

contract POCPv2 is POCP {

    address public whatever;

    function setWhatever(address whatever_) external onlyRole(UPGRADER_ROLE) {
		whatever = whatever_;
	}

	function getWhatever() external view returns (address){
		return whatever;
	}
}