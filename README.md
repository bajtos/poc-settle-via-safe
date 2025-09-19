# poc-settle-via-safe

Settle a Filecoin Pay rail via Safe

Node.js 24+ is required.

```
PRIVATE_KEY=<your wallet private key> SAFE_ADDRESS=<your-safe-address> node settle-via-safe.js <rail-id> <until-epoch>
```

You can map DataSet ID to Rail IDs using `utils/settle-dataset-rails.js` from synapse-sdk.

IMPORTANT: Rail settlement burns NETWORK_FEE amount of FIL. It's not possible to include funds in
the outer Safe transaction, therefore the Safe must have enough FIL to cover the NETWORK_FEE.
