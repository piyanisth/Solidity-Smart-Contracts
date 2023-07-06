const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deploy } = require("near-cli");

const tokens = (n) => {
  return ethers.utils.parseEther(n.toString(), 'ether');
}

const ether = tokens;

describe("RealEstate", function () {

  let realEstate, escrow, deployer, seller, buyer
  let nftID = 1;
  let price = ether(100);
  let earnestMoney = ether(20);

  beforeEach(async function () {
    accounts = await ethers.getSigners(); // get all accounts
    deployer = accounts[0]; 
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];


    //Get Contracts;
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    //Deploy Contracts;
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address, 
      nftID, 
      price, 
      earnestMoney,
      seller.address, 
      buyer.address, 
      inspector.address, 
      lender.address
    ); 

    // Seller approves the Escrow contract to transfer the NFT
    transaction = await realEstate.connect(seller).approve(escrow.address, nftID);
    await transaction.wait(); // wait for the transaction to be mined
  })

  describe("Deployment", function () {
    it("deploys RealEstate", async function () {
      expect(realEstate.address).to.not.equal(0);
    })

    it("deploys Escrow", async function () {
      expect(escrow.address).to.not.equal(0);
    })
    it("sets the NFT ID", async function () {
      expect(await escrow.nftID()).to.equal(nftID);
    })

    it('sends an NFT to the seller/deployer', async function () {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
    })
  })



  describe('Selling real estate', function () {
    let balance, transaction;

    it('executes a successful transaction', async function () {
      // expects the seller to be the owner of the NFT
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      balance = await ethers.provider.getBalance(seller.address);
      console.log("Seller Balance: ", ethers.utils.formatEther(balance));

      // Check escrow balance before depositing earnest money
      balance = await escrow.getBalance();
      console.log("Earnest Money: ", ethers.utils.formatEther(balance));

      // Buyer deposits earnest money
      transaction = await escrow.connect(buyer).depositEarnestMoney({value: earnestMoney});
      await transaction.wait();
      console.log('Buyer deposited earnest money');

      // Check escrow balance after depositing earnest money
      balance = await escrow.getBalance();
      expect(balance).to.equal(earnestMoney);
      console.log("Earnest Money: ", ethers.utils.formatEther(balance));

      // Inspector updates status to "Passed"
      transaction = await escrow.connect(inspector).updateInspectionStatus(true);
      await transaction.wait();
      console.log('Inspector updated status to "Passed"');

      // Buyer Approves sale
      transaction = await escrow.connect(buyer).approveSale();
      await transaction.wait()
      console.log('Buyer approved the sale')

      // Seller Approves sale
      transaction = await escrow.connect(seller).approveSale();
      await transaction.wait()
      console.log('Seller approved the sale')

      // Lender funds the escrow
      transaction = await lender.sendTransaction({to: escrow.address, value: ether(80)});
      console.log('Lender funded the escrow')

      // Lender Approves sale
      transaction = await escrow.connect(lender).approveSale();
      await transaction.wait()
      console.log('Lender approved the sale')

      // Finalize the sale
      transaction = await escrow.connect(buyer).finalizeSale(); //connect ile kontrakttan buyer ın adresini aldık
      await transaction.wait();

      // Expects the buyer to be the owner of the NFT
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);

      // Expects the Seller to receive the funds
      balance = await ethers.provider.getBalance(seller.address);
      console.log("Seller Balance: ", ethers.utils.formatEther(balance));
      expect(balance).to.above(ether(10099));
    })
  })
})