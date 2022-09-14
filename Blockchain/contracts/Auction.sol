// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract Auction {

    uint maxBet;
    uint bidQuantity = 0;
    address owner;
    address currentWinner;
    mapping (address => uint) bets;

    event NewBet(address newMaxAddress, uint value);
    event AuctionFinished(address previousOwner, address newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el dueno del contrato puede cerrar la subasta.");
		_;
    }
 
    modifier minimunBet(uint _value) {
        require(_value > maxBet, "La apuesta maxima es mayor.");
		_;
    }
    
    modifier maximumBet(uint _value) {
        require(msg.sender.balance > _value, "No tenes ehter suficiente para realizar la apuesta.");
		_;
    }
 
    modifier alreadyWinner() {
        require(msg.sender != currentWinner, "Ya posee la apuesta maxima.");
		_;
    }
    
    modifier nobodyBids() {
        require(owner != currentWinner, "No hay apuestas iniciales.");
		_;
    }
    

    modifier ownerCantBet() {
        require(msg.sender != owner, "Usted es el vendedor.");
		_;
    }
        
    constructor() {
        owner = msg.sender;
        currentWinner = msg.sender;
        maxBet = 2;
    }

    function newBet(uint _value) public minimunBet(_value) maximumBet(_value) alreadyWinner ownerCantBet payable returns (bool){
        bets[msg.sender] = _value;
        maxBet = _value;
        bidQuantity++;
        currentWinner = msg.sender;
        emit NewBet(currentWinner, maxBet);
        return true;
    }

    function getCurrentMax() public view returns (address, address, uint, uint) {
        return (currentWinner, owner, maxBet, bidQuantity);
    }

    function finishAuction() public onlyOwner nobodyBids payable returns (bool) {
        address previousOwner = owner;
        owner = currentWinner;
        emit AuctionFinished(previousOwner, owner);
        return true;
    }
}