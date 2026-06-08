/**
 * Parses all AUTHORS.md files under ../skills/ and generates
 * src/data/contributors.json with deduplicated contributor data.
 *
 * Run: node scripts/generate-contributors.js
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', '..', 'skills');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'contributors.json');

/** Map skill folder name → display name (from SKILL.md H1 heading) */
function getSkillDisplayName(skillDir) {
  const skillMd = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMd)) return null;
  const content = fs.readFileSync(skillMd, 'utf-8');
  const match = content.match(/^# (.+)$/m);
  return match ? match[1].trim() : null;
}

/** Parse a single AUTHORS.md and return an array of author objects */
function parseAuthorsFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');

  // Remove HTML comments
  const clean = content.replace(/<!--[\s\S]*?-->/g, '');

  const authors = [];
  let current = null;

  for (const line of clean.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const fieldMatch = trimmed.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/);
    if (fieldMatch) {
      const key = fieldMatch[1].trim();
      const value = fieldMatch[2].trim();

      if (key === 'Full Name') {
        // Start a new author entry
        current = { fullName: value };
        authors.push(current);
      } else if (current) {
        if (key === 'GitHub User') current.githubUser = value;
        if (key === 'GitHub Profile') current.githubProfile = value;
        if (key === 'LinkedIn Profile') current.linkedinProfile = value;
      }
    }
  }

  return authors.filter((a) => a.githubUser);
}

function main() {
  /** @type {Map<string, {fullName: string, githubUser: string, githubProfile: string, linkedinProfile: string, skills: {folder: string, name: string}[]}>} */
  const contributorsMap = new Map();

  const skillFolders = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const folder of skillFolders) {
    const skillDir = path.join(SKILLS_DIR, folder);
    const authorsFile = path.join(skillDir, 'AUTHORS.md');
    const displayName = getSkillDisplayName(skillDir) || folder;
    const authors = parseAuthorsFile(authorsFile);

    for (const author of authors) {
      const key = author.githubUser.toLowerCase();

      if (!contributorsMap.has(key)) {
        contributorsMap.set(key, {
          fullName: author.fullName,
          githubUser: author.githubUser,
          githubProfile: author.githubProfile || `https://github.com/${author.githubUser}`,
          linkedinProfile: author.linkedinProfile || '',
          skills: [],
        });
      }

      contributorsMap.get(key).skills.push({
        folder,
        name: displayName,
      });
    }
  }

  const contributors = Array.from(contributorsMap.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ contributors }, null, 2) + '\n');
  console.log(
    `Generated ${OUTPUT_FILE} with ${contributors.length} contributor(s) across ${skillFolders.length} skills.`,
  );
}

main();
