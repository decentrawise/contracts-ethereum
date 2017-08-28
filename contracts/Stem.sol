pragma solidity ^0.4.11;

contract Stem {

    struct StemStruct {
        string stemTitle;
        bytes32 stemHash;
    }

    mapping (bytes32 => address) stems;     //since Structs as keytypes are not supported 
                                            //just yet, we use bytes32 Stem hash and 
                                            //Artis address in shis mapping

}