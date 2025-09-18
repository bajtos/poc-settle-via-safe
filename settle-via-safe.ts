// import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import {
  type MetaTransactionData,
  OperationType,
  SigningMethod,
} from '@safe-global/types-kit'
import { Interface } from '@ethersproject/abi'

const paymentsAbi = [
  `
  function settleRail(uint256 railId, uint256 untilEpoch)
    returns (
      uint256 totalSettledAmount,
      uint256 totalNetPayeeAmount,
      uint256 totalOperatorCommission,
      uint256 finalSettledEpoch,
      string memory note
    )
  `,
]

const paymentsIface = new Interface(paymentsAbi)

const RPC_URL =
  process.env.RPC_URL ?? 'https://api.calibration.node.glif.io/rpc/v1'

console.log('RPC URL', RPC_URL)

const PAYMENTS_CONTRACT_ADDRESS =
  process.env.PAYMENTS_CONTRACT_ADDRESS ??
  '0x1096025c9D6B29E12E2f04965F6E64d564Ce0750'

console.log('Payments contract address:', PAYMENTS_CONTRACT_ADDRESS)

const SAFE_ADDRESS =
  process.env.SAFE_ADDRESS ??
  // FilCDN Beneficiary
  '0x1D60d2F5960Af6341e842C539985FA297E10d6eA'
if (!SAFE_ADDRESS) {
  throw new Error('SAFE_ADDRESS not set')
}

const PRIVATE_KEY = process.env.PRIVATE_KEY
if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY not set')
}

const [railId, untilEpoch] = process.argv.slice(2)

if (!railId) {
  throw new Error('railId (1st argument) not set')
}

if (!untilEpoch) {
  throw new Error('untilEpoch (2nd argument) not set')
}

// Initialize the Protocol Kit with Owner A
const safeKit = await Safe.init({
  provider: RPC_URL,
  signer: PRIVATE_KEY,
  safeAddress: SAFE_ADDRESS,
})

const signerAddress = await safeKit.getSafeProvider().getSignerAddress()
console.log('Signer:', signerAddress)
if (!signerAddress) {
  console.error('Unexpected error: signer address is null or undefined')
  process.exit(2)
}

console.log('== Safe info ==')
console.log('Chain ID:', await safeKit.getChainId())
console.log('IS SIGNER AN OWNER?', await safeKit.isOwner(signerAddress))

// Create a Safe transaction

const safeTransactionData: MetaTransactionData = {
  to: PAYMENTS_CONTRACT_ADDRESS,
  value: '0',
  data: paymentsIface.encodeFunctionData('settleRail', [
    BigInt(railId),
    BigInt(untilEpoch),
  ]),
  operation: OperationType.Call,
}

console.log('Creating a transaction:', safeTransactionData)

const safeTransaction = await safeKit.createTransaction({
  transactions: [safeTransactionData],
})
const signedTransaction = await safeKit.signTransaction(
  safeTransaction,
  SigningMethod.ETH_SIGN,
)

console.log('Executing the transaction...')

// Execute the Safe transaction
const tx = await safeKit.executeTransaction(signedTransaction)
console.log('TX hash:', tx.hash)
console.log(
  'TX response: %o',
  await (tx.transactionResponse as { wait: () => Promise<unknown> }).wait(),
)

console.log('Inspect the TX logs to find events related to the settlement.')
