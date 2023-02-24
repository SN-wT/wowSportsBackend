// This script is used for adding external public key
import { config, mutate, tx, sansPrefix, withPrefix } from '@onflow/fcl'
import { admin } from './adminAcc.js'

import { SHA3 } from 'sha3'
import elliptic from 'elliptic'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const addPublicKey = async (address, userPrivateKey, publicKey) => {
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

  const user = async (account) => {
    const keyId = 0
    const accountAddress = address
    const pkey = userPrivateKey
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

  const cadence = `
  transaction(publicKey: String) {
    prepare(signer: AuthAccount) {
      let bytes = publicKey.decodeHex()

      let key = PublicKey(
        publicKey: bytes,
        signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1
      )

      signer.keys.add(
        publicKey: key,
        hashAlgorithm: HashAlgorithm.SHA3_256,
        weight: 1000.0
      )
    }
  }
  `

  // List of arguments
  const args = (arg, t) => [
    arg(publicKey, t.String)
  ]

  // Roles
  const proposer = user
  const payer = admin
  const authorizations = [user]

  // Execution limit
  const limit = 1000

  // "mutate" method will return us transaction id
  const txId = await mutate({
    proposer,
    payer,
    authorizations,
    cadence,
    args,
    limit
  })

  const txDetails = await tx(txId).onceSealed()
  console.log({ txDetails })

  return txDetails
}
