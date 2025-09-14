'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Dua {
  id: string
  title: string
  category: string
  arabic: string
  urdu: string
  english: string
  transliteration?: string
  reference?: string
  audioUrl?: string
  isActive: boolean
  order: number
}

interface DuaLibraryProps {
  compact?: boolean
}

const CATEGORIES = [
  'all',
  'morning',
  'evening',
  'salah',
  'protection',
  'forgiveness',
  'healing',
  'quranic',
  'sunnah',
  'durood',
  'names',
  'travel',
  'waking',
  'food',
  'wudu',
  'clothes',
  'home',
  'social',
  'iman',
  'difficulties',
  'happiness',
  'hajj',
  'money',
  'marriage',
  'nature',
  'istikharah'
]

export default function DuaLibrary({ compact = false }: DuaLibraryProps) {
  const { data: session } = useSession()
  const [duas, setDuas] = useState<Dua[]>([])
  const [filteredDuas, setFilteredDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load duas
  useEffect(() => {
    const fetchDuas = async () => {
      try {
        const response = await fetch('/api/duas')
        if (response.ok) {
          const data = await response.json()
          setDuas(data)
          setFilteredDuas(data)
        }
      } catch (error) {
        console.error('Error fetching duas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDuas()
  }, [])

  // Load user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/duas/favorites')
        if (response.ok) {
          const data = await response.json()
          setFavorites(new Set(data.map((fav: { duaId: string }) => fav.duaId)))
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      }
    }

    fetchFavorites()
  }, [session])

  // Filter duas based on search and category
  useEffect(() => {
    let filtered = duas

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dua => dua.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(dua =>
        dua.title.toLowerCase().includes(query) ||
        dua.arabic.includes(query) ||
        dua.english.toLowerCase().includes(query) ||
        dua.urdu.includes(query) ||
        (dua.transliteration && dua.transliteration.toLowerCase().includes(query))
      )
    }

    setFilteredDuas(filtered)
  }, [duas, searchQuery, selectedCategory])

  const toggleFavorite = async (duaId: string) => {
    if (!session?.user?.id) return

    const isFavorite = favorites.has(duaId)
    const newFavorites = new Set(favorites)

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch('/api/duas/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ duaId }),
        })

        if (response.ok) {
          newFavorites.delete(duaId)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/duas/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ duaId }),
        })

        if (response.ok) {
          newFavorites.add(duaId)
        }
      }

      setFavorites(newFavorites)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const shareDua = async (dua: Dua) => {
    const shareText = `${dua.title}\n\nArabic: ${dua.arabic}\n\nEnglish: ${dua.english}\n\nFrom Durood Tracker`

    if (navigator.share) {
      try {
        await navigator.share({
          title: dua.title,
          text: shareText,
        })
      } catch (error) {
        console.error('Error sharing:', error)
        copyToClipboard(shareText)
      }
    } else {
      copyToClipboard(shareText)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Copied to clipboard!')
    })
  }

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-4xl mx-auto"}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">Loading duas...</p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📖 Dua Library
          </CardTitle>
          <CardDescription>
            {filteredDuas.length} duas available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDuas.slice(0, 3).map((dua) => (
              <div key={dua.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-emerald-800">{dua.title}</h4>
                  <Badge variant="outline" className="text-xs">{dua.category}</Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{dua.english}</p>
              </div>
            ))}
          </div>
          {filteredDuas.length > 3 && (
            <Button variant="outline" className="w-full mt-4" onClick={() => setSelectedDua(filteredDuas[0])}>
              View All Duas
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                📖 Dua Library
              </CardTitle>
              <CardDescription>
                Authentic duas with Arabic, Urdu, and English translations
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredDuas.length} duas
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search duas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dua List */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Duas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredDuas.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No duas found matching your criteria
                  </div>
                ) : (
                  filteredDuas.map((dua) => (
                    <div
                      key={dua.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedDua?.id === dua.id ? 'bg-emerald-50 border-emerald-200' : ''
                      }`}
                      onClick={() => setSelectedDua(dua)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{dua.title}</h4>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {dua.category}
                          </Badge>
                          {session?.user?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(dua.id)
                              }}
                              className={`text-sm ${favorites.has(dua.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                            >
                              {favorites.has(dua.id) ? '❤️' : '🤍'}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{dua.english}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dua Details */}
        <div className="lg:col-span-2">
          {selectedDua ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedDua.title}</CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {selectedDua.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {session?.user?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorite(selectedDua.id)}
                        className={favorites.has(selectedDua.id) ? 'text-red-500 border-red-300' : ''}
                      >
                        {favorites.has(selectedDua.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareDua(selectedDua)}
                    >
                      📤 Share
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="arabic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="arabic">العربية</TabsTrigger>
                    <TabsTrigger value="english">English</TabsTrigger>
                    <TabsTrigger value="urdu">اردو</TabsTrigger>
                    <TabsTrigger value="transliteration">Transliteration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="arabic" className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-200">
                      <h3 className="font-semibold text-emerald-800 mb-3">Arabic Text</h3>
                      <div className="text-right text-2xl leading-relaxed text-gray-800 font-arabic">
                        {selectedDua.arabic}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="english" className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-3">English Translation</h3>
                      <div className="text-gray-800 leading-relaxed">
                        {selectedDua.english}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="urdu" className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-purple-800 mb-3">Urdu Translation</h3>
                      <div className="text-right text-lg leading-relaxed text-gray-800">
                        {selectedDua.urdu}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transliteration" className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Romanized Transliteration</h3>
                      <div className="text-gray-700 leading-relaxed font-mono text-sm">
                        {selectedDua.transliteration || 'Transliteration not available'}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Reference */}
                {selectedDua.reference && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Reference</h4>
                    <p className="text-yellow-700 text-sm">{selectedDua.reference}</p>
                  </div>
                )}

                {/* Audio */}
                {selectedDua.audioUrl && (
                  <div className="mt-6">
                    <audio controls className="w-full">
                      <source src={selectedDua.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">📖</div>
                <p>Select a dua from the list to view its details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
