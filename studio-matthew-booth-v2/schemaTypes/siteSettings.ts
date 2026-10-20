import {NavLink, RichText} from '../utils/fields'

export default {
  name: 'siteSettings',
  type: 'document',
  title: 'Site Settings',
  fields: [
    {
      name: 'siteTitle',
      type: 'string',
      title: 'Site Title',
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      rows: 3,
    },
    {
      name: 'ogImage',
      type: 'image',
      title: 'OG Image',
    },
    {
      name: 'globalIntro',
      type: 'array',
      title: 'Global Intro',
      of: [RichText],
    },
    {
      name: 'navLinks',
      type: 'array',
      title: 'Nav Links',
      of: [NavLink],
    },
    {
      name: 'loginText',
      type: 'array',
      title: 'Login Text',
      description: 'Shown above the login form for the Private page.',
      of: [RichText],
    },
  ],
}
