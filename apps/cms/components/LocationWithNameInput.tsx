import {useCallback, useEffect, useRef, useState} from 'react'
import {ObjectInputProps, set, unset, PatchEvent, FieldMember, MemberField} from 'sanity'
import {Box, Card, Flex, Stack, Text, TextInput, Label, Spinner} from '@sanity/ui'
import styled from 'styled-components'

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: {
      maps: typeof google.maps
    }
  }
}

interface GeoPointValue {
  _type: 'geopoint'
  lat: number
  lng: number
  alt?: number
}

interface LocationWithNameValue {
  _type: 'locationWithName'
  name?: string
  geopoint?: GeoPointValue
}

const StyledCard = styled(Card)`
  border: 1px solid var(--card-border-color);
  border-radius: 4px;
`

const NameInputWrapper = styled(Box)`
  position: relative;
`

const LoadingOverlay = styled(Flex)`
  position: absolute;
  top: 0;
  right: 8px;
  bottom: 0;
  align-items: center;
  pointer-events: none;
`

export function LocationWithNameInput(props: ObjectInputProps<LocationWithNameValue>) {
  const {value, onChange, members, renderInput, renderField, renderItem, renderPreview} = props
  const [isLoadingName, setIsLoadingName] = useState(false)
  const previousGeopointRef = useRef<string>('')

  // Find the geopoint field member
  const geopointMember = members.find(
    (member): member is FieldMember => member.kind === 'field' && member.name === 'geopoint',
  )

  // Reverse geocode to get place name when geopoint changes
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      // Check if Google Maps API is available
      if (typeof window === 'undefined' || !window.google?.maps) {
        console.warn('Google Maps API not loaded')
        return
      }

      setIsLoadingName(true)

      try {
        const geocoder = new window.google.maps.Geocoder()
        const latlng = {lat, lng}

        geocoder.geocode({location: latlng}, (results, status) => {
          setIsLoadingName(false)

          if (status === 'OK' && results && results.length > 0) {
            // Try to get a meaningful name
            // Priority: locality > administrative_area_level_2 > formatted_address
            let placeName = ''

            for (const result of results) {
              // Look for locality (city/town name)
              const locality = result.address_components?.find((c) => c.types.includes('locality'))
              if (locality) {
                placeName = locality.long_name
                // Add sublocality or area if available for more context
                const sublocality = result.address_components?.find(
                  (c) => c.types.includes('sublocality') || c.types.includes('neighborhood'),
                )
                if (sublocality) {
                  placeName = `${sublocality.long_name}, ${locality.long_name}`
                }
                break
              }
            }

            // Fallback to formatted address if no locality found
            if (!placeName) {
              placeName = results[0].formatted_address || ''
              // Trim long addresses to be more readable
              if (placeName.length > 60) {
                const parts = placeName.split(',')
                placeName = parts.slice(0, 3).join(',')
              }
            }

            if (placeName) {
              // Set the name field
              onChange(PatchEvent.from(set(placeName, ['name'])))
            }
          }
        })
      } catch (error) {
        setIsLoadingName(false)
        console.error('Geocoding error:', error)
      }
    },
    [onChange],
  )

  // Watch for geopoint changes
  useEffect(() => {
    const geopoint = value?.geopoint
    if (!geopoint?.lat || !geopoint?.lng) {
      previousGeopointRef.current = ''
      return
    }

    const geopointKey = `${geopoint.lat},${geopoint.lng}`
    if (geopointKey === previousGeopointRef.current) {
      return
    }

    previousGeopointRef.current = geopointKey
    reverseGeocode(geopoint.lat, geopoint.lng)
  }, [value?.geopoint?.lat, value?.geopoint?.lng, reverseGeocode])

  // Handle name change manually
  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value
      if (newValue) {
        onChange(PatchEvent.from(set(newValue, ['name'])))
      } else {
        onChange(PatchEvent.from(unset(['name'])))
      }
    },
    [onChange],
  )

  return (
    <Stack space={4}>
      {/* Location Name Input */}
      <Stack space={2}>
        <Label size={1}>Location Name</Label>
        <NameInputWrapper>
          <TextInput
            value={value?.name || ''}
            onChange={handleNameChange}
            placeholder="Auto-populated from map selection, or type manually"
            disabled={isLoadingName}
          />
          {isLoadingName && (
            <LoadingOverlay>
              <Spinner muted />
            </LoadingOverlay>
          )}
        </NameInputWrapper>
        <Text size={1} muted>
          This will be auto-filled when you pick a location on the map. You can edit it afterwards.
        </Text>
      </Stack>

      {/* Geopoint Map Picker */}
      <StyledCard padding={3}>
        <Stack space={3}>
          <Text size={1} weight="semibold">
            Map Location
          </Text>
          {geopointMember && (
            <MemberField
              member={geopointMember}
              renderInput={renderInput}
              renderField={renderField}
              renderItem={renderItem}
              renderPreview={renderPreview}
            />
          )}
          {value?.geopoint && (
            <Text size={1} muted>
              Coordinates: {value.geopoint.lat.toFixed(6)}, {value.geopoint.lng.toFixed(6)}
            </Text>
          )}
        </Stack>
      </StyledCard>
    </Stack>
  )
}
