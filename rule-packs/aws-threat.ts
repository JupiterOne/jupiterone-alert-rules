import { AlertRule, AlertRuleLevel } from './types';

export const AwsThreat: AlertRule[] = [
  {
    name: 'aws-guardduty-inspector-finding-instance-correlation',
    description:
      'Identifies vulnerable EC2 instances (i.e. with medium or higher rated open Inspector finding) that are also targets of suspicious activities (i.e. with medium or higher rated open GuardDuty finding).',
    queries: [
      {
        name: 'query0',
        query:
          'Find aws_guardduty_finding with numericSeverity > 5 and open=true as guardduty that relates to aws_instance as i that has aws_inspector_finding with numericSeverity > 5 and open=true as inspector return i.*, guardduty.*, inspector.*',
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.High,
  },
  {
    name: 'aws-unvalidated-external-trusts',
    description:
      "Identifies assume role trust relationships from integrated account to external IAM role or user or account that is not integrated (i.e. unknown to JupiterOne). Ensure all valid accounts are integrated to reduce noise. You can also manually edit known/trusted external accounts and set the 'validated' property to 'true'.",
    queries: [
      {
        name: 'query0',
        query:
          "Find aws_account as aws that HAS aws_iam that HAS aws_iam_role as role that TRUSTS (AccessRole|User|Account) with _source='system-mapper' and validated!=true as e return aws.name, aws.accountId, role.roleName, e.displayName, e._type, e.arn",
        version: 'v1',
      },
    ],
  },
  {
    name: 'aws-guardduty-finding-unattributed',
    description:
      'Identifies GuardDuty findings with a userName that is not mapped to a known User or Person entity. Unmapped finding (without attribution) could be an indicator of compromise (IOC).',
    queries: [
      {
        name: 'query0',
        query: 'find Finding with userName!=undefined that !has (Person|User)',
        version: 'v1',
      },
    ],
  },
  {
    name: 'aws-s3-public-access-via-ec2-instances-iam',
    description:
      'Non-public S3 buckets accessible via public facing EC2 instances and their assigned IAM roles/policies.',
    queries: [
      {
        name: 'query0',
        query:
          "find UNIQUE Internet\n  that allows as rule aws_security_group\n  that protects aws_instance with active=true as instance\n  that uses aws_iam_role as role\n  that assigned AccessPolicy as policy\n  that allows (aws_s3|aws_s3_bucket) with classification!='public' as s3\nreturn\n  s3.tag.AccountName, s3.bucketName, instance.name, instance.instanceId, instance.owner, instance.webLink, role.roleName, policy.displayName",
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.High,
  },
  {
    name: 'aws-s3-public-access-via-cloudfront',
    description:
      'Non-public S3 buckets accessible via cloudfront distribution gateways.',
    queries: [
      {
        name: 'query0',
        query:
          "find Internet\n  that CONNECTS aws_cloudfront_distribution with active=true as cloudfront\n  that CONNECTS aws_s3_bucket with classification!='public' as s3\nreturn\n  s3.bucketName, s3.tag.AccountName, s3.ownerId, s3.owner, s3.webLink,\n  cloudfront.domainName, cloudfront.tag.AccountName, cloudfront.webLink",
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.High,
  },
];
