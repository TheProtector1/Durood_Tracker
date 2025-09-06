'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TimezoneDisplay from '@/components/TimezoneDisplay'
import { fetchPrayerTimes, formatTo12Hour, PAKISTANI_CITIES, clearPrayerTimesCache, prefetchTodayPrayerTimes, testPrayerTimesAccuracy, dailyPrayerTimesSync, checkAndUpdatePrayerTimes } from '@/lib/prayer-times/prayerTimesService'

interface IslamicGroup {
  id: string
  name: string
  arabicName: string
  founder: string
  description: string
  prayerTimings: {
    Fajr: string
    Dhuhr: string
    Asr: string
    Maghrib: string
    Isha: string
  }
  methodology: string
  regions: string[]
}

interface PrayerTimes {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

interface Location {
  name: string
  lat: number
  lng: number
}

const islamicGroups: IslamicGroup[] = [
  {
    id: 'hanafi',
    name: 'Hanafi',
    arabicName: 'حنفي',
    founder: 'Imam Abu Hanifa (699-767 CE)',
    description: 'The largest Islamic school of thought, known for its emphasis on reason and analogy in legal rulings.',
    prayerTimings: {
      Fajr: 'Dawn until sunrise',
      Dhuhr: 'Noon (when sun passes zenith) until Asr',
      Asr: 'When shadow of object equals its length until sunset',
      Maghrib: 'Sunset until darkness',
      Isha: 'Darkness until midnight (or earlier in some regions)'
    },
    methodology: 'Uses discretion and public interest in legal rulings. Asr prayer timing follows the Hanafi method where shadow equals object length.',
    regions: ['Turkey', 'Pakistan', 'Bangladesh', 'India', 'Central Asia', 'Middle East']
  },
  {
    id: 'shafi',
    name: 'Shafi\'i',
    arabicName: 'شافعي',
    founder: 'Imam Al-Shafi\'i (767-820 CE)',
    description: 'Known for its balanced approach between tradition and reason, widely followed in Southeast Asia.',
    prayerTimings: {
      Fajr: 'Dawn until sunrise',
      Dhuhr: 'Noon (when sun passes zenith) until Asr',
      Asr: 'When shadow of object equals twice its length until sunset',
      Maghrib: 'Sunset until darkness',
      Isha: 'Darkness until midnight (or earlier in some regions)'
    },
    methodology: 'Emphasizes Quran, Hadith, consensus, and analogy. Asr prayer timing requires shadow to be twice the object\'s length.',
    regions: ['Indonesia', 'Malaysia', 'Brunei', 'Singapore', 'Yemen', 'East Africa']
  },
  {
    id: 'maliki',
    name: 'Maliki',
    arabicName: 'مالكي',
    founder: 'Imam Malik ibn Anas (711-795 CE)',
    description: 'Based on the practices of Medina, emphasizes local customs and community practices.',
    prayerTimings: {
      Fajr: 'Dawn until sunrise',
      Dhuhr: 'Noon (when sun passes zenith) until Asr',
      Asr: 'When shadow of object equals its length until sunset',
      Maghrib: 'Sunset until darkness',
      Isha: 'Darkness until midnight'
    },
    methodology: 'Strong emphasis on the practices of Medina and local customs. Known for its flexibility in certain rulings.',
    regions: ['Morocco', 'Algeria', 'Tunisia', 'Libya', 'West Africa']
  },
  {
    id: 'hanbali',
    name: 'Hanbali',
    arabicName: 'حنبلي',
    founder: 'Imam Ahmad ibn Hanbal (780-855 CE)',
    description: 'The most conservative school, strictly follows Hadith and is the basis for Wahhabi and Salafi movements.',
    prayerTimings: {
      Fajr: 'Dawn until sunrise',
      Dhuhr: 'Noon (when sun passes zenith) until Asr',
      Asr: 'When shadow of object equals its length until sunset',
      Maghrib: 'Sunset until darkness',
      Isha: 'Darkness until midnight'
    },
    methodology: 'Strict adherence to Hadith literature. Most conservative in its rulings and practices.',
    regions: ['Saudi Arabia', 'Qatar', 'UAE', 'Some parts of Pakistan']
  },
  {
    id: 'jafari',
    name: 'Ja\'fari (Shi\'a)',
    arabicName: 'جعفري',
    founder: 'Imam Ja\'far al-Sadiq (702-765 CE)',
    description: 'The primary school of Shia Islam, followed by Twelver Shi\'ites worldwide.',
    prayerTimings: {
      Fajr: 'Dawn until sunrise',
      Dhuhr: 'Noon (when sun passes zenith) until Asr',
      Asr: 'When shadow of object equals its length until sunset',
      Maghrib: 'Sunset until darkness',
      Isha: 'Darkness until midnight'
    },
    methodology: 'Based on the teachings of Ahl al-Bayt (Family of Prophet). Includes additional prayers and has some differences in methodology.',
    regions: ['Iran', 'Iraq', 'Lebanon', 'Bahrain', 'Azerbaijan', 'Pakistan (minority)']
  }
]

// Pakistani cities for prayer timings - using authentic service data

export default function PrayerTimingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedGroup, setSelectedGroup] = useState<string>('hanafi')
  const [selectedLocation, setSelectedLocation] = useState<Location>(PAKISTANI_CITIES[0])
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [customLocation, setCustomLocation] = useState('')
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check and update prayer times on component mount and daily
  useEffect(() => {
    const initializePrayerTimes = async () => {
      try {
        // Check if we need to update prayer times for today
        const wasUpdated = await checkAndUpdatePrayerTimes()

        if (!wasUpdated) {
          // If no update was needed, just prefetch for performance
          await prefetchTodayPrayerTimes()
        }
      } catch (error) {
        console.error('Error initializing prayer times:', error)
        // Fallback to prefetch
        await prefetchTodayPrayerTimes().catch(console.error)
      }
    }

    initializePrayerTimes()
  }, [])

  // Fetch authentic prayer times when location changes
  useEffect(() => {
    const fetchTimes = async () => {
      setIsLoadingTimes(true)
      setSearchError('')

      try {
        const times = await fetchPrayerTimes(selectedLocation.name, new Date())
        const formattedTimes = {
          Fajr: formatTo12Hour(times.Fajr),
          Dhuhr: formatTo12Hour(times.Dhuhr),
          Asr: formatTo12Hour(times.Asr),
          Maghrib: formatTo12Hour(times.Maghrib),
          Isha: formatTo12Hour(times.Isha)
        }

        setPrayerTimes(formattedTimes)
      } catch (error) {
        console.error('Error fetching prayer times:', error)
        setSearchError('Failed to load authentic prayer times. Please try again.')
        setPrayerTimes(null)
      } finally {
        setIsLoadingTimes(false)
      }
    }

    fetchTimes()
  }, [selectedLocation])

  // Refresh prayer times (clear cache and refetch)
  const refreshPrayerTimes = async () => {
    setIsRefreshing(true)
    clearPrayerTimesCache()

    try {
      const times = await fetchPrayerTimes(selectedLocation.name, new Date())
      setPrayerTimes({
        Fajr: formatTo12Hour(times.Fajr),
        Dhuhr: formatTo12Hour(times.Dhuhr),
        Asr: formatTo12Hour(times.Asr),
        Maghrib: formatTo12Hour(times.Maghrib),
        Isha: formatTo12Hour(times.Isha)
      })
      setSearchError('')
    } catch (error) {
      console.error('Error refreshing prayer times:', error)
      setSearchError('Failed to refresh prayer times. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Authenticating...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const selectedGroupData = islamicGroups.find(group => group.id === selectedGroup)

  // Search for custom location and get prayer times
  const searchLocation = async () => {
    if (!customLocation.trim()) return

    setSearchError('')
    setIsLoadingTimes(true)

    try {
      // Check if it's a Pakistani city from our list
      const pakistaniCity = PAKISTANI_CITIES.find(city =>
        city.name.toLowerCase() === customLocation.toLowerCase() ||
        customLocation.toLowerCase().includes(city.name.toLowerCase())
      )

      if (pakistaniCity) {
        setSelectedLocation(pakistaniCity)
        setCustomLocation('')
        return
      }

      // Try geocoding services for other locations
      const geocodingServices = [
        {
          url: `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(customLocation)},Pakistan&limit=1&appid=6b7b471967dd0851d0010cdecf28fd429`,
          parser: (data: unknown) => {
            const typedData = data as { lat?: number; lon?: number; name?: string; country?: string }[]
            return typedData?.[0] ? {
              name: typedData[0].name || '',
              lat: typedData[0].lat || 0,
              lng: typedData[0].lon || 0
            } : null
          }
        },
        {
          url: `https://geocode.maps.co/search?q=${encodeURIComponent(customLocation + ', Pakistan')}&limit=1`,
          parser: (data: unknown) => {
            const typedData = data as { lat?: string; lon?: string; display_name?: string }[]
            return typedData?.[0] ? {
              name: typedData[0].display_name?.split(',')[0] || '',
              lat: parseFloat(typedData[0].lat || '0'),
              lng: parseFloat(typedData[0].lon || '0')
            } : null
          }
        }
      ]

      for (const service of geocodingServices) {
        try {
          const response = await fetch(service.url)
          if (response.ok) {
            const data = await response.json()
            const location = service.parser(data)

            if (location && location.lat && location.lng) {
              setSelectedLocation(location)
              setCustomLocation('')
              return
            }
          }
        } catch (error) {
          console.warn('Geocoding service failed:', error)
          continue
        }
      }

      // If all services fail, show error
      setSearchError('Location not found. Please try a Pakistani city name.')
    } catch (error) {
      console.error('Error searching location:', error)
      setSearchError('Error searching for location. Please try again.')
    } finally {
      setIsLoadingTimes(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Islamic decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Timezone Display - Absolute Top Right Corner */}
      <div className="fixed top-4 right-4 z-50">
        <TimezoneDisplay variant="compact" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                ← Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🕌 Prayer Timings</h1>
          <p className="text-gray-600">Understanding prayer timings according to Islamic schools of thought</p>
          <div className="text-xs text-emerald-600 mt-2">
            <div>📖 Different Islamic groups follow slightly different methodologies for prayer timings</div>
          </div>
        </div>

        {/* Group Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {islamicGroups.map(group => (
            <Button
              key={group.id}
              variant={selectedGroup === group.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGroup(group.id)}
              className={selectedGroup === group.id
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              }
            >
              {group.name}
            </Button>
          ))}
        </div>

        {/* Location Selector */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-blue-800">
              📍 Select Pakistani City
            </CardTitle>
            <CardDescription className="text-center text-blue-600">
              Choose your city or search for accurate prayer times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Quick City Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {PAKISTANI_CITIES.slice(0, 10).map(location => (
                  <Button
                    key={`${location.name}-pakistan`}
                    variant={selectedLocation.name === location.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocation(location)}
                    className={selectedLocation.name === location.name
                      ? "bg-blue-600 hover:bg-blue-700 text-xs"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50 text-xs"
                    }
                  >
                    {location.name}
                  </Button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <Label htmlFor="custom-location" className="text-sm font-medium text-blue-800 mb-2 block">
                  Or search for any city:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-location"
                    placeholder="Enter city name..."
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    className="flex-1"
                  />
                  <Button onClick={searchLocation} disabled={!customLocation.trim()}>
                    Search
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {searchError && (
                <div className="max-w-md mx-auto">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                    {searchError}
                  </div>
                </div>
              )}

                {/* Current Location Display */}
                <div className="text-center">
                  <Badge variant="outline" className="bg-white/80 text-blue-800 border-blue-300">
                    Current: {selectedLocation.name}, Pakistan
                  </Badge>
                  <div className="text-xs text-blue-600 mt-1">
                    Lat: {selectedLocation.lat.toFixed(2)}°, Lon: {selectedLocation.lng.toFixed(2)}°
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Group Information */}
        {selectedGroupData && (
          <div className="space-y-6">
            {/* Group Overview */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-center text-emerald-800 flex items-center justify-center gap-2">
                  <span className="text-2xl">🕌</span>
                  {selectedGroupData.name} School ({selectedGroupData.arabicName})
                </CardTitle>
                <CardDescription className="text-center text-emerald-600">
                  Founded by {selectedGroupData.founder}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-gray-800">{selectedGroupData.description}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedGroupData.regions.map(region => (
                      <Badge key={region} variant="outline" className="bg-white/80">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prayer Timings */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-center">
                      🕐 Authentic Prayer Timings for {selectedLocation.name}
                    </CardTitle>
                    <CardDescription className="text-center">
                      Calculated by University of Islamic Sciences, Karachi (Hanafi) • {selectedGroupData.methodology}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={refreshPrayerTimes}
                      disabled={isRefreshing || isLoadingTimes}
                      size="sm"
                      variant="outline"
                    >
                      {isRefreshing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                      ) : (
                        '🔄 Refresh'
                      )}
                    </Button>
                    <Button
                      onClick={() => dailyPrayerTimesSync()}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      📅 Daily Sync
                    </Button>
                    <Button
                      onClick={() => testPrayerTimesAccuracy()}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      🧪 Test Accuracy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTimes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Calculating prayer times...</p>
                  </div>
                ) : prayerTimes ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedGroupData.prayerTimings).map(([prayer, methodology]) => {
                      const prayerTime = prayerTimes[prayer as keyof PrayerTimes]
                      return (
                        <div
                          key={prayer}
                          className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200"
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-emerald-800 capitalize mb-2">
                              {prayer}
                            </div>
                            <div className="text-xl font-bold text-emerald-700 mb-1">
                              {prayerTime}
                            </div>
                            <div className="text-xs text-emerald-600 border-t border-emerald-300 pt-2 mt-2">
                              {methodology}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Unable to calculate prayer times</p>
                  </div>
                )}

                {/* Today's Date */}
                <div className="text-center mt-6">
                  <Badge variant="outline" className="bg-white/80 text-emerald-800 border-emerald-300">
                    Today: {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Key Differences */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-center text-blue-800">
                  🔍 Key Differences in Prayer Timings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Asr Prayer Timing</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Hanafi:</strong> Shadow equals object length</div>
                        <div><strong>Shafi&apos;i:</strong> Shadow equals twice object length</div>
                        <div><strong>Others:</strong> Generally follow Hanafi method</div>
                      </div>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Isha Prayer Timing</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>General:</strong> Darkness until midnight</div>
                        <div><strong>Regional variations:</strong> May end earlier in some areas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Islamic Reminder */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="text-emerald-800">
                <p className="text-lg font-semibold mb-2">🕌 Remember</p>
                <p className="text-base mb-3">
                  &ldquo;The prayer is a pillar of Islam, and whoever establishes it establishes Islam,
                  and whoever abandons it demolishes Islam.&rdquo;
                </p>
                <p className="text-sm text-emerald-600 italic">
                  - Prophet Muhammad ﷺ (Sunan Ibn Majah)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
