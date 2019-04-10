'use strict';

const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs/src/j1client');
const { prompt } = require('inquirer');
const program = require('commander');
const error = require('./util/error');
const fs = require('fs');
const path = require('path');

const J1_USER_POOL_ID = process.env.J1_USER_POOL_ID || 'us-east-2_9fnMVHuxD';
const J1_CLIENT_ID = process.env.J1_CLIENT_ID || '1hcv141pqth5f49df7o28ngq1u';
const J1_API_TOKEN = process.env.J1_API_TOKEN;

const EUSAGEERROR = 126;

async function main() {
  program
    .version(require('./package').version, '-v, --version')
    .usage('[options]')
    .option('-a, --account <name>', 'JupiterOne account name.')
    .option('-u, --user <email>', 'JupiterOne user email.')
    .option('-k, --key <apiToken>', 'JupiterOne API access token.')
    .option('-r, --rules <name>', 'Name of rule pack to provision.')
    .parse(process.argv);

  try {
    const data = await validateInputs();
    const j1Client = await initializeJ1Client();
    await provisionRules(j1Client, data);
  }
  catch (err) {
    error.fatal(`Unexpected error: ${err}`);
  }

  console.log('Done!');
}

async function validateInputs() {
  process.stdout.write('Validating inputs... ');
  if (!program.account || program.account === '') {
    error.fatal('Missing -a|--account flag!', EUSAGEERROR);
  }

  let data;

  if ((!program.key || program.key === '') && !J1_API_TOKEN) {
    if (!program.user || program.user === '') {
      error.fatal('Must authenticate with either the API key (using -k|--key) or username/password (using -u|--user)', EUSAGEERROR);
    } else {
      await gatherPassword();
    }
  }

  if (!program.rules || program.rules === '') {
    error.fatal('Must specify name of rule pack with -r|--rules)', EUSAGEERROR);
  } else {
    const rulePacksFile = path.resolve(path.join('./rule-packs', program.rules + '.json'));

    if (!fs.existsSync(rulePacksFile)) {
      error.fatal(`Could not find file for rule pack (${program.rules}) at ${rulePacksFile}.`);
    } else {
      data = jParse(rulePacksFile);
      if (!data) {
        error.fatal(`Could not parse rule pack file ${rulePacksFile}.`);
      }
    }
  }

  console.log('OK');
  return data;
}

function getDefaultSettings() {
  const settingsFile = path.resolve('./rule-settings/default-settings.json');
  return jParse(settingsFile);
}

function jParse(file) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (err) { return null; }
  return data;
}

// Note: this will happily read from STDIN if data is piped in...
// e.g. if lastpass is installed:
// lpass show MyJ1Password | psp publish -u my.user@domain.tld -a myaccount
async function gatherPassword() {
  const answer = await prompt([
    {
      type: 'password',
      name: 'password',
      message: 'JupiterOne password:'
    }
  ]);
  program.password = answer.password;
}

async function initializeJ1Client() {
  process.stdout.write('Authenticating with JupiterOne... ');
  const j1Client = 
    await (new JupiterOneClient(
      program.account,
      program.user,
      program.password,
      J1_USER_POOL_ID,
      J1_CLIENT_ID,
      program.key || J1_API_TOKEN
    )).init(true);
  console.log('OK');
  return j1Client;
}

async function provisionRules(j1Client, rules) {
  const defaultSettings = getDefaultSettings();
  const promises = [];
  for (const r of rules) {
    if (r.instance) {
      const update = r.instance.id !== undefined;
      promises.push(j1Client.mutateAlertRule(rule, update));
    }
    else {
      const instance = {
        name: r.name,
        description: r.description,
        question: {
          queries: r.queries
        },
        ...defaultSettings
      }
      promises.push(j1Client.mutateAlertRule({instance}, false));
    }
  }
  const res = await Promise.all(promises);
  process.stdout.write(`${res.length} rules provisioned:\n${JSON.stringify(res, null, 2)}\n`);
}

main();