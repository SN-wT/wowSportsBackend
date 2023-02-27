 // 
// Adapted from https://dev.to/muttoni/lets-build-a-twitter-clone-on-web3-a-comprehensive-guide-to-building-on-flow-24l9
//
pub contract wowSportsPostsV2 {

    pub let wowSportsPostsV2CollectionStoragePath: StoragePath
    pub let wowSportsReactionsStoragePath: StoragePath
      pub let wowSportsReactionsPublicPath: PublicPath
   // pub let wowSportsRecentPostsStoragePath: StoragePath
    pub let wowSportsPostsV2CollectionPublicPath: PublicPath
  
    // A map for the most liked fan posts
    // pub let wallofFamePosts: {UInt64: PostReactions}
  

    //
    // Map of reactions count for a Postid
    // 
    //access(self) var postReactions: {UInt64: UInt64} 

    pub event CreatedPost(postid: UInt64)

    // Interface to expose get count alone
  pub resource interface IReactionsPublic {
       pub fun getReactionsCount(id: UInt64): UInt64 
    }

// post reactions are restricted
    pub resource PostReactions: IReactionsPublic {

            // A map of postid to likeCount
            pub var postReactions: {UInt64: UInt64}
            // postid to share count
            pub var postShares: {UInt64: UInt64} 

            init() {
               self.postReactions = {}
               self.postShares = {}
            }

            pub fun updatePostReactions(postid: UInt64): UInt64 {
              let reactionCount = self.postReactions[postid] ??  0
              self.postReactions[postid] =  reactionCount + 1
              return self.postReactions[postid]!;
            }

            pub fun updatePostShares(postid: UInt64): UInt64 {
              let shareCount = self.postShares[postid] ??  0
              self.postShares[postid] =  shareCount + 1
              return self.postShares[postid]!;
            }

            pub fun getReactionsCount(id: UInt64): UInt64 {

                    return self.postReactions[id] ?? 0;
            }

    }

/*
      pub fun getPostReactionsAdmin(): @PostReactions {

            return <- create PostReactions()

    }
    */
    

    pub resource Post {

        pub let postid: UInt64
        pub let postdata: {String: String}

        init(post: String, url: String, timestamp: String) {
            self.postid = self.uuid
            self.postdata = {
                "post": post,
                "url": url,
                "time": timestamp
            }
        }

    }


    pub fun newPost(post: String, url: String, timestamp: String): @Post {
        return <-create Post(post: post, url: url, timestamp: timestamp)
    }

    
    pub resource interface ICollectionPublic {
        pub fun getIDs(): [UInt64]
        pub fun borrowPost(id: UInt64): &Post?
       // pub fun getReactionsCount(id: UInt64): UInt64 
    }
    
    pub resource Collection: ICollectionPublic {
      
        pub var posts: @{UInt64: Post}
    

   //  pub fun savePost(post: @Post, recentPostsResource: &wowSportsPostsV2.recent50Posts): UInt64 {
   pub fun savePost(post: @Post): UInt64 {
           
            let newid = post.postid;
            self.posts[post.postid] <-! post
             emit CreatedPost(postid: newid)
         //   recentPostsResource.upatePostsMap(recentPostsResource: recentPostsResource, address: wowSportsPostsV2.account.address, newid: newid)
            return newid;
            
        }


    /*
          pub fun updatePostReactions(postid: UInt64): UInt64 {
       
              let reactionCount = wowSportsPostsV2.postReactions[postid] ??  0
              wowSportsPostsV2.postReactions[postid] =  reactionCount + 1
              return wowSportsPostsV2.postReactions[postid]!
           
        }

    

        pub fun getReactionsCount(id: UInt64): UInt64 {
                return wowSportsPostsV2.postReactions[id] ?? 0
        }
        */

    

        // get all the id's of the posts in the collection
        pub fun getIDs(): [UInt64] {
            return self.posts.keys
        }

         pub fun borrowPost(id: UInt64): &Post? {
            if self.posts[id] != nil {
                let ref = (&self.posts[id] as &wowSportsPostsV2.Post?)!
                return ref
            }
            return nil
        }

        init() {
            self.posts <- {}
        }

        destroy() {
            destroy self.posts
        }
    }
 
    init() {

       
         //   self.postReactions = {}
         //   self.postsAddressCrossRef = {}
            self.wowSportsPostsV2CollectionStoragePath = /storage/wowSportsPostsV2Collection
         //   self.wowSportsRecentPostsStoragePath = /storage/wowSportsRecentPostsCollection
            self.wowSportsReactionsStoragePath = /storage/StoragePathRecations
            self.wowSportsReactionsPublicPath = /public/PostReactions
            self.wowSportsPostsV2CollectionPublicPath = /public/wowSportsPostsV2Collection 
            self.account.save(<- self.createEmptyCollection(), to: self.wowSportsPostsV2CollectionStoragePath)
         //   self.account.save(<- self.getRecentPostsResource(), to: self.wowSportsRecentPostsStoragePath)
            self.account.link<&{ICollectionPublic}>(self.wowSportsPostsV2CollectionPublicPath, target: self.wowSportsPostsV2CollectionStoragePath)
            self.account.save<@wowSportsPostsV2.PostReactions>(<- create wowSportsPostsV2.PostReactions(), to: self.wowSportsReactionsStoragePath)
            self.account.link<&{IReactionsPublic}>(self.wowSportsReactionsPublicPath, target: self.wowSportsReactionsStoragePath);
      
    } 

     // create a new collection
    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }


}
