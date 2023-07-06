const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Flashloan', () => {
  let token, flashLoan, flashLoanReceiver
  let deployer, user1

  beforeEach(async () => {
    // Setup accounts
    accounts = await ethers.getSigners()
    deployer = accounts[0]

    // Load contracts
    const FlashLoan = await ethers.getContractFactory('FlashLoan')
    const FlashLoanReceiver = await ethers.getContractFactory('FlashLoanReceiver')
    const Token = await ethers.getContractFactory('Token')

    // Deploy token
    token = await Token.deploy('Halit', 'HLT', '1000000')

    // Deploy Flash Loan Pool
    flashLoan = await FlashLoan.deploy(token.address)

    // Approve tokens before depositing
    let transaction = await token.connect(deployer).approve(flashLoan.address, tokens(1000000))
    await transaction.wait()

    // Deposit tokens into the pool
    transaction = await flashLoan.connect(deployer).depositTokens(tokens(1000000))
    await transaction.wait()

    // Deploy Flash Loan Receiver
    flashLoanReceiver = await FlashLoanReceiver.deploy(flashLoan.address)
 })

 describe('Deployment', async function () {

  it('sends tokens to the flash loan pool contract', async function () {
   expect(await token.balanceOf(flashLoan.address)).to.equal(tokens(1000000));
  })

 describe('Borrowing funds', async function () {
  it('borrows funds from the pool', async function () {
   // Borrow 100 tokens
   let transaction = await flashLoanReceiver.connect(deployer).executeFlashLoan(tokens(100))
   await transaction.wait()

   await expect(transaction).to.emit(flashLoanReceiver, 'LoanReceived').withArgs(token.address, tokens(100))


  })
 })

})
})