  import wowSportsPostsV2 from 0xf3510e7eb2b4cb38

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