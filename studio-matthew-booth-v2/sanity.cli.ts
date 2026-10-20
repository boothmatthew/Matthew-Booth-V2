import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'blzzqscv',
    dataset: 'production'
  },
  deployment: {
    // boothmatt.sanity.studio, so `sanity deploy` doesn't prompt for the host
    appId: 'nxsy9splumu37h87y2q8zv9x',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
