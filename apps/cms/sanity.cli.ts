import {defineCliConfig} from 'sanity/cli'
import {getStudioEnvironmentVariables} from 'sanity/cli'

const env = getStudioEnvironmentVariables({envFile: {mode: 'production'}})

export default defineCliConfig({
  api: {
    projectId: env.SANITY_STUDIO_PROJECT_ID,
    dataset: env.SANITY_STUDIO_DATASET,
  },
  deployment: {
    autoUpdates: true,
    appId: env.SANITY_STUDIO_APP_ID,
  },
  vite: {
    envPrefix: ['SANITY_STUDIO'],
  },
})
