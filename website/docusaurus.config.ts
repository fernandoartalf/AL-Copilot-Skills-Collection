import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AL Copilot Skills Collection',
  tagline: 'Supercharge your Business Central development with sharp skills',
  favicon: 'img/ALCSC_LOGO.png',

  // Set the production url of your site here
  url: 'https://fernandoartalf.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // Use DOCUSAURUS_DEPLOY to distinguish between local serve and GitHub Pages deploy
  baseUrl: process.env.DOCUSAURUS_DEPLOY === 'true' ? '/al-copilot-skills-site/' : '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'fernandoartalf', // Usually your GitHub org/user name.
  projectName: 'al-copilot-skills-site', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  markdown: {
    format: 'md',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexPages: true,
        docsRouteBasePath: ['/docs', '/roadmap'],
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        searchBarShortcutHint: true,
      },
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'roadmap',
        path: '../releaseplan',
        routeBasePath: 'roadmap',
        sidebarPath: './sidebarsRoadmap.ts',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          exclude: [
            '**/CHANGELOG.md',
            '**/AUTHORS.md',
            '**/TEMPLATE.md',
            '**/node_modules/**',
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
          ],
        },
        blog: false, // Disable blog as per spec
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'AL Copilot Skills Collection',
      logo: {
        alt: 'AL Copilot Skills Collection Logo',
        src: 'img/ALCSC_LOGO.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/contributors',
          label: 'Contributors',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'roadmapSidebar',
          docsPluginId: 'roadmap',
          position: 'left',
          label: 'Roadmap',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://marketplace.visualstudio.com/items?itemName=FernandoArtigasAlfonso.al-copilot-skills-collection',
          position: 'right',
          className: 'header-vscode-link',
          'aria-label': 'VS Code Marketplace',
        },
        {
          href: 'https://github.com/fernandoartalf/AL-Copilot-Skills-Collection',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/fernandoartalf/AL-Copilot-Skills-Collection',
            },
            {
              label: 'Open Issue',
              href: 'https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Contributing',
              to: '/docs/contributing',
            },
            {
              label: 'Roadmap',
              to: '/roadmap/RELEASE-PLAN-GUIDE',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AL Copilot Skills Collection. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
