import {defineType, defineField} from 'sanity'
import {PinIcon} from '@sanity/icons'
import {LocationWithNameInput} from '../components/LocationWithNameInput'

export const locationWithName = defineType({
  name: 'locationWithName',
  title: 'Location with Name',
  type: 'object',
  icon: PinIcon,
  components: {
    input: LocationWithNameInput,
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Location Name',
      type: 'string',
      description: 'Name of the location (auto-populated from Google Places, editable)',
    }),
    defineField({
      name: 'geopoint',
      title: 'Coordinates',
      type: 'geopoint',
      description: 'Geographic coordinates (latitude and longitude)',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      lat: 'geopoint.lat',
      lng: 'geopoint.lng',
    },
    prepare({name, lat, lng}) {
      const coords = lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'No coordinates'
      return {
        title: name || 'Unnamed location',
        subtitle: coords,
      }
    },
  },
})
