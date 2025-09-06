'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TimezoneDisplay from '@/components/TimezoneDisplay'

interface Durood {
  id: string
  arabic: string
  urdu: string
  english: string
  transliteration: string
  category: string
  description: string
}

const duroods: Durood[] = [
  {
    id: 'ibrahimi',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    urdu: 'اے اللہ! محمد اور آلِ محمد پر اتنا درود بھیج جتنا تو نے ابراہیم اور آلِ ابراہیم پر بھیجا، بیشک تو تعریف اور بزرگی کا مالک ہے۔',
    english: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim. Indeed, You are the Praiseworthy, the Glorious.',
    transliteration: 'Allahumma salli ala Muhammadin wa ala aali Muhammadin kama sallayta ala Ibrahima wa ala aali Ibrahima innaka Hamidum Majid.',
    category: 'Standard',
    description: 'The most common durood recited by Muslims worldwide, also known as Durood Ibrahim.'
  },
  {
    id: 'taaj',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَأَصْحَابِهِ أَجْمَعِينَ',
    urdu: 'اے اللہ! ہمارے سید محمد اور ان کی آل اور تمام صحابہ پر درود، سلام اور برکت بھیج۔',
    english: 'O Allah, send blessings, peace and blessings upon our master Muhammad, and upon his family and all his companions.',
    transliteration: 'Allahumma salli wa sallim wa barik ala Sayyidina Muhammadin wa ala alihi wa ashabihi ajmain.',
    category: 'Comprehensive',
    description: 'A comprehensive durood that includes blessings for the Prophet, his family, and his companions.'
  },
  {
    id: 'shifa',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ وَبَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    urdu: 'اے اللہ! محمد اور آلِ محمد پر اتنا درود بھیج جتنا تو نے ابراہیم اور آلِ ابراہیم پر بھیجا اور محمد اور آلِ محمد پر اتنی برکت بھیج جتنی تو نے ابراہیم اور آلِ ابراہیم پر بھیجی، بیشک تو تعریف اور بزرگی کا مالک ہے۔',
    english: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim, and send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim. Indeed, You are the Praiseworthy, the Glorious.',
    transliteration: 'Allahumma salli ala Muhammadin wa ala aali Muhammadin kama sallayta ala Ibrahima wa ala aali Ibrahima wa barik ala Muhammadin wa ala aali Muhammadin kama barakta ala Ibrahima wa ala aali Ibrahima innaka Hamidum Majid.',
    category: 'Comprehensive',
    description: 'A longer version that includes both blessings and mercy, known for its healing properties.'
  },
  {
    id: 'noor',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ نُورِكَ وَرَحْمَتِكَ وَبَرَكَاتِكَ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَسَلِّمْ',
    urdu: 'اے اللہ! اپنے نور، رحمت اور برکتوں پر ہمارے سید محمد اور ان کی آل پر درود اور سلام بھیج۔',
    english: 'O Allah, send blessings upon Your light, mercy and blessings, our master Muhammad, and upon his family and grant them peace.',
    transliteration: 'Allahumma salli ala noorika wa rahmatika wa barakatika Sayyidina Muhammadin wa ala alihi wa sallim.',
    category: 'Spiritual',
    description: 'A durood that focuses on the spiritual light and mercy of the Prophet.'
  },
  {
    id: 'iftitah',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي وَاسْتَغْفِرْكَ لِي',
    urdu: 'اے اللہ! محمد اور آلِ محمد پر درود بھیج اور میری زبان کی گرہ کھول دے اور مجھے معافی عطا فرما۔',
    english: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad, and loosen a knot from my tongue and grant me forgiveness.',
    transliteration: 'Allahumma salli ala Muhammadin wa ala aali Muhammadin wa ahlul uqdah min lisani wastaghfiruka li.',
    category: 'Opening',
    description: 'A durood recited at the beginning of gatherings or important tasks to seek Allah\'s help.'
  },
  {
    id: 'khizri',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ وَبَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ وَصَلِّ عَلَىٰ جَمِيعِ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ وَالْمَلَائِكَةِ الْمُقَرَّبِينَ وَالْأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِينَ وَمَا خَلَقْتَ مِنْ خَلْقِكَ يَا رَبَّ الْعَالَمِينَ',
    urdu: 'اے اللہ! محمد اور آلِ محمد پر اتنا درود بھیج جتنا تو نے ابراہیم اور آلِ ابراہیم پر بھیجا اور محمد اور آلِ محمد پر اتنی برکت بھیج جتنی تو نے ابراہیم اور آلِ ابراہیم پر بھیجی، بیشک تو تعریف اور بزرگی کا مالک ہے، اور تمام انبیاء، مرسلین، مقرّبین فرشتوں، اولیاء، شہداء، صالحین اور اپنی تمام مخلوقات پر درود بھیج اے دنیا کے پروردگار!',
    english: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim, and send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim. Indeed, You are the Praiseworthy, the Glorious. And send blessings upon all the prophets, messengers, angels, saints, martyrs, righteous ones and all Your creation, O Lord of the worlds.',
    transliteration: 'Allahumma salli ala Muhammadin wa ala aali Muhammadin kama sallayta ala Ibrahima wa ala aali Ibrahima wa barik ala Muhammadin wa ala aali Muhammadin kama barakta ala Ibrahima wa ala aali Ibrahima innaka Hamidum Majid. Wa salli ala jami\' al-anbiya wa al-mursalin wa al-malayikah al-muqarrabin wa al-awliya wa al-shuhada wa al-salihin wa ma khalaqta min khalqik ya Rabb al-alamin.',
    category: 'Comprehensive',
    description: 'A very comprehensive durood that includes blessings for all prophets, messengers, angels, and creation.'
  },
  {
    id: 'muhammadi',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ وَبَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    urdu: 'اے اللہ! محمد اور آلِ محمد پر اتنا درود بھیج جتنا تو نے ابراہیم اور آلِ ابراہیم پر بھیجا اور محمد اور آلِ محمد پر اتنی برکت بھیج جتنی تو نے ابراہیم اور آلِ ابراہیم پر بھیجی، بیشک تو تعریف اور بزرگی کا مالک ہے۔',
    english: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim, and send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim. Indeed, You are the Praiseworthy, the Glorious.',
    transliteration: 'Allahumma salli ala Muhammadin wa ala aali Muhammadin kama sallayta ala Ibrahima wa ala aali Ibrahima wa barik ala Muhammadin wa ala aali Muhammadin kama barakta ala Ibrahima wa ala aali Ibrahima innaka Hamidum Majid.',
    category: 'Standard',
    description: 'A beautiful durood that emphasizes the connection between Prophet Muhammad and Prophet Ibrahim.'
  },
  {
    id: 'badawi',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ الصَّلَاةُ الْمُتَوَاصِلَةُ الدَّائِمَةُ الْمُتَرَدِّدَةُ الْمُتَوَالِيَةُ الْمُتَدَاوِلَةُ الْمُتَحَرِّكَةُ الْمُتَوَاتِرَةُ الْمُتَعَاقِبَةُ الْمُتَتَابِعَةُ الْمُتَرَادِفَةُ الْمُتَعَاطِفَةُ الْمُتَعَاوِنَةُ',
    urdu: 'اے اللہ! ہمارے سید محمد پر لگاتار، دائمی، متواصل، متوالی، متداول، متحرک، متواتر، متعاقب، متتابع، مترادف، متعاطف اور متعاون درود بھیج۔',
    english: 'O Allah, send continuous, permanent, successive, consecutive, circulating, moving, frequent, following, successive, synonymous, sympathetic, and cooperative blessings upon our master Muhammad.',
    transliteration: 'Allahumma salli ala Sayyidina Muhammadin al-salatul mutawassilah al-daimah al-mutaraddidah al-mutawaliyah al-mutadawilah al-mutaharrikah al-mutawatirah al-muta\'aqibah al-mutataabi\'ah al-mutaradifah al-muta\'atifah al-muta\'awinah.',
    category: 'Continuous',
    description: 'A durood that asks for continuous blessings in various forms and descriptions.'
  },
  {
    id: 'alanbiya',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ وَعَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ وَعَلَىٰ نُوحٍ وَعَلَىٰ آلِ نُوحٍ وَعَلَىٰ مُوسَىٰ وَعَلَىٰ آلِ مُوسَىٰ وَعَلَىٰ عِيسَىٰ وَعَلَىٰ آلِ عِيسَىٰ وَعَلَىٰ أَنْبِيَائِكَ وَرُسُلِكَ وَمَلَائِكَتِكَ الْمُقَرَّبِينَ',
    urdu: 'اے اللہ! محمد اور آلِ محمد، ابراہیم اور آلِ ابراہیم، نوح اور آلِ نوح، موسیٰ اور آلِ موسیٰ، عیسیٰ اور آلِ عیسیٰ اور اپنے تمام انبیاء، رسولوں اور مقرّب فرشتوں پر درود بھیج۔',
    english: 'O Allah, send blessings upon Muhammad and the family of Muhammad, upon Ibrahim and the family of Ibrahim, upon Nuh and the family of Nuh, upon Musa and the family of Musa, upon Isa and the family of Isa, and upon all Your prophets, messengers, and angels who are close to You.',
    transliteration: 'Allahumma salli ala Muhammadin wa ala aali Muhammadin wa ala Ibrahima wa ala aali Ibrahima wa ala Noohin wa ala aali Noohin wa ala Moosa wa ala aali Moosa wa ala Isa wa ala aali Isa wa ala anbiyaika wa rusulika wa malayikatikal muqarrabin.',
    category: 'Prophets',
    description: 'A durood that includes blessings for major prophets and messengers of Allah.'
  },
  {
    id: 'daud',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ وَعَلَىٰ دَاوُدَ وَعَلَىٰ آلِ دَاوُدَ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    urdu: 'اے اللہ! محمد اور آلِ محمد، داؤد اور آلِ داؤد پر اتنا درود بھیج جتنا تو نے ابراہیم اور آلِ ابراہیم پر بھیجا، بیشک تو تعریف اور بزرگی کا مالک ہے۔',
    english: 'O Allah, send blessings upon Muhammad and the family of Muhammad, and upon Daud and the family of Daud, as You sent blessings upon Ibrahim and the family of Ibrahim. Indeed, You are the Praiseworthy, the Glorious.',
    transliteration: 'Allahumma salli ala Muhammadin wa ala aali Muhammadin wa ala Dawooda wa ala aali Dawooda kama sallayta ala Ibrahima wa ala aali Ibrahima innaka Hamidum Majid.',
    category: 'Prophets',
    description: 'A durood that connects Prophet Muhammad with Prophet Daud (David) and their families.'
  },
  {
    id: 'rohani',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ رُوحِ النَّبِيِّ وَعَلَىٰ جَسَدِ النَّبِيِّ وَعَلَىٰ قَبْرِ النَّبِيِّ وَعَلَىٰ رَحْمَةِ النَّبِيِّ وَعَلَىٰ بَرَكَةِ النَّبِيِّ وَعَلَىٰ آلِ النَّبِيِّ وَأَصْحَابِ النَّبِيِّ أَجْمَعِينَ',
    urdu: 'اے اللہ! نبی کی روح پر، نبی کے جسم پر، نبی کی قبر پر، نبی کی رحمت پر، نبی کی برکت پر، نبی کی آل پر اور نبی کے تمام صحابہ پر درود بھیج۔',
    english: 'O Allah, send blessings upon the soul of the Prophet, upon the body of the Prophet, upon the grave of the Prophet, upon the mercy of the Prophet, upon the blessing of the Prophet, upon the family of the Prophet, and upon all the companions of the Prophet.',
    transliteration: 'Allahumma salli ala roohin nabiyyi wa ala jasadin nabiyyi wa ala qabr in nabiyyi wa ala rahmatin nabiyyi wa ala barakatin nabiyyi wa ala aalin nabiyyi wa ashabin nabiyyi ajmain.',
    category: 'Spiritual',
    description: 'A spiritual durood that focuses on different aspects of the Prophet\'s blessed presence.'
  },
  {
    id: 'muqaddas',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ الْمُقَدَّسِ وَعَلَىٰ آلِ مُحَمَّدٍ الْمُقَدَّسِينَ وَعَلَىٰ إِبْرَاهِيمَ الْمُقَدَّسِ وَعَلَىٰ آلِ إِبْرَاهِيمَ الْمُقَدَّسِينَ',
    urdu: 'اے اللہ! پاک محمد اور پاک آلِ محمد پر، پاک ابراہیم اور پاک آلِ ابراہیم پر درود بھیج۔',
    english: 'O Allah, send blessings upon the sanctified Muhammad and upon the sanctified family of Muhammad, and upon the sanctified Ibrahim and upon the sanctified family of Ibrahim.',
    transliteration: 'Allahumma salli ala Muhammadin al-muqaddasi wa ala aali Muhammadin al-muqaddasin wa ala Ibrahima al-muqaddasi wa ala aali Ibrahima al-muqaddasin.',
    category: 'Spiritual',
    description: 'A durood that emphasizes the sanctified and pure nature of the Prophet and his family.'
  },
  {
    id: 'habibi',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ حَبِيبِكَ مُحَمَّدٍ وَعَلَىٰ آلِ حَبِيبِكَ مُحَمَّدٍ وَعَلَىٰ أَحِبَّائِكَ مِنْ خَلْقِكَ وَعَلَىٰ أَصْحَابِ حَبِيبِكَ مُحَمَّدٍ أَجْمَعِينَ',
    urdu: 'اے اللہ! اپنے محبوب محمد اور محبوب محمد کی آل پر، اپنے تمام محبوب بندوں پر اور محبوب محمد کے تمام صحابہ پر درود بھیج۔',
    english: 'O Allah, send blessings upon Your beloved Muhammad and upon the family of Your beloved Muhammad, and upon Your beloved ones from Your creation, and upon all the companions of Your beloved Muhammad.',
    transliteration: 'Allahumma salli ala habibika Muhammadin wa ala aali habibika Muhammadin wa ala ahbbyika min khalqika wa ala ashabi habibika Muhammadin ajmain.',
    category: 'Love',
    description: 'A durood that expresses love and affection for the Prophet and his companions.'
  }
]

