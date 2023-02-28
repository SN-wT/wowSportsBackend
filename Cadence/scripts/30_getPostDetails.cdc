  import wowSportsPostsV2 from 0xf3510e7eb2b4cb38

  pub struct PostMetadata {
      pub let id: UInt64
      pub let post: String 
      pub let url: String
      pub let timestamp: String
  
      init(id: UInt64, post: String, url: String, timestamp: String) {
          self.id = id
          self.post = post
          self.url = url
          self.timestamp = timestamp
      }
  }
  
  // Get tweets owned by an account
  pub fun main(postid: UInt64, acct: Address): PostMetadata  {
      // Get the public account object for account
      let postOwner = getAccount(acct)
  
      // Find the public capability for their Collection
      
      let capability = postOwner.getCapability<&{wowSportsPostsV2.ICollectionPublic}>(wowSportsPostsV2.wowSportsPostsV2CollectionPublicPath)
      
      // borrow a reference from the capability
      let publicRef = capability.borrow()
              ?? panic("Could not borrow public reference")
      
      let post = publicRef.borrowPost(id: postid) ?? panic("Post does not exist")
      let postMetadata = PostMetadata(id: postid, post: post.postdata["post"]!, url: post.postdata["url"]!, timestamp: post.postdata["time"]!);
  
      return postMetadata
  
      } 