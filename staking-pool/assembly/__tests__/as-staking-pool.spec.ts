import { u128, VMContext, Context, env, util } from "near-sdk-as";
import { init } from "..";
import { RewardFeeFraction } from "../model";

const INPUT = "USER123";
const DEPOSIT = u128.from(10);

beforeEach(() => {
//  VMContext.setAttached_deposit(DEPOSIT);
//  VMContext.setInput(INPUT);
});

describe("staking-pool contract", () => {
  it("should init", () => {

    //waiting until near-sdk-as fixes
    //const rff=new RewardFeeFraction(8,100)
    //init('owner',"7VY9Zidrta8jmthaH4wnsqXZ498Hx5tX3uY8MkaCzcwH",rff)

    // VMContext.setInput('"owner_id":"owner",'+
    // '"stake_public_key":"7VY9Zidrta8jmthaH4wnsqXZ498Hx5tX3uY8MkaCzcwH",'+
    // '"reward_fee_fraction": { "numerator": 8, "denominator": 100 }'
    // );
    // env.input(0);
    // let len = env.register_len(0);
    // let expected = new Uint8Array(len as u32);
    // // @ts-ignore;
    // env.read_register(0, expected.dataStart);
    // expect(expected).toStrictEqual(util.stringToBytes(INPUT))
  });

  it("should have correct deposit", () => {
    expect(Context.attachedDeposit).toStrictEqual(DEPOSIT);
  });
});
