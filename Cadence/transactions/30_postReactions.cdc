import wowSportsPostsV2 from 0xf3510e7eb2b4cb38

transaction(postid: UInt64) {

  prepare(acct: AuthAccount) {


   let collectionsReference = acct.borrow<&wowSportsPostsV2.PostReactions>(from: wowSportsPostsV2.wowSportsReactionsStoragePath)

     if (collectionsReference != nil) {
   
         let reactionsCount = collectionsReference?.updatePostReactions(postid: postid)
        log(reactionsCount)
     } else {
     }
     
  }

  execute {
   
  }
}