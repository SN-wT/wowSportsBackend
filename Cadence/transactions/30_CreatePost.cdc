 import wowSportsPostsV2 from 0xf3510e7eb2b4cb38

  transaction(post: String, url: String, timestamp: String) {

    prepare(acct: AuthAccount) {
  
      if acct.borrow<&wowSportsPostsV2.Collection>(from: wowSportsPostsV2.wowSportsPostsV2CollectionStoragePath) != nil {
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
  }