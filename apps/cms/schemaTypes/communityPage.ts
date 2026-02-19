import {defineType, defineField, defineArrayMember} from 'sanity'
import {UsersIcon} from '@sanity/icons'

// Singleton document ID - ensures only one community page document exists
export const COMMUNITY_PAGE_DOCUMENT_ID = 'communityPage'

export const communityPage = defineType({
  name: 'communityPage',
  title: 'Community Page',
  type: 'document',
  icon: UsersIcon,
  fields: [
    // Hero Section
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Community Voices',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      rows: 2,
      initialValue: 'Analysis, opinion, and citizen perspectives on local issues',
    }),
    defineField({
      name: 'heroCtaText',
      title: 'Hero CTA Button Text',
      type: 'string',
      initialValue: 'Write for Ullatchi',
    }),

    // Featured Article
    defineField({
      name: 'featuredArticle',
      title: 'Featured Article',
      description: 'The main featured article displayed prominently at the top',
      type: 'reference',
      to: [{type: 'article'}],
      options: {
        filter: 'isPublished == true',
      },
    }),

    // Articles Grid
    defineField({
      name: 'articles',
      title: 'Articles',
      description: 'Select and reorder articles to display in the grid (drag to reorder)',
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
      validation: (rule) => rule.max(10).warning("It's recommended to display at most 10 articles"),
    }),

    // Bottom CTA Section
    defineField({
      name: 'ctaTitle',
      title: 'CTA Title',
      type: 'string',
      initialValue: 'Share Your Voice',
    }),
    defineField({
      name: 'ctaDescription',
      title: 'CTA Description',
      type: 'text',
      rows: 3,
      initialValue:
        'Have a perspective on local issues? We welcome submissions from community members who want to contribute to the conversation about local governance and civic life.',
    }),
    defineField({
      name: 'ctaButtonText',
      title: 'CTA Button Text',
      type: 'string',
      initialValue: 'Submit Your Article',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Community Page',
        subtitle: 'Community Page Configuration',
      }
    },
  },
})
