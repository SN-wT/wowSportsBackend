/* 
*
*  Implementation of a Flow Non-Fungible Token standard contract.
*  It defines a simple NFT with tech utility metadata required for our mobile app.
*   
*/

import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

pub contract wowSports: NonFungibleToken {

    pub var totalSupply: UInt64

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    pub struct wowSportsData{
        pub let id: UInt64
        pub let name: String
        pub let type: String
        pub let url: String
        pub let ARUrl: String
        pub let utility: String
        pub let target: String
        pub let specific: String
        pub let specific1: String

        init(_id: UInt64, _name: String, _type: String, _url: String, _ARUrl: String, _utility: String, _target: String, _specific: String, _specific1: String){
            self.id = _id
            self.name = _name
            self.type = _type
            self.url = _url
            self.ARUrl = _ARUrl
            self.utility = _utility
            self.target = _target
            self.specific = _specific
            self.specific1 = _specific1
        }
    }

    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let name: String
        pub let type: String
        pub let url: String
        pub let ARUrl: String
        pub let utility: String
        pub let target: String
        pub let specific: String
        pub let specific1: String
    
        init(
            id: UInt64,
            name: String,
            type: String,
            url: String,
            ARUrl: String,
            utility: String,
            target: String,
            specific: String,
            specific1: String
        ) {
            self.id = id
            self.name = name
            self.type = type
            self.url = url
            self.ARUrl = ARUrl
            self.utility = utility
            self.target = target
            self.specific = specific
            self.specific1 = specific1
        }
    
        pub fun getViews(): [Type] {
            return [ Type<wowSportsData>() ]
        }

        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<wowSportsData>():
                return wowSportsData(
                    _id: self.id,
                    _name: self.name,
                    _type: self.type,
                    _url: self.url,
                    _ARUrl: self.ARUrl,
                    _utility: self.utility,
                    _target: self.target,
                    _specific: self.specific,
                    _specific1: self.specific1
                )
            }
            return nil
        }
    }

    pub resource interface wowSportsCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowwowSports(id: UInt64): &wowSports.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow wowSports reference: the ID of the returned reference is incorrect"
            }
        }
    }

    pub resource Collection: wowSportsCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        // withdraw removes an NFT from the collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // deposit takes an NFT and adds it to the collections dictionary
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @wowSports.NFT

            let id: UInt64 = token.id

            // add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // getIDs returns an array of the IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }
 
        pub fun borrowwowSports(id: UInt64): &wowSports.NFT? {
            if self.ownedNFTs[id] != nil {
                // Create an authorized reference to allow downcasting
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &wowSports.NFT
            }

            return nil
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let wowSportsNFT = nft as! &wowSports.NFT
            return wowSportsNFT as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // public function that anyone can call to create a new empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    // Resource for minting contract owner only able to call mintNFT function
    pub resource NFTMinter {

        pub fun mintNFT(
            recipient: &{NonFungibleToken.CollectionPublic},
            name: String,
            type: String,
            url: String,
            ARUrl: String,
            utility: String,
            target: String,
            specific: String,
            specific1: String
        ) {

            // create a new NFT
            var newNFT <- create NFT(
                id: wowSports.totalSupply,
                name: name,
                type: type,
                url: url,
                ARUrl: ARUrl,
                utility: utility,
                target: target,
                specific: specific,
                specific1: specific1
            )

            // deposit it in the recipient's account using their reference
            recipient.deposit(token: <-newNFT)

            wowSports.totalSupply = wowSports.totalSupply + UInt64(1)
        }
    }

    init() {
        // Initialize the total supply
        self.totalSupply = 0

        // Set the named paths
        self.CollectionStoragePath = /storage/wowSportsNFTCollection
        self.CollectionPublicPath = /public/wowSportsMintNFTCollection
        self.MinterStoragePath = /storage/wowSportsMintNFTMinter

        // Create a Collection resource and save it to storage
        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)

        // create a public capability for the collection
        self.account.link<&wowSports.Collection{NonFungibleToken.CollectionPublic, wowSports.wowSportsCollectionPublic, MetadataViews.ResolverCollection}>(
            self.CollectionPublicPath,
            target: self.CollectionStoragePath
        )

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
    }
}
 