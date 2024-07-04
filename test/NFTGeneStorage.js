const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTGeneStorage", function () {
  let NFTGeneStorage;
  let nftGeneStorage;
  let owner;

  beforeEach(async function () {
    NFTGeneStorage = await ethers.getContractFactory("NFTGeneStorage");
    [owner] = await ethers.getSigners();
    nftGeneStorage = await NFTGeneStorage.deploy();
    await nftGeneStorage.waitForDeployment();
  });

  it("should pack and unpack genes correctly", async function () {
    const genes = [];
    for (let i = 0; i < 5000; i++) {
      genes.push(i);
    }

    const chunkSize = 250;
    for (let i = 0; i < genes.length; i += chunkSize) {
      const chunk = genes.slice(i, i + chunkSize);
      await nftGeneStorage.packGenes(chunk, i);
    }

    for (let i = 0; i < genes.length; i++) {
      const unpackedGene = await nftGeneStorage.unpackGene(i);
      expect(unpackedGene).to.equal(genes[i]);
    }
  });

  it("should decode attributes correctly", async function () {
    const gene = BigInt("0x00123456789ABCDE");
    const attributes = await nftGeneStorage.decodeAttributes(gene);

    expect(attributes[0]).to.equal(Number(gene & BigInt(0x3F)));
    expect(attributes[1]).to.equal(Number((gene >> BigInt(6)) & BigInt(0x3F)));
    expect(attributes[2]).to.equal(Number((gene >> BigInt(12)) & BigInt(0xF)));
    expect(attributes[3]).to.equal(Number((gene >> BigInt(16)) & BigInt(0xF)));
    expect(attributes[4]).to.equal(Number((gene >> BigInt(20)) & BigInt(0x7F)));
    expect(attributes[5]).to.equal(Number((gene >> BigInt(27)) & BigInt(0x3F)));
    expect(attributes[6]).to.equal(Number((gene >> BigInt(33)) & BigInt(0x3F)));
    expect(attributes[7]).to.equal(Number((gene >> BigInt(39)) & BigInt(0x3F)));
    expect(attributes[8]).to.equal(Number((gene >> BigInt(45)) & BigInt(0x7F)));
    expect(attributes[9]).to.equal(Number((gene >> BigInt(52)) & BigInt(0xF)));
    expect(attributes[10]).to.equal(Number((gene >> BigInt(56)) & BigInt(0x1F)));
    expect(attributes[11]).to.equal(Number((gene >> BigInt(61)) & BigInt(0x1F)));
  });

  it("should revert if invalid start index is provided", async function () {
    const genes = [0x00123456789ABCDE];

    await expect(nftGeneStorage.packGenes(genes, 5000)).to.be.revertedWith("Invalid start index");
  });

  it("should revert if too many genes are packed", async function () {
    const genes = new Array(5001).fill(0);

    await expect(nftGeneStorage.packGenes(genes, 0)).to.be.revertedWith("Too many genes");
  });

  it("should revert if accessing out of range gene index", async function () {
    const genes = new Array(5000).fill(0);

    const chunkSize = 250;
    for (let i = 0; i < genes.length; i += chunkSize) {
      const chunk = genes.slice(i, i + chunkSize);
      await nftGeneStorage.packGenes(chunk, i);
    }

    await expect(nftGeneStorage.unpackGene(5000)).to.be.revertedWith("Invalid gene index");
  });
});
