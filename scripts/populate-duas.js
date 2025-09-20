const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const duasData = [
  // Eating/Drinking (Category: eating)
  {
    title: "Before eating",
    category: "eating",
    arabic: "بِسْمِ اللَّهِ",
    urdu: "اللہ کے نام سے (کھانا شروع کرتے وقت)",
    english: "In the name of Allah.",
    reference: "Sahih al-Bukhari",
    order: 1
  },
  {
    title: "If you forget to say Bismillah at start of meal",
    category: "eating",
    arabic: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ",
    urdu: "اللہ کے نام سے شروع میں بھی اور آخر میں بھی",
    english: "In the name of Allah, at its beginning and at its end.",
    reference: "Sunan Abi Dawud; Jami` at-Tirmidhi",
    order: 2
  },
  {
    title: "After eating (comprehensive)",
    category: "eating",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    urdu: "سب تعریف اللہ کے لیے ہے جس نے مجھے یہ کھانا کھلایا اور اسے میرے لیے بغیر میری طاقت و قوت کے رزق بنایا",
    english: "All praise is for Allah who fed me this and provided it for me without any might nor power from myself.",
    reference: "Jami` at-Tirmidhi",
    order: 3
  },

  // Sleeping (Category: sleeping)
  {
    title: "Before sleeping",
    category: "sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    urdu: "اے اللہ! تیرے نام کے ساتھ میں مرتا ہوں اور جیتا ہوں",
    english: "In Your name, O Allah, I die and I live.",
    reference: "Sahih al-Bukhari",
    order: 1
  },
  {
    title: "Upon waking up",
    category: "sleeping",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    urdu: "سب تعریف اللہ کے لیے ہے جس نے ہمیں موت کے بعد زندہ کیا اور اسی کی طرف لوٹنا ہے",
    english: "All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.",
    reference: "Sahih al-Bukhari; Sahih Muslim",
    order: 2
  },
  {
    title: "Ayat al-Kursi before sleep / protection",
    category: "sleeping",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ...",
    urdu: "آیت الکرسی (البقرۃ 255)",
    english: "Ayat al-Kursi (Qur'an 2:255).",
    reference: "Sahih al-Bukhari; Qur'an 2:255",
    order: 3
  },

  // Protection (Category: protection)
  {
    title: "Recite Ikhlas, Falaq, Nas (3x) evening/morning & before sleep",
    category: "protection",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ … قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ … قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    urdu: "سورہ اخلاص، فلق، ناس (تین بار) صبح و شام اور سونے سے پہلے",
    english: "Surah Ikhlas, Falaq and Nas (three times) in the morning, evening and before sleep.",
    reference: "Sunan Abi Dawud; Jami` at-Tirmidhi",
    order: 1
  },
  {
    title: "Morning/Evening protection (3x)",
    category: "protection",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    urdu: "اللہ کے نام کے ساتھ جس کے نام کے ساتھ زمین و آسمان کی کوئی چیز نقصان نہیں پہنچا سکتی، اور وہ سنتا جانتا ہے",
    english: "In the name of Allah with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.",
    reference: "Sunan Abi Dawud; Jami` at-Tirmidhi",
    order: 2
  },
  {
    title: "Seek refuge (3x) morning/evening",
    category: "protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    urdu: "میں اللہ کے کامل کلمات کے ذریعے ہر اس چیز کے شر سے پناہ مانگتا/مانگتی ہوں جو اس نے پیدا کی",
    english: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    reference: "Sahih Muslim",
    order: 3
  },
  {
    title: "Asking for well‑being (ʿAfiyah) morning/evening",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    urdu: "اے اللہ! میں دنیا و آخرت میں عافیت مانگتا/مانگتی ہوں",
    english: "O Allah, I ask You for well‑being in this world and the Hereafter.",
    reference: "Sunan Abi Dawud; Musnad Ahmad",
    order: 4
  },

  // Forgiveness (Category: forgiveness)
  {
    title: "Sayyidul Istighfar (Master supplication for forgiveness)",
    category: "forgiveness",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    urdu: "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں... (مکمل دعا)",
    english: "O Allah, You are my Lord; there is no deity but You... (full text).",
    reference: "Sahih al-Bukhari",
    order: 1
  },

  // Distress (Category: distress)
  {
    title: "Distress (Dhu'n‑Nun)",
    category: "distress",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    urdu: "تیرے سوا کوئی معبود نہیں، تُو پاک ہے، بے شک میں ہی ظالموں میں سے تھا",
    english: "There is no deity except You; exalted are You. Indeed, I was of the wrongdoers.",
    reference: "Qur'an 21:87; Musnad Ahmad",
    order: 1
  },
  {
    title: "Relief from worry, debt etc.",
    category: "distress",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
    urdu: "اے اللہ! میں غم و فکر سے، عاجزی و سستی سے، بزدلی و بخل سے، قرض کے غلبہ اور لوگوں کے ظلم سے تیری پناہ چاہتا/چاہتی ہوں",
    english: "O Allah, I seek refuge in You from worry and grief, incapacity and laziness, cowardice and miserliness, the burden of debt and being overpowered by men.",
    reference: "Sahih al-Bukhari",
    order: 2
  },

  // Sufficiency (Category: sufficiency)
  {
    title: "Hasbunallahu (sufficiency)",
    category: "sufficiency",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    urdu: "ہمارے لیے اللہ کافی ہے اور وہ بہترین کارساز ہے",
    english: "Allah is sufficient for us and He is the best Disposer of affairs.",
    reference: "Qur'an 3:173",
    order: 1
  },

  // Bathroom (Category: bathroom)
  {
    title: "Entering the bathroom",
    category: "bathroom",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    urdu: "اے اللہ! میں ناپاک جنوں اور جنّنیوں کے شر سے تیری پناہ چاہتا/چاہتی ہوں",
    english: "O Allah, I seek refuge with You from male and female devils.",
    reference: "Sahih al-Bukhari; Sahih Muslim",
    order: 1
  },
  {
    title: "Leaving the bathroom",
    category: "bathroom",
    arabic: "غُفْرَانَكَ",
    urdu: "میں تیری مغفرت چاہتا/چاہتی ہوں",
    english: "I seek Your forgiveness.",
    reference: "Sunan Abi Dawud; Jami` at-Tirmidhi",
    order: 2
  },

  // Wudu (Category: wudu)
  {
    title: "After Wudu",
    category: "wudu",
    arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    urdu: "میں گواہی دیتا/دیتی ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں، اور میں گواہی دیتا/دیتی ہوں کہ محمد ﷺ اس کے بندے اور رسول ہیں۔ اے اللہ! مجھے توبہ کرنے والوں اور پاک رہنے والوں میں شامل فرما",
    english: "I bear witness that there is no deity but Allah alone without partner, and I bear witness that Muhammad is His servant and messenger. O Allah, make me among those who constantly repent and those who purify themselves.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Masjid (Category: masjid)
  {
    title: "Entering the masjid",
    category: "masjid",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    urdu: "اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے",
    english: "O Allah, open for me the doors of Your mercy.",
    reference: "Sahih Muslim",
    order: 1
  },
  {
    title: "Leaving the masjid",
    category: "masjid",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    urdu: "اے اللہ! میں تجھ سے اپنے فضل (رحمت/عطا) کا سوال کرتا/کرتی ہوں",
    english: "O Allah, I ask You from Your bounty.",
    reference: "Sahih Muslim",
    order: 2
  },

  // Adhan (Category: adhan)
  {
    title: "After the Adhan",
    category: "adhan",
    arabic: "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
    urdu: "اے اللہ! اس پکارِ کامل اور قائم نماز کے رب! محمد ﷺ کو وسیلہ اور فضیلت عطا فرما اور انہیں وعدہ کیا ہوا مقامِ محمود پر فائز فرما",
    english: "O Allah, Lord of this perfect call and established prayer, grant Muhammad the right of intercession and favor, and raise him to the praised station You have promised.",
    reference: "Sahih al-Bukhari",
    order: 1
  },

  // Travel (Category: travel)
  {
    title: "Travel (safar)",
    category: "travel",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هٰذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هٰذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ",
    urdu: "اے اللہ! ہم اپنے اس سفر میں تقویٰ اور نیکی مانگتے ہیں اور ایسے عمل جو تجھے پسند ہوں... اے اللہ! تو سفر میں ساتھی اور گھر والوں میں نگہبان ہے",
    english: "O Allah, we ask You for piety and righteousness in this journey and deeds that please You... O Allah, You are the Companion on the journey and the Guardian of the family.",
    reference: "Sahih Muslim",
    order: 1
  },
  {
    title: "Mounting/Vehicle",
    category: "travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ",
    urdu: "پاک ہے وہ (اللہ) جس نے ہمارے لیے اس (سواری) کو مسخر کیا اور ہم اسے قابو میں لانے والے نہ تھے، اور بے شک ہم اپنے رب کی طرف لوٹنے والے ہیں",
    english: "Glory be to Him who subjected this to us, and we could not have done it by ourselves; and surely to our Lord we will return.",
    reference: "Qur'an 43:13-14; Sunan Abi Dawud",
    order: 2
  },

  // Guidance (Category: guidance)
  {
    title: "Istikhara (seeking guidance)",
    category: "guidance",
    arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ ...",
    urdu: "اے اللہ! میں تیرے علم کے ساتھ خیر طلب کرتا/کرتی ہوں، اور تیری قدرت سے طاقت مانگتا/مانگتی ہوں...",
    english: "O Allah, I seek Your counsel by Your knowledge and I seek ability by Your power, and I ask You from Your immense bounty...",
    reference: "Sahih al-Bukhari",
    order: 1
  },

  // Healing (Category: healing)
  {
    title: "For healing the sick",
    category: "healing",
    arabic: "أَذْهِبِ الْبَأْسَ رَبَّ النَّاسِ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
    urdu: "اے لوگوں کے رب! تکلیف دور فرما، تو ہی شافی ہے، تیری شفا کے سوا کوئی شفا نہیں، ایسی شفا دے جو بیماری نہ چھوڑے",
    english: "Remove the harm, Lord of mankind; heal, for You are the Healer. There is no healing but Your healing, a cure that leaves no disease.",
    reference: "Sahih al-Bukhari; Sahih Muslim",
    order: 1
  },
  {
    title: "Ruqyah (general)",
    category: "healing",
    arabic: "بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنٍ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ",
    urdu: "اللہ کے نام سے میں تم پر جھاڑ پھونک کرتا ہوں، ہر چیز کے شر سے جو تمہیں تکلیف دے... اللہ تمہیں شفا دے، اللہ کے نام سے میں تم پر دم کرتا ہوں",
    english: "In the name of Allah, I perform ruqyah for you, from everything that harms you, from the evil of every soul or envious eye. May Allah heal you. In the name of Allah, I perform ruqyah for you.",
    reference: "Sahih Muslim",
    order: 2
  },
  {
    title: "Pain in body (place hand)",
    category: "healing",
    arabic: "بِسْمِ اللَّهِ (ثلاثًا) أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (سبعًا)",
    urdu: "اللہ کے نام سے (تین بار)؛ میں اللہ کی عزت و قدرت کی پناہ لیتا/لیتی ہوں اس چیز کے شر سے جسے میں پاتا اور ڈرتا ہوں (سات بار)",
    english: "In the name of Allah (three times). I seek refuge in the might and power of Allah from the evil of what I find and what I fear (seven times).",
    reference: "Sahih Muslim",
    order: 3
  },

  // Children (Category: children)
  {
    title: "Protection for children",
    category: "children",
    arabic: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    urdu: "میں تم دونوں کو اللہ کے کامل کلمات کے ذریعے ہر شیطان اور زہریلی جانور اور ہر نقصان پہنچانے والی نظر سے پناہ دیتا/دیتی ہوں",
    english: "I seek refuge for you both in the perfect words of Allah from every devil and poisonous creature and from every harmful, envious eye.",
    reference: "Sahih al-Bukhari",
    order: 1
  },

  // Anger (Category: anger)
  {
    title: "When angry",
    category: "anger",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    urdu: "میں مردود شیطان سے اللہ کی پناہ مانگتا/مانگتی ہوں",
    english: "I seek refuge with Allah from the accursed devil.",
    reference: "Sahih al-Bukhari",
    order: 1
  },

  // Weather (Category: weather)
  {
    title: "Rain after it falls",
    category: "weather",
    arabic: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
    urdu: "ہم پر اللہ کے فضل اور اس کی رحمت سے بارش ہوئی",
    english: "We have been given rain by the grace and mercy of Allah.",
    reference: "Sahih al-Bukhari",
    order: 1
  },
  {
    title: "Wind",
    category: "weather",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا فِيهَا، وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا فِيهَا، وَشَرِّ مَا أُرْسِلَتْ بِهِ",
    urdu: "اے اللہ! میں اس ہوا کی بھلائی اور جو اس میں ہے اور جس کے ساتھ بھیجی گئی ہے اس کی بھلائی مانگتا/مانگتی ہوں، اور اس کی برائی اور جو اس میں ہے اور جس کے ساتھ بھیجی گئی ہے اس کی برائی سے تیری پناہ چاہتا/چاہتی ہوں",
    english: "O Allah, I ask You for the good of this wind, the good within it and the good it was sent with; and I seek refuge in You from its evil, the evil within it and the evil it was sent with.",
    reference: "Sahih Muslim",
    order: 2
  },

  // Afflicted (Category: afflicted)
  {
    title: "Seeing someone afflicted",
    category: "afflicted",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ وَفَضَّلَنِي عَلَىٰ كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا",
    urdu: "سب تعریف اللہ کے لیے ہے جس نے مجھے اس سے عافیت دی جس میں تجھے مبتلا کیا اور مجھے اپنی مخلوق میں سے بہت سوں پر فضیلت دی",
    english: "All praise is for Allah who spared me from what He tested you with and favored me greatly over many of His creation.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Clothes (Category: clothes)
  {
    title: "New clothes",
    category: "clothes",
    arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
    urdu: "اے اللہ! سب تعریف تیرے لیے ہے، تو نے مجھے یہ لباس پہنایا، میں اس کی بھلائی اور جس مقصد کے لیے بنایا گیا اس کی بھلائی مانگتا/مانگتی ہوں، اور اس کی برائی اور جس مقصد کے لیے بنایا گیا اس کی برائی سے تیری پناہ چاہتا/چاہتی ہوں",
    english: "O Allah, all praise is Yours; You have clothed me with this. I ask You for its good and the good of what it was made for, and I seek refuge in You from its evil and the evil of what it was made for.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Mirror (Category: mirror)
  {
    title: "Looking in the mirror",
    category: "mirror",
    arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
    urdu: "اے اللہ! جیسے تو نے میری صورت اچھی بنائی ہے ویسے ہی میرا اخلاق بھی اچھا کر دے",
    english: "O Allah, just as You have made my form good, make my character good.",
    reference: "Musnad Ahmad",
    order: 1
  },

  // Sneezing (Category: sneezing)
  {
    title: "Sneezing (sneezer)",
    category: "sneezing",
    arabic: "الْحَمْدُ لِلَّهِ",
    urdu: "سب تعریف اللہ کے لیے ہے",
    english: "All praise is for Allah.",
    reference: "Sahih al-Bukhari",
    order: 1
  },
  {
    title: "Sneezing (response)",
    category: "sneezing",
    arabic: "يَرْحَمُكَ اللَّهُ",
    urdu: "اللہ تم پر رحم کرے",
    english: "May Allah have mercy on you.",
    reference: "Sahih al-Bukhari",
    order: 2
  },
  {
    title: "Sneezing (reply to response)",
    category: "sneezing",
    arabic: "يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
    urdu: "اللہ تمہیں ہدایت دے اور تمہاری حالت درست کرے",
    english: "May Allah guide you and set your affairs right.",
    reference: "Sahih al-Bukhari",
    order: 3
  },

  // Fasting (Category: fasting)
  {
    title: "Breaking fast (Iftar)",
    category: "fasting",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    urdu: "پیاس بجھ گئی، رگیں تر ہو گئیں اور ان شاء اللہ اجر ثابت ہو گیا",
    english: "The thirst has gone, the veins are moistened and the reward is assured, if Allah wills.",
    reference: "Sunan Abi Dawud; Hasan",
    order: 1
  },

  // Prayer (Category: prayer)
  {
    title: "Qunut (Witr)",
    category: "prayer",
    arabic: "اللَّهُمَّ اهْدِنَا فِيمَنْ هَدَيْتَ، وَعَافِنَا فِيمَنْ عَافَيْتَ، وَتَوَلَّنَا فِيمَنْ تَوَلَّيْتَ ...",
    urdu: "اے اللہ! ہمیں ان لوگوں میں ہدایت دے جنہیں تو نے ہدایت دی...",
    english: "O Allah, guide us among those You have guided...",
    reference: "Sunan Abi Dawud; Jami` at-Tirmidhi",
    order: 1
  },
  {
    title: "Between two prostrations",
    category: "prayer",
    arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
    urdu: "اے میرے رب! مجھے بخش دے، اے میرے رب! مجھے بخش دے",
    english: "My Lord, forgive me; My Lord, forgive me.",
    reference: "Sunan Abi Dawud; Jami` at-Tirmidhi",
    order: 2
  },
  {
    title: "After rising from Rukuʿ",
    category: "prayer",
    arabic: "رَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ",
    urdu: "اے ہمارے رب! اور تیرے ہی لیے تعریف ہے، بہت زیادہ پاکیزہ اور بابرکت حمد",
    english: "Our Lord, and to You is all praise—abundant, pure and blessed.",
    reference: "Sahih al-Bukhari",
    order: 3
  },
  {
    title: "In Rukuʿ",
    category: "prayer",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    urdu: "پاک ہے میرا رب عظمت والا",
    english: "Glory be to my Lord, the Magnificent.",
    reference: "Sunan Abi Dawud",
    order: 4
  },
  {
    title: "In Sujud",
    category: "prayer",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    urdu: "پاک ہے میرا رب سب سے بلند",
    english: "Glory be to my Lord, the Most High.",
    reference: "Sunan Abi Dawud",
    order: 5
  },
  {
    title: "After Tashahhud before Salam",
    category: "prayer",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    urdu: "اے اللہ! میں جہنم کے عذاب، قبر کے عذاب، زندگی اور موت کے فتنوں اور مسیح دجال کے فتنے کے شر سے تیری پناہ مانگتا/مانگتی ہوں",
    english: "O Allah, I seek refuge in You from the punishment of Hell, the punishment of the grave, the trials of life and death, and from the evil of the trial of the False Messiah.",
    reference: "Sahih Muslim",
    order: 6
  },
  {
    title: "Salat upon the Prophet ﷺ (Ibrahimiyya)",
    category: "prayer",
    arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ ...",
    urdu: "اے اللہ! محمد ﷺ اور آل محمد پر رحمت نازل فرما جیسے تو نے ابراہیم پر رحمت نازل فرمائی...",
    english: "O Allah, send Your blessings upon Muhammad and the family of Muhammad as You sent blessings upon Ibrahim...",
    reference: "Sahih al-Bukhari; Sahih Muslim",
    order: 7
  },

  // Laylat al-Qadr (Category: laylat)
  {
    title: "Laylat al‑Qadr",
    category: "laylat",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    urdu: "اے اللہ! بے شک تُو معاف کرنے والا، کریم ہے، معافی کو پسند کرتا ہے، لہٰذا مجھے معاف فرما",
    english: "O Allah, You are Pardoning, Generous; You love to pardon, so pardon me.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Funeral (Category: funeral)
  {
    title: "Funeral/Cemetery greeting",
    category: "funeral",
    arabic: "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ",
    urdu: "سلام ہو تم پر اے اس دیار کے رہنے والو، مؤمنو اور مسلمانو! اور ہم بھی ان شاء اللہ تم سے ملنے والے ہیں۔ ہم اللہ سے ہمارے اور تمہارے لیے عافیت کا سوال کرتے ہیں",
    english: "Peace be upon you, O inhabitants of the dwellings, believers and Muslims. Indeed, we will, if Allah wills, be joining you. We ask Allah for well‑being for us and for you.",
    reference: "Sahih Muslim",
    order: 1
  },

  // Favor (Category: favor)
  {
    title: "For someone who does you a favor",
    category: "favor",
    arabic: "جَزَاكَ اللَّهُ خَيْرًا",
    urdu: "اللہ آپ کو اچھا بدلہ دے",
    english: "May Allah reward you with goodness.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Home (Category: home)
  {
    title: "Entering home",
    category: "home",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    urdu: "اللہ کے نام سے ہم داخل ہوئے، اللہ کے نام سے ہم نکلتے ہیں، اور ہم نے اپنے رب پر توکل کیا",
    english: "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.",
    reference: "Sunan Abi Dawud",
    order: 1
  },

  // Beginning (Category: beginning)
  {
    title: "Beginning something important",
    category: "beginning",
    arabic: "بِسْمِ اللَّهِ",
    urdu: "اللہ کے نام سے (ہر نیک کام کے آغاز پر)",
    english: "In the name of Allah (at the start of any good deed).",
    reference: "General Sunnah",
    order: 1
  },

  // Anger/Temptation (Category: temptation)
  {
    title: "Entering state of anger/temptation (brief)",
    category: "temptation",
    arabic: "لا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    urdu: "اللہ کے سوا کوئی طاقت اور قوت نہیں",
    english: "There is no power and no might except with Allah.",
    reference: "Sahih al-Bukhari; Sahih Muslim",
    order: 1
  },

  // Guidance (Category: steadfastness)
  {
    title: "For guidance/steadfastness",
    category: "steadfastness",
    arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ",
    urdu: "اے دلوں کو پھیرنے والے! میرے دل کو اپنے دین پر ثابت قدم رکھ",
    english: "O Turner of hearts, keep my heart firm upon Your religion.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Debt (Category: debt)
  {
    title: "For debt sufficiency",
    category: "debt",
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    urdu: "اے اللہ! مجھے اپنے حلال سے حرام سے بے نیاز کر دے اور اپنے فضل سے میرے سوا سب سے بے نیاز کر دے",
    english: "O Allah, suffice me with what You have made lawful against what You have made unlawful, and make me independent by Your bounty from all besides You.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Grief (Category: grief)
  {
    title: "Heavy grief & sorrow (long dua)",
    category: "grief",
    arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ ...",
    urdu: "اے اللہ! میں تیرا بندہ، تیرے بندے کا بیٹا، تیری بندی کا بیٹا ہوں... میرا پیشانی کا بال تیرے ہاتھ میں ہے...",
    english: "O Allah, I am Your servant, son of Your male servant and Your female servant... my forelock is in Your hand...",
    reference: "Musnad Ahmad; authenticated",
    order: 1
  },

  // Moon (Category: moon)
  {
    title: "New moon (Hilal)",
    category: "moon",
    arabic: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالإِيمَانِ، وَالسَّلَامَةِ وَالإِسْلاَمِ، وَرِضْوَانٍ مِنَ الرَّحْمَٰنِ",
    urdu: "اے اللہ! اسے ہمارے لیے امن و ایمان، سلامتی و اسلام اور رحمان کی رضا کے ساتھ نمودار فرما",
    english: "O Allah, bring it over us with security and faith, safety and Islam, and the pleasure of the Most Merciful.",
    reference: "Jami` at-Tirmidhi",
    order: 1
  },

  // Intimacy (Category: intimacy)
  {
    title: "Before intercourse",
    category: "intimacy",
    arabic: "بِسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا",
    urdu: "اللہ کے نام سے، اے اللہ! ہمیں شیطان سے بچا اور جو ہمیں تو عطا کرے اسے بھی شیطان سے بچا",
    english: "In the name of Allah. O Allah, keep us away from Satan and keep Satan away from what You provide for us.",
    reference: "Sahih al-Bukhari; Sahih Muslim",
    order: 1
  },

  // Marketplace (Category: marketplace)
  {
    title: "Entering the marketplace (often cited)",
    category: "marketplace",
    arabic: "لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    urdu: "اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں...",
    english: "There is no deity but Allah alone with no partner. To Him belongs the dominion and praise. He gives life and causes death; He is living and does not die. In His hand is all good and He is over all things competent.",
    reference: "Reported in collections; scholars differ on grading",
    order: 1
  },

  // Graveyard (Category: graveyard)
  {
    title: "Entering the graveyard (variant)",
    category: "graveyard",
    arabic: "السَّلَامُ عَلَيْكُمْ دَارَ قَوْمٍ مُؤْمِنِينَ ...",
    urdu: "سلام ہو تم پر اے مومنوں کے گھر والو...",
    english: "Peace be upon you, O abode of believing people...",
    reference: "Sahih Muslim",
    order: 1
  }
]

async function populateDuas() {
  console.log('🌙 Starting dua population...')

  try {
    // Check existing duas
    const existingCount = await prisma.dua.count()
    console.log(`📊 Found ${existingCount} existing duas in database`)

    // Get all existing dua titles to avoid duplicates
    const existingDuas = await prisma.dua.findMany({
      select: { title: true }
    })
    const existingTitles = new Set(existingDuas.map(d => d.title))

    // Insert all duas that don't already exist
    console.log('📖 Inserting additional duas...')
    let createdCount = 0
    let skippedCount = 0

    for (const dua of duasData) {
      if (existingTitles.has(dua.title)) {
        console.log(`⏭️  Skipped duplicate dua: "${dua.title}"`)
        skippedCount++
        continue
      }

      await prisma.dua.create({
        data: {
          title: dua.title,
          category: dua.category,
          arabic: dua.arabic,
          urdu: dua.urdu,
          english: dua.english,
          reference: dua.reference,
          order: dua.order,
          isActive: true
        }
      })
      console.log(`✅ Created dua: "${dua.title}" (${dua.category})`)
      createdCount++
    }

    const totalCount = await prisma.dua.count()
    console.log('\n🎉 Population completed!')
    console.log(`📊 Created: ${createdCount} new duas`)
    console.log(`⏭️  Skipped: ${skippedCount} duplicates`)
    console.log(`📈 Total duas in database: ${totalCount}`)
    console.log('✅ Population process completed successfully!')

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
    console.error('❌ Error populating duas:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

populateDuas()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })