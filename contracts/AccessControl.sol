// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControl {
    struct Dataset {
        address owner;
        mapping(address => bool) permissions;
    }

    mapping(string => Dataset) private datasets;

    event DatasetOwnerSet(string datasetName, address owner);
    event PermissionGranted(string datasetName, address grantee);

    modifier onlyDatasetOwner(string memory datasetName) {
        require(msg.sender == datasets[datasetName].owner, "Not dataset owner");
        _;
    }

    // Set dataset owner (admin setup)
    function setDatasetOwner(string memory datasetName, address owner) public {
        require(datasets[datasetName].owner == address(0), "Owner already set");
        datasets[datasetName].owner = owner;
        emit DatasetOwnerSet(datasetName, owner);
    }

    // Grant permission to a user
    function grantPermission(address user, string memory datasetName)
        public
        onlyDatasetOwner(datasetName)
    {
        datasets[datasetName].permissions[user] = true;
        emit PermissionGranted(datasetName, user);
    }

    // Check if a user has access
    function checkAccess(address user, string memory datasetName)
        public
        view
        returns (bool)
    {
        return datasets[datasetName].permissions[user];
    }

    // Retrieve dataset owner
    function getDatasetOwner(string memory datasetName)
        public
        view
        returns (address)
    {
        return datasets[datasetName].owner;
    }
}
