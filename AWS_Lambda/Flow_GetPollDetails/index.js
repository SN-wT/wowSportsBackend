// Lambda script for get polls details from contract
import { config, query } from '@onflow/fcl'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const handler = async function () {
  console.log('Signing Transaction')

  // Cadence code for getting poll details
  const cadence = `

  import wowSportsPoll from 0xf3510e7eb2b4cb38

  pub fun main(): {String: wowSportsPoll.Choices} {
     return wowSportsPoll.getPollDetails()
   }
    `

  // "query" method will return us transaction id
  const pollDetails = await query({
    cadence
  })

  const wowPollDetails = `${JSON.stringify(pollDetails)}`

  return wowPollDetails
}
