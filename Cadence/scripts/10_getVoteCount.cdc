// This script to retrieve total poll count
import wowSportsPoll from 0xf3510e7eb2b4cb38

pub fun main(): {String: Int} {
  let votecount = wowSportsPoll.getVoteCount(pollname: "Who will be the NBA champions in 2023");
  return votecount
}
