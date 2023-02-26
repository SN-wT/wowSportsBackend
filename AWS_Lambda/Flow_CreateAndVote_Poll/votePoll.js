// Actual voting function referenced from index.js
import { config, mutate, tx, sansPrefix, withPrefix } from '@onflow/fcl'

import { SHA3 } from 'sha3'
import elliptic from 'elliptic'
import { admin } from './adminAcc.js'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const votePoll = async (address, userPrivateKey, pollname, choice) => {
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

  const voter = async (account) => {
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

  // Cadence code for voting poll
  const cadence = `

  import wowSportsPoll from 0xf3510e7eb2b4cb38

    transaction(pollname: String, choice: String) {

    prepare(acct: AuthAccount) {

        if (acct.borrow<&wowSportsPoll.checkAddrResource>(from: /storage/address) == nil) {
                acct.save(<- wowSportsPoll.getAddrResource(), to: /storage/address)
        }
    let resourceCheck = acct.borrow<&wowSportsPoll.checkAddrResource>(from: /storage/address)

    let temp <- wowSportsPoll.getPollAdmin()

    temp.voteOnPoll(pollname: pollname, choice: choice, addressCheckResource: resourceCheck!)

    destroy temp;
   
    }

    execute {
    }
} 
`

  // List of arguments
  const proposer = admin
  const payer = admin
  const authorizations = [voter]

  // "mutate" method will return us transaction id
  const txId = await mutate({
    cadence,
    proposer,
    payer,
    authorizations,
    limit: 999,
    args: (arg, t) => [arg(pollname, t.String), arg(choice, t.String)]
  })

  console.log(`Submitted transaction ${txId} to the network`)

  const txDetails = await tx(txId).onceSealed()
  console.log({ txDetails })
}
