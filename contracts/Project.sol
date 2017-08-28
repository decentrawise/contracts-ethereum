pragma solidity ^0.4.11;

contract Project {

    mapping (bytes32 => bytes32) projects;          //project => stems
    mapping (bytes32 => address) owners;            //project => owner address

    struct ProjectStruct {
        bytes32 projectHash; //hash where is saved project data
    }
}