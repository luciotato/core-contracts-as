import { Runtime, Account, stateSize } from "near-sdk-as";
import { DEFAULT_GAS } from "near-sdk-as/runtime/dist/types";


let runtime: Runtime;
let owner: Account;
let contract: Account;
let alice: Account;
const INPUT = "USER123";
const DEPOSIT = "42";
const ZERO_DEPOSIT = "0"
const DEPOSIT_100 = "100"

type  ReturnValue = {
  Value: String
}

describe("staking-pool", () => {

  beforeEach(() => {
    runtime = new Runtime()
    owner = runtime.newAccount("owner")
    contract = runtime.newAccount("staking-pool",__dirname + "/../../build/debug/staking-pool.wasm")
    contract.balance=2*1e12
    alice = runtime.newAccount("alice")
  });

  test("init, deposit, get_info, withdraw", () => {

    let params = {
      owner_id: owner.account_id,
      stake_public_key: "7VY9Zidrta8jmthaH4wnsqXZ498Hx5tX3uY8MkaCzcwH",
      reward_fee_fraction: { numerator: 8, denominator: 100 }
    };
  
    let init = owner.call_other("staking-pool", "init", params, DEFAULT_GAS, ZERO_DEPOSIT)
    expect(init.err).toBeNull()
    
    let stakeKey = owner.call_other("staking-pool", "get_staking_key",null, DEFAULT_GAS, ZERO_DEPOSIT)
    const value = (stakeKey.result.outcome.return_data as ReturnValue).Value;
    expect(value).toBe('"7VY9Zidrta8jmthaH4wnsqXZ498Hx5tX3uY8MkaCzcwH"')

    let rffInfo = owner.call_other("staking-pool", "get_reward_fee_fraction",null, DEFAULT_GAS, ZERO_DEPOSIT)
    expect(rffInfo.result.outcome.return_data as unknown).toStrictEqual({ numerator: 8, denominator: 100 })

    let depo = alice.call_other("staking-pool", "deposit", null, DEFAULT_GAS, DEPOSIT_100)
    expect(depo.result.outcome.balance).toBe('2000000000100')

    let getInfo = alice.call_other("staking-pool", "get_account", {"account_id":"alice"}, DEFAULT_GAS, ZERO_DEPOSIT)
    expect(getInfo.result.outcome.return_data as unknown).toStrictEqual({"Value": '{"account_id":"alice","unstaked_balance":"100","staked_balance":"0","can_withdraw":false}'})

    let wtd = alice.call_other("staking-pool", "withdraw", {"amount":"40"}, DEFAULT_GAS, ZERO_DEPOSIT)
    expect(wtd.result.outcome.logs).toContain("@alice withdrawing 40. New unstaked balance is 60")

    let wtdAll = alice.call_other("staking-pool", "withdraw_all", null,  DEFAULT_GAS, ZERO_DEPOSIT)
    expect(wtdAll.result.outcome.logs).toContain("@alice withdrawing 60. New unstaked balance is 0")

  });


});
