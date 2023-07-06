const {expect} = require('chai');
const {ethers} = require('hardhat');

describe('Counter', function () {

  let myCounter

  this.beforeEach(async function () {

    // Get the ContractFactory and Signers here;
    const counter = await ethers.getContractFactory('Counter')

    // Deploy the contract;
    myCounter = await counter.deploy('My Counter', 1)
  })

  describe('Deployment', function () {

    it('sets the initial count', async function () {
      const count = await myCounter.count()
      expect(count).to.equal(1)
    })

    it('sets the initial name', async function () {
      const name = await myCounter.name()
      expect(name).to.equal('My Counter')
    })
  })

  describe('Counting', function () {

    it('reads the count from count public variable', async function () {
      expect(await myCounter.count()).to.equal(1)
    })

    it('reads the count from getCount() function', async function () {
      expect(await myCounter.getCount()).to.equal(1)
    })

    it('increments the count', async function () {
      await myCounter.increment()
      expect(await myCounter.count()).to.equal(2)
    })

    it('decrements the count', async function () {
      await myCounter.decrement()
      expect(await myCounter.count()).to.equal(0)
      await expect(myCounter.decrement()).to.be.reverted // count cannot go below zero
    })

  })

  describe('Naming', function () {
    it('reads the name from "name" public variable', async function () {
      expect(await myCounter.name()).to.equal('My Counter')
    })

    it('reads the name from getName() function', async function () {
      expect(await myCounter.getName()).to.equal('My Counter')
    })

    it('updates the name', async function () {
      await myCounter.setName('New Name')
      expect(await myCounter.name()).to.equal('New Name')
    })
  })











})