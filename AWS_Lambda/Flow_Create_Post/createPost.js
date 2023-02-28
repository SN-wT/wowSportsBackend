//This script used for creating user posts
import { config, mutate, tx, sansPrefix, withPrefix } from '@onflow/fcl'
import { admin } from './adminAcc.js'
import { SHA3 } from 'sha3'
import elliptic from 'elliptic'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const createPost = async (address, userPrivateKey, post, url) => {
  const timestamp = Math.floor(Date.now() / 1000).toString()
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

 

  // Cadence code for creating user posts
  const cadence = `
  import wowSportsPostsV2 from 0xf3510e7eb2b4cb38

  transaction(post: String, url: String, timestamp: String) {

    prepare(acct: AuthAccount) {
  
      if acct.borrow<&wowSportsPostsV2.Collection>(from: wowSportsPostsV2.wowSportsPostsV2CollectionStoragePath) != nil {
              log("Collection exists!")
          } else {
            
              acct.save<@wowSportsPostsV2.Collection>(<-wowSportsPostsV2.createEmptyCollection(), to: wowSportsPostsV2.wowSportsPostsV2CollectionStoragePath)
              acct.link<&{wowSportsPostsV2.ICollectionPublic}>(wowSportsPostsV2.wowSportsPostsV2CollectionPublicPath, target: wowSportsPostsV2.wowSportsPostsV2CollectionStoragePath)
          }
  
        let postsReference = acct.borrow<&wowSportsPostsV2.Collection>(from: wowSportsPostsV2.wowSportsPostsV2CollectionStoragePath)      
        let createdID = postsReference?.savePost(post: <- wowSportsPostsV2.newPost(post: post, url: url, timestamp: timestamp))
        log("created id is ".concat(createdID?.toString()!))
        log(postsReference?.getIDs())
    
    }
  
    execute {
     
    }
  }`

  // List of arguments  
  const authorizations = [user]
  const proposer = user
  const payer = admin

  // "mutate" method will return us transaction id
  const txId = await mutate({
    cadence,
    proposer,
    payer,
    authorizations,
    limit: 999,
    args: (arg, t) => [arg(post, t.String), arg(url, t.String), arg(timestamp, t.String)]
  })

  console.log(`Submitted transaction ${txId} to the network`)
 
  const txDetails = await tx(txId).onceSealed()
  
  console.log({ txDetails })
  const postId = txDetails.events[0].data.postid
  const statusString = txDetails.statusString

  return { postId, statusString }
}
