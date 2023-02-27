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

  console.log('Signing Transaction')

  // Our Cadence code. Notice the use of alias here
  const cadence = `
  import wowSportsPosts from 0x6c4a3489acbd49eb

  transaction(post: String, url: String, timestamp: String) {

    prepare(acct: AuthAccount) {
  
      if acct.borrow<&wowSportsPosts.Collection>(from: wowSportsPosts.wowSportsPostsCollectionStoragePath) != nil {
              log("Collection exists!")
          } else {
            
              acct.save<@wowSportsPosts.Collection>(<-wowSportsPosts.createEmptyCollection(), to: wowSportsPosts.wowSportsPostsCollectionStoragePath)
              acct.link<&{wowSportsPosts.ICollectionPublic}>(wowSportsPosts.wowSportsPostsCollectionPublicPath, target: wowSportsPosts.wowSportsPostsCollectionStoragePath)
          }
  
        let postsReference = acct.borrow<&wowSportsPosts.Collection>(from: wowSportsPosts.wowSportsPostsCollectionStoragePath)      
        let createdID = postsReference?.savePost(post: <- wowSportsPosts.newPost(post: post, url: url, timestamp: timestamp))
        log("created id is ".concat(createdID?.toString()!))
        log(postsReference?.getIDs())
    
    }
  
    execute {
     
    }
  }`

  // List of arguments
  console.log('admin ', admin)
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
  console.log('Waiting for transaction to be sealed...')

  const label = 'Transaction Sealing Time'
  console.time(label)
  const txDetails = await tx(txId).onceSealed()
  console.timeEnd(label)
  console.log({ txDetails })
  const postId = txDetails.events[0].data.postid
  const statusString = txDetails.statusString

  console.log('postId ', postId)

  return { postId, statusString }
}
