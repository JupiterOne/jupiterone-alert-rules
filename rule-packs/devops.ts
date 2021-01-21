import { AlertRule, AlertRuleLevel } from './types';

export const DevOps: AlertRule[] = [
  {
    name: 'private-repo-published-publicly',
    description:
      'Find code repos marked as private but published as public packages/modules.',
    queries: [
      {
        name: 'query0',
        query:
          "find CodeRepo with public!=true and classification!='public' that published CodeModule with public=true",
        version: 'v1',
      },
    ],
  },
  {
    name: 'aws-ecs-tasks-orphaned',
    description:
      'Finds ECS tasks that are running for over 24 hours but its corresponding task definition is gone. These tasks are orphaned and shows up as INACTIVE in the AWS Console.',
    queries: [
      {
        name: 'query0',
        query:
          'find aws_ecs_task with active=true and createdOn < date.now-24hours that !DEFINES aws_ecs_task_definition',
        version: 'v1',
      },
    ],
    alertLevel: AlertRuleLevel.Info,
  },
];
