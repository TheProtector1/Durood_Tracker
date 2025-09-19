import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive Dua Collection from LifeWithAllah.com
const comprehensiveDuas = [
  // MORNING ADHKAR
  {
    title: "Morning Testimony of Faith",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    urdu: "اے اللہ! میں نے صبح کی اور میں گواہی دیتا ہوں تجھے اور تیرے عرش کو اٹھانے والوں اور تیرے فرشتوں اور تیری تمام مخلوق کو گواہی دیتا ہوں کہ تو ہی اللہ ہے، تیرے سوا کوئی معبود نہیں، تو اکیلا ہے، تیرے لیے کوئی شریک نہیں اور محمد تیرا بندہ اور تیرا رسول ہے",
    english: "O Allah, I have entered the morning and I bear witness to You, and I bear witness to the carriers of Your Throne, and Your angels, and all Your creation, that You are Allah, there is no god but You alone, You have no partner, and Muhammad is Your servant and Your Messenger.",
    transliteration: "Allahumma inni asbahtu ush-hiduka wa ush-hidu hamalata 'arshika wa mala'ikataka wa jami'a khalqika annaka antallah la ilaha illa anta wahdaka la sharika laka wa anna Muhammadan 'abduka wa rasuluka",
    reference: "Sahih Muslim 2723",
    order: 1
  },
  {
    title: "Morning Protection from Evil",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أَعُوذُ بِكَ مِنْ ضِيقِ الدُّنْيَا وَضِيقِ الْقَبْرِ",
    urdu: "اے اللہ! میں نے صبح کی، میں تیری پناہ چاہتا ہوں دنیا کی تنگی اور قبر کی تنگی سے",
    english: "O Allah, I have entered the morning seeking Your protection from the constriction of this world and the constriction of the grave.",
    transliteration: "Allahumma inni asbahtu a'udhu bika min diqid dunya wa diqil qabri",
    reference: "Sunan Abu Dawood 5074",
    order: 2
  },
  {
    title: "Morning Istighfar",
    category: "morning",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    urdu: "میں اللہ سے معافی مانگتا ہوں اور اس کی طرف رجوع کرتا ہوں",
    english: "I seek forgiveness from Allah and repent to Him.",
    transliteration: "Astaghfirullaha wa atubu ilayhi",
    reference: "Sahih Muslim",
    order: 3
  },

  // EVENING ADHKAR
  {
    title: "Evening Testimony of Faith",
    category: "evening",
    arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    urdu: "اے اللہ! میں نے شام کی اور میں گواہی دیتا ہوں تجھے اور تیرے عرش کو اٹھانے والوں اور تیرے فرشتوں اور تیری تمام مخلوق کو گواہی دیتا ہوں کہ تو ہی اللہ ہے، تیرے سوا کوئی معبود نہیں، تو اکیلا ہے، تیرے لیے کوئی شریک نہیں اور محمد تیرا بندہ اور تیرا رسول ہے",
    english: "O Allah, I have entered the evening and I bear witness to You, and I bear witness to the carriers of Your Throne, and Your angels, and all Your creation, that You are Allah, there is no god but You alone, You have no partner, and Muhammad is Your servant and Your Messenger.",
    transliteration: "Allahumma inni amsaytu ush-hiduka wa ush-hidu hamalata 'arshika wa mala'ikataka wa jami'a khalqika annaka antallah la ilaha illa anta wahdaka la sharika laka wa anna Muhammadan 'abduka wa rasuluka",
    reference: "Sahih Muslim 2723",
    order: 1
  },
  {
    title: "Evening Protection from Evil",
    category: "evening",
    arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أَعُوذُ بِكَ مِنْ ضِيقِ الدُّنْيَا وَضِيقِ الْقَبْرِ",
    urdu: "اے اللہ! میں نے شام کی، میں تیری پناہ چاہتا ہوں دنیا کی تنگی اور قبر کی تنگی سے",
    english: "O Allah, I have entered the evening seeking Your protection from the constriction of this world and the constriction of the grave.",
    transliteration: "Allahumma inni amsaytu a'udhu bika min diqid dunya wa diqil qabri",
    reference: "Sunan Abu Dawood 5074",
    order: 2
  },

  // BEFORE SLEEP
  {
    title: "Before Sleep Protection",
    category: "sleep",
    arabic: "بِسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ",
    urdu: "اے اللہ! تیرے نام سے میں زندہ ہوں اور تیرے نام سے مرتا ہوں",
    english: "In Your name, O Allah, I live and die.",
    transliteration: "Bismika Allahumma ahya wa amut",
    reference: "Sahih al-Bukhari 6312",
    order: 1
  },
  {
    title: "Four Quls Before Sleep",
    category: "sleep",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ﴿٤﴾",
    urdu: "کہہ دو کہ وہ اللہ ایک ہے، اللہ بے نیاز ہے، نہ پیدا کیا اور نہ پیدا ہوا، اور نہ ہی اس کا کوئی ہمسر ہے",
    english: "Say: 'He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.'",
    transliteration: "Qul huwa Allahu ahad. Allahu as-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad",
    reference: "Surah Al-Ikhlas (112:1-4)",
    order: 2
  },

  // SALAH (Prayer)
  {
    title: "After Salah Tasbih",
    category: "salah",
    arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    urdu: "اللہ پاک ہے، تمام تعریفیں اللہ کے لیے ہیں، اللہ کے سوا کوئی معبود نہیں اور اللہ سب سے بڑا ہے",
    english: "Glory be to Allah, and all praises be to Allah, and there is no god but Allah, and Allah is the Greatest.",
    transliteration: "Subhanallah wal hamdulillah wa la ilaha illallah wallahu akbar",
    reference: "Sahih Muslim 597",
    order: 1
  },
  {
    title: "Takbir for Ruku",
    category: "salah",
    arabic: "اللَّهُ أَكْبَرُ",
    urdu: "اللہ سب سے بڑا ہے",
    english: "Allah is the Greatest.",
    transliteration: "Allahu Akbar",
    reference: "Essential in Salah",
    order: 2
  },

  // TRAVEL
  {
    title: "Travel Dua",
    category: "travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    urdu: "پاک ہے وہ ذات جس نے ہمارے لیے یہ (سواری) مسخر کر دی اور ہم خود اس کے قابو میں نہیں تھے اور ہم اپنے رب کی طرف لوٹنے والے ہیں",
    english: "Glory be to Him who has subjected this to us, and we were not able to do it. And indeed, to our Lord we will return.",
    transliteration: "Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
    reference: "Surah Az-Zukhruf (43:13-14)",
    order: 1
  },
  {
    title: "Travel Protection",
    category: "travel",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى",
    urdu: "اے اللہ! ہم تجھ سے اس سفر میں نیکی اور تقویٰ اور ایسے عمل کا سوال کرتے ہیں جس سے تو راضی ہو",
    english: "O Allah, we ask You in this journey of ours for goodness and piety, and for works that are pleasing to You.",
    transliteration: "Allahumma inna nas'aluka fi safarina hadhal birra wal taqwa wa minal 'amali ma tarda",
    reference: "Sunan at-Tirmidhi 3444",
    order: 2
  },

  // PROTECTION
  {
    title: "Protection from Evil",
    category: "protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    urdu: "میں اللہ کی مکمل باتوں کی پناہ چاہتا ہوں اس چیز کی برائی سے جسے اس نے پیدا کیا",
    english: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    transliteration: "A'udhu bikalimatillahi at-tammati min sharri ma khalaq",
    reference: "Sahih Muslim 2708",
    order: 1
  },
  {
    title: "Protection from Shaytan",
    category: "protection",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    urdu: "میں اللہ کی پناہ چاہتا ہوں شیطان مردود سے",
    english: "I seek refuge in Allah from the accursed Satan.",
    transliteration: "A'udhu billahi minash shaytanir rajeem",
    reference: "Surah An-Nahl (16:98)",
    order: 2
  },

  // FORGIVENESS
  {
    title: "Seeking Forgiveness",
    category: "forgiveness",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
    urdu: "اے میرے رب! مجھے بخش دے اور مجھے توبہ قبول فرما بیشک تو توبہ قبول کرنے والا اور رحم کرنے والا ہے",
    english: "My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of Repentance, the Merciful.",
    transliteration: "Rabbi ighfir li wa tub 'alayya innaka antat tawwabu rahim",
    reference: "Surah Al-Mu'minun (23:118)",
    order: 1
  },
  {
    title: "Istighfar",
    category: "forgiveness",
    arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    urdu: "میں اس اللہ سے معافی مانگتا ہوں جس کے سوا کوئی معبود نہیں، وہ زندہ اور قیوم ہے اور میں اس کی طرف رجوع کرتا ہوں",
    english: "I seek forgiveness from Allah, there is no god but Him, the Ever Living, the Sustainer, and I repent to Him.",
    transliteration: "Astaghfirullaha alladhi la ilaha illa huwa al-hayyul qayyum wa atubu ilayhi",
    reference: "Sunan at-Tirmidhi",
    order: 2
  },

  // FOOD & DRINK
  {
    title: "Before Eating",
    category: "food",
    arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
    urdu: "اللہ کے نام سے اور اللہ کی برکت سے",
    english: "In the name of Allah and with the blessings of Allah.",
    transliteration: "Bismillahi wa 'ala barakatillah",
    reference: "Sunan Abu Dawood 3767",
    order: 1
  },
  {
    title: "After Eating",
    category: "food",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    urdu: "تمام تعریفیں اللہ کے لیے ہیں جس نے مجھے یہ کھانا کھلایا اور اسے میرے لیے رزق بنایا میرے اپنے زور اور طاقت سے نہیں",
    english: "All praise is due to Allah who fed me this and provided it for me without any might or power from myself.",
    transliteration: "Alhamdu lillahi alladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    reference: "Sunan Abu Dawood 4023",
    order: 2
  },

  // HOME
  {
    title: "Entering Home",
    category: "home",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    urdu: "اے اللہ! میں تجھ سے داخلے کی بھلائی اور باہر نکلنے کی بھلائی مانگتا ہوں، ہم اللہ کے نام سے داخل ہوئے اور ہم اللہ کے نام سے باہر نکلتے ہیں اور ہم نے اپنے رب اللہ پر بھروسہ کیا",
    english: "O Allah, I ask You for the blessing of entering and exiting. In the name of Allah we enter and in the name of Allah we exit, and upon Allah our Lord we rely.",
    transliteration: "Allahumma inni as'aluka khayral mawliji wa khayral makhraji bismillahi walajna wa bismillahi kharajna wa 'ala Allahi rabbina tawakkalna",
    reference: "Sunan Abu Dawood 5095",
    order: 1
  },

  // SOCIAL
  {
    title: "Meeting Muslims",
    category: "social",
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
    urdu: "سلام ہو تم پر اور اللہ کی رحمت اور اس کی برکتیں",
    english: "Peace be upon you and the mercy of Allah and His blessings.",
    transliteration: "Assalamu alaikum wa rahmatullahi wa barakatuhu",
    reference: "Essential greeting",
    order: 1
  },

  // DIFFICULTIES
  {
    title: "Relief from Distress",
    category: "difficulties",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    urdu: "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بیشک میں ظالموں میں سے تھا",
    english: "There is no god but You, glory be to You. Indeed, I have been among the wrongdoers.",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz zalimin",
    reference: "Surah Al-Anbiya (21:87)",
    order: 1
  },

  // QUR'ANIC DUAS
  {
    title: "Hasbiyallah",
    category: "quranic",
    arabic: "حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ",
    urdu: "اللہ مجھے کافی ہے اور وہ بہترین کارساز ہے",
    english: "Allah is sufficient for me, and He is the best Disposer of affairs.",
    transliteration: "Hasbiyallah wa ni'mal wakeel",
    reference: "Surah Al-Imran (3:173)",
    order: 1
  },
  {
    title: "La Hawla wa La Quwwata",
    category: "quranic",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    urdu: "کوئی زور اور طاقت نہیں مگر اللہ کے زور اور طاقت سے",
    english: "There is no power and no strength except with Allah.",
    transliteration: "La hawla wa la quwwata illa billah",
    reference: "Surah Al-Kahf (18:39)",
    order: 2
  },

  // SUNNAH DUAS
  {
    title: "Dua for Parents",
    category: "sunnah",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    urdu: "اے میرے رب! ان دونوں پر رحم فرما جیسے انہوں نے مجھے بچپن میں پرورش دی",
    english: "My Lord, have mercy upon them as they brought me up when I was small.",
    transliteration: "Rabbi irhamhuma kama rabbayani sagheera",
    reference: "Surah Al-Isra (17:24)",
    order: 1
  },

  // NAMES OF ALLAH
  {
    title: "Allah - The Most Merciful",
    category: "names",
    arabic: "الرَّحْمَنُ الرَّحِيمُ",
    urdu: "بہت مہربان، رحم کرنے والا",
    english: "The Most Gracious, The Most Merciful",
    transliteration: "Ar-Rahman Ar-Raheem",
    reference: "Surah Al-Fatihah (1:3)",
    order: 1
  },

  // ISTIGHFAR
  {
    title: "Comprehensive Istighfar",
    category: "istighfar",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    urdu: "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں، اور میں تیری پکے عہد پر ہوں جتنا میں کر سکتا ہوں، میں تیری پناہ چاہتا ہوں اپنے کیے کی برائی سے، میں تیرے شکر ادا کرتا ہوں اپنی نعمتوں پر اور اپنے گناہوں کا اعتراف کرتا ہوں، تو مجھے بخش دے کیونکہ تیرے سوا کوئی گناہ نہیں بخشتا",
    english: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I am upon Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for indeed none forgives sins except You.",
    transliteration: "Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastata'tu a'udhu bika min sharri ma sana'tu abu'u laka bini'matika 'alayya wa abu'u bidhanbi faghfir li fa innahu la yaghfirudh dhanuba illa anta",
    reference: "Sahih al-Bukhari 6306",
    order: 1
  },

  // WUDU
  {
    title: "After Wudu",
    category: "wudu",
    arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    urdu: "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں اور میں گواہی دیتا ہوں کہ محمد اس کا بندہ اور رسول ہے",
    english: "I bear witness that there is no god but Allah alone, He has no partner, and I bear witness that Muhammad is His servant and His Messenger.",
    transliteration: "Ashhadu an la ilaha illallah wahdahu la sharika lahu wa ashhadu anna Muhammadan 'abduhu wa rasuluhu",
    reference: "Sahih Muslim 234",
    order: 1
  },

  // CLOTHES
  {
    title: "Wearing New Clothes",
    category: "clothes",
    arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
    urdu: "اے اللہ! تیری ہی تعریف ہے تو نے مجھے یہ کپڑا پہنایا، میں تجھ سے اس کی بھلائی اور اس چیز کی بھلائی کا سوال کرتا ہوں جس کے لیے یہ بنایا گیا اور میں تیری پناہ چاہتا ہوں اس کی برائی اور اس چیز کی برائی سے جس کے لیے یہ بنایا گیا",
    english: "O Allah, praise be to You, You have clothed me. I ask You for its goodness and the goodness of what it was made for, and I seek refuge in You from its evil and the evil of what it was made for.",
    transliteration: "Allahumma laka alhamdu anta kasawtanihi as'aluka min khayrihi wa khayri ma suni'a lahu wa a'udhu bika min sharrihi wa sharri ma suni'a lahu",
    reference: "Sunan Abu Dawood 4020",
    order: 1
  },

  // MONEY & SHOPPING
  {
    title: "When Spending Money",
    category: "money",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
    urdu: "اے اللہ! میں تجھ سے نافع علم اور پاک رزق اور قبول شدہ عمل کا سوال کرتا ہوں",
    english: "O Allah, I ask You for beneficial knowledge, pure provision, and accepted deeds.",
    transliteration: "Allahumma inni as'aluka 'ilman nafian wa rizqan tayyiban wa 'amalan mutaqabbalan",
    reference: "Sunan Ibn Majah",
    order: 1
  },

  // MARRIAGE
  {
    title: "Marriage Dua",
    category: "marriage",
    arabic: "رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ",
    urdu: "اے میرے رب! مجھے اپنے پاس سے پاک اولاد عطا فرما، بیشک تو دعا سننے والا ہے",
    english: "My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication.",
    transliteration: "Rabbi hab li min ladunka dhurriyyatan tayyibatan innaka sami'ud du'a",
    reference: "Surah Al-Imran (3:38)",
    order: 1
  },

  // NATURE
  {
    title: "When Seeing Rain",
    category: "nature",
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    urdu: "اے اللہ! نافع بارش برسا",
    english: "O Allah, send down beneficial rain.",
    transliteration: "Allahumma sayyiban nafian",
    reference: "Sahih al-Bukhari",
    order: 1
  },

  // IMAN PROTECTION
  {
    title: "Protection of Iman",
    category: "iman",
    arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    urdu: "اے دلوں کو پلٹنے والے! میرے دل کو اپنے دین پر ثابت رکھ",
    english: "O Turner of hearts, make my heart firm upon Your religion.",
    transliteration: "Ya muqallibal qulubi thabbit qalbi 'ala deenik",
    reference: "Sunan at-Tirmidhi",
    order: 1
  }
]

