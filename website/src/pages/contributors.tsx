import {useState, useEffect, useCallback, useRef} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './contributors.module.css';
import contributorData from '../data/contributors.json';

type Skill = {
  folder: string;
  name: string;
};

type Contributor = {
  fullName: string;
  githubUser: string;
  githubProfile: string;
  linkedinProfile: string;
  skills: Skill[];
};

const {contributors: rawContributors} = contributorData as {contributors: Contributor[]};

// Sort by number of skills descending
const contributors = [...rawContributors].sort(
  (a, b) => b.skills.length - a.skills.length,
);

function getBadge(skillCount: number): {src: string; label: string} {
  if (skillCount >= 5) {
    return {src: '/img/ALCSC_LOGO_DIAMOND_TRANSPARENT.png', label: 'Diamond'};
  } else if (skillCount >= 3) {
    return {src: '/img/ALCSC_LOGO_GOLD_TRANSPARENT.png', label: 'Gold'};
  } else if (skillCount >= 2) {
    return {src: '/img/ALCSC_LOGO_SILVER_TRANSPARENT.png', label: 'Silver'};
  }
  return {src: '/img/ALCSC_LOGO_BRONCE_TRANSPARENT.png', label: 'Bronze'};
}

function ContributorCardContent({contributor}: {contributor: Contributor}) {
  const avatarUrl = `https://github.com/${contributor.githubUser}.png?size=200`;
  const badge = getBadge(contributor.skills.length);
  const badgeUrl = useBaseUrl(badge.src);

  return (
    <>
      <div className={styles.cardHeader}>
        <img
          src={avatarUrl}
          alt={`${contributor.fullName}'s avatar`}
          className={styles.avatar}
          loading="lazy"
        />
        <img
          src={badgeUrl}
          alt={`${badge.label} contributor badge`}
          className={styles.badge}
          title={`${badge.label} Contributor \u2014 ${contributor.skills.length} skill(s)`}
          loading="lazy"
        />
        <div className={styles.info}>
          <Heading as="h3" className={styles.name}>
            {contributor.fullName}
          </Heading>
          <p className={styles.username}>@{contributor.githubUser}</p>
          <div className={styles.links}>
            <a
              href={contributor.githubProfile}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.profileLink}
              title="GitHub Profile">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            {contributor.linkedinProfile && (
              <a
                href={contributor.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.profileLink}
                title="LinkedIn Profile">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.skillsSection}>
        <Heading as="h4" className={styles.skillsTitle}>
          Skills ({contributor.skills.length})
        </Heading>
        <div className={styles.skillTags}>
          {contributor.skills.map((skill) => (
            <Link
              key={skill.folder}
              to={`/docs/skills/${skill.folder}/SKILL`}
              className={styles.skillTag}>
              {skill.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function ContributorModal({
  index,
  onClose,
  onNavigate,
}: {
  index: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const contributor = contributors[index];
  const hasPrev = index > 0;
  const hasNext = index < contributors.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1);
    },
    [index, hasPrev, hasNext, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 50;
    if (diff > SWIPE_THRESHOLD && hasPrev) onNavigate(index - 1);
    if (diff < -SWIPE_THRESHOLD && hasNext) onNavigate(index + 1);
    touchStartX.current = null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`${contributor.fullName} contributor details`}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {hasPrev && (
          <button
            className={clsx(styles.navButton, styles.navPrev)}
            onClick={() => onNavigate(index - 1)}
            aria-label="Previous contributor">
            &#8249;
          </button>
        )}

        <div className={styles.modalCard}>
          <ContributorCardContent contributor={contributor} />
        </div>

        {hasNext && (
          <button
            className={clsx(styles.navButton, styles.navNext)}
            onClick={() => onNavigate(index + 1)}
            aria-label="Next contributor">
            &#8250;
          </button>
        )}

        <div className={styles.counter}>
          {index + 1} / {contributors.length}
        </div>
      </div>
    </div>
  );
}

export default function Contributors(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const heroImageUrl = useBaseUrl('/img/Meet_Heroes.png');

  return (
    <Layout
      title="Contributors"
      description="Meet the contributors behind AL Copilot Skills Collection">
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <img 
              src={heroImageUrl} 
              alt="Meet the Heroes" 
              className={styles.headerImage}
            />
            <p className={styles.subtitle}>
              The developers forging the skills that power the next generation of Business Central development framework
            </p>
          </div>
          <div className={styles.grid}>
            {contributors.map((contributor, idx) => (
              <div
                key={contributor.githubUser}
                className={styles.card}
                onClick={() => setActiveIndex(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(idx);
                  }
                }}>
                <ContributorCardContent contributor={contributor} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {activeIndex !== null && (
        <ContributorModal
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </Layout>
  );
}
