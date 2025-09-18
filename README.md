# poc-settle-via-safe

Settle a Filecoin Pay rail via Safe

Node.js 24+ is required.

```
PRIVATE_KEY=<your wallet private key> SAFE_ADDRESS=<your-safe-address> node settle-via-safe.js <rail-id> <until-epoch>
```

You can map DataSet ID to Rail IDs using `utils/settle-dataset-rails.js` from synapse-sdk.
