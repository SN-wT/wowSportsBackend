// This script to retrieve nft for particular address from contract
  import wowSports from 0x7b4b3fdedb68dad7
  import MetadataViews from 0x631e88ae7f1d7c20

  pub fun main(address: Address): [wowSports.wowSportsData] {
    let collection = getAccount(address).getCapability(wowSports.CollectionPublicPath)
                      .borrow<&{MetadataViews.ResolverCollection}>()
                      ?? panic("Could not borrow a reference to the nft collection")
  
    let ids = collection.getIDs()
  
    let getNfts: [wowSports.wowSportsData] = []
  
    for id in ids {
      
      let nft = collection.borrowViewResolver(id: id)
      let view = nft.resolveView(Type<wowSports.wowSportsData>())!
  
      let display = view as! wowSports.wowSportsData
      getNfts.append(display)
    }
      
    return getNfts
  }