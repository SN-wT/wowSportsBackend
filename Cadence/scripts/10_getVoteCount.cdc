// This script to retrieve total poll count
import wowSportsPoll from 0x59b297f21e60da9d

pub fun main(): {String: Int} {
  let votecount = wowSportsPoll.getVoteCount(pollname: "Who will be the NBA champions in 2023");
  return votecount
}
