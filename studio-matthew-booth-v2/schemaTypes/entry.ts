import {createElement} from 'react'
import {ImageField, RichText} from '../utils/fields'
import {STATUSES} from '../utils/sites'
import {ReferenceCheckboxes} from '../components/ReferenceCheckboxes'
import {AdditionalInfoInput} from '../components/AdditionalInfoInput'
import {orderRankField} from '@sanity/orderable-document-list'

export default {
  name: 'entry',
  type: 'document',
  title: 'Entry',
  fields: [
    orderRankField({type: 'entry'}),
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
      validation: (Rule: any) => Rule.required(),
      options: {source: 'title'},
    },
    {
      name: 'italicizeTitle',
      type: 'boolean',
      title: 'Italicize Title',
      description: 'Whether to italicize the title.',
      initialValue: false,
    },
    {
      name: 'externalAuthor',
      type: 'boolean',
      title: 'External Author',
      description: 'Whether the author of this entry is not Matthew Booth.',
      initialValue: false,
    },
    {
      name: 'externalAuthorName',
      type: 'string',
      title: 'External Author Name',
      hidden: ({document}: any) => !document?.externalAuthor,
    },
    {
      name: 'categories',
      type: 'array',
      title: 'Categories',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      components: {input: ReferenceCheckboxes},
    },
    {
      name: 'status',
      type: 'array',
      title: 'Status',
      description:
        'Public entries appear on the index. WIP and Testing entries are only shown to logged-in users given access to them.',
      of: [{type: 'string'}],
      options: {list: STATUSES, layout: 'grid'},
      initialValue: ['public'],
    },
    {
      name: 'useCustomThumbnail',
      type: 'boolean',
      title: 'Use Custom Thumbnail',
      description:
        'Override the auto-derived thumbnail (taken from the first block) with a custom image or video.',
      initialValue: false,
    },
    {
      name: 'customThumbnail',
      type: 'object',
      title: 'Custom Thumbnail',
      hidden: ({document}: any) => !document?.useCustomThumbnail,
      fields: [
        {
          name: 'mediaType',
          type: 'string',
          title: 'Media Type',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Video (Mux)', value: 'muxVideo'},
              {title: 'Video (file)', value: 'video'},
            ],
            layout: 'radio',
          },
          initialValue: 'image',
        },
        {
          ...ImageField,
          name: 'image',
          title: 'Image',
          hidden: ({parent}: any) => parent?.mediaType !== 'image',
        },
        {
          name: 'muxVideo',
          type: 'mux.video',
          title: 'Video (Mux)',
          hidden: ({parent}: any) => parent?.mediaType !== 'muxVideo',
        },
        {
          name: 'video',
          type: 'file',
          title: 'Video',
          options: {accept: 'video/mp4'},
          hidden: ({parent}: any) => parent?.mediaType !== 'video',
        },
      ],
    },
    {
      name: 'description',
      type: 'array',
      title: 'Description',
      of: [RichText],
      description: 'The description of the entry shown in the list view.',
    },
    {
      name: 'year',
      type: 'string',
      title: 'Year',
    },
    {
      name: 'hideDefaultAdditionalInfo',
      type: 'boolean',
      title: 'Hide Default Additional Info',
      description:
        'Whether to hide the default additional info values (title, date, and category).',
      initialValue: false,
    },
    {
      name: 'additionalInfo',
      type: 'array',
      title: 'Additional Info',
      description:
        'Additional information about the entry. Shown in the "Information" section on the slide item.',
      components: {input: AdditionalInfoInput},
      of: [
        {
          type: 'object',
          name: 'additionalInfoItem',
          title: 'Info Item',
          fields: [
            {name: 'title', type: 'string', title: 'Title'},
            {name: 'text', type: 'array', title: 'Text', of: [RichText]},
            {
              name: 'relatedEntries',
              type: 'array',
              title: 'Related Entries',
              of: [{type: 'reference', to: [{type: 'entry'}]}],
            },
          ],
          preview: {
            select: {title: 'title', text: 'text'},
            prepare({title, text}: any) {
              const firstBlock = text?.find((b: any) => b._type === 'block')
              const subtitle = firstBlock?.children?.map((c: any) => c.text).join('') || ''
              return {title: title || 'Info Item', subtitle}
            },
          },
        },
      ],
    },
    {
      name: 'blocks',
      type: 'array',
      title: 'Blocks',
      of: [{type: 'textBlock'}, {type: 'carouselBlock'}, {type: 'singleMediaBlock'}],
    },
  ],
  preview: {
    // Mirror the site's thumbnail resolution: the custom thumbnail override
    // when set, else the first media block (a carousel falls through to its
    // first slide). Select paths are static, so probe the first few blocks
    // and pick the first media block in prepare.
    select: {
      title: 'title',
      useCustom: 'useCustomThumbnail',
      customMediaType: 'customThumbnail.mediaType',
      customImage: 'customThumbnail.image',
      customPlaybackId: 'customThumbnail.muxVideo.asset.playbackId',
      customThumbTime: 'customThumbnail.muxVideo.asset.thumbTime',
      ...Object.fromEntries(
        [0, 1, 2, 3].flatMap((i) => [
          [`b${i}Type`, `blocks.${i}._type`],
          [`b${i}MediaType`, `blocks.${i}.mediaType`],
          [`b${i}Image`, `blocks.${i}.image`],
          [`b${i}PlaybackId`, `blocks.${i}.muxVideo.asset.playbackId`],
          [`b${i}ThumbTime`, `blocks.${i}.muxVideo.asset.thumbTime`],
          [`b${i}SlideMediaType`, `blocks.${i}.media.0.mediaType`],
          [`b${i}SlideImage`, `blocks.${i}.media.0.image`],
          [`b${i}SlidePlaybackId`, `blocks.${i}.media.0.muxVideo.asset.playbackId`],
          [`b${i}SlideThumbTime`, `blocks.${i}.media.0.muxVideo.asset.thumbTime`],
        ]),
      ),
    },
    prepare({title, useCustom, customMediaType, customImage, customPlaybackId, customThumbTime, ...blocks}: any) {
      let thumb: any = null

      if (useCustom) {
        thumb = {
          mediaType: customMediaType,
          image: customImage,
          playbackId: customPlaybackId,
          thumbTime: customThumbTime,
        }
      } else {
        for (const i of [0, 1, 2, 3]) {
          const type = blocks[`b${i}Type`]
          if (type === 'singleMediaBlock') {
            thumb = {
              mediaType: blocks[`b${i}MediaType`],
              image: blocks[`b${i}Image`],
              playbackId: blocks[`b${i}PlaybackId`],
              thumbTime: blocks[`b${i}ThumbTime`],
            }
            break
          }
          if (type === 'carouselBlock') {
            thumb = {
              mediaType: blocks[`b${i}SlideMediaType`],
              image: blocks[`b${i}SlideImage`],
              playbackId: blocks[`b${i}SlidePlaybackId`],
              thumbTime: blocks[`b${i}SlideThumbTime`],
            }
            break
          }
        }
      }

      let media
      if (thumb?.mediaType === 'image' && thumb.image?.asset) {
        media = thumb.image
      } else if (thumb?.mediaType === 'muxVideo' && thumb.playbackId) {
        media = createElement('img', {
          src: `https://image.mux.com/${thumb.playbackId}/thumbnail.jpg?width=160&time=${thumb.thumbTime ?? 0}`,
          style: {width: '100%', height: '100%', objectFit: 'cover'},
        })
      }

      return {title, media}
    },
  },
}
