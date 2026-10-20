// One-off migration from the old `sites` checkboxes to `status`
// (main → public, wip → wip, testing → testing), on published and draft
// entries alike.
//
// Run from the studio directory, in two steps:
//   1. before deploying the new frontend — copies sites into status and
//      leaves sites in place, so the live site keeps working meanwhile:
//        npx sanity exec scripts/sites-to-status.ts --with-user-token
//   2. once the new frontend is live — removes the old sites field:
//        npx sanity exec scripts/sites-to-status.ts --with-user-token -- --unset-sites
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-12'})

const STATUS_FOR_SITE: Record<string, string> = {main: 'public', wip: 'wip', testing: 'testing'}

async function run() {
  if (process.argv.includes('--unset-sites')) {
    const ids: string[] = await client.fetch(`*[_type == "entry" && defined(sites)]._id`)
    if (!ids.length) return console.log('No entries have a sites value left.')

    const transaction = client.transaction()
    ids.forEach((id) => transaction.patch(id, {unset: ['sites']}))
    await transaction.commit()
    return console.log(`Removed sites from ${ids.length} entries.`)
  }

  const entries: {_id: string; sites: string[] | null}[] = await client.fetch(
    `*[_type == "entry" && !defined(status)]{ _id, sites }`,
  )
  if (!entries.length) return console.log('Nothing to migrate — every entry already has a status.')

  const transaction = client.transaction()
  entries.forEach(({_id, sites}) => {
    const status = (sites ?? []).map((site) => STATUS_FOR_SITE[site]).filter(Boolean)
    transaction.patch(_id, {set: {status}})
  })
  await transaction.commit()
  console.log(`Set status on ${entries.length} entries.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
