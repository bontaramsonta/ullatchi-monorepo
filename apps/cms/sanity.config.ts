import {defineConfig} from 'sanity'
import {structureTool, type StructureBuilder} from 'sanity/structure'
import {googleMapsInput} from '@sanity/google-maps-input'
import {schemaTypes} from './schemaTypes'
import {COMMUNITY_PAGE_DOCUMENT_ID} from './schemaTypes/communityPage'
import {HOMEPAGE_DOCUMENT_ID} from './schemaTypes/homepage'

export default defineConfig({
  name: 'default',
  title: 'ullatchi',

  projectId: '6qd28ej7',
  dataset: 'develop',

  plugins: [
    googleMapsInput({
      apiKey: process.env.SANITY_STUDIO_GOOGLE_MAPS_API_KEY || '',
      defaultLocation: {
        lat: 13.0843007,
        lng: 80.2704622,
      },
      defaultZoom: 15,
      defaultRadius: 1000,
      defaultRadiusZoom: 15,
      defaultLocale: 'en-IN',
    }),
    structureTool({
      structure: (S: StructureBuilder) =>
        S.list()
          .title('Content')
          .items([
            // Homepage singleton
            S.listItem()
              .title('Homepage')
              .id('homepage')
              .child(S.document().schemaType('homepage').documentId(HOMEPAGE_DOCUMENT_ID)),
            // Community Page singleton
            S.listItem()
              .title('Community Page')
              .id('communityPage')
              .child(
                S.document().schemaType('communityPage').documentId(COMMUNITY_PAGE_DOCUMENT_ID),
              ),
            S.divider(),
            // Articles list
            S.documentTypeListItem('article').title('Articles'),
            // Categories list
            S.documentTypeListItem('articleCategory').title('Article Categories'),
            // Authors list
            S.documentTypeListItem('author').title('Authors'),
            S.divider(),
            // Reports list
            S.documentTypeListItem('report').title('Reports'),
            // Report Categories list
            S.documentTypeListItem('reportCategory').title('Report Categories'),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
