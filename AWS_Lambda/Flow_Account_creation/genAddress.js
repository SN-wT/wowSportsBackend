import { config, mutate, tx } from '@onflow/fcl'
import { admin } from './adminAcc.js'
import { createPubAndPrivateKey } from './genPubAndPrivKey.js'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const genAddress = async () => {
  const { publicKey, privateKey } = createPubAndPrivateKey()

  console.log('Signing Transaction')

  // Our Cadence code for creating public account and adding the publickey to public account
  const cadence = `
  transaction {

    prepare(acct: AuthAccount) {
    let publicKey = "${publicKey}";
  
    
     let key = PublicKey(
              publicKey: publicKey.decodeHex(),             
              signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1
            )
    
            let account = AuthAccount(payer: acct)

            account.keys.add(
              publicKey: key,
              hashAlgorithm: HashAlgorithm.SHA3_256,
              weight: 1000.0
          )
    }
  }
  `

  // List of arguments
  const proposer = admin
  const payer = admin
  const authorizations = [admin]

  // "mutate" method will return us transaction id
  const txId = await mutate({
    cadence,
    proposer,
    payer,
    authorizations,
    limit: 999
  })

  console.log(`Submitted transaction ${txId} to the network`)

  const txDetails = await tx(txId).onceSealed()
  const { address } = txDetails.events[5].data

  return {
    publicKey,
    address,
    privateKey
  }
}
