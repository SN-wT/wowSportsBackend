import { config, mutate, tx } from '@onflow/fcl'
import { admin } from './adminAcc.js'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

const reactPost = async () => {

  console.log('Signing Transaction')

  // Our Cadence code. Notice the use of alias here
  const cadence = `
  transaction {

    prepare(acct: AuthAccount) {
    let publicKey = "${publicKey}";
  
    
     let key = PublicKey(
              publicKey: publicKey.decodeHex(),             
              signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1
            )
    
            let account = AuthAccount(payer: acct)
            log("account is ".concat(account.address.toString()))

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
  console.log('Waiting for transaction to be sealed...')

  const label = 'Transaction Sealing Time'
  console.time(label)
  const txDetails = await tx(txId).onceSealed()
  console.timeEnd(label)
  console.log({txDetails})

//   return {
    
//   }
}

reactPost()
