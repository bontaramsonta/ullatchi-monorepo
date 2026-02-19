import {defineType, defineField} from 'sanity'
import {WarningOutlineIcon} from '@sanity/icons'

export const report = defineType({
  name: 'report',
  title: 'Report',
  type: 'document',
  icon: WarningOutlineIcon,
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Detailed description of the issue',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'locationWithName',
      description: 'Where the issue is located (must be within Chennai)',
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
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'reportCategory'}],
    }),
    defineField({
      name: 'dateReported',
      title: 'Date Reported',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Reported', value: 'reported'},
          {title: 'Under Review', value: 'under-review'},
          {title: 'Resolved', value: 'resolved'},
        ],
        layout: 'radio',
      },
      initialValue: 'reported',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
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
  ],
  orderings: [
    {
      title: 'Date Reported, New',
      name: 'dateReportedDesc',
      by: [{field: 'dateReported', direction: 'desc'}],
    },
    {
      title: 'Date Reported, Old',
      name: 'dateReportedAsc',
      by: [{field: 'dateReported', direction: 'asc'}],
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [{field: 'status', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      category: 'category.name',
      media: 'image',
    },
    prepare({title, status, category, media}) {
      const statusLabel =
        status === 'reported'
          ? '🔴 Reported'
          : status === 'under-review'
            ? '🟡 Under Review'
            : '🟢 Resolved'
      return {
        title,
        subtitle: `${statusLabel} • ${category || 'No category'}`,
        media,
      }
    },
  },
})
