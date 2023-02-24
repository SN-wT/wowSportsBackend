// Actual mint module which is called in lambda script 
import { config, mutate, tx, sansPrefix, withPrefix } from '@onflow/fcl'

import { SHA3 } from 'sha3'
import elliptic from 'elliptic'
import { admin } from './adminAcc.js'
import { getNftData } from './getNftData.js'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const mintNFT = async (address, userPrivateKey, name, packName) => {
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

  const buyer = async (account) => {
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

  const { type, url, ARUrl, utility, target, specific, specific1 } = await getNftData(packName, name)

  // Our Cadence code for minting nfts
  const cadence = `
  import wowSports from ${process.env.wowSports}
  import NonFungibleToken from 0x631e88ae7f1d7c20
  import MetadataViews from 0x631e88ae7f1d7c20

  transaction(name: String, type: String, url: String, ARUrl: String, utility: String, target: String, specific: String, specific1: String){

      prepare(adminsign: AuthAccount, signer: AuthAccount){
        
        let minterResource = adminsign.borrow<&wowSports.NFTMinter>(from:  /storage/wowSportsMintNFTMinter) ?? panic("Resource not found!")
        
          if signer.borrow<&wowSports.Collection>(from: wowSports.CollectionStoragePath) == nil 
      {

      signer.save(<- wowSports.createEmptyCollection(), to: wowSports.CollectionStoragePath)
      signer.link<&wowSports.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(wowSports.CollectionPublicPath, target: wowSports.CollectionStoragePath)

      }
          let recipientCollection = signer.getCapability(wowSports.CollectionPublicPath)
          .borrow<&wowSports.Collection{NonFungibleToken.CollectionPublic}>()!

          minterResource.mintNFT(
            recipient: recipientCollection,
            name: name,
            type: type, 
            url: url,
            ARUrl: ARUrl,
            utility: utility,
            target: target,
            specific: specific,
            specific1: specific1
            )             
      }
      
      execute{
      }
  }`

  // List of arguments
  const authorizations = [admin, buyer]
  const proposer = admin
  const payer = admin

  // "mutate" method will return us transaction id
  const txId = await mutate({
    cadence,
    proposer,
    payer,
    authorizations,
    limit: 999,
    args: (arg, t) => [arg(name, t.String), arg(type, t.String), arg(url, t.String), arg(ARUrl, t.String), arg(utility, t.String), arg(target, t.String), arg(specific, t.String), arg(specific1, t.String)]
  })

  console.log(`Submitted transaction ${txId} to the network`)

  const txDetails = await tx(txId).onceSealed()
  console.log('txDetails is ', { txDetails })

  return { txDetails }
}
