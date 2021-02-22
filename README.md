# JupiterOne Alert Rule Packs

This project contains default rule packs that can be provisioned to your
JupiterOne account via the included CLI utility.

## Rule Packs

- `rule-packs/aws-config.json`

  Alert rules for AWS configuration audit

- `rule-packs/aws-threat.json`

  Alert rules for AWS threat monitoring

- `rule-packs/gcp.json`

  Alert rules for Google Cloud Platform

- `rule-packs/common-alerts.json`

  Commonly used alert rules

All rules inherit the alert settings from `index.js`.

## Provision Rules

To add these alert rules to your account via the CLI, you will need to install
the **JupiterOne CLI** from [npm][1] or download source from [github][2]:

**Install J1 CLI**

```bash
npm install @jupiterone/jupiterone-client-nodejs -g
```

**Provision Rule Pack**

```bash
j1 -a <j1AccountId> -u <j1Username> -o provision-alert-rule-pack --alert -f aws-config
```

[1]: https://www.npmjs.com/package/@jupiterone/jupiterone-client-nodejs
[2]: https://github.com/JupiterOne/jupiterone-client-nodejs

## Contribution

This repo is coupled to the `@jupiterone/jupiterone-alert-rules` npm package via Github Workflows. Any rule pack edits should be followed by an `npm version patch` command to inform the CI to publish a new package version when the edits are merged into `master`.