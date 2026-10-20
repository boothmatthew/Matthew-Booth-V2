export default {
  name: 'collection',
  type: 'document',
  title: 'Collection',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title'},
      // wip/testing are the built-in status collections on /private
      validation: (Rule: any) =>
        Rule.required().custom((slug: any) =>
          ['wip', 'testing'].includes(slug?.current)
            ? 'This slug is reserved for the built-in WIP and Testing collections.'
            : true,
        ),
    },
    {
      name: 'entries',
      type: 'array',
      title: 'Entries',
      description: 'Shown to every site user given this collection, whatever the entry’s status.',
      of: [{type: 'reference', to: [{type: 'entry'}]}],
    },
  ],
  preview: {
    select: {title: 'title', entries: 'entries'},
    prepare({title, entries}: any) {
      const count = entries?.length ?? 0
      return {title, subtitle: `${count} ${count === 1 ? 'entry' : 'entries'}`}
    },
  },
}
