import {defineType, defineField, defineArrayMember} from 'sanity'
import {HomeIcon} from '@sanity/icons'

// Singleton document ID - ensures only one homepage document exists
export const HOMEPAGE_DOCUMENT_ID = 'homepage'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'featuredStories',
      title: 'Featured Stories',
      description: 'Select and reorder articles to feature on the homepage (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'article'}],
          options: {
            filter: 'isPublished == true',
          },
        }),
      ],
      validation: (rule) => rule.max(6).warning("It's recommended to feature at most 6 articles"),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage',
        subtitle: 'Homepage Configuration',
      }
    },
  },
})
