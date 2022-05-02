# JupiterOne Alert Rule Packs

This project contains default rule packs that can be provisioned to your
JupiterOne account via the included CLI utility.

## Contribution

When making a pull request for this repo, please update the version property in the `package.json`.
If it is not updated, then the code will not get released.

Patch version - x.x.1 - A patch version is used to make a quick fix, patch a security vulnerability, or do clean up.
Minor version - x.1.x - A minor version is used to add/remove content
Major version - 1.x.x - A major version is used to introduce breaking changes

## Rule Packs

- `rule-packs/aws-config.json`

  Alert rules for AWS configuration audit

- `rule-packs/aws-threat.json`

  Alert rules for AWS threat monitoring

- `rule-packs/gcp.json`

  Alert rules for Google Cloud Platform

- `rule-packs/azure-config.json`

  Alert rules for Azure configuration audit
  
- `rule-packs/azure.json`

  Commonly used Azure alert rules
  
- `rule-packs/gcp.json`

  Commonly used GCP alert rules
  
- `rule-packs/common-alerts.json`

  Commonly used alert rules
  
- `rule-packs/critical-assets.json`

  Alert rules to monitor changes to and risks of critical assets
  
- `rule-packs/devops.json`

  Commonly used DevOps alert rules
  
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

This repo is coupled to the `@jupiterone/jupiterone-alert-rules` npm package via Github Workflows.

In order to publish your changes into a new npm package version, your **last commit** must be the
commit that is automatically made via running `npm version patch` or `yarn version --patch`. You
must then push your changes along with the version tag by using `git push --follow-tags`.

Doing both of these things will inform the CI to publish a new package version when the edits are
merged into `main`.
