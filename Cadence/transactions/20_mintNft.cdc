  // Transaction script for minting Non-Fungible Token
  import wowSports from 0x7b4b3fdedb68dad7
  import NonFungibleToken from 0x631e88ae7f1d7c20
  import MetadataViews from 0x631e88ae7f1d7c20

  transaction(name: String, type: String, url: String, ARUrl: String, utility: String, target: String, specific: String, specific1: String){

      prepare(adminsign: AuthAccount, signer: AuthAccount){
        
        let minterResource = adminsign.borrow<&wowSports.NFTMinter>(from:  /storage/wowSportsMintNFTMinter) ?? panic("Resource not found!")
        
          if signer.borrow<&wowSports.Collection>(from: wowSports.CollectionStoragePath) == nil 
      {

      signer.save(<- wowSports.createEmptyCollection(), to: wowSports.CollectionStoragePath)
      signer.link<&wowSports.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(wowSports.CollectionPublicPath, target: wowSports.CollectionStoragePath)

      }
          let recipientCollection = signer.getCapability(wowSports.CollectionPublicPath)
          .borrow<&wowSports.Collection{NonFungibleToken.CollectionPublic}>()!
          
          minterResource.mintNFT(
            recipient: recipientCollection,
            name: name,
            type: type, 
            url: url,
            ARUrl: ARUrl,
            utility: utility,
            target: target,
            specific: specific,
            specific1: specific1
            )             
      }
      
      execute{
      }
  }