import { useCallback } from 'react';
import { BCS, HexString, TxnBuilderTypes } from 'supra-l1-sdk-core';

const useConversionUtils = () => {
    // Convert a human-readable string to Uint8Array
    const stringToUint8Array = useCallback((humanReadableStr: string) => {
        return BCS.bcsToBytes(new TxnBuilderTypes.Identifier(humanReadableStr));
    }, []);

    const serializeString = useCallback((humanReadableStr: string) => {
        return BCS.bcsSerializeStr(humanReadableStr);
    }, []);

    // Convert a crypto address to Uint8Array
    const addressToUint8Array = useCallback((cryptoAddress: string) => {
        return BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(cryptoAddress));
    }, []);

    // Serialize a uint8 value
    const serializeUint8 = useCallback((value: number | string) => {
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (num < 0 || num > 255) {
            throw new Error(`u8 value out of range: ${num}`);
        }
        return BCS.bcsSerializeU8(num);
    }, []);

    // Serialize a uint16 value
    const serializeUint16 = useCallback((value: number | string | bigint) => {
        let num: number;
        if (typeof value === 'string') {
            num = parseInt(value, 10);
        } else if (typeof value === 'bigint') {
            num = Number(value);
        } else {
            num = value;
        }
        if (num < 0 || num > 65535) {
            throw new Error(`u16 value out of range: ${num}`);
        }
        return BCS.bcsSerializeU16(num);
    }, []);

    // Serialize a uint32 value
    const serializeUint32 = useCallback((value: number | string | bigint) => {
        let num: number;
        if (typeof value === 'string') {
            num = parseInt(value, 10);
        } else if (typeof value === 'bigint') {
            num = Number(value);
        } else {
            num = value;
        }
        if (num < 0 || num > 4294967295) {
            throw new Error(`u32 value out of range: ${num}`);
        }
        return BCS.bcsSerializeU32(num);
    }, []);

    // Serialize a uint64 value
    const serializeUint64 = useCallback((value: number | string | bigint) => {
        let num: bigint;
        if (typeof value === 'string') {
            num = BigInt(value);
        } else if (typeof value === 'number') {
            num = BigInt(value);
        } else {
            num = value;
        }
        if (num < 0) {
            throw new Error(`u64 value cannot be negative: ${num}`);
        }
        return BCS.bcsSerializeUint64(num);
    }, []);

    // Serialize a uint128 value
    const serializeUint128 = useCallback((value: number | string | bigint) => {
        let num: bigint;
        if (typeof value === 'string') {
            num = BigInt(value);
        } else if (typeof value === 'number') {
            num = BigInt(value);
        } else {
            num = value;
        }
        if (num < 0) {
            throw new Error(`u128 value cannot be negative: ${num}`);
        }
        return BCS.bcsSerializeU128(num);
    }, []);

    const serializeU256 = useCallback((value: bigint) => {
        return BCS.bcsSerializeU256(value);
    }, []);

    const serializeBool = useCallback((value: boolean) => {
        return BCS.bcsSerializeBool(value);
    }, []);

    const serializeVector = useCallback((values: any[], type: 'u8' | 'u64' | 'bool' | 'string' | 'address') => {
        const serializer = new BCS.Serializer();
        serializer.serializeU32AsUleb128(values.length);
        
        values.forEach(value => {
            if (type === 'u64') {
                serializer.serializeU64(value as bigint);
            } else if (type === 'bool') {
                serializer.serializeBool(value as boolean);
            } else if (type === 'string') {
                serializer.serializeStr(value as string);
            } else if (type === 'address') {
                const accountAddress = TxnBuilderTypes.AccountAddress.fromHex(value as string);
                serializer.serializeFixedBytes(accountAddress.address);
            } else {
                serializer.serializeStr(value as string);
            }
        });
        return serializer.getBytes();
    }, []);

    return {
        stringToUint8Array,
        addressToUint8Array,
        serializeString,
        serializeUint8,
        serializeUint16,
        serializeUint32,
        serializeUint64,
        serializeUint128,
        serializeU256,
        serializeBool,
        serializeVector,
    };
};

export default useConversionUtils;
