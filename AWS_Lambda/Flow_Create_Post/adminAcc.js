import { sansPrefix, withPrefix } from '@onflow/fcl'
import { SHA3 } from 'sha3'
import elliptic from 'elliptic'

const curve = new elliptic.ec('secp256k1')

const hashMessageHex = (msgHex) => {
  const sha = new SHA3(256)
  sha.update(Buffer.from(msgHex, 'hex'))
  return sha.digest()
}

const signWithKey = (privateKey, msgHex) => {
  const key = curve.keyFromPrivate(Buffer.from(privateKey, 'hex'))
  const sig = key.sign(hashMessageHex(msgHex))
  const n = 32
  const r = sig.r.toArrayLike(Buffer, 'be', n)
  const s = sig.s.toArrayLike(Buffer, 'be', n)
  return Buffer.concat([r, s]).toString('hex')
}

export const admin = async (account) => {
  const keyId = 0
  const accountAddress = process.env.AdminAddress
  const pkey = process.env.AdminPrivateKey

  return {
    ...account,
    tempId: `${accountAddress}-${keyId}`,
    addr: sansPrefix(accountAddress),
    keyId: Number(keyId),

    signingFunction: async (signable) => {
      const signature = await signWithKey(pkey, signable.message)
      return {
        addr: withPrefix(accountAddress),
        keyId: Number(keyId),
        signature
      }
    }
  }
}
