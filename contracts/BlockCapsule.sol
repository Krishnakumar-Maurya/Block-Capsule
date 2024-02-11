// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BlockCapsule {
    struct access {
        address user;
        bool access;
    }

    mapping (address => bool) verified;

    mapping (address => string[]) value;
    mapping (address => mapping (address => bool)) viewOwnership;
    mapping (address => mapping (address => bool)) editOwnership;
    mapping (address => access[]) viewAccessList;
    mapping (address => access[]) editAccessList;
    mapping (address => mapping (address => bool)) viewPreviousData;
    mapping (address => mapping (address => bool)) editPreviousData;

    function add (address _user, string memory url) external {
        value[_user].push(url);
        verified[_user] = false;
    }

    function verify (address _user) external {
        verified[_user] = true;
    }
    function isVerified (address _user) public view returns( string memory ) {
        if (verified[_user])
        {
            return "Yes";
        }
        else{
            return "No";
        }
    }

    function allowView (address user) external {
        viewOwnership[msg.sender][user] = true;
        if (viewPreviousData[msg.sender][user]) {
            for (uint i = 0; i < viewAccessList[msg.sender].length; i++) {
                if (viewAccessList[msg.sender][i].user == user) {
                    viewAccessList[msg.sender][i].access = true;
                }
            }
        }
        else {
            viewAccessList[msg.sender].push(access(user,true));
            viewPreviousData[msg.sender][user] = true;
        }
    }
    function disAllowView (address user) public {
        viewOwnership[msg.sender][user] = false;
        for (uint i = 0; i < viewAccessList[msg.sender].length; i++) {
            if (viewAccessList[msg.sender][i].user == user) {
                viewAccessList[msg.sender][i].access = false;
            }
        }
    }

    function allowEdit (address user) external {
        editOwnership[msg.sender][user] = true;
        if (editPreviousData[msg.sender][user]) {
            for (uint i = 0; i < editAccessList[msg.sender].length; i++) {
                if (editAccessList[msg.sender][i].user == user) {
                    editAccessList[msg.sender][i].access = true;
                }
            }
        }
        else {
            editAccessList[msg.sender].push(access(user,true));
            editPreviousData[msg.sender][user] = true;
        }
    }
    function disAllowEdit (address user) public {
        editOwnership[msg.sender][user] = false;
        for (uint i = 0; i < editAccessList[msg.sender].length; i++) {
            if (editAccessList[msg.sender][i].user == user) {
                editAccessList[msg.sender][i].access = false;
            }
        }
    }

    function display (address _user) external view returns(string[] memory) {
        require(_user == msg.sender || viewOwnership[_user][msg.sender], "You don't have access");
        return value[_user];
    }

    function viewShareAccess() public view returns (access[] memory) {
        return viewAccessList[msg.sender];
    }
    function editShareAccess() public view returns (access[] memory) {
        return editAccessList[msg.sender];
    }

    function isEditAllowed(address _user) external view returns( string memory ) {
        if (editOwnership[_user][msg.sender])
        {
            return "Yes";
        }
        else {
            return "No";
        }
    }
    function isViewAllowed(address _user) external view returns( string memory ) {
        if (viewOwnership[_user][msg.sender])
        {
            return "Yes";
        }
        else {
            return "No";
        }
    }
}