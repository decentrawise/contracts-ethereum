pragma solidity ^0.4.11;

contract Stem {

    mapping (bytes32 => StemStruct) public stems;    

    struct StemStruct {
        string stemTitle;
        bytes32 stemHash;
        bytes32[] stemReferences;
    }

    event StemCreated(address _artistAddress, bytes32 _hash, string _title);
    event StemUsedByArtist(address _stemUser, bytes32 _hash, string _title);

    function createStem(bytes32 _hash, string _title, bytes32[] _stemReferences) {
        StemStruct storage stem = stems[_hash];
        stem.stemHash = _hash;
        stem.stemTitle = _title;
        stem.stemReferences = _stemReferences;
        StemCreated(msg.sender, _hash, _title);
        for (uint i = 0; i < _stemReferences.length; i++) {
            StemStruct storage usedStem = stems[_stemReferences[i]];
            StemUsedByArtist(msg.sender, usedStem.stemHash, usedStem.stemTitle);
        }
    }
}