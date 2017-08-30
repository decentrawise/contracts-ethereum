pragma solidity ^0.4.11;

import "./Stem.sol";
import "./Auth.sol";

contract Artist is Auth, Stem {

    mapping (address => ArtistStruct) public artists;

    struct ArtistStruct {
        string artistUsername;
        address artistAddress;
        bytes32[] artistStems;
    }

    function createArtist(string _username) {
        ArtistStruct storage artist = artists[msg.sender];
        artist.artistAddress = msg.sender;
        artist.artistUsername = _username;
    }

    function getArtist(address _address) returns (string, bytes32[]) {
        ArtistStruct storage artist = artists[_address];
        return (artist.artistUsername, artist.artistStems);
    }

    function changeUsername(string _username) {
        ArtistStruct storage artist = artists[msg.sender];
        artist.artistUsername = _username; 
    }

    function addStem(bytes32 _hash, string _title, bytes32[] _stemReferences) {
        ArtistStruct storage artist = artists[msg.sender];
        createStem(_hash, _title, _stemReferences);
        artist.artistStems.push(_hash);
    }

    function returnStemsForArtist(address _address) returns (bytes32[]) {
        ArtistStruct storage artist = artists[_address];
        return artist.artistStems;
    }


}