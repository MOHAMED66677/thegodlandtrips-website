/* =========================================================
   TRIP ASSISTANT ("Une question ?" button on every page)
   Visitors tap suggested questions and get instant answers.
   No AI, nothing sent anywhere: answers come from the site itself.
   - The FAQ answers come from translations.js (faq.q1 / faq.a1 ...)
   - The "key facts" come from the travel guides (guides.js)
   - The activity lists come from site.js (ACTIVITIES)
   Only the texts below are specific to the assistant.
   build.mjs turns all of it into dist/assistant/<lang>.json
   ========================================================= */
var ASSISTANT_TEXT = {
  fr: {
    launcher: "Une question ?", title: "Conseiller voyage", subtitle: "Réponses immédiates · gratuit",
    greet: "Bonjour ! Je suis l'assistant de Marrakech Odyssey. Choisissez une question, je vous réponds tout de suite.",
    arrive: "Aéroport → médina", visit: "Que visiter ?", planner: "Idées selon vos envies", practical: "Questions pratiques", human: "Parler à un conseiller",
    heritage: "1 jour historique", museums: "Les musées", desert: "Agafay ou Merzouga ?", daytrips: "Excursion d'une journée", night: "Arriver de nuit", wear: "Que porter ?",
    visitQ: "Que voulez-vous découvrir ?", plannerQ: "Qu'est-ce qui vous attire ?", practicalQ: "Quelle est votre question ?",
    catIntro: "Voici nos activités « {cat} », transport depuis votre hôtel inclus :",
    heritageA: "Une journée idéale dans la médina : le matin, le palais de la Bahia, puis les tombeaux saadiens et le palais El Badi, tout proches. L'après-midi, au nord de la médina : la médersa Ben Youssef, la Koubba almoravide et la Maison de la Photographie. Nous vous déposons et venons vous chercher.",
    museumsA: "Marrakech compte de beaux musées, souvent installés dans d'anciens palais :",
    humanA: "Notre équipe vous répond rapidement sur WhatsApp, 7 jours sur 7. Vous pouvez aussi demander un devis gratuit et sans engagement.",
    more: "Autres questions", read: "Lire le guide", quote: "Demander un devis", wa: "Écrire sur WhatsApp", close: "Fermer", restart: "Recommencer",
    waMsg: "Bonjour Marrakech Odyssey ! Je prépare mon séjour à Marrakech.", waTopics: "Sujets qui m'intéressent :", privacy: "Rien n'est envoyé ni enregistré : la conversation reste dans votre navigateur."
  },
  ar: {
    launcher: "عندك سؤال؟", title: "مستشار الرحلات", subtitle: "إجابات فورية · مجانًا",
    greet: "مرحبًا! أنا مساعد Marrakech Odyssey. اختر سؤالًا وسأجيبك فورًا.",
    arrive: "من المطار إلى المدينة", visit: "ماذا أزور؟", planner: "أفكار حسب رغباتك", practical: "أسئلة عملية", human: "تحدث مع مستشار",
    heritage: "يوم تاريخي", museums: "المتاحف", desert: "أكفاي أم مرزوكة؟", daytrips: "رحلة ليوم واحد", night: "الوصول ليلًا", wear: "ماذا أرتدي؟",
    visitQ: "ماذا تريد أن تكتشف؟", plannerQ: "ما الذي يجذبك؟", practicalQ: "ما هو سؤالك؟",
    catIntro: "إليك أنشطة «{cat}»، والنقل من فندقك مشمول:",
    heritageA: "يوم مثالي في المدينة العتيقة: في الصباح قصر الباهية، ثم قبور السعديين وقصر البديع القريبان. وبعد الظهر، شمال المدينة: مدرسة ابن يوسف والقبة المرابطية ودار الفوتوغرافيا. نوصلك ونعيدك.",
    museumsA: "في مراكش متاحف جميلة، كثير منها في قصور قديمة:",
    humanA: "يرد عليك فريقنا بسرعة على واتساب، طوال أيام الأسبوع. ويمكنك أيضًا طلب عرض سعر مجاني ودون أي التزام.",
    more: "أسئلة أخرى", read: "اقرأ الدليل", quote: "اطلب عرض سعر", wa: "اكتب لنا على واتساب", close: "إغلاق", restart: "البداية",
    waMsg: "مرحبًا Marrakech Odyssey! أحضّر لإقامتي في مراكش.", waTopics: "المواضيع التي تهمني:", privacy: "لا يُرسل أي شيء ولا يُحفظ: تبقى المحادثة في متصفحك."
  },
  en: {
    launcher: "Any questions?", title: "Trip advisor", subtitle: "Instant answers · free",
    greet: "Hello! I'm the Marrakech Odyssey assistant. Pick a question and I'll answer right away.",
    arrive: "Airport → medina", visit: "What to visit?", planner: "Ideas for your tastes", practical: "Practical questions", human: "Talk to an advisor",
    heritage: "A day of history", museums: "Museums", desert: "Agafay or Merzouga?", daytrips: "Day trips", night: "Arriving at night", wear: "What to wear?",
    visitQ: "What would you like to discover?", plannerQ: "What do you enjoy?", practicalQ: "What's your question?",
    catIntro: "Here are our \"{cat}\" activities, with transport from your hotel included:",
    heritageA: "An ideal day in the medina: in the morning, the Bahia Palace, then the nearby Saadian Tombs and El Badi Palace. In the afternoon, in the north of the medina: the Ben Youssef Madrasa, the Almoravid Koubba and the Maison de la Photographie. We drop you off and pick you up.",
    museumsA: "Marrakech has fine museums, often set in old palaces:",
    humanA: "Our team replies quickly on WhatsApp, 7 days a week. You can also ask for a free, no-obligation quote.",
    more: "Other questions", read: "Read the guide", quote: "Get a quote", wa: "Message us on WhatsApp", close: "Close", restart: "Start again",
    waMsg: "Hello Marrakech Odyssey! I'm planning my stay in Marrakech.", waTopics: "Topics I'm interested in:", privacy: "Nothing is sent or saved: the conversation stays in your browser."
  },
  es: {
    launcher: "¿Alguna pregunta?", title: "Asesor de viaje", subtitle: "Respuestas al instante · gratis",
    greet: "¡Hola! Soy el asistente de Marrakech Odyssey. Elija una pregunta y le respondo al momento.",
    arrive: "Aeropuerto → medina", visit: "¿Qué visitar?", planner: "Ideas según sus gustos", practical: "Preguntas prácticas", human: "Hablar con un asesor",
    heritage: "Un día de historia", museums: "Los museos", desert: "¿Agafay o Merzouga?", daytrips: "Excursión de un día", night: "Llegar de noche", wear: "¿Qué ropa llevar?",
    visitQ: "¿Qué le gustaría descubrir?", plannerQ: "¿Qué le atrae?", practicalQ: "¿Cuál es su pregunta?",
    catIntro: "Estas son nuestras actividades «{cat}», con transporte desde su hotel incluido:",
    heritageA: "Un día ideal en la medina: por la mañana, el palacio de la Bahía y, muy cerca, las tumbas saadíes y el palacio El Badi. Por la tarde, en el norte de la medina: la madrasa Ben Youssef, la Qubba almorávide y la Maison de la Photographie. Le llevamos y le recogemos.",
    museumsA: "Marrakech tiene bonitos museos, a menudo en antiguos palacios:",
    humanA: "Nuestro equipo le responde rápido por WhatsApp, los 7 días de la semana. También puede pedir un presupuesto gratuito y sin compromiso.",
    more: "Otras preguntas", read: "Leer la guía", quote: "Pedir presupuesto", wa: "Escribir por WhatsApp", close: "Cerrar", restart: "Volver a empezar",
    waMsg: "¡Hola, Marrakech Odyssey! Estoy preparando mi estancia en Marrakech.", waTopics: "Temas que me interesan:", privacy: "No se envía ni se guarda nada: la conversación se queda en su navegador."
  },
  de: {
    launcher: "Fragen?", title: "Reiseberater", subtitle: "Sofort-Antworten · kostenlos",
    greet: "Hallo! Ich bin der Assistent von Marrakech Odyssey. Wählen Sie eine Frage, ich antworte sofort.",
    arrive: "Flughafen → Medina", visit: "Was besichtigen?", planner: "Ideen nach Ihrem Geschmack", practical: "Praktische Fragen", human: "Mit einem Berater sprechen",
    heritage: "Ein Tag Geschichte", museums: "Museen", desert: "Agafay oder Merzouga?", daytrips: "Tagesausflüge", night: "Ankunft bei Nacht", wear: "Was anziehen?",
    visitQ: "Was möchten Sie entdecken?", plannerQ: "Was reizt Sie?", practicalQ: "Was ist Ihre Frage?",
    catIntro: "Unsere Aktivitäten „{cat}“, mit Transfer ab Ihrem Hotel inklusive:",
    heritageA: "Ein idealer Tag in der Medina: morgens der Bahia-Palast, danach die nahen Saadier-Gräber und der El-Badi-Palast. Nachmittags im Norden der Medina: die Medersa Ben Youssef, die Almoravidische Kuppel und die Maison de la Photographie. Wir bringen Sie hin und holen Sie ab.",
    museumsA: "Marrakech hat schöne Museen, oft in alten Palästen:",
    humanA: "Unser Team antwortet schnell auf WhatsApp, 7 Tage die Woche. Sie können auch ein kostenloses, unverbindliches Angebot anfragen.",
    more: "Weitere Fragen", read: "Ratgeber lesen", quote: "Angebot anfragen", wa: "Auf WhatsApp schreiben", close: "Schließen", restart: "Neu beginnen",
    waMsg: "Hallo Marrakech Odyssey! Ich plane meinen Aufenthalt in Marrakech.", waTopics: "Themen, die mich interessieren:", privacy: "Nichts wird gesendet oder gespeichert: Das Gespräch bleibt in Ihrem Browser."
  },
  nl: {
    launcher: "Een vraag?", title: "Reisadviseur", subtitle: "Direct antwoord · gratis",
    greet: "Hallo! Ik ben de assistent van Marrakech Odyssey. Kies een vraag en ik antwoord meteen.",
    arrive: "Luchthaven → medina", visit: "Wat bezoeken?", planner: "Ideeën naar uw smaak", practical: "Praktische vragen", human: "Praat met een adviseur",
    heritage: "Een dag geschiedenis", museums: "Musea", desert: "Agafay of Merzouga?", daytrips: "Dagtochten", night: "'s Nachts aankomen", wear: "Wat aantrekken?",
    visitQ: "Wat wilt u ontdekken?", plannerQ: "Wat spreekt u aan?", practicalQ: "Wat is uw vraag?",
    catIntro: "Dit zijn onze activiteiten '{cat}', met vervoer vanaf uw hotel inbegrepen:",
    heritageA: "Een ideale dag in de medina: 's ochtends het Bahia-paleis, daarna de nabije Saadische graftombes en het El Badi-paleis. 's Middags in het noorden van de medina: de medersa Ben Youssef, de Almoravidische koepel en de Maison de la Photographie. Wij brengen u en halen u op.",
    museumsA: "Marrakech heeft mooie musea, vaak in oude paleizen:",
    humanA: "Ons team antwoordt snel via WhatsApp, 7 dagen per week. U kunt ook een gratis, vrijblijvende offerte vragen.",
    more: "Andere vragen", read: "Lees de gids", quote: "Offerte aanvragen", wa: "Stuur ons een WhatsApp", close: "Sluiten", restart: "Opnieuw beginnen",
    waMsg: "Hallo Marrakech Odyssey! Ik plan mijn verblijf in Marrakech.", waTopics: "Onderwerpen die mij interesseren:", privacy: "Er wordt niets verzonden of opgeslagen: het gesprek blijft in uw browser."
  },
  it: {
    launcher: "Domande?", title: "Consulente di viaggio", subtitle: "Risposte immediate · gratis",
    greet: "Buongiorno! Sono l'assistente di Marrakech Odyssey. Scelga una domanda e Le rispondo subito.",
    arrive: "Aeroporto → medina", visit: "Cosa visitare?", planner: "Idee secondo i Suoi gusti", practical: "Domande pratiche", human: "Parli con un consulente",
    heritage: "Un giorno di storia", museums: "I musei", desert: "Agafay o Merzouga?", daytrips: "Gite di un giorno", night: "Arrivare di notte", wear: "Cosa indossare?",
    visitQ: "Cosa vorrebbe scoprire?", plannerQ: "Cosa La attira?", practicalQ: "Qual è la Sua domanda?",
    catIntro: "Ecco le nostre attività «{cat}», con trasporto dal Suo hotel incluso:",
    heritageA: "Una giornata ideale nella medina: al mattino il palazzo della Bahia, poi le vicine tombe saadiane e il palazzo El Badi. Nel pomeriggio, a nord della medina: la madrasa Ben Youssef, la Cupola almoravide e la Maison de la Photographie. La accompagniamo e veniamo a riprenderLa.",
    museumsA: "Marrakech ha bei musei, spesso in antichi palazzi:",
    humanA: "Il nostro team risponde rapidamente su WhatsApp, 7 giorni su 7. Può anche chiedere un preventivo gratuito e senza impegno.",
    more: "Altre domande", read: "Leggi la guida", quote: "Chiedi un preventivo", wa: "Scrivici su WhatsApp", close: "Chiudi", restart: "Ricomincia",
    waMsg: "Buongiorno Marrakech Odyssey! Sto preparando il mio soggiorno a Marrakech.", waTopics: "Argomenti che mi interessano:", privacy: "Nulla viene inviato o salvato: la conversazione resta nel Suo browser."
  }
};
if (typeof module !== "undefined") module.exports = { ASSISTANT_TEXT: ASSISTANT_TEXT };
