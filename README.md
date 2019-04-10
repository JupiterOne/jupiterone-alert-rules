# JupiterOne Alert Rule Packs

This project contains default rule packs that can be provisioned to your
JupiterOne account via the included CLI utility.

## Rule Packs

- `rule-packs/aws-config.json`: AWS configuration audit

All rules inherit the alert settings from `rule-settings/default-settings.json`.

## Provision Rules

To add these alert rules to your account via the CLI, run the following command:

```bash
node index -a <j1AccountId> -u <j1Username> -r aws-config
```
