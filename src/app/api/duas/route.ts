import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Sample duas data - in production, this would be seeded from a database
const sampleDuas = [
  {
    title: "Morning Dua",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    urdu: "اے اللہ! میں نے صبح کی اور میں گواہی دیتا ہوں تجھے اور تیرے عرش کو اٹھانے والوں اور تیرے فرشتوں اور تیری تمام مخلوق کو گواہی دیتا ہوں کہ تو ہی اللہ ہے، تیرے سوا کوئی معبود نہیں، تو اکیلا ہے، تیرے لیے کوئی شریک نہیں اور محمد تیرا بندہ اور تیرا رسول ہے",
    english: "O Allah, I have entered the morning and I bear witness to You, and I bear witness to the carriers of Your Throne, and Your angels, and all Your creation, that You are Allah, there is no god but You alone, You have no partner, and Muhammad is Your servant and Your Messenger.",
    transliteration: "Allahumma inni asbahtu ush-hiduka wa ush-hidu hamalata 'arshika wa mala'ikataka wa jami'a khalqika annaka antallah la ilaha illa anta wahdaka la sharika laka wa anna Muhammadan 'abduka wa rasuluka",
    reference: "Sahih Muslim 2723",
    order: 1
  },
  {
    title: "Evening Dua",
    category: "evening",
    arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    urdu: "اے اللہ! میں نے شام کی اور میں گواہی دیتا ہوں تجھے اور تیرے عرش کو اٹھانے والوں اور تیرے فرشتوں اور تیری تمام مخلوق کو گواہی دیتا ہوں کہ تو ہی اللہ ہے، تیرے سوا کوئی معبود نہیں، تو اکیلا ہے، تیرے لیے کوئی شریک نہیں اور محمد تیرا بندہ اور تیرا رسول ہے",
    english: "O Allah, I have entered the evening and I bear witness to You, and I bear witness to the carriers of Your Throne, and Your angels, and all Your creation, that You are Allah, there is no god but You alone, You have no partner, and Muhammad is Your servant and Your Messenger.",
    transliteration: "Allahumma inni amsaytu ush-hiduka wa ush-hidu hamalata 'arshika wa mala'ikataka wa jami'a khalqika annaka antallah la ilaha illa anta wahdaka la sharika laka wa anna Muhammadan 'abduka wa rasuluka",
    reference: "Sahih Muslim 2723",
    order: 2
  },
  {
    title: "Travel Dua",
    category: "travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    urdu: "پاک ہے وہ ذات جس نے ہمارے لیے یہ (سواری) مسخر کر دی اور ہم خود اس کے قابو میں نہیں تھے اور ہم اپنے رب کی طرف لوٹنے والے ہیں",
    english: "Glory be to Him who has subjected this to us, and we were not able to do it. And indeed, to our Lord we will return.",
    transliteration: "Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
    reference: "Surah Az-Zukhruf (43:13-14)",
    order: 3
  },
  {
    title: "Protection from Evil",
    category: "protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    urdu: "میں اللہ کی مکمل باتوں کی پناہ چاہتا ہوں اس چیز کی برائی سے جسے اس نے پیدا کیا",
    english: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    transliteration: "A'udhu bikalimatillahi at-tammati min sharri ma khalaq",
    reference: "Sahih Muslim 2708",
    order: 4
  },
  {
    title: "Forgiveness Dua",
    category: "forgiveness",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
    urdu: "اے میرے رب! مجھے بخش دے اور مجھے توبہ قبول فرما بیشک تو توبہ قبول کرنے والا اور رحم کرنے والا ہے",
    english: "My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of Repentance, the Merciful.",
    transliteration: "Rabbi ighfir li wa tub 'alayya innaka antat tawwabu rahim",
    reference: "Surah Al-Mu'minun (23:118)",
    order: 5
  }
]

export async function GET(request: NextRequest) {
  try {
    const duas = await prisma.dua.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(duas)
  } catch (error) {
    console.error('Error fetching duas:', error)
    return NextResponse.json({ error: 'Failed to fetch duas' }, { status: 500 })
  }
}

// Add new dua (admin only)
export async function POST(request: NextRequest) {
  try {
    // In production, add authentication check here
    const duaData = await request.json()

    // Validate required fields
    const { title, category, arabic, urdu, english, transliteration, reference } = duaData
    if (!title || !category || !arabic || !urdu || !english) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newDua = await prisma.dua.create({
      data: {
        title,
        category,
        arabic,
        urdu,
        english,
        transliteration: duaData.transliteration || null,
        reference: duaData.reference || null,
        audioUrl: duaData.audioUrl || null,
        order: duaData.order || 0
      }
    })

    return NextResponse.json(newDua, { status: 201 })
  } catch (error) {
    console.error('Error creating dua:', error)
    return NextResponse.json({ error: 'Failed to create dua' }, { status: 500 })
  }
}
