import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200,
      },
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Required'
          if (!/^[a-z0-9-]+$/.test(slug.current)) {
            return 'Slug must be lowercase with hyphens only'
          }
          return true
        }),
    }),
    defineField({
      name: 'datePublished',
      title: 'Date Published',
      type: 'datetime',
    }),
    defineField({
      name: 'isPublished',
      title: 'Is Published',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'cardDescription',
      title: 'Card Description',
      type: 'text',
      rows: 2,
      description: 'Short description shown on article cards',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Full description/excerpt of the article',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for accessibility',
        }),
      ],
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'locationWithName',
      description: 'Optional geographic location for this article (must be within Chennai)',
      validation: (rule) =>
        rule.custom((location: {geopoint?: {lat: number; lng: number}} | undefined) => {
          // Allow empty/undefined locations
          if (!location?.geopoint) return true

          const {lat, lng} = location.geopoint

          // Chennai bounding box (approximate)
          const CHENNAI_BOUNDS = {
            north: 13.25,
            south: 12.85,
            east: 80.35,
            west: 80.05,
          }

          const isWithinChennai =
            lat >= CHENNAI_BOUNDS.south &&
            lat <= CHENNAI_BOUNDS.north &&
            lng >= CHENNAI_BOUNDS.west &&
            lng <= CHENNAI_BOUNDS.east

          if (!isWithinChennai) {
            return 'Location must be within Chennai city limits'
          }

          return true
        }),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Underline', value: 'underline'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) =>
                      rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'articleCategory'}],
        }),
      ],
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'author'}],
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Published Date, New',
      name: 'datePublishedDesc',
      by: [{field: 'datePublished', direction: 'desc'}],
    },
    {
      title: 'Published Date, Old',
      name: 'datePublishedAsc',
      by: [{field: 'datePublished', direction: 'asc'}],
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author0: 'authors.0.displayName',
      media: 'heroImage',
      isPublished: 'isPublished',
    },
    prepare({title, author0, media, isPublished}) {
      return {
        title,
        subtitle: `${isPublished ? '✓' : '○'} ${author0 || 'No author'}`,
        media,
      }
    },
  },
})
