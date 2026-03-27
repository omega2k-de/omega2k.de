import { writeFileSync } from 'node:fs';
import semanticRelease from 'semantic-release';

const envFile = process.env['RELEASE_ENV_FILE'] ?? 'release.env';
const isDryRun = process.argv.includes('--dry-run');
const log = message => process.stdout.write(`${message}\n`);
const logError = message => process.stderr.write(`${message}\n`);
const getEnv = (...keys) => keys.map(key => process.env[key]).find(Boolean);
const encodeGitCredential = value => encodeURIComponent(value ?? '');
const isDeployToken = token =>
  Boolean(token) &&
  (token.startsWith('gldt-') ||
    token === process.env['CI_DEPLOY_PASSWORD'] ||
    getEnv('DEPLOY_USERNAME', 'CI_DEPLOY_USER')?.startsWith('gitlab+deploy-token-'));

const prepareGitAuthentication = () => {
  if (process.env['GIT_CREDENTIALS']) {
    return;
  }

  const password = getEnv('CI_DEPLOY_PASSWORD', 'DEPLOY_TOKEN');

  if (!password) {
    return;
  }

  const username = getEnv('CI_DEPLOY_USER', 'DEPLOY_USERNAME');

  if (!username && isDeployToken(password)) {
    throw new Error(
      'DEPLOY_TOKEN looks like a GitLab deploy token. Set DEPLOY_USERNAME or use CI_DEPLOY_USER/CI_DEPLOY_PASSWORD.'
    );
  }

  const resolvedUsername = username || 'oauth2';
  process.env['GIT_CREDENTIALS'] =
    `${encodeGitCredential(resolvedUsername)}:${encodeGitCredential(password)}`;
};

const prepareGitLabApiAuthentication = () => {
  if (getEnv('GL_TOKEN', 'GITLAB_TOKEN')) {
    return;
  }

  const deployToken = process.env['DEPLOY_TOKEN'];

  if (deployToken && !isDeployToken(deployToken)) {
    process.env['GL_TOKEN'] = deployToken;
    return;
  }

  if (process.env['CI_JOB_TOKEN']) {
    log('Using CI_JOB_TOKEN for GitLab release API authentication.');
    return;
  }

  throw new Error(
    'Missing GitLab API authentication. Set GL_TOKEN/GITLAB_TOKEN with api scope, or run in GitLab CI with CI_JOB_TOKEN.'
  );
};

const writeReleaseEnv = ({ releaseCreated, version = '', tag = '' }) => {
  const resolvedVersion = version || process.env['CI_COMMIT_SHORT_SHA'] || '0.0.0-dev';
  const resolvedTag = tag || (version ? `v${version}` : '');

  writeFileSync(
    envFile,
    [
      `RELEASE_CREATED=${releaseCreated ? 'true' : 'false'}`,
      `RELEASE_VERSION=${resolvedVersion}`,
      `RELEASE_TAG=${resolvedTag}`,
      `COMPOSE_IMAGE_TAG=${resolvedVersion}`,
      `VERSION=${resolvedVersion}`
    ].join('\n') + '\n'
  );
};

prepareGitAuthentication();
prepareGitLabApiAuthentication();

const result = await semanticRelease({
  dryRun: isDryRun,
  ci: true
});

if (!result) {
  writeReleaseEnv({ releaseCreated: false });
  log('No semantic release generated for this commit range.');
  process.exit(0);
}

const version = result.nextRelease.version;
const tag = result.nextRelease.gitTag;
const expectedVersion = process.env['EXPECTED_RELEASE_VERSION'];

if (expectedVersion && expectedVersion !== version) {
  logError(`Expected semantic-release version ${expectedVersion}, but got ${version}.`);
  process.exit(1);
}

writeReleaseEnv({ releaseCreated: true, version, tag });
log(`${isDryRun ? 'Prepared' : 'Published'} semantic release ${tag}.`);
