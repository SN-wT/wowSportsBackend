// Lambda script for getting nfts from contract
import { config, query } from '@onflow/fcl'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const handler = async function (event, context) {
  let address = ''

  try {
    address = event.address
  } catch (err) {
    console.log('Starting... error with event processing ', err)
    return 'error getting input Details'
  }

  console.log('Signing Transaction')

  // Cadence code for getting nfts
  const cadence = `

  import wowSports from 0x59b297f21e60da9d
  import MetadataViews from 0x631e88ae7f1d7c20

  pub fun main(address: Address): [wowSports.wowSportsData] {
    // let address: Address
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
    `

  // "query" method will return us transaction id
  const nftDetails = await query({
    cadence,
    args: (arg, t) => [arg(address, t.Address)]
  })

  console.log(`${JSON.stringify(nftDetails)}`)
  return { "body": nftDetails }
}
