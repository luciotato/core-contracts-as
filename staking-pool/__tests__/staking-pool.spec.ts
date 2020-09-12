import { Runtime, Account, stateSize } from "near-sdk-simulator";
import { DEFAULT_GAS, ResultsObject, StandaloneOutput } from "near-sdk-simulator/dist/types";

class RewardFeeFraction {
  constructor(
    public numerator: number,
    public denominator: number )
  {}
}

let runtime: Runtime;
let owner: Account;
let contract: Account;
let alice: Account;
const INPUT = "USER123";
const DEPOSIT = "42";
const ZERO_DEPOSIT = "0"
const DEPOSIT_100 = "100"

type CallResult = {
  return_data: any;
  err: any;
  result: StandaloneOutput;
  calls: any;
  results: ResultsObject;
}

type ReturnValue = {
  Value: string
}

const zeroFee = new RewardFeeFraction(0,1)
const rewardFeeFraction_8 = new RewardFeeFraction(8,100)

//helper functions
function createStakingPoolContract(owner: Account, rff:RewardFeeFraction): CallResult {
  let params = {
    owner_id: owner.account_id,
    stake_public_key: "7VY9Zidrta8jmthaH4wnsqXZ498Hx5tX3uY8MkaCzcwH",
    reward_fee_fraction: rff
  };

  return owner.call_other("staking-pool", "init", params, DEFAULT_GAS, ZERO_DEPOSIT)
}

describe("staking-pool", () => {

  beforeEach(() => {
    runtime = new Runtime()
    owner = runtime.newAccount("owner")
    contract = runtime.newAccount("staking-pool", __dirname + "/../../build/debug/staking-pool.wasm")
    contract.balance = 2 * 1e12
    alice = runtime.newAccount("alice")
  });

  test("init, deposit, get_info, withdraw", () => {

    let init = createStakingPoolContract(owner,rewardFeeFraction_8)
    expect(init.err).toBeNull()

    let stakeKey = owner.call_other("staking-pool", "get_staking_key", null, DEFAULT_GAS, ZERO_DEPOSIT)
    const value = (stakeKey.result.outcome.return_data as ReturnValue).Value;
    //expressely wrong until fixing of near-sdk-as/base58
    expect(value).toBe('"17VY9Zidrta8jmthaH4wnsqXZ498Hx5tX3uY8MkaCzcwH"')

    const rffInfo = owner.call_other("staking-pool", "get_reward_fee_fraction", null, DEFAULT_GAS, ZERO_DEPOSIT)
    const rff = JSON.parse((rffInfo.result.outcome.return_data as ReturnValue).Value)
    expect(rff).toStrictEqual({ numerator: 8, denominator: 100 })

    let depo = alice.call_other("staking-pool", "deposit", null, DEFAULT_GAS, DEPOSIT_100)
    expect(depo.result.outcome.balance).toBe('2000000000100')

    let getInfo = alice.call_other("staking-pool", "get_account", { "account_id": "alice" }, DEFAULT_GAS, ZERO_DEPOSIT)
    expect(getInfo.result.outcome.return_data as unknown).toStrictEqual({ "Value": '{"account_id":"alice","unstaked_balance":"100","staked_balance":"0","can_withdraw":false}' })

    let wtd = alice.call_other("staking-pool", "withdraw", { "amount": "40" }, DEFAULT_GAS, ZERO_DEPOSIT)
    expect(wtd.result.outcome.logs).toContain("@alice withdrawing 40. New unstaked balance is 60")

    let wtdAll = alice.call_other("staking-pool", "withdraw_all", null, DEFAULT_GAS, ZERO_DEPOSIT)
    expect(wtdAll.result.outcome.logs).toContain("@alice withdrawing 60. New unstaked balance is 0")

  })

})

// replicated rust tests
