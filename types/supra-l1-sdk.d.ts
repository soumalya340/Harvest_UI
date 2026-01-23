declare module 'supra-l1-sdk' {
  export class SupraAccount {
    constructor(privateKey: Uint8Array);
    address(): string;
  }

  export class SupraClient {
    static init(rpcUrl: string): Promise<SupraClient>;
    getAccountInfo(address: string): Promise<{ sequence_number: bigint }>;
    createSerializedRawTxObject(
      senderAddress: string,
      sequenceNumber: bigint,
      moduleAddress: string,
      moduleName: string,
      functionName: string,
      typeArgs: any[],
      args: Uint8Array[]
    ): Promise<any>;
    sendTxUsingSerializedRawTransaction(
      account: SupraAccount,
      serializedRawTransaction: any,
      options?: {
        enableTransactionSimulation?: boolean;
        enableWaitForTransaction?: boolean;
      }
    ): Promise<{ txHash: string }>;
  }

  export namespace BCS {
    export function bcsToBytes(value: any): Uint8Array;
    export function bcsSerializeUint64(value: bigint): Uint8Array;
    export function bcsSerializeStr(value: string): Uint8Array;
  }

  export namespace TxnBuilderTypes {
    export class AccountAddress {
      static fromHex(address: string): AccountAddress;
    }
    export class Identifier {
      constructor(value: string);
    }
  }
}
