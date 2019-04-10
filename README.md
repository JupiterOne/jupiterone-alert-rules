# JupiterOne Alert Rule Packs

This project contains default rule packs that can be provisioned to your
JupiterOne account via the included CLI utility.

## Rule Packs

- `rule-packs/aws-config.json`

  Alert rules for AWS configuration audit

All rules inherit the alert settings from `index.js`.

## Provision Rules

To add these alert rules to your account via the CLI, you will need to download
the [JupiterOne CLI][1] and run the following command:

```bash
./bin/j1cli -a <j1AccountId> -u <j1Username> -o provision-alert-rule-pack --alert -f aws-config
```

[1]: https://github.com/JupiterOne/jupiterone-client-nodejs
