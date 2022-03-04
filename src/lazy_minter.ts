const SIGNING_DOMAIN_NAME = "LazyNFT-Voucher";
const SIGNING_DOMAIN_VERSION = "1";

export class LazyMinter {
  contract: any;
  signer: any;
  _domain: any;
  constructor({ contract, signer }: any) {
    this.contract = contract;
    this.signer = signer;
  }

  async createVoucher(tokenId: any, uri: any, approvedFor: any, minPrice = 0) {
    console.log(tokenId, uri, approvedFor);
    const voucher = { tokenId, uri, minPrice, approvedFor };
    const domain = await this._signingDomain();
    const types = {
      NFTVoucher: [
        { name: "tokenId", type: "uint256" },
        { name: "minPrice", type: "uint256" },
        { name: "uri", type: "string" },
        { name: "approvedFor", type: "address" },
      ],
    };
    const signature = await this.signer._signTypedData(domain, types, voucher);
    return {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...voucher,
      signature,
    };
  }

  async _signingDomain() {
    if (this._domain != null) {
      return this._domain;
    }
    const chainId = await this.contract.getChainID();
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };
    return this._domain;
  }
}
