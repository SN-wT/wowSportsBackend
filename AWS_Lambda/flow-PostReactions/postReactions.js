//This script used for update post reactions
import { config, mutate, tx } from '@onflow/fcl'
import { admin } from './adminAcc.js'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const reactPost = async (postid) => {

  
  // Cadence code to update post reactions
  const cadence = `
  import wowSportsPostsV2 from 0xf3510e7eb2b4cb38

transaction(postid: UInt64) {

  prepare(acct: AuthAccount) {


   let collectionsReference = acct.borrow<&wowSportsPostsV2.PostReactions>(from: wowSportsPostsV2.wowSportsReactionsStoragePath)

     if (collectionsReference != nil) {
        log("reference is not nil ")

   
         let reactionsCount = collectionsReference?.updatePostReactions(postid: postid)
        log(reactionsCount)
     } else {
     }
     
  }

  execute {
   
  }
}`

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
    limit: 999,
    args: (arg, t) => [arg(postid, t.UInt64)]
  })

  console.log(`Submitted transaction ${txId} to the network`)
 
  const txDetails = await tx(txId).onceSealed()
  
  console.log({txDetails})

}
