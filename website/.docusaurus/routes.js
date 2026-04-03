import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/contributors',
    component: ComponentCreator('/contributors', 'fea'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '822'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '535'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'd8f'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '4b0'),
            routes: [
              {
                path: '/docs/contributing',
                component: ComponentCreator('/docs/contributing', '069'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/instructions/',
                component: ComponentCreator('/docs/instructions/', '756'),
                exact: true
              },
              {
                path: '/docs/instructions/skills-creation.instructions',
                component: ComponentCreator('/docs/instructions/skills-creation.instructions', 'edd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/LICENSE',
                component: ComponentCreator('/docs/LICENSE', 'f04'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/releasenotes/2026/april',
                component: ComponentCreator('/docs/releasenotes/2026/april', '855'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/SECURITY',
                component: ComponentCreator('/docs/SECURITY', '050'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-api-page-generator/references/api-examples',
                component: ComponentCreator('/docs/skills/bc-api-page-generator/references/api-examples', '363'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-api-page-generator/references/api-patterns',
                component: ComponentCreator('/docs/skills/bc-api-page-generator/references/api-patterns', '757'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-api-page-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-api-page-generator/SKILL', 'c78'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-api-query-generator/references/query-examples',
                component: ComponentCreator('/docs/skills/bc-api-query-generator/references/query-examples', 'bf4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-api-query-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-api-query-generator/SKILL', 'b5d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-attachments-generator/references/code-templates',
                component: ComponentCreator('/docs/skills/bc-attachments-generator/references/code-templates', '9f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-attachments-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-attachments-generator/SKILL', '038'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-business-events-generator/references/code-templates',
                component: ComponentCreator('/docs/skills/bc-business-events-generator/references/code-templates', 'f2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-business-events-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-business-events-generator/SKILL', 'b4a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-cds-page-generator/references/examples',
                component: ComponentCreator('/docs/skills/bc-cds-page-generator/references/examples', '55f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-cds-page-generator/references/field-layout',
                component: ComponentCreator('/docs/skills/bc-cds-page-generator/references/field-layout', '852'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-cds-page-generator/references/quick-start',
                component: ComponentCreator('/docs/skills/bc-cds-page-generator/references/quick-start', 'c36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-cds-page-generator/references/standard-components',
                component: ComponentCreator('/docs/skills/bc-cds-page-generator/references/standard-components', '99f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-cds-page-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-cds-page-generator/SKILL', 'de9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-dataverse-entity-generator/references/generate-entity-list-script',
                component: ComponentCreator('/docs/skills/bc-dataverse-entity-generator/references/generate-entity-list-script', '064'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-dataverse-entity-generator/references/generate-entity-script',
                component: ComponentCreator('/docs/skills/bc-dataverse-entity-generator/references/generate-entity-script', '983'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-dataverse-entity-generator/references/workflow-examples',
                component: ComponentCreator('/docs/skills/bc-dataverse-entity-generator/references/workflow-examples', '56e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-dataverse-entity-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-dataverse-entity-generator/SKILL', '3aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-dataverse-mapping-generator/references/custom-entity-mapping',
                component: ComponentCreator('/docs/skills/bc-dataverse-mapping-generator/references/custom-entity-mapping', 'd5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-dataverse-mapping-generator/references/oob-entity-mapping',
                component: ComponentCreator('/docs/skills/bc-dataverse-mapping-generator/references/oob-entity-mapping', '2fa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-dataverse-mapping-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-dataverse-mapping-generator/SKILL', 'd9a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-install-codeunit-generator/references/install-examples',
                component: ComponentCreator('/docs/skills/bc-install-codeunit-generator/references/install-examples', '536'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-install-codeunit-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-install-codeunit-generator/SKILL', 'ee9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-number-series-generator/references/number-series-examples',
                component: ComponentCreator('/docs/skills/bc-number-series-generator/references/number-series-examples', '025'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-number-series-generator/references/number-series-troubleshooting',
                component: ComponentCreator('/docs/skills/bc-number-series-generator/references/number-series-troubleshooting', 'ac0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-number-series-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-number-series-generator/SKILL', '11c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-setup-table-generator/references/patterns',
                component: ComponentCreator('/docs/skills/bc-setup-table-generator/references/patterns', '787'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-setup-table-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-setup-table-generator/SKILL', '8e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-setup-wizard-generator/references/code-templates',
                component: ComponentCreator('/docs/skills/bc-setup-wizard-generator/references/code-templates', 'e9a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-setup-wizard-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-setup-wizard-generator/SKILL', '43c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-telemetry-generator/references/kql-queries',
                component: ComponentCreator('/docs/skills/bc-telemetry-generator/references/kql-queries', '853'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-telemetry-generator/references/telemetry-reference',
                component: ComponentCreator('/docs/skills/bc-telemetry-generator/references/telemetry-reference', 'd25'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-telemetry-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-telemetry-generator/SKILL', 'ffb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-test-codeunit-generator/references/test-examples',
                component: ComponentCreator('/docs/skills/bc-test-codeunit-generator/references/test-examples', 'f48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-test-codeunit-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-test-codeunit-generator/SKILL', 'c71'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-upgrade-codeunit-generator/references/upgrade-examples',
                component: ComponentCreator('/docs/skills/bc-upgrade-codeunit-generator/references/upgrade-examples', 'b46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/skills/bc-upgrade-codeunit-generator/SKILL',
                component: ComponentCreator('/docs/skills/bc-upgrade-codeunit-generator/SKILL', 'aae'),
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
    path: '/roadmap',
    component: ComponentCreator('/roadmap', '2ed'),
    routes: [
      {
        path: '/roadmap',
        component: ComponentCreator('/roadmap', '455'),
        routes: [
          {
            path: '/roadmap',
            component: ComponentCreator('/roadmap', '2c1'),
            routes: [
              {
                path: '/roadmap/2026/april',
                component: ComponentCreator('/roadmap/2026/april', '0cf'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/august',
                component: ComponentCreator('/roadmap/2026/august', 'f97'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/december',
                component: ComponentCreator('/roadmap/2026/december', '7a9'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/july',
                component: ComponentCreator('/roadmap/2026/july', 'fe4'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/june',
                component: ComponentCreator('/roadmap/2026/june', '873'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/may',
                component: ComponentCreator('/roadmap/2026/may', '08d'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/november',
                component: ComponentCreator('/roadmap/2026/november', '7d7'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/october',
                component: ComponentCreator('/roadmap/2026/october', 'e81'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2026/september',
                component: ComponentCreator('/roadmap/2026/september', '9b9'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/april',
                component: ComponentCreator('/roadmap/2027/april', 'd23'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/august',
                component: ComponentCreator('/roadmap/2027/august', '126'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/december',
                component: ComponentCreator('/roadmap/2027/december', '6d7'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/february',
                component: ComponentCreator('/roadmap/2027/february', 'dab'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/january',
                component: ComponentCreator('/roadmap/2027/january', 'c6a'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/july',
                component: ComponentCreator('/roadmap/2027/july', '52d'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/june',
                component: ComponentCreator('/roadmap/2027/june', 'd98'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/march',
                component: ComponentCreator('/roadmap/2027/march', 'ad3'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/may',
                component: ComponentCreator('/roadmap/2027/may', 'c34'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/november',
                component: ComponentCreator('/roadmap/2027/november', '258'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/october',
                component: ComponentCreator('/roadmap/2027/october', '606'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/2027/september',
                component: ComponentCreator('/roadmap/2027/september', '59c'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/RELEASE-PLAN-GUIDE',
                component: ComponentCreator('/roadmap/RELEASE-PLAN-GUIDE', '566'),
                exact: true,
                sidebar: "roadmapSidebar"
              },
              {
                path: '/roadmap/TEMPLATE',
                component: ComponentCreator('/roadmap/TEMPLATE', '3a6'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
