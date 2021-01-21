import { AlertRule, AlertRuleLevel } from './types';

export const CommonAlerts: AlertRule[] = [
  {
    name: 'domain-expires-in-30-days',
    description:
      'Find registered domain names with an expiration date within 30 days from now and not set to auto-renew.',
    queries: [
      {
        name: 'query0',
        query:
          'Find Domain with expiresOn < date.now+30days and autoRenew!=true',
        version: 'v1',
      },
    ],
  },
  {
    name: 'high-severity-finding',
    description:
      'Findings with a severity of High or a numeric severity rating higher than 7 that were new within the last 24 hours.',
    queries: [
      {
        name: 'query0',
        query:
          "Find Finding with (severity='High' or severity='high' or numericSeverity>=7) and _createdOn > date.now-24hours",
        version: 'v1',
      },
    ],
    templates: {
      emailBody:
        '({{itemIndex+1}} of {{itemCount}}) <b>{{item.displayName}}</b><br>---<br>{{item.description || item.summary}}<br><b>severity:</b> {{item.severity}}<br><br>',
      slackBody:
        '({{itemIndex+1}} of {{itemCount}}) *{{item.displayName}}*\n---\n{{item.description || item.summary}}\n*severity:* {{item.severity}}\n\n',
    },
  },
  {
    name: 'prod-resources-with-high-severity-finding',
    description: 'Production resources impacted by high severity findings',
    queries: [
      {
        name: 'query0',
        query:
          "Find unique (Host|DataStore|Application|CodeRepo|Account|Service|Network) with tag.Production=true that has Finding with severity=('High' or 'high') or (numericSeverity>=7 and numericSeverity<9)",
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.High,
  },
  {
    name: 'prod-resources-with-critical-finding',
    description: 'Production resources impacted by critical findings',
    queries: [
      {
        name: 'query0',
        query:
          "Find unique (Host|DataStore|Application|CodeRepo|Account|Service|Network) with tag.Production=true that has Finding with severity=('Critical' or 'critical') or numericSeverity>=9",
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.Critical,
  },
  {
    name: 'unencrypted-critical-data-stores',
    description:
      "Unencrypted data store with classification label of 'critical' or 'sensitive' or 'confidential' or 'restricted'",
    queries: [
      {
        name: 'query0',
        query:
          "Find DataStore with classification=('critical' or 'sensitive' or 'confidential' or 'restricted') and encrypted!=true",
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.Critical,
  },
  {
    name: 'unclassified-data-stores',
    description: 'Data stores without a classification tag assigned',
    queries: [
      {
        name: 'query0',
        query: 'Find DataStore with classification=undefined',
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.Medium,
  },
];