async function main() {
  console.log('🌱 Starting comprehensive dua seeding...')

  try {
    // Check if any duas already exist
    const existingCount = await prisma.dua.count()
    console.log(`📊 Found ${existingCount} existing duas in database`)

    if (existingCount > 0) {
      console.log('⏭️  Database already has duas. Skipping seeding to preserve existing data.')
      console.log('✅ Seeding process completed successfully!')
      return
    }

    // Insert comprehensive duas
    console.log('📖 Inserting comprehensive duas...')
    let createdCount = 0

    for (const dua of comprehensiveDuas) {
      await prisma.dua.create({
        data: {
          title: dua.title,
          category: dua.category,
          arabic: dua.arabic,
          urdu: dua.urdu,
          english: dua.english,
          transliteration: dua.transliteration,
          reference: dua.reference,
          order: dua.order,
          isActive: true
        }
      })
      console.log(`✅ Created dua: "${dua.title}"`)
      createdCount++
    }

    const totalCount = await prisma.dua.count()
    console.log('\n🎉 Seeding completed!')
    console.log(`📊 Created: ${createdCount} duas`)
    console.log(`📈 Total duas in database: ${totalCount}`)
    console.log('✅ Seeding process completed successfully!')

    // Show category breakdown
    const categoryStats = await prisma.dua.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    console.log('\n📊 Category breakdown:')
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat._count.category} duas`)
    })

  } catch (error) {
    console.error('❌ Error seeding duas:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
