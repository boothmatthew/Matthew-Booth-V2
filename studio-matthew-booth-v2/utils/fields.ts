export const RichText = {
  type: 'block',
  styles: [],
  marks: {
    decorators: [
      {title: 'Strong', value: 'strong'},
      {title: 'Emphasis', value: 'em'},
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [
          {name: 'href', type: 'string', title: 'URL'},
        ],
      },
    ],
  },
}

export const ImageField = {
  type: 'image' as const,
  options: {hotspot: true},
  fields: [
    {name: 'alt', type: 'string', title: 'Alt Text'},
  ],
}

export const NavLink = {
  name: 'navLink',
  type: 'object',
  title: 'Nav Link',
  fields: [
    {name: 'label', type: 'string', title: 'Label'},
    {name: 'url', type: 'string', title: 'URL'},
  ],
  preview: {
    select: {title: 'label', subtitle: 'url'},
  },
}
