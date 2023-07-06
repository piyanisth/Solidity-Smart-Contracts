// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    uint256 public nftID;
    uint256 public price;
    uint256 public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function");
        _;
    }

    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "Only inspector can call this function"
        );
        _; // onlyBuyer fonksiyonu çağrıldığında bu fonksiyonun içindeki kodu çalıştırır
    }

    bool public inspectionPassed = false;

    mapping(address => bool) public approval;

    mapping(address => bool) public disapproval;

    receive() external payable {} // contract can receive ether

    constructor(
        address _nftAddress,
        uint256 _nftID,
        uint256 _price,
        uint256 _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftID = _nftID;
        seller = _seller;
        buyer = _buyer;
        price = _price;
        escrowAmount = _escrowAmount;
        inspector = _inspector;
        lender = _lender;
    }

    function depositEarnestMoney() public payable onlyBuyer {
        require(msg.value >= escrowAmount);
    }

    function updateInspectionStatus(bool _status) public onlyInspector {
        inspectionPassed = _status;
    }

    function approveSale() public {
        require(
            msg.sender == buyer || msg.sender == seller || msg.sender == lender,
            "Only buyer, seller or lender can call this function"
        );
        approval[msg.sender] = true;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function cancelSale() public {
        if (!inspectionPassed) {
            payable(buyer).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    function finalizeSale() public {
        require(inspectionPassed, "Inspection not passed");
        require(approval[buyer], "Buyer did not approve");
        require(approval[seller], "Seller did not approve");
        require(approval[lender], "Lender did not approve");
        require(
            address(this).balance >= price,
            "Insufficient funds to finalize sale"
        );

        // Sends money to seller. call adresteki balance i seller a aktardım diye bilgilendirir.
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success, "Failed to send money to seller");

        // Transfer NFT to buyer
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }
}
