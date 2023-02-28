//This script used to retrieve reactions from the contract
import { config, query } from '@onflow/fcl'
import dotenv from 'dotenv'
dotenv.config()

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const getPostReactions = async (postid) => {

    let admin = process.env.AdminAddress

  // Cadence code for get Reactions
  const cadence = `

  import wowSportsPostsV2 from ${admin}

  // Get reactions owned by an account
  pub fun main(admin: Address, postid: UInt64): UInt64  {

      // Get the public account object for account
      let postOwner = getAccount(admin)
  
      // Find the public capability for their Collection
      
      let capability = postOwner.getCapability<&{wowSportsPostsV2.IReactionsPublic}>(wowSportsPostsV2.wowSportsReactionsPublicPath)
      
      // borrow a reference from the capability
      let publicRef = capability.borrow()
              ?? panic("Could not borrow public reference")
      
  
      // get Reactions of post IDs
      let postIDs = publicRef.getReactionsCount(id: postid)
      
      return postIDs
  
      }
    `

  // "query" method will return the postIDs
  const PostReactions = await query({
    cadence,
    args: (arg, t) => [arg(admin, t.Address), arg(postid, t.UInt64)]
  })

  return PostReactions
}