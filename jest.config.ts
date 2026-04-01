import { ClassicConfig } from '@typescript-eslint/utils/ts-eslint';
import { getJestProjectsAsync } from '@nx/jest';
import Config = ClassicConfig.Config;

module.exports = async (): Promise<Config> => ({
  projects: await getJestProjectsAsync(),
});
