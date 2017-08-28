pragma solidity ^0.4.11;

import "./Stem.sol";

contract Artist {

    mapping (address => Artist) artists;

    struct ArtistStruct {
        bytes32 artistName;
        address artistAddress;
        mapping (address => bytes32[]) stems;
    }

}