export enum AlertRuleLevel {
  Info = 'INFO',
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL',
}

export interface AlertRule {
  name: string;
  description: string;
  queries: AlertRuleQuery[];
  alertLevel?: AlertRuleLevel;
  templates?: AlertRuleTemplates;
}

export interface AlertRuleQuery {
  name: string;
  query: string;
  version: string;
}

export interface AlertRuleTemplates {
  emailBody?: string;
  slackBody?: string;
  jiraTicket?: string;
}
