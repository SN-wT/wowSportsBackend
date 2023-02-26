// This script is used for getting vote poll counts
import { config, query } from '@onflow/fcl'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const handler = async function (event, context) {
  let pollname = ''

  try {
    pollname = event.pollname
  } catch (err) {
    console.log('Starting... error with event processing ', err)
    return 'error getting input Details'
  }

  // Cadence code for get vote poll counts
  const cadence = `

  import wowSportsPoll from 0xf3510e7eb2b4cb38

  pub fun main(pollname: String): {String: Int} {
    let votecount = wowSportsPoll.getVoteCount(pollname: pollname);
    return votecount
  }
    `

  // "query" method will return PollCounts
  const PollCounts = await query({
    cadence,
    args: (arg, t) => [arg(pollname, t.String)]
  })

  return PollCounts
}
