import { AlertRule } from './types';

export const AzureConfig: AlertRule[] = [
  {
    name: 'azure-security-groups-wide-open',
    description:
      "Find security groups with wide open access. A security group is determined to be wide open if there is an 'allow all' rule before 'deny all' rule.",
    queries: [
      {
        name: 'query0',
        query: 'find azure_user_group with wideOpen=true',
        version: 'v1',
      },
    ],
  },
  {
    name: 'azure-non-web-inbound-access',
    description:
      'Find security groups allowing inbound non-web access (not port 80 or 443) from the Internet to a Host or Gateway entity internally.',
    queries: [
      {
        name: 'query0',
        query:
          'find Internet that allows as rule azure_security_group as sg\n  that protects * as i\n  that (has|contains|connects|uses) (Host|Gateway) as h\nwhere\n  rule.ingress=true and\n  (rule.fromPort!=80 and rule.toPort!=80) and\n  (rule.toPort!=443 and rule.toPort!=443)\nreturn\n  sg.displayName, sg.resourceGroup,\n  rule.protocol, rule.fromPort, rule.toPort,\n  i._type, i.displayName, i.CIDR, i.privateIp, i.publicIp,\n  h._type, h.displayName, h.webLink',
        version: 'v1',
      },
    ],
  },
];
