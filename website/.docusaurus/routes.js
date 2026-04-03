import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/al-copilot-skills-site/contributors',
    component: ComponentCreator('/al-copilot-skills-site/contributors', '0d2'),
    exact: true
  },
  {
    path: '/al-copilot-skills-site/search',
    component: ComponentCreator('/al-copilot-skills-site/search', '04e'),
    exact: true
  },
  {
    path: '/al-copilot-skills-site/docs',
    component: ComponentCreator('/al-copilot-skills-site/docs', '180'),
    routes: [
      {
        path: '/al-copilot-skills-site/docs',
        component: ComponentCreator('/al-copilot-skills-site/docs', '84f'),
        routes: [
          {
            path: '/al-copilot-skills-site/docs',
            component: ComponentCreator('/al-copilot-skills-site/docs', '38b'),
            routes: [
              {
                path: '/al-copilot-skills-site/docs/contributing',
                component: ComponentCreator('/al-copilot-skills-site/docs/contributing', 'a67'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/instructions/',
                component: ComponentCreator('/al-copilot-skills-site/docs/instructions/', '8d0'),
                exact: true
              },
              {
                path: '/al-copilot-skills-site/docs/instructions/skills-creation.instructions',
                component: ComponentCreator('/al-copilot-skills-site/docs/instructions/skills-creation.instructions', 'fae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/intro',
                component: ComponentCreator('/al-copilot-skills-site/docs/intro', '0cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/LICENSE',
                component: ComponentCreator('/al-copilot-skills-site/docs/LICENSE', '333'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/releasenotes/2026/april',
                component: ComponentCreator('/al-copilot-skills-site/docs/releasenotes/2026/april', 'f10'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/SECURITY',
                component: ComponentCreator('/al-copilot-skills-site/docs/SECURITY', 'f1b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-api-page-generator/references/api-examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-api-page-generator/references/api-examples', '7a0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-api-page-generator/references/api-patterns',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-api-page-generator/references/api-patterns', '586'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-api-page-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-api-page-generator/SKILL', 'ae1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-api-query-generator/references/query-examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-api-query-generator/references/query-examples', '276'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-api-query-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-api-query-generator/SKILL', '857'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-attachments-generator/references/code-templates',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-attachments-generator/references/code-templates', '656'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-attachments-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-attachments-generator/SKILL', '0bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-business-events-generator/references/code-templates',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-business-events-generator/references/code-templates', '71e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-business-events-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-business-events-generator/SKILL', '288'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/examples', '271'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/field-layout',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/field-layout', '1a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/quick-start',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/quick-start', '3ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/standard-components',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-cds-page-generator/references/standard-components', '94d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-cds-page-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-cds-page-generator/SKILL', '670'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/references/generate-entity-list-script',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/references/generate-entity-list-script', 'a30'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/references/generate-entity-script',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/references/generate-entity-script', 'edf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/references/workflow-examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/references/workflow-examples', 'f63'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-dataverse-entity-generator/SKILL', 'a04'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-dataverse-mapping-generator/references/custom-entity-mapping',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-dataverse-mapping-generator/references/custom-entity-mapping', '08f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-dataverse-mapping-generator/references/oob-entity-mapping',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-dataverse-mapping-generator/references/oob-entity-mapping', '7e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-dataverse-mapping-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-dataverse-mapping-generator/SKILL', 'b22'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-install-codeunit-generator/references/install-examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-install-codeunit-generator/references/install-examples', '474'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-install-codeunit-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-install-codeunit-generator/SKILL', 'e7d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-number-series-generator/references/number-series-examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-number-series-generator/references/number-series-examples', 'fd6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-number-series-generator/references/number-series-troubleshooting',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-number-series-generator/references/number-series-troubleshooting', 'ceb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-number-series-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-number-series-generator/SKILL', '4c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-setup-table-generator/references/patterns',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-setup-table-generator/references/patterns', '259'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-setup-table-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-setup-table-generator/SKILL', '3a3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-setup-wizard-generator/references/code-templates',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-setup-wizard-generator/references/code-templates', '04b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-setup-wizard-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-setup-wizard-generator/SKILL', '7ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-telemetry-generator/references/kql-queries',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-telemetry-generator/references/kql-queries', 'db5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-telemetry-generator/references/telemetry-reference',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-telemetry-generator/references/telemetry-reference', 'e97'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-telemetry-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-telemetry-generator/SKILL', 'f5a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-test-codeunit-generator/references/test-examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-test-codeunit-generator/references/test-examples', '2cf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-test-codeunit-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-test-codeunit-generator/SKILL', '252'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-upgrade-codeunit-generator/references/upgrade-examples',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-upgrade-codeunit-generator/references/upgrade-examples', 'a0d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/al-copilot-skills-site/docs/skills/bc-upgrade-codeunit-generator/SKILL',
                component: ComponentCreator('/al-copilot-skills-site/docs/skills/bc-upgrade-codeunit-generator/SKILL', 'dff'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/al-copilot-skills-site/roadmap',
    component: ComponentCreator('/al-copilot-skills-site/roadmap', '075'),
    routes: [
      {
        path: '/al-copilot-skills-site/roadmap',
        component: ComponentCreator('/al-copilot-skills-site/roadmap', 'eb4'),
        routes: [
          {
            path: '/al-copilot-skills-site/roadmap',
            component: ComponentCreator('/al-copilot-skills-site/roadmap', 'f68'),
            routes: [
              {
                path: '/al-copilot-skills-site/roadmap/2026/april',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/april', '9bd'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/august',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/august', '5d9'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/december',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/december', 'd1e'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/july',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/july', '15a'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/june',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/june', '53e'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/may',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/may', '263'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/november',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/november', 'b7b'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/october',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/october', '349'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2026/september',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2026/september', 'c5b'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/april',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/april', '1bc'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/august',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/august', 'fc2'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/december',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/december', '522'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/february',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/february', '46d'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/january',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/january', '615'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/july',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/july', '480'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/june',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/june', 'a22'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/march',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/march', 'f21'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/may',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/may', '6e9'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/november',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/november', '32f'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/october',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/october', 'daf'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/2027/september',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/2027/september', '3bd'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/RELEASE-PLAN-GUIDE',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/RELEASE-PLAN-GUIDE', 'a29'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/al-copilot-skills-site/roadmap/TEMPLATE',
                component: ComponentCreator('/al-copilot-skills-site/roadmap/TEMPLATE', '925'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/al-copilot-skills-site/',
    component: ComponentCreator('/al-copilot-skills-site/', '498'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
