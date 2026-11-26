import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const logoUrl = useBaseUrl('/img/ALCSC_LONG.png');
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <img 
          src={logoUrl} 
          alt="AL Copilot Skills Collection" 
          className={styles.heroLogo}
        />
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--primary', styles.downloadButton)}
            href="https://marketplace.visualstudio.com/items?itemName=FernandoArtigasAlfonso.al-copilot-skills-collection">
            Download Now!
          </Link>
        </div>
        <div className={styles.secondaryButtons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            see more →
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: JSX.Element;
  logoPosition?: 'left' | 'right';
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Ready-to-Use AL Skills',
    description: (
      <>
        Comprehensive collection of Copilot skills covering API development, 
        testing, performance optimization, events, permissions, and more.
      </>
    ),
    logoPosition: 'left',
  },
  {
    title: 'Agentic Development',
    description: (
      <>
        Purpose-built AL Copilot Skills that help agents implement consistent 
        Business Central patterns and development best practices.
      </>
    ),
  },
  {
    title: 'Open Source',
    description: (
      <>
        Community-driven, MIT licensed. Fork the skills, customize for your 
        team, and contribute back to help the AL ecosystem grow.
      </>
    ),
    logoPosition: 'right',
  },
];

function Feature({title, description, logoPosition}: FeatureItem) {
  const logoUrl = useBaseUrl('/img/ALCSC_LOGO.png');
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{ position: 'relative' }}>
        {logoPosition === 'left' && (
          <img 
            src={logoUrl} 
            alt="AL Copilot Skills Collection" 
            style={{ 
              position: 'absolute', 
              left: '-120px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '100px',
              height: 'auto',
              opacity: 0.7
            }} 
          />
        )}
        {logoPosition === 'right' && (
          <img 
            src={logoUrl} 
            alt="AL Copilot Skills Collection" 
            style={{ 
              position: 'absolute', 
              right: '-120px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '100px',
              height: 'auto',
              opacity: 0.7
            }} 
          />
        )}
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Home`}
      description="AL Copilot Skills Collection - Supercharge your Business Central development with sharp skills">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
