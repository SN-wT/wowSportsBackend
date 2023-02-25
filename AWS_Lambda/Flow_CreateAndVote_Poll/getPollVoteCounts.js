// This script is used for getting vote poll counts
import { config, query } from '@onflow/fcl'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const getPollVoteCounts = async (pollname) => {

  // Cadence code for getting poll vote counts
  const cadence = `

  import wowSportsPoll from 0x59b297f21e60da9d

  pub fun main(pollname: String): {String: Int} {
    let votecount = wowSportsPoll.getVoteCount(pollname: pollname);
    return votecount
  }
    `

  // "query" method will return poll counts
  const PollCounts = await query({
    cadence,
    args: (arg, t) => [arg(pollname, t.String)]
  })

  return PollCounts
}