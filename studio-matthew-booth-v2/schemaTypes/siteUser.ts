import {GATED_SITES} from '../utils/sites'
import {PasswordInput} from '../components/PasswordInput'

export default {
  name: 'siteUser',
  type: 'document',
  title: 'Site User',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      description: 'Who this password belongs to, e.g. "Jane — Gallery X".',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'active',
      type: 'boolean',
      title: 'Active',
      description: 'Uncheck to revoke this person’s access without deleting them.',
      initialValue: true,
    },
    {
      name: 'collections',
      type: 'array',
      title: 'Collections',
      description:
        'Collections this person sees on the Private page, in this order (drag to reorder). The Private page opens on the first one; WIP and Testing come after.',
      of: [{type: 'reference', to: [{type: 'collection'}]}],
    },
    {
      name: 'canSeeWip',
      type: 'boolean',
      title: 'Can See WIP Entries',
      description: 'Adds a WIP collection with every WIP entry to their Private page.',
      initialValue: false,
    },
    {
      name: 'canSeeTesting',
      type: 'boolean',
      title: 'Can See Testing Entries',
      description: 'Adds a Testing collection with every Testing entry to their Private page.',
      initialValue: false,
    },
    {
      name: 'sites',
      type: 'array',
      title: 'Can Access Subdomains',
      description: 'Which password-protected subdomains this person can log into.',
      of: [{type: 'string'}],
      options: {list: GATED_SITES, layout: 'grid'},
    },
    {
      name: 'auth',
      type: 'object',
      title: 'Password',
      components: {input: PasswordInput},
      fields: [
        {name: 'hash', type: 'string', title: 'Hash'},
        {name: 'salt', type: 'string', title: 'Salt'},
      ],
      validation: (Rule: any) =>
        Rule.custom((value: any) => (value?.hash ? true : 'A password must be set.')),
    },
  ],
  preview: {
    select: {title: 'name', active: 'active', collections: 'collections'},
    prepare({title, active, collections}: any) {
      const count = collections?.length ?? 0
      const subtitle = `${count} ${count === 1 ? 'collection' : 'collections'}`
      return {title, subtitle: active ? subtitle : `inactive — ${subtitle}`}
    },
  },
}
