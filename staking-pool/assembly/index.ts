import { Context, storage, u128, env, ContractPromise, ContractPromiseBatch, base58, logging } from "near-sdk-as"
import { AccountId, HumanReadableAccount, RewardFeeFraction } from "./model"
import { StakingContractState, getStateFromStorage, initializeState, saveState } from "./contract-internal"

const DEBUG=1

/**
 * This is the public interface for the staking contract
 * 
 * all functions are public and callable, except thos starting with '_'
 * 
 * Any code that is outside of a function is bundled into a start function. 
 * If you build with yarn `asb --wat` you'll see the generated wat file and you'll 
 * see this start function.  There is a special start section in a wasm binary
 * and this function is listed as the function that should be run when
 * the binary is instantiated, which is before any contract method is called.
 * 
 */

/**
 *  The amount of gas given to complete `vote` call.
 */
const VOTE_GAS: u128 = u128.from(100_000_000_000_000)

/// There is no deposit balance attached.
const NO_DEPOSIT: u128 = u128.from(0)

//--------------------
//   INITIALZATION - wake up from storage
//--------------------
var contract: StakingContractState = getStateFromStorage()
//--------------------
//--------------------

// function init
/// Initializes the contract with the given owner_id, initial staking public key (with ED25519
/// curve) and initial reward fee fraction that owner charges for the validation work.
///
/// The entire current balance of this contract will be used to stake. This allows contract to
/// always maintain staking shares that can't be unstaked or withdrawn.
/// It prevents inflating the price of the share too much.
//@exportAs ("new")
export function init( owner_id: AccountId, stake_public_key: string, reward_fee_fraction: RewardFeeFraction): void {
    assert(contract.owner_id == "", "Already initialized")
    //create and store this contract state
    initializeState(owner_id, stake_public_key, reward_fee_fraction)
    saveState()
    // Staking with the current pool to make sure the staking key is valid.
    //contract.restake()
}

export function test(): void {
    if (DEBUG) logging.log("test") 
    saveState()
}

// client Context.predecessor is depositing Context.attachedDeposit in their internal account
@payable
export function deposit(): void {
    if (DEBUG) logging.log("let needToRestake = contract.internalPing() ") 
    let needToRestake = contract.internalPing()
    if (DEBUG) logging.log("needToRestake = "+needToRestake.toString()) 
    if (DEBUG) logging.log("contract.clientDeposit()") 
    const deposited=contract.clientDeposit()
    if (DEBUG) logging.log("after contract.clientDeposit()") 
    saveState()
    if (DEBUG) logging.log("after saveState()") 
    if (needToRestake) {
        if (DEBUG) logging.log("contract.restake()") 
        contract.restake()
    }
}

/// Returns human readable representation of the account for the given account ID.
export function get_account(account_id: AccountId): HumanReadableAccount {
    return contract.getClientHRA(account_id)
}

/// Withdraws the entire unstaked balance from the predecessor account.
/// It's only allowed if the `unstake` action was not performed in the four most recent epochs.
export function withdraw_all(): void {
    let needToRestake = contract.internalPing()
    let clientId = Context.predecessor
    let account = contract.getClientAccount(clientId)
    contract.clientWithdraw(account.unstaked)
    saveState()
    if (needToRestake) contract.restake()
}

/// Withdraws the non staked balance for given account.
/// It's only allowed if the `unstake` action was not performed in the four most recent epochs.
export function withdraw(amount: u128): void {
    let needToRestake = contract.internalPing()
    contract.clientWithdraw(amount)
    saveState()
    if (needToRestake) contract.restake()
}

/// Returns the staking public key
export function get_staking_key(): string {
    return base58.encode(contract.stake_public_key_u8Arr)
}

/// Returns the current reward fee as a fraction.
export function get_reward_fee_fraction(): RewardFeeFraction {
    return contract.reward_fee_fraction
}

/// Returns the current reward fee as a fraction.
export function get_owner_id(): string {
    return contract.owner_id
}
