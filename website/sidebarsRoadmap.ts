import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebarsRoadmap: SidebarsConfig = {
  roadmapSidebar: [
    {
      type: 'doc',
      id: 'RELEASE-PLAN-GUIDE',
      label: 'Release Plan Guide',
    },
    {
      type: 'category',
      label: '2026',
      collapsed: true,
      items: [
        {type: 'doc', id: '2026/april', label: 'April'},
        {type: 'doc', id: '2026/may', label: 'May'},
        {type: 'doc', id: '2026/june', label: 'June'},
        {type: 'doc', id: '2026/july', label: 'July'},
        {type: 'doc', id: '2026/august', label: 'August'},
        {type: 'doc', id: '2026/september', label: 'September'},
        {type: 'doc', id: '2026/october', label: 'October'},
        {type: 'doc', id: '2026/november', label: 'November'},
        {type: 'doc', id: '2026/december', label: 'December'},
      ],
    },
    {
      type: 'category',
      label: '2027',
      collapsed: true,
      items: [
        {type: 'doc', id: '2027/january', label: 'January'},
        {type: 'doc', id: '2027/february', label: 'February'},
        {type: 'doc', id: '2027/march', label: 'March'},
        {type: 'doc', id: '2027/april', label: 'April'},
        {type: 'doc', id: '2027/may', label: 'May'},
        {type: 'doc', id: '2027/june', label: 'June'},
        {type: 'doc', id: '2027/july', label: 'July'},
        {type: 'doc', id: '2027/august', label: 'August'},
        {type: 'doc', id: '2027/september', label: 'September'},
        {type: 'doc', id: '2027/october', label: 'October'},
        {type: 'doc', id: '2027/november', label: 'November'},
        {type: 'doc', id: '2027/december', label: 'December'},
      ],
    },
  ],
};

export default sidebarsRoadmap;
