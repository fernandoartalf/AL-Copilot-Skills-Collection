/**
 * Syncs content from root directory to docs folder:
 * - Skills from ../skills/ to docs/skills/
 * - Release notes from ../releasenotes/ to docs/releasenotes/
 * - Instructions from ../instructions/ to docs/instructions/
 * - Root documentation files (README, CONTRIBUTING, SECURITY, LICENSE)
 * Preserves the folder structure and all markdown files.
 *
 * Run: node scripts/sync-skills.js
 */

const fs = require('fs');
const path = require('path');

const SKILLS_SOURCE = path.join(__dirname, '..', '..', 'skills');
const SKILLS_TARGET = path.join(__dirname, '..', 'docs', 'skills');
const RELEASENOTES_SOURCE = path.join(__dirname, '..', '..', 'releasenotes');
const RELEASENOTES_TARGET = path.join(__dirname, '..', 'docs', 'releasenotes');
const INSTRUCTIONS_SOURCE = path.join(__dirname, '..', '..', 'instructions');
const INSTRUCTIONS_TARGET = path.join(__dirname, '..', 'docs', 'instructions');
const ROOT_SOURCE = path.join(__dirname, '..', '..');
const DOCS_TARGET = path.join(__dirname, '..', 'docs');

/** Recursively copy directory contents */
function copyRecursive(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }
      copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      // Only copy markdown files and skip CHANGELOG.md, AUTHORS.md
      if (
        entry.name.endsWith('.md') &&
        entry.name !== 'CHANGELOG.md' &&
        entry.name !== 'AUTHORS.md'
      ) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

/** Clean target directory before sync */
function cleanTarget(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Add or update frontmatter in a markdown file */
function addFrontmatter(content, frontmatter) {
  // Check if file already has frontmatter
  if (content.startsWith('---')) {
    // Replace existing frontmatter
    const endIndex = content.indexOf('---', 3);
    if (endIndex !== -1) {
      return `---\n${frontmatter}\n---\n${content.slice(endIndex + 4)}`;
    }
  }
  // Add new frontmatter
  return `---\n${frontmatter}\n---\n\n${content}`;
}

/** Sync individual root documentation files with frontmatter */
function syncRootDocs() {
  const rootDocs = [
    {
      source: 'README.md',
      target: 'intro.md',
      frontmatter: `title: Introduction
description: AL Copilot Skills Collection - Purpose-built skills for Business Central development
sidebar_position: 1`
    },
    {
      source: 'CONTRIBUTING.md',
      target: 'contributing.md',
      frontmatter: `title: Contributing Guide
description: How to contribute new skills and improvements to the collection
sidebar_position: 100`
    },
    {
      source: 'SECURITY.md',
      target: 'SECURITY.md',
      frontmatter: `title: Security Policy
description: Security policy and vulnerability reporting guidelines
sidebar_position: 101`
    },
    {
      source: 'LICENSE',
      target: 'LICENSE.md',
      frontmatter: `title: License
description: MIT License - Terms and conditions for using this project
sidebar_position: 102`
    }
  ];

  for (const doc of rootDocs) {
    const sourcePath = path.join(ROOT_SOURCE, doc.source);
    const targetPath = path.join(DOCS_TARGET, doc.target);

    if (fs.existsSync(sourcePath)) {
      let content = fs.readFileSync(sourcePath, 'utf-8');
      content = addFrontmatter(content, doc.frontmatter);
      fs.writeFileSync(targetPath, content);
    }
  }
}

function main() {
  console.log('Syncing root documentation files...');
  syncRootDocs();
  console.log('✓ Root docs synced (intro, contributing, security)');

  console.log('Syncing skills from ../skills/ to docs/skills/...');
  cleanTarget(SKILLS_TARGET);
  copyRecursive(SKILLS_SOURCE, SKILLS_TARGET);
  console.log(`✓ Skills synced to ${SKILLS_TARGET}`);

  console.log('Syncing release notes from ../releasenotes/ to docs/releasenotes/...');
  cleanTarget(RELEASENOTES_TARGET);
  copyRecursive(RELEASENOTES_SOURCE, RELEASENOTES_TARGET);
  console.log(`✓ Release notes synced to ${RELEASENOTES_TARGET}`);

  console.log('Syncing instructions from ../instructions/ to docs/instructions/...');
  cleanTarget(INSTRUCTIONS_TARGET);
  copyRecursive(INSTRUCTIONS_SOURCE, INSTRUCTIONS_TARGET);
  console.log(`✓ Instructions synced to ${INSTRUCTIONS_TARGET}`);

  // Remove installation.md if it exists (content is now in README/intro)
  const installationPath = path.join(DOCS_TARGET, 'installation.md');
  if (fs.existsSync(installationPath)) {
    fs.unlinkSync(installationPath);
    console.log('✓ Removed installation.md (content merged into intro)');
  }
}

main();