type ContentType = 'durood-collection' | 'quran-verses' | 'hadith-collection' | 'islamic-teachings'

export default function DuroodsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedContent, setSelectedContent] = useState<ContentType>('durood-collection')
  const [selectedDurood, setSelectedDurood] = useState<string | null>(null)

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

  // Get selected durood details
  const selectedDuroodData = selectedDurood ? duroods.find(d => d.id === selectedDurood) : null

  // Function to get proper durood name
  const getDuroodDisplayName = (duroodId: string) => {
    const nameMap: { [key: string]: string } = {
      'ibrahimi': 'Durood e Ibrahim',
      'taaj': 'Durood e Taj',
      'shifa': 'Durood e Shifa',
      'noor': 'Durood e Noor',
      'iftitah': 'Durood e Iftitah',
      'khizri': 'Durood e Khizri',
      'muhammadi': 'Durood e Muhammadi',
      'badawi': 'Durood e Badawi',
      'alanbiya': 'Durood e Alanbiya',
      'daud': 'Durood e Daud',
      'rohani': 'Durood e Rohani',
      'muqaddas': 'Durood e Muqaddas',
      'habibi': 'Durood e Habibi'
    }
    return nameMap[duroodId] || duroodId.charAt(0).toUpperCase() + duroodId.slice(1)
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ﷺ Durood Collection</h1>
          <p className="text-gray-600">Beautiful duroods with Urdu translations</p>
          <div className="text-xs text-emerald-600 mt-2">
            <div>📖 Recite these blessed duroods to earn spiritual rewards</div>
          </div>
        </div>

        {/* Content Selector */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md">
            <Select value={selectedContent} onValueChange={(value) => {
              setSelectedContent(value as ContentType)
              setSelectedDurood(null) // Reset durood selection when changing content type
            }}>
              <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-emerald-300">
                <SelectValue placeholder="Choose content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="durood-collection">
                  <div className="flex items-center gap-2">
                    <span>ﷺ</span>
                    <span>Durood Collection</span>
                  </div>
                </SelectItem>
                <SelectItem value="quran-verses">
                  <div className="flex items-center gap-2">
                    <span>﷽</span>
                    <span>Quran Verses</span>
                  </div>
                </SelectItem>
                <SelectItem value="hadith-collection">
                  <div className="flex items-center gap-2">
                    <span>📚</span>
                    <span>Hadith Collection</span>
                  </div>
                </SelectItem>
                <SelectItem value="islamic-teachings">
                  <div className="flex items-center gap-2">
                    <span>🌟</span>
                    <span>Islamic Teachings</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic Content Based on Selection */}
        {selectedContent === 'quran-verses' && (
          <div className="mb-8">
            {/* Quran Verse */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-center text-emerald-800 flex items-center justify-center gap-2">
                  <span className="text-2xl">﷽</span>
                  Quran - Surah Al-Ahzab (33:56)
                </CardTitle>
                <CardDescription className="text-center text-emerald-600">
                  Allah and His angels send blessings on the Prophet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div dir="rtl" className="text-right text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed">
                  إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا
                </div>
                <div dir="rtl" className="text-right p-4 bg-white/70 border border-emerald-100 rounded-lg text-gray-800 text-lg leading-relaxed">
                  بیشک اللہ اور اس کے فرشتے نبی پر درود بھیجتے ہیں۔ اے ایمان والو! تم بھی ان پر درود و سلام بھیجا کرو۔
                </div>
                <div className="text-center p-3 bg-emerald-100/50 border border-emerald-200 rounded-lg text-emerald-800">
                  <strong>English:</strong> Indeed, Allah and His angels send blessings upon the Prophet. O you who have believed, ask Allah to confer blessing upon him and ask Allah to grant him peace.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedContent === 'hadith-collection' && (
          <div className="mb-8">
            {/* Hadiths */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-center text-blue-800 flex items-center justify-center gap-2">
                    <span className="text-xl">📚</span>
                    Hadith - Sahih Muslim
                  </CardTitle>
                  <CardDescription className="text-center text-blue-600">
                    The Prophet&apos;s love for durood
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-800">
                    <p className="mb-3">
                      &ldquo;The closest people to me on the Day of Judgment will be those who send the most blessings upon me.&rdquo;
                    </p>
                    <div className="text-sm text-blue-600 italic">
                      - Prophet Muhammad ﷺ (Sahih Muslim)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-center text-purple-800 flex items-center justify-center gap-2">
                    <span className="text-xl">📚</span>
                    Hadith - Jami&apos; at-Tirmidhi
                  </CardTitle>
                  <CardDescription className="text-center text-purple-600">
                    Rewards of reciting durood
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-800">
                    <p className="mb-3">
                      &ldquo;Whoever sends blessings upon me once, Allah will send blessings upon him ten times.&rdquo;
                    </p>
                    <div className="text-sm text-purple-600 italic">
                      - Prophet Muhammad ﷺ (Jami&apos; at-Tirmidhi)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedContent === 'islamic-teachings' && (
          <div className="mb-8">
            {/* Islamic Teaching */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-center text-amber-800">
                  🌟 Islamic Teaching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-800 space-y-3">
                  <p>
                    <strong>Durood Shareef</strong> is the best form of worship after the obligatory prayers.
                    It brings countless blessings and is a means of attaining Allah&apos;s pleasure.
                  </p>
                  <p className="text-sm text-amber-600">
                    &ldquo;The most beloved deeds to Allah are those done regularly, even if they are small.&rdquo; - Prophet Muhammad ﷺ
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedContent === 'durood-collection' && (
          <div className="mb-8">
            {!selectedDurood ? (
              <>
                {/* Durood Selection Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {duroods.map(durood => (
                    <div
                      key={durood.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedDurood(durood.id)}
                    >
                      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-emerald-50/90 border-emerald-200 hover:border-emerald-300">
                        <CardContent className="p-4 text-center">
                          <div className="text-sm font-semibold text-emerald-800">
                            {getDuroodDisplayName(durood.id)}
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                            {durood.category}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Selection Prompt */}
                <div className="text-center text-gray-600">
                  <p className="text-lg">Click on any durood above to view its complete details</p>
                  <p className="text-sm mt-2">Including Arabic text, Urdu translation, English translation, and transliteration</p>
                </div>
              </>
            ) : selectedDuroodData ? (
              <>
                {/* Back Button */}
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={() => setSelectedDurood(null)}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    ← Back to Durood Collection
                  </Button>
                </div>

                {/* Selected Durood Details */}
                <Card className="shadow-xl bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-emerald-800">
                        {getDuroodDisplayName(selectedDuroodData.id)}
                      </CardTitle>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-sm px-3 py-1">
                        {selectedDuroodData.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-emerald-600 text-base">
                      {selectedDuroodData.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8">
                    {/* Arabic Text */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                      <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">📖</span>
                        Arabic Text
                      </h4>
                      <div dir="rtl" className="text-right text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed">
                        {selectedDuroodData.arabic}
                      </div>
                    </div>

                    {/* Urdu Translation */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="text-xl">🇵🇰</span>
                        Urdu Translation
                      </h4>
                      <div dir="rtl" className="text-right text-xl text-gray-800 leading-relaxed">
                        {selectedDuroodData.urdu}
                      </div>
                    </div>

                    {/* English Translation */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="text-xl">🇺🇸</span>
                        English Translation
                      </h4>
                      <div className="text-lg text-gray-800 leading-relaxed">
                        {selectedDuroodData.english}
                      </div>
                    </div>

                    {/* Transliteration */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">🔤</span>
                        Transliteration
                      </h4>
                      <div className="text-lg text-blue-800 leading-relaxed font-mono">
                        {selectedDuroodData.transliteration}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="text-emerald-800">
                <p className="text-lg font-semibold mb-2">ﷺ Remember</p>
                <p className="text-base">
                  Reciting durood upon the Prophet Muhammad ﷺ is one of the most virtuous deeds in Islam.
                  It brings immense spiritual rewards and strengthens our connection with Allah and His Messenger.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
