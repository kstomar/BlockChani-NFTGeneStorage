// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTGeneStorage {
    uint256 constant BITS_PER_ATTRIBUTE = 6;
    uint256 constant ATTRIBUTES_PER_GENE = 12;
    uint256 constant BITS_PER_GENE = BITS_PER_ATTRIBUTE * ATTRIBUTES_PER_GENE;
    uint256 constant GENES_PER_SLOT = 256 / BITS_PER_GENE;
    uint256 constant GENE_MASK = (1 << BITS_PER_GENE) - 1;

    uint256[2084] public genes;

    function decodeAttributes(uint256 gene) public pure returns (uint8[12] memory) {
        uint8[12] memory attributes;

        attributes[0] = uint8(gene & 0x3F);
        attributes[1] = uint8((gene >> 6) & 0x3F); 
        attributes[2] = uint8((gene >> 12) & 0xF); 
        attributes[3] = uint8((gene >> 16) & 0xF); 
        attributes[4] = uint8((gene >> 20) & 0x7F); 
        attributes[5] = uint8((gene >> 27) & 0x3F); 
        attributes[6] = uint8((gene >> 33) & 0x3F); 
        attributes[7] = uint8((gene >> 39) & 0x3F); 
        attributes[8] = uint8((gene >> 45) & 0x7F); 
        attributes[9] = uint8((gene >> 52) & 0xF); 
        attributes[10] = uint8((gene >> 56) & 0x1F); 
        attributes[11] = uint8((gene >> 61) & 0x1F); 

        return attributes;
    }
    
    function packGenes(uint256[] memory _genes, uint256 startIndex) public {
        require(startIndex < 5000, "Invalid start index");
        uint256 endIndex = startIndex + _genes.length;
        require(endIndex <= 5000, "Too many genes");

        for (uint256 i = 0; i < _genes.length; i++) {
            uint256 slotIndex = (startIndex + i) / GENES_PER_SLOT;
            uint256 geneIndex = (startIndex + i) % GENES_PER_SLOT;
            genes[slotIndex] = (genes[slotIndex] & ~(GENE_MASK << (BITS_PER_GENE * geneIndex))) | (_genes[i] << (BITS_PER_GENE * geneIndex));
        }
    }

    function unpackGene(uint256 geneIndex) public view returns (uint256) {
        require(geneIndex < 5000, "Invalid gene index");
        uint256 slotIndex = geneIndex / GENES_PER_SLOT;
        uint256 indexInSlot = geneIndex % GENES_PER_SLOT;
        return (genes[slotIndex] >> (BITS_PER_GENE * indexInSlot)) & GENE_MASK;
    }

}
