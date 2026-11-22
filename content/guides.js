/* =========================================================
   TRAVEL GUIDES (articles) — one page per guide and language
   /guides/<slug>.html (French) and /<lang>/guides/<slug>.html
   - image:    Unsplash id (same as the activities) or "images/xxx.jpg"
   - related:  ids of activities shown under the article
   - per language:
       t  = title, d = short description (Google, cards)
       facts = key facts shown in a box at the top (short lines)
       s  = sections: [heading, paragraph, paragraph...]
   Keep facts true and timeless: no prices that change often.
   ========================================================= */
var GUIDE_UI = {
  fr: { title: "Guides de voyage", lead: "Nos conseils pratiques pour préparer votre séjour à Marrakech.", home: "Avant de partir", homeLead: "Les réponses aux questions que tout le monde se pose avant d'arriver.", read: "Lire le guide", all: "Tous les guides de voyage", facts: "L'essentiel", related: "Activités liées", minutes: "{n} min de lecture", updated: "Mis à jour", cta: "Un transfert ou une excursion ?", ctaText: "Envoyez-nous vos dates et le nombre de personnes : nous vous répondons rapidement sur WhatsApp." },
  ar: { title: "أدلة السفر", lead: "نصائحنا العملية لتحضير إقامتك في مراكش.", home: "قبل السفر", homeLead: "إجابات عن الأسئلة التي يطرحها الجميع قبل الوصول.", read: "اقرأ الدليل", all: "كل أدلة السفر", facts: "باختصار", related: "أنشطة ذات صلة", minutes: "قراءة {n} دقائق", updated: "آخر تحديث", cta: "تحتاج نقلًا أو رحلة؟", ctaText: "أرسل لنا تواريخك وعدد الأشخاص: نرد عليك بسرعة عبر واتساب." },
  en: { title: "Travel guides", lead: "Practical tips to prepare your stay in Marrakech.", home: "Before you go", homeLead: "Answers to the questions everyone asks before arriving.", read: "Read the guide", all: "All travel guides", facts: "Key facts", related: "Related activities", minutes: "{n} min read", updated: "Updated", cta: "Need a transfer or a trip?", ctaText: "Send us your dates and the number of people: we reply quickly on WhatsApp." },
  es: { title: "Guías de viaje", lead: "Nuestros consejos prácticos para preparar su estancia en Marrakech.", home: "Antes de viajar", homeLead: "Respuestas a las preguntas que todos se hacen antes de llegar.", read: "Leer la guía", all: "Todas las guías de viaje", facts: "Lo esencial", related: "Actividades relacionadas", minutes: "{n} min de lectura", updated: "Actualizado", cta: "¿Necesita un traslado o una excursión?", ctaText: "Envíenos sus fechas y el número de personas: le respondemos rápido por WhatsApp." },
  de: { title: "Reisetipps", lead: "Praktische Tipps für die Vorbereitung Ihres Aufenthalts in Marrakech.", home: "Vor der Reise", homeLead: "Antworten auf die Fragen, die sich alle vor der Ankunft stellen.", read: "Zum Reisetipp", all: "Alle Reisetipps", facts: "Das Wichtigste", related: "Passende Aktivitäten", minutes: "{n} Min. Lesezeit", updated: "Aktualisiert", cta: "Transfer oder Ausflug gewünscht?", ctaText: "Schicken Sie uns Ihre Daten und die Personenzahl: Wir antworten schnell per WhatsApp." },
  nl: { title: "Reisgidsen", lead: "Praktische tips om uw verblijf in Marrakech voor te bereiden.", home: "Voordat u vertrekt", homeLead: "Antwoorden op de vragen die iedereen stelt vóór aankomst.", read: "Lees de gids", all: "Alle reisgidsen", facts: "In het kort", related: "Bijbehorende activiteiten", minutes: "{n} min lezen", updated: "Bijgewerkt", cta: "Een transfer of uitstap nodig?", ctaText: "Stuur ons uw data en het aantal personen: we antwoorden snel via WhatsApp." },
  it: { title: "Guide di viaggio", lead: "I nostri consigli pratici per preparare il Suo soggiorno a Marrakech.", home: "Prima di partire", homeLead: "Le risposte alle domande che tutti si pongono prima di arrivare.", read: "Leggi la guida", all: "Tutte le guide di viaggio", facts: "In breve", related: "Attività correlate", minutes: "{n} min di lettura", updated: "Aggiornato", cta: "Le serve un transfer o un'escursione?", ctaText: "Ci invii le date e il numero di persone: rispondiamo rapidamente su WhatsApp." },
};

var GUIDES = [
  /* ------------------------------------------------------------------ */
  {
    id: "airport", slug: "marrakech-airport-to-medina", image: "photo-1532968899863-5b52ef155913", related: ["medina"], minutes: 4,
    fr: {
      t: "De l'aéroport de Marrakech à la médina : comment s'y rendre",
      d: "Distance, temps de trajet et options pour rejoindre votre riad depuis l'aéroport Marrakech-Menara, de jour comme de nuit.",
      facts: ["L'aéroport Marrakech-Menara (RAK) est à environ 6 km de la place Jemaa el-Fna", "Comptez 15 à 25 minutes en voiture selon la circulation", "Les voitures ne peuvent pas entrer dans les ruelles de la médina : la dernière partie se fait à pied"],
      s: [
        ["Un aéroport tout proche de la ville", "L'aéroport Marrakech-Menara se trouve au sud-ouest de la ville, à quelques kilomètres seulement du centre. C'est une chance : quel que soit votre hôtel ou votre riad, vous y êtes en général en moins d'une demi-heure."],
        ["Les options pour rejoindre votre hébergement", "Vous trouverez des taxis à la sortie de l'aéroport et une ligne de bus relie l'aéroport au centre-ville. Avec un taxi, mettez-vous d'accord sur le prix avant de monter. Le transfert privé réservé à l'avance reste le plus simple : votre chauffeur vous attend dans le hall d'arrivée avec une pancarte à votre nom, suit votre vol en cas de retard, et le prix est connu d'avance."],
        ["Le cas particulier de la médina", "La plupart des riads se trouvent dans des ruelles trop étroites pour les voitures. Le chauffeur vous dépose au point le plus proche (une porte de la médina ou une petite place), où le personnel du riad vient souvent vous chercher. Prévenez votre riad de votre heure d'arrivée et gardez son numéro de téléphone à portée de main."],
        ["Nos conseils", "Envoyez votre numéro de vol au moment de la réservation, ayez un peu de dirhams pour les pourboires, et si vous arrivez tard, préférez un transfert réservé : vous ne chercherez pas votre chemin de nuit dans la médina."]
      ]
    },
    ar: {
      t: "من مطار مراكش إلى المدينة القديمة: كيف تصل",
      d: "المسافة ومدة الطريق والخيارات المتاحة للوصول إلى رياضك من مطار مراكش المنارة، ليلًا أو نهارًا.",
      facts: ["يقع مطار مراكش المنارة (RAK) على بعد حوالي 6 كلم من ساحة جامع الفنا", "تستغرق الرحلة بالسيارة من 15 إلى 25 دقيقة حسب حركة السير", "لا تدخل السيارات أزقة المدينة القديمة: الجزء الأخير يكون مشيًا"],
      s: [
        ["مطار قريب جدًا من المدينة", "يقع مطار مراكش المنارة جنوب غرب المدينة، على بعد بضعة كيلومترات فقط من المركز. وهذا أمر مريح: أيًا كان فندقك أو رياضك، تصل إليه عادة في أقل من نصف ساعة."],
        ["خيارات الوصول إلى مكان إقامتك", "تجد سيارات الأجرة عند مخرج المطار، كما يربط خط حافلات المطار بوسط المدينة. إذا اخترت سيارة أجرة، فاتفق على الثمن قبل الركوب. يبقى النقل الخاص المحجوز مسبقًا الأسهل: ينتظرك السائق في قاعة الوصول بلافتة تحمل اسمك، ويتابع رحلتك في حال التأخير، والثمن معروف مسبقًا."],
        ["حالة المدينة القديمة", "تقع أغلب الرياضات في أزقة ضيقة لا تمر منها السيارات. يوصلك السائق إلى أقرب نقطة (باب من أبواب المدينة أو ساحة صغيرة)، وغالبًا ما يأتي عامل الرياض لاستقبالك. أخبر الرياض بموعد وصولك واحتفظ برقم هاتفه."],
        ["نصائحنا", "أرسل رقم رحلتك عند الحجز، واحمل قليلًا من الدراهم للإكراميات، وإذا كان وصولك متأخرًا ففضّل النقل المحجوز مسبقًا حتى لا تبحث عن طريقك ليلًا في المدينة القديمة."]
      ]
    },
    en: {
      t: "Marrakech airport to the medina: how to get there",
      d: "Distance, travel time and your options to reach your riad from Marrakech-Menara airport, day or night.",
      facts: ["Marrakech-Menara airport (RAK) is about 6 km from Jemaa el-Fna square", "Allow 15 to 25 minutes by car depending on traffic", "Cars can't enter the medina's lanes: the last stretch is on foot"],
      s: [
        ["An airport right next to the city", "Marrakech-Menara airport is south-west of the city, only a few kilometres from the centre. That's good news: wherever your hotel or riad is, you'll usually be there in under half an hour."],
        ["Your options to reach your accommodation", "You'll find taxis outside the terminal, and a bus line links the airport with the city centre. If you take a taxi, agree on the price before you get in. A private transfer booked in advance is the simplest option: your driver waits in the arrivals hall with a sign showing your name, tracks your flight if it's delayed, and the price is fixed beforehand."],
        ["The special case of the medina", "Most riads are in lanes too narrow for cars. Your driver drops you at the nearest point (a medina gate or a small square), where riad staff often come to meet you. Tell your riad your arrival time and keep their phone number handy."],
        ["Our tips", "Send your flight number when you book, carry a few dirhams for tips, and if you land late, choose a booked transfer: you won't have to find your way through the medina at night."]
      ]
    },
    es: {
      t: "Del aeropuerto de Marrakech a la medina: cómo llegar",
      d: "Distancia, tiempo de trayecto y opciones para llegar a su riad desde el aeropuerto Marrakech-Menara, de día o de noche.",
      facts: ["El aeropuerto Marrakech-Menara (RAK) está a unos 6 km de la plaza Jemaa el-Fna", "Cuente de 15 a 25 minutos en coche según el tráfico", "Los coches no pueden entrar en los callejones de la medina: el último tramo se hace a pie"],
      s: [
        ["Un aeropuerto muy cerca de la ciudad", "El aeropuerto Marrakech-Menara está al suroeste de la ciudad, a pocos kilómetros del centro. Una buena noticia: esté donde esté su hotel o riad, normalmente llegará en menos de media hora."],
        ["Opciones para llegar a su alojamiento", "Encontrará taxis a la salida de la terminal y una línea de autobús une el aeropuerto con el centro. Si toma un taxi, acuerde el precio antes de subir. El traslado privado reservado con antelación es lo más sencillo: su conductor le espera en la sala de llegadas con un cartel con su nombre, sigue su vuelo si se retrasa y el precio se conoce de antemano."],
        ["El caso especial de la medina", "La mayoría de los riads están en callejones demasiado estrechos para los coches. El conductor le deja en el punto más cercano (una puerta de la medina o una pequeña plaza), donde a menudo el personal del riad viene a buscarle. Avise a su riad de su hora de llegada y tenga a mano su número de teléfono."],
        ["Nuestros consejos", "Envíe su número de vuelo al reservar, lleve algunos dírhams para propinas y, si llega tarde, elija un traslado reservado: no tendrá que buscar el camino de noche por la medina."]
      ]
    },
    de: {
      t: "Vom Flughafen Marrakech in die Medina: So kommen Sie hin",
      d: "Entfernung, Fahrzeit und Ihre Möglichkeiten, vom Flughafen Marrakech-Menara zu Ihrem Riad zu gelangen, tagsüber oder nachts.",
      facts: ["Der Flughafen Marrakech-Menara (RAK) liegt rund 6 km vom Platz Jemaa el-Fna entfernt", "Rechnen Sie je nach Verkehr mit 15 bis 25 Minuten Fahrt", "Autos können nicht in die Gassen der Medina fahren: das letzte Stück geht man zu Fuß"],
      s: [
        ["Ein Flughafen direkt vor der Stadt", "Der Flughafen Marrakech-Menara liegt südwestlich der Stadt, nur wenige Kilometer vom Zentrum entfernt. Das ist praktisch: Egal wo Ihr Hotel oder Riad liegt, Sie sind meist in weniger als einer halben Stunde dort."],
        ["Ihre Möglichkeiten bis zur Unterkunft", "Vor dem Terminal finden Sie Taxis, und eine Buslinie verbindet den Flughafen mit dem Stadtzentrum. Vereinbaren Sie beim Taxi den Preis vor dem Einsteigen. Am einfachsten ist ein vorab gebuchter Privattransfer: Ihr Fahrer wartet in der Ankunftshalle mit einem Namensschild, verfolgt Ihren Flug bei Verspätung, und der Preis steht vorher fest."],
        ["Der Sonderfall Medina", "Die meisten Riads liegen in Gassen, die für Autos zu eng sind. Der Fahrer setzt Sie am nächstgelegenen Punkt ab (einem Stadttor oder kleinen Platz), wo Sie oft vom Personal des Riads abgeholt werden. Teilen Sie Ihrem Riad die Ankunftszeit mit und halten Sie dessen Telefonnummer bereit."],
        ["Unsere Tipps", "Geben Sie bei der Buchung Ihre Flugnummer an, halten Sie ein paar Dirham für Trinkgeld bereit, und wählen Sie bei später Ankunft einen gebuchten Transfer: So müssen Sie nachts nicht den Weg durch die Medina suchen."]
      ]
    },
    nl: {
      t: "Van de luchthaven van Marrakech naar de medina: zo komt u er",
      d: "Afstand, reistijd en uw mogelijkheden om vanaf luchthaven Marrakech-Menara bij uw riad te komen, overdag of 's nachts.",
      facts: ["Luchthaven Marrakech-Menara (RAK) ligt op ongeveer 6 km van het Jemaa el-Fna-plein", "Reken op 15 tot 25 minuten met de auto, afhankelijk van het verkeer", "Auto's kunnen de steegjes van de medina niet in: het laatste stuk gaat te voet"],
      s: [
        ["Een luchthaven vlak bij de stad", "Luchthaven Marrakech-Menara ligt ten zuidwesten van de stad, maar een paar kilometer van het centrum. Prettig: waar uw hotel of riad ook ligt, u bent er meestal binnen een half uur."],
        ["Uw opties naar uw verblijf", "Buiten de terminal staan taxi's en een buslijn verbindt de luchthaven met het centrum. Spreek bij een taxi de prijs af vóór u instapt. Een vooraf geboekte privétransfer is het eenvoudigst: uw chauffeur wacht in de aankomsthal met een bord met uw naam, volgt uw vlucht bij vertraging en de prijs staat vooraf vast."],
        ["Het bijzondere geval van de medina", "De meeste riads liggen in steegjes die te smal zijn voor auto's. De chauffeur zet u af op het dichtstbijzijnde punt (een stadspoort of een pleintje), waar het personeel van de riad u vaak komt ophalen. Laat uw riad uw aankomsttijd weten en houd hun telefoonnummer bij de hand."],
        ["Onze tips", "Geef uw vluchtnummer door bij de boeking, neem een paar dirham mee voor fooien en kies bij een late aankomst een geboekte transfer: dan hoeft u 's nachts niet zelf de weg door de medina te zoeken."]
      ]
    },
    it: {
      t: "Dall'aeroporto di Marrakech alla medina: come arrivare",
      d: "Distanza, tempi di percorrenza e soluzioni per raggiungere il Suo riad dall'aeroporto Marrakech-Menara, di giorno come di notte.",
      facts: ["L'aeroporto Marrakech-Menara (RAK) dista circa 6 km dalla piazza Jemaa el-Fna", "Calcoli dai 15 ai 25 minuti in auto a seconda del traffico", "Le auto non possono entrare nei vicoli della medina: l'ultimo tratto si fa a piedi"],
      s: [
        ["Un aeroporto vicinissimo alla città", "L'aeroporto Marrakech-Menara si trova a sud-ovest della città, a pochi chilometri dal centro. Un vantaggio: qualunque sia il Suo hotel o riad, di solito ci arriva in meno di mezz'ora."],
        ["Come raggiungere l'alloggio", "Fuori dal terminal trova i taxi, e una linea di autobus collega l'aeroporto al centro. Se prende un taxi, concordi il prezzo prima di salire. Un transfer privato prenotato in anticipo è la soluzione più semplice: l'autista La attende nella sala arrivi con un cartello con il Suo nome, segue il volo in caso di ritardo e il prezzo è fissato prima."],
        ["Il caso particolare della medina", "La maggior parte dei riad si trova in vicoli troppo stretti per le auto. L'autista La lascia nel punto più vicino (una porta della medina o una piazzetta), dove spesso il personale del riad viene ad accoglierLa. Comunichi al riad l'orario di arrivo e tenga a portata di mano il loro numero di telefono."],
        ["I nostri consigli", "Indichi il numero di volo al momento della prenotazione, porti qualche dirham per le mance e, se atterra tardi, scelga un transfer prenotato: non dovrà orientarsi da solo nella medina di notte."]
      ]
    }
  },
  /* ------------------------------------------------------------------ */
  {
    id: "desert", slug: "agafay-or-merzouga-desert", image: "photo-1673283579119-d108cbd0ed7f", related: ["agafay", "quad", "buggy"], minutes: 4,
    fr: {
      t: "Agafay ou Merzouga : quel désert choisir depuis Marrakech ?",
      d: "Désert de pierre à une heure de Marrakech ou grandes dunes du Sahara à une journée de route : les différences pour bien choisir.",
      facts: ["Agafay : désert de pierre à environ 40 km de Marrakech, moins d'une heure de route", "Merzouga : vraies dunes de sable du Sahara, à environ 550 km, soit 9 à 10 heures de route", "Agafay se fait en une demi-journée ; Merzouga demande en général 3 jours"],
      s: [
        ["Agafay, le désert tout proche", "Le désert d'Agafay est un plateau de collines de pierre et de terre ocre, avec les sommets de l'Atlas à l'horizon. Il n'y a pas de grandes dunes, mais les paysages sont superbes, surtout au coucher du soleil. On y fait du quad, du buggy, des balades à dos de dromadaire, et beaucoup de camps proposent le dîner sous les étoiles."],
        ["Merzouga, le Sahara des grandes dunes", "Merzouga, aux portes de l'Erg Chebbi, offre les dunes de sable orange que l'on imagine en pensant au Sahara. Mais il faut traverser l'Atlas et la route est longue : la plupart des voyageurs partent pour trois jours, avec des étapes en chemin."],
        ["Comment choisir", "Si votre séjour dure moins d'une semaine ou si vous voyagez avec de jeunes enfants, Agafay est le meilleur choix : vous profitez du désert sans passer deux jours en voiture. Si vous rêvez de vraies dunes et avez du temps, Merzouga vaut le voyage."],
        ["Notre conseil", "Pour Agafay, partez en fin d'après-midi pour le coucher du soleil, et prenez une veste : les soirées sont fraîches, même en été."]
      ]
    },
    ar: {
      t: "أكفاي أم مرزوكة: أي صحراء تختار انطلاقًا من مراكش؟",
      d: "صحراء حجرية على بعد ساعة من مراكش أو كثبان الصحراء الكبرى على بعد يوم من الطريق: الفروق التي تساعدك على الاختيار.",
      facts: ["أكفاي: صحراء حجرية على بعد حوالي 40 كلم من مراكش، أقل من ساعة بالسيارة", "مرزوكة: كثبان رملية حقيقية في الصحراء الكبرى، على بعد حوالي 550 كلم، أي من 9 إلى 10 ساعات", "تكفي نصف يوم لأكفاي، بينما تتطلب مرزوكة عادة 3 أيام"],
      s: [
        ["أكفاي، الصحراء القريبة", "صحراء أكفاي هضبة من التلال الحجرية والتربة المغرّة، وقمم الأطلس في الأفق. لا توجد بها كثبان كبيرة، لكن مناظرها رائعة، خاصة عند الغروب. يمكنك فيها ركوب الكواد والبوغي والجمال، وتقدم مخيمات كثيرة العشاء تحت النجوم."],
        ["مرزوكة، صحراء الكثبان الكبيرة", "تقدم مرزوكة، عند بوابة عرق الشبي، الكثبان الرملية البرتقالية التي نتخيلها عند ذكر الصحراء الكبرى. لكن يجب عبور الأطلس والطريق طويلة: يسافر أغلب الزوار لثلاثة أيام مع محطات في الطريق."],
        ["كيف تختار", "إذا كانت إقامتك أقل من أسبوع أو كنت مسافرًا مع أطفال صغار، فأكفاي هو الخيار الأفضل: تستمتع بالصحراء دون قضاء يومين في السيارة. وإذا كنت تحلم بكثبان حقيقية ولديك الوقت، فمرزوكة تستحق الرحلة."],
        ["نصيحتنا", "لزيارة أكفاي، انطلق في آخر النهار لمشاهدة الغروب، وخذ معك سترة: الأمسيات باردة حتى في الصيف."]
      ]
    },
    en: {
      t: "Agafay or Merzouga: which desert should you choose from Marrakech?",
      d: "A stone desert an hour from Marrakech, or the Sahara's big dunes a full day's drive away: the differences to help you choose.",
      facts: ["Agafay: stone desert about 40 km from Marrakech, under an hour's drive", "Merzouga: real Sahara sand dunes, about 550 km away, 9 to 10 hours by road", "Agafay takes half a day; Merzouga usually takes 3 days"],
      s: [
        ["Agafay, the desert next door", "The Agafay desert is a plateau of stony hills and ochre earth, with the Atlas peaks on the horizon. There are no big dunes, but the scenery is stunning, especially at sunset. You can ride quads, buggies or camels, and many camps serve dinner under the stars."],
        ["Merzouga, the Sahara of big dunes", "Merzouga, at the edge of Erg Chebbi, has the orange sand dunes people picture when they think of the Sahara. But you have to cross the Atlas and the road is long: most travellers go for three days, with stops along the way."],
        ["How to choose", "If your stay is shorter than a week or you're travelling with young children, Agafay is the better choice: you enjoy the desert without spending two days in a car. If you dream of real dunes and have the time, Merzouga is worth the journey."],
        ["Our tip", "For Agafay, leave in the late afternoon to catch the sunset, and bring a jacket: evenings are cool, even in summer."]
      ]
    },
    es: {
      t: "Agafay o Merzouga: ¿qué desierto elegir desde Marrakech?",
      d: "Un desierto de piedra a una hora de Marrakech o las grandes dunas del Sáhara a un día de carretera: las diferencias para elegir bien.",
      facts: ["Agafay: desierto de piedra a unos 40 km de Marrakech, menos de una hora en coche", "Merzouga: auténticas dunas de arena del Sáhara, a unos 550 km, de 9 a 10 horas de carretera", "Agafay se visita en medio día; Merzouga suele requerir 3 días"],
      s: [
        ["Agafay, el desierto de al lado", "El desierto de Agafay es una meseta de colinas de piedra y tierra ocre, con las cumbres del Atlas en el horizonte. No hay grandes dunas, pero los paisajes son espectaculares, sobre todo al atardecer. Se puede hacer quad, buggy o paseos en dromedario, y muchos campamentos ofrecen cena bajo las estrellas."],
        ["Merzouga, el Sáhara de las grandes dunas", "Merzouga, a las puertas del Erg Chebbi, tiene las dunas de arena naranja que imaginamos al pensar en el Sáhara. Pero hay que cruzar el Atlas y el viaje es largo: la mayoría de los viajeros van tres días, con paradas en el camino."],
        ["Cómo elegir", "Si su estancia dura menos de una semana o viaja con niños pequeños, Agafay es la mejor opción: disfruta del desierto sin pasar dos días en el coche. Si sueña con dunas de verdad y tiene tiempo, Merzouga merece el viaje."],
        ["Nuestro consejo", "Para Agafay, salga a última hora de la tarde para ver la puesta de sol y lleve una chaqueta: las noches son frescas, incluso en verano."]
      ]
    },
    de: {
      t: "Agafay oder Merzouga: Welche Wüste ab Marrakech?",
      d: "Eine Steinwüste eine Stunde von Marrakech oder die großen Sahara-Dünen eine Tagesfahrt entfernt: die Unterschiede für die richtige Wahl.",
      facts: ["Agafay: Steinwüste rund 40 km von Marrakech, weniger als eine Stunde Fahrt", "Merzouga: echte Sanddünen der Sahara, rund 550 km entfernt, 9 bis 10 Stunden Fahrt", "Für Agafay reicht ein halber Tag; für Merzouga braucht man meist 3 Tage"],
      s: [
        ["Agafay, die Wüste vor der Haustür", "Die Agafay-Wüste ist ein Plateau aus steinigen Hügeln und ockerfarbener Erde, mit den Gipfeln des Atlas am Horizont. Große Dünen gibt es nicht, aber die Landschaft ist beeindruckend, besonders bei Sonnenuntergang. Man kann Quad, Buggy oder Kamel fahren, und viele Camps bieten ein Abendessen unter dem Sternenhimmel."],
        ["Merzouga, die Sahara der großen Dünen", "Merzouga am Rand des Erg Chebbi hat die orangefarbenen Sanddünen, die man sich unter der Sahara vorstellt. Dafür muss man den Atlas überqueren und die Strecke ist lang: Die meisten Reisenden sind drei Tage unterwegs, mit Etappen auf dem Weg."],
        ["Wie wählen?", "Wenn Ihr Aufenthalt kürzer als eine Woche ist oder Sie mit kleinen Kindern reisen, ist Agafay die bessere Wahl: Sie erleben die Wüste, ohne zwei Tage im Auto zu sitzen. Wenn Sie von echten Dünen träumen und Zeit haben, lohnt sich Merzouga."],
        ["Unser Tipp", "Fahren Sie nach Agafay am späten Nachmittag zum Sonnenuntergang, und nehmen Sie eine Jacke mit: Die Abende sind kühl, auch im Sommer."]
      ]
    },
    nl: {
      t: "Agafay of Merzouga: welke woestijn kiest u vanuit Marrakech?",
      d: "Een stenen woestijn op een uur van Marrakech of de grote Sahara-duinen op een dag rijden: de verschillen om goed te kiezen.",
      facts: ["Agafay: stenen woestijn op ongeveer 40 km van Marrakech, minder dan een uur rijden", "Merzouga: echte zandduinen van de Sahara, op ongeveer 550 km, 9 tot 10 uur rijden", "Agafay doet u in een halve dag; voor Merzouga rekent men meestal 3 dagen"],
      s: [
        ["Agafay, de woestijn om de hoek", "De Agafay-woestijn is een plateau van stenige heuvels en okerkleurige aarde, met de toppen van de Atlas aan de horizon. Er zijn geen grote duinen, maar het landschap is prachtig, vooral bij zonsondergang. U kunt er quad, buggy of kameel rijden en veel kampen serveren een diner onder de sterren."],
        ["Merzouga, de Sahara van de grote duinen", "Merzouga, aan de rand van de Erg Chebbi, heeft de oranje zandduinen die men zich bij de Sahara voorstelt. Maar u moet de Atlas over en de weg is lang: de meeste reizigers gaan drie dagen, met tussenstops onderweg."],
        ["Hoe kiest u?", "Duurt uw verblijf korter dan een week of reist u met jonge kinderen, dan is Agafay de beste keuze: u geniet van de woestijn zonder twee dagen in de auto te zitten. Droomt u van echte duinen en heeft u de tijd, dan is Merzouga de reis waard."],
        ["Onze tip", "Vertrek voor Agafay laat in de middag voor de zonsondergang en neem een jas mee: de avonden zijn fris, ook in de zomer."]
      ]
    },
    it: {
      t: "Agafay o Merzouga: quale deserto scegliere partendo da Marrakech?",
      d: "Un deserto di pietra a un'ora da Marrakech o le grandi dune del Sahara a una giornata di strada: le differenze per aiutarLa a scegliere.",
      facts: ["Agafay: deserto di pietra a circa 40 km da Marrakech, meno di un'ora di auto", "Merzouga: vere dune di sabbia del Sahara, a circa 550 km, 9-10 ore di strada", "Agafay richiede mezza giornata; Merzouga di solito 3 giorni"],
      s: [
        ["Agafay, il deserto a due passi", "Il deserto di Agafay è un altopiano di colline pietrose e terra ocra, con le cime dell'Atlante all'orizzonte. Non ci sono grandi dune, ma il paesaggio è spettacolare, soprattutto al tramonto. Si può andare in quad, in buggy o a dorso di cammello, e molti campi servono la cena sotto le stelle."],
        ["Merzouga, il Sahara delle grandi dune", "Merzouga, ai margini dell'Erg Chebbi, offre le dune di sabbia arancione che tutti immaginano pensando al Sahara. Ma bisogna attraversare l'Atlante e la strada è lunga: la maggior parte dei viaggiatori ci va per tre giorni, con tappe lungo il percorso."],
        ["Come scegliere", "Se il Suo soggiorno dura meno di una settimana o viaggia con bambini piccoli, Agafay è la scelta migliore: si gode il deserto senza passare due giorni in auto. Se sogna le vere dune e ha tempo, Merzouga vale il viaggio."],
        ["Il nostro consiglio", "Per Agafay, parta nel tardo pomeriggio per vedere il tramonto e porti una giacca: le serate sono fresche, anche d'estate."]
      ]
    }
  },
  /* ------------------------------------------------------------------ */
  {
    id: "daytrips", slug: "day-trips-from-marrakech", image: "photo-1758622159686-7f61d8a81aa5", related: ["ouzoud", "ourika", "essaouira"], minutes: 5,
    fr: {
      t: "Excursion d'une journée depuis Marrakech : Ouzoud, Ourika ou Essaouira ?",
      d: "Cascades, vallée de l'Atlas ou ville au bord de l'océan : temps de route, ambiance et conseils pour choisir votre excursion.",
      facts: ["Vallée de l'Ourika : environ 65 km, un peu plus d'une heure de route", "Cascades d'Ouzoud : environ 150 km, 2 h 30 à 3 h de route", "Essaouira : environ 190 km, près de 3 h de route"],
      s: [
        ["La vallée de l'Ourika, l'Atlas tout proche", "C'est l'excursion la plus courte : une vallée verte au pied de l'Atlas, des villages berbères et, au bout de la route, des petites cascades que l'on rejoint à pied. Idéale pour une journée détendue, ou si vous avez peu de temps."],
        ["Les cascades d'Ouzoud, les plus hautes du Maroc", "Les chutes d'Ouzoud tombent d'environ 110 mètres dans un cadre très vert. On descend un sentier jusqu'au bassin, on peut faire un petit tour en barque, et on croise souvent des singes magots. Comptez une bonne partie de la journée sur la route, mais le spectacle en vaut la peine."],
        ["Essaouira, l'air de l'océan", "Ancien port fortifié au bord de l'Atlantique, Essaouira a une médina inscrite au patrimoine de l'UNESCO, un port de pêche animé et des remparts face à la mer. L'ambiance est plus calme qu'à Marrakech et le vent souffle souvent : prenez un pull."],
        ["Comment choisir", "Pour la nature et la randonnée facile : Ourika. Pour un grand spectacle naturel : Ouzoud. Pour changer d'air et voir la mer : Essaouira. Dans tous les cas, partez tôt le matin pour profiter de la journée."]
      ]
    },
    ar: {
      t: "رحلة يوم واحد من مراكش: أوزود أم أوريكا أم الصويرة؟",
      d: "شلالات أو وادٍ في الأطلس أو مدينة على المحيط: مدة الطريق والأجواء ونصائح لاختيار رحلتك.",
      facts: ["وادي أوريكا: حوالي 65 كلم، أكثر بقليل من ساعة بالسيارة", "شلالات أوزود: حوالي 150 كلم، من ساعتين ونصف إلى 3 ساعات", "الصويرة: حوالي 190 كلم، قرابة 3 ساعات"],
      s: [
        ["وادي أوريكا، الأطلس القريب", "هي أقصر الرحلات: وادٍ أخضر عند سفح الأطلس وقرى أمازيغية، وفي نهاية الطريق شلالات صغيرة نصل إليها مشيًا. مثالية ليوم هادئ أو إذا كان وقتك ضيقًا."],
        ["شلالات أوزود، الأعلى في المغرب", "تنحدر شلالات أوزود من علو يقارب 110 أمتار وسط طبيعة خضراء. ننزل في ممر حتى الحوض، ويمكن القيام بجولة قصيرة في قارب، وغالبًا ما نصادف قردة المكاك. يأخذ الطريق جزءًا كبيرًا من اليوم، لكن المنظر يستحق."],
        ["الصويرة، نسيم المحيط", "الصويرة ميناء محصّن قديم على المحيط الأطلسي، بمدينة قديمة مصنفة ضمن التراث العالمي لليونسكو، وميناء صيد نابض بالحياة، وأسوار مطلة على البحر. أجواؤها أهدأ من مراكش والريح تهب كثيرًا: خذ معك سترة."],
        ["كيف تختار", "للطبيعة والمشي السهل: أوريكا. لمشهد طبيعي مبهر: أوزود. لتغيير الأجواء ورؤية البحر: الصويرة. وفي كل الأحوال، انطلق باكرًا للاستمتاع بيومك."]
      ]
    },
    en: {
      t: "Day trip from Marrakech: Ouzoud, Ourika or Essaouira?",
      d: "Waterfalls, an Atlas valley or a town by the ocean: driving times, atmosphere and tips to choose your day trip.",
      facts: ["Ourika valley: about 65 km, a little over an hour's drive", "Ouzoud waterfalls: about 150 km, 2.5 to 3 hours' drive", "Essaouira: about 190 km, close to 3 hours' drive"],
      s: [
        ["Ourika valley, the Atlas on your doorstep", "The shortest trip: a green valley at the foot of the Atlas, Berber villages and, at the end of the road, small waterfalls you reach on foot. Perfect for a relaxed day, or if you're short on time."],
        ["Ouzoud waterfalls, Morocco's highest", "The Ouzoud falls drop about 110 metres in a lush green setting. A path leads down to the pool, you can take a short boat ride, and you'll often meet Barbary macaques. The drive takes a good part of the day, but the sight is worth it."],
        ["Essaouira, a breath of ocean air", "A former fortified port on the Atlantic, Essaouira has a UNESCO-listed medina, a lively fishing harbour and ramparts facing the sea. It's calmer than Marrakech and often windy: bring a jumper."],
        ["How to choose", "For nature and an easy walk: Ourika. For a spectacular natural sight: Ouzoud. For a change of scene and the sea: Essaouira. Whichever you pick, leave early in the morning to make the most of the day."]
      ]
    },
    es: {
      t: "Excursión de un día desde Marrakech: ¿Ouzoud, Ourika o Essaouira?",
      d: "Cascadas, un valle del Atlas o una ciudad junto al océano: tiempos de viaje, ambiente y consejos para elegir su excursión.",
      facts: ["Valle del Ourika: unos 65 km, algo más de una hora en coche", "Cascadas de Ouzoud: unos 150 km, de 2,5 a 3 horas en coche", "Essaouira: unos 190 km, cerca de 3 horas en coche"],
      s: [
        ["El valle del Ourika, el Atlas a dos pasos", "Es la excursión más corta: un valle verde al pie del Atlas, pueblos bereberes y, al final de la carretera, pequeñas cascadas a las que se llega a pie. Ideal para un día tranquilo o si tiene poco tiempo."],
        ["Las cascadas de Ouzoud, las más altas de Marruecos", "Las cascadas de Ouzoud caen unos 110 metros en un entorno muy verde. Un sendero baja hasta la poza, se puede dar un pequeño paseo en barca y a menudo se ven macacos de Berbería. El trayecto ocupa buena parte del día, pero el espectáculo lo merece."],
        ["Essaouira, el aire del océano", "Antiguo puerto fortificado junto al Atlántico, Essaouira tiene una medina declarada Patrimonio de la UNESCO, un animado puerto pesquero y murallas frente al mar. El ambiente es más tranquilo que en Marrakech y suele hacer viento: lleve un jersey."],
        ["Cómo elegir", "Para naturaleza y una caminata fácil: Ourika. Para un gran espectáculo natural: Ouzoud. Para cambiar de aires y ver el mar: Essaouira. En cualquier caso, salga temprano para aprovechar el día."]
      ]
    },
    de: {
      t: "Tagesausflug ab Marrakech: Ouzoud, Ourika oder Essaouira?",
      d: "Wasserfälle, ein Atlas-Tal oder eine Stadt am Meer: Fahrzeiten, Atmosphäre und Tipps für die Wahl Ihres Ausflugs.",
      facts: ["Ourika-Tal: rund 65 km, gut eine Stunde Fahrt", "Wasserfälle von Ouzoud: rund 150 km, 2,5 bis 3 Stunden Fahrt", "Essaouira: rund 190 km, knapp 3 Stunden Fahrt"],
      s: [
        ["Das Ourika-Tal, der Atlas vor der Tür", "Der kürzeste Ausflug: ein grünes Tal am Fuß des Atlas, Berberdörfer und am Ende der Straße kleine Wasserfälle, die man zu Fuß erreicht. Ideal für einen entspannten Tag oder wenn Sie wenig Zeit haben."],
        ["Die Wasserfälle von Ouzoud, die höchsten Marokkos", "Die Ouzoud-Fälle stürzen rund 110 Meter in eine sattgrüne Umgebung. Ein Pfad führt hinunter zum Becken, man kann eine kurze Bootsfahrt machen und trifft oft Berberaffen. Die Fahrt nimmt einen guten Teil des Tages ein, aber der Anblick lohnt sich."],
        ["Essaouira, frische Meeresluft", "Die ehemalige befestigte Hafenstadt am Atlantik hat eine Medina, die zum UNESCO-Welterbe gehört, einen lebhaften Fischerhafen und Stadtmauern zum Meer hin. Es geht ruhiger zu als in Marrakech, und oft weht Wind: Nehmen Sie einen Pullover mit."],
        ["Wie wählen?", "Für Natur und eine leichte Wanderung: Ourika. Für ein großes Naturschauspiel: Ouzoud. Für Tapetenwechsel und Meer: Essaouira. In jedem Fall lohnt es sich, früh am Morgen loszufahren."]
      ]
    },
    nl: {
      t: "Dagtrip vanuit Marrakech: Ouzoud, Ourika of Essaouira?",
      d: "Watervallen, een Atlasdal of een stad aan de oceaan: reistijden, sfeer en tips om uw dagtrip te kiezen.",
      facts: ["Ourikavallei: ongeveer 65 km, iets meer dan een uur rijden", "Watervallen van Ouzoud: ongeveer 150 km, 2,5 tot 3 uur rijden", "Essaouira: ongeveer 190 km, bijna 3 uur rijden"],
      s: [
        ["De Ourikavallei, de Atlas om de hoek", "De kortste trip: een groene vallei aan de voet van de Atlas, Berberdorpen en aan het eind van de weg kleine watervallen die u te voet bereikt. Ideaal voor een ontspannen dag of als u weinig tijd heeft."],
        ["De watervallen van Ouzoud, de hoogste van Marokko", "De watervallen van Ouzoud storten zo'n 110 meter naar beneden in een groene omgeving. Een pad leidt naar het bekken, u kunt een kort boottochtje maken en u ziet vaak Berberapen. De rit neemt een flink deel van de dag in beslag, maar het uitzicht is het waard."],
        ["Essaouira, frisse oceaanlucht", "Deze voormalige versterkte haven aan de Atlantische Oceaan heeft een medina op de UNESCO-werelderfgoedlijst, een levendige vissershaven en stadsmuren aan zee. Het is er rustiger dan in Marrakech en het waait vaak: neem een trui mee."],
        ["Hoe kiest u?", "Voor natuur en een makkelijke wandeling: Ourika. Voor een groots natuurschouwspel: Ouzoud. Voor afwisseling en de zee: Essaouira. Vertrek in elk geval vroeg in de ochtend om van de dag te genieten."]
      ]
    },
    it: {
      t: "Gita di un giorno da Marrakech: Ouzoud, Ourika o Essaouira?",
      d: "Cascate, una valle dell'Atlante o una città sull'oceano: tempi di percorrenza, atmosfera e consigli per scegliere la Sua gita.",
      facts: ["Valle dell'Ourika: circa 65 km, poco più di un'ora di auto", "Cascate di Ouzoud: circa 150 km, da 2 ore e mezza a 3 ore di auto", "Essaouira: circa 190 km, quasi 3 ore di auto"],
      s: [
        ["La valle dell'Ourika, l'Atlante a portata di mano", "La gita più breve: una valle verde ai piedi dell'Atlante, villaggi berberi e, in fondo alla strada, piccole cascate da raggiungere a piedi. Perfetta per una giornata tranquilla o se ha poco tempo."],
        ["Le cascate di Ouzoud, le più alte del Marocco", "Le cascate di Ouzoud fanno un salto di circa 110 metri in un ambiente verde e rigoglioso. Un sentiero scende fino alla pozza, si può fare un breve giro in barca e spesso si incontrano le bertucce. Il viaggio occupa buona parte della giornata, ma lo spettacolo ne vale la pena."],
        ["Essaouira, una boccata d'aria oceanica", "Antico porto fortificato sull'Atlantico, Essaouira ha una medina patrimonio dell'UNESCO, un vivace porto di pescatori e bastioni affacciati sul mare. È più tranquilla di Marrakech e spesso ventosa: porti un maglione."],
        ["Come scegliere", "Per la natura e una passeggiata facile: Ourika. Per uno spettacolo naturale: Ouzoud. Per cambiare aria e vedere il mare: Essaouira. Qualunque sia la scelta, parta presto la mattina per sfruttare al meglio la giornata."]
      ]
    }
  },
  /* ------------------------------------------------------------------ */
  {
    id: "wear", slug: "what-to-wear-quad-camel-desert", image: "photo-1624664929003-3da28050c0bf", related: ["quad", "buggy", "agafay"], minutes: 3,
    fr: {
      t: "Que porter pour une balade en quad, en buggy ou à dos de dromadaire ?",
      d: "Vêtements, chaussures et petits accessoires pour profiter du quad, du buggy et des balades dans le désert autour de Marrakech.",
      facts: ["Pantalon long et chaussures fermées : indispensables pour le quad et le buggy", "Lunettes de soleil et foulard pour la poussière", "Une veste pour le soir : il fait frais dans le désert après le coucher du soleil"],
      s: [
        ["Pour le quad et le buggy", "Portez un pantalon long et des chaussures fermées (baskets ou chaussures de marche) : les jambes sont près du moteur et des pierres. Le casque est fourni. Ajoutez des lunettes de soleil et un foulard (ou un chèche, souvent proposé sur place) pour vous protéger de la poussière."],
        ["Pour le dromadaire", "Un pantalon confortable est plus agréable qu'un short pour monter à dos de dromadaire. Évitez les sacs encombrants : un petit sac à dos suffit pour l'eau, la crème solaire et le téléphone."],
        ["Selon la saison", "En été, la chaleur est forte en journée : chapeau, crème solaire et beaucoup d'eau. D'octobre à mars, les matinées et les soirées peuvent être froides, surtout dans le désert : prévoyez une veste chaude ou une polaire."],
        ["Dans les villages", "Si l'excursion passe par des villages berbères, une tenue qui couvre les épaules et les genoux est appréciée. Demandez toujours avant de photographier les habitants."]
      ]
    },
    ar: {
      t: "ماذا ترتدي لجولة بالكواد أو البوغي أو على ظهر الجمل؟",
      d: "الملابس والأحذية والإكسسوارات الصغيرة للاستمتاع بالكواد والبوغي وجولات الصحراء حول مراكش.",
      facts: ["سروال طويل وحذاء مغلق: ضروريان للكواد والبوغي", "نظارات شمسية ووشاح للوقاية من الغبار", "سترة للمساء: يبرد الجو في الصحراء بعد الغروب"],
      s: [
        ["للكواد والبوغي", "ارتدِ سروالًا طويلًا وحذاءً مغلقًا (حذاء رياضي أو حذاء مشي): فالساقان قريبتان من المحرك والحجارة. الخوذة متوفرة. أضف نظارات شمسية ووشاحًا (أو لثامًا يُقترح غالبًا في المكان) للحماية من الغبار."],
        ["لركوب الجمل", "السروال المريح أفضل من الشورت لركوب الجمل. تجنّب الحقائب الكبيرة: تكفي حقيبة ظهر صغيرة للماء وواقي الشمس والهاتف."],
        ["حسب الموسم", "في الصيف تكون الحرارة مرتفعة نهارًا: قبعة وواقٍ من الشمس وكثير من الماء. من أكتوبر إلى مارس قد تكون الصباحات والأمسيات باردة، خاصة في الصحراء: خذ سترة دافئة."],
        ["في القرى", "إذا مرت الرحلة بقرى أمازيغية، يُستحسن لباس يغطي الكتفين والركبتين. واستأذن دائمًا قبل تصوير السكان."]
      ]
    },
    en: {
      t: "What to wear for a quad, buggy or camel ride",
      d: "Clothes, shoes and small essentials to enjoy quad biking, buggies and desert rides around Marrakech.",
      facts: ["Long trousers and closed shoes: essential for quad and buggy rides", "Sunglasses and a scarf against the dust", "A jacket for the evening: the desert gets cool after sunset"],
      s: [
        ["For quads and buggies", "Wear long trousers and closed shoes (trainers or walking shoes): your legs are close to the engine and the stones. Helmets are provided. Add sunglasses and a scarf (or a desert turban, often offered on site) to protect yourself from the dust."],
        ["For a camel ride", "Comfortable trousers are nicer than shorts on a camel. Skip bulky bags: a small backpack is enough for water, sunscreen and your phone."],
        ["Depending on the season", "In summer the daytime heat is strong: hat, sunscreen and plenty of water. From October to March, mornings and evenings can be cold, especially in the desert: bring a warm jacket or fleece."],
        ["In the villages", "If your trip goes through Berber villages, clothes covering shoulders and knees are appreciated. Always ask before taking photos of people."]
      ]
    },
    es: {
      t: "Qué ponerse para un paseo en quad, buggy o dromedario",
      d: "Ropa, calzado y pequeños accesorios para disfrutar del quad, el buggy y los paseos por el desierto cerca de Marrakech.",
      facts: ["Pantalón largo y calzado cerrado: imprescindibles para el quad y el buggy", "Gafas de sol y un pañuelo contra el polvo", "Una chaqueta para la noche: refresca en el desierto tras la puesta de sol"],
      s: [
        ["Para el quad y el buggy", "Lleve pantalón largo y calzado cerrado (zapatillas o calzado de montaña): las piernas van cerca del motor y de las piedras. El casco se proporciona. Añada gafas de sol y un pañuelo (o un turbante del desierto, que a menudo ofrecen allí) para protegerse del polvo."],
        ["Para el dromedario", "Un pantalón cómodo es más agradable que un pantalón corto para montar en dromedario. Evite bolsos voluminosos: basta una pequeña mochila para el agua, la crema solar y el móvil."],
        ["Según la estación", "En verano hace mucho calor durante el día: sombrero, crema solar y mucha agua. De octubre a marzo, las mañanas y las noches pueden ser frías, sobre todo en el desierto: lleve una chaqueta de abrigo o un forro polar."],
        ["En los pueblos", "Si la excursión pasa por pueblos bereberes, se agradece una ropa que cubra hombros y rodillas. Pida siempre permiso antes de fotografiar a las personas."]
      ]
    },
    de: {
      t: "Was anziehen für eine Quad-, Buggy- oder Kameltour?",
      d: "Kleidung, Schuhe und kleine Helfer, um Quad, Buggy und Wüstenausflüge rund um Marrakech zu genießen.",
      facts: ["Lange Hose und geschlossene Schuhe: unerlässlich für Quad und Buggy", "Sonnenbrille und ein Tuch gegen den Staub", "Eine Jacke für den Abend: Nach Sonnenuntergang wird es in der Wüste kühl"],
      s: [
        ["Für Quad und Buggy", "Tragen Sie eine lange Hose und geschlossene Schuhe (Turnschuhe oder Wanderschuhe): Die Beine sind nah am Motor und an den Steinen. Ein Helm wird gestellt. Dazu Sonnenbrille und ein Tuch (oder ein Wüstenturban, der vor Ort oft angeboten wird) als Schutz vor Staub."],
        ["Für den Kamelritt", "Eine bequeme Hose ist auf dem Kamel angenehmer als Shorts. Verzichten Sie auf große Taschen: Ein kleiner Rucksack für Wasser, Sonnencreme und Handy genügt."],
        ["Je nach Jahreszeit", "Im Sommer ist es tagsüber sehr heiß: Hut, Sonnencreme und viel Wasser. Von Oktober bis März können Morgen und Abende kalt sein, besonders in der Wüste: Nehmen Sie eine warme Jacke oder einen Fleece mit."],
        ["In den Dörfern", "Führt der Ausflug durch Berberdörfer, ist Kleidung, die Schultern und Knie bedeckt, gern gesehen. Fragen Sie immer, bevor Sie Menschen fotografieren."]
      ]
    },
    nl: {
      t: "Wat trekt u aan voor een quad-, buggy- of kameeltocht?",
      d: "Kleding, schoenen en handige spullen om te genieten van quad, buggy en woestijntochten rond Marrakech.",
      facts: ["Lange broek en dichte schoenen: onmisbaar voor quad en buggy", "Zonnebril en een sjaal tegen het stof", "Een jas voor de avond: na zonsondergang wordt het fris in de woestijn"],
      s: [
        ["Voor quad en buggy", "Draag een lange broek en dichte schoenen (sneakers of wandelschoenen): uw benen zitten dicht bij de motor en de stenen. Een helm krijgt u erbij. Neem een zonnebril en een sjaal mee (of een woestijntulband, vaak ter plekke aangeboden) tegen het stof."],
        ["Voor een kameeltocht", "Een comfortabele broek is op een kameel prettiger dan een korte broek. Laat grote tassen thuis: een klein rugzakje is genoeg voor water, zonnebrand en uw telefoon."],
        ["Afhankelijk van het seizoen", "In de zomer is het overdag erg warm: hoed, zonnebrand en veel water. Van oktober tot maart kunnen ochtenden en avonden koud zijn, zeker in de woestijn: neem een warme jas of fleece mee."],
        ["In de dorpen", "Gaat de tocht door Berberdorpen, dan wordt kleding die schouders en knieën bedekt gewaardeerd. Vraag altijd toestemming voordat u mensen fotografeert."]
      ]
    },
    it: {
      t: "Come vestirsi per un giro in quad, in buggy o a dorso di cammello",
      d: "Abiti, scarpe e piccoli accessori indispensabili per godersi quad, buggy ed escursioni nel deserto intorno a Marrakech.",
      facts: ["Pantaloni lunghi e scarpe chiuse: indispensabili per quad e buggy", "Occhiali da sole e una sciarpa contro la polvere", "Una giacca per la sera: dopo il tramonto il deserto si rinfresca"],
      s: [
        ["Per quad e buggy", "Indossi pantaloni lunghi e scarpe chiuse (da ginnastica o da trekking): le gambe sono vicine al motore e ai sassi. Il casco è fornito. Aggiunga occhiali da sole e una sciarpa (o un turbante, spesso offerto sul posto) per proteggersi dalla polvere."],
        ["Per un giro in cammello", "Sul cammello sono più comodi i pantaloni che i pantaloncini. Eviti borse ingombranti: basta un piccolo zaino per acqua, crema solare e telefono."],
        ["A seconda della stagione", "In estate il caldo di giorno è intenso: cappello, crema solare e molta acqua. Da ottobre a marzo, mattine e serate possono essere fredde, soprattutto nel deserto: porti una giacca calda o un pile."],
        ["Nei villaggi", "Se la gita attraversa villaggi berberi, sono apprezzati abiti che coprono spalle e ginocchia. Chieda sempre il permesso prima di fotografare le persone."]
      ]
    }
  },
  /* ------------------------------------------------------------------ */
  {
    id: "night", slug: "arriving-in-marrakech-at-night", image: "photo-1597212618440-806262de4f6b", related: ["medina"], minutes: 3,
    fr: {
      t: "Arriver à Marrakech de nuit : ce qu'il faut savoir",
      d: "Vol tardif ? Les bons réflexes pour rejoindre votre hôtel ou votre riad sereinement : transfert, argent, carte SIM et médina la nuit.",
      facts: ["Des distributeurs automatiques sont disponibles à l'aéroport", "On peut acheter une carte SIM marocaine dès l'arrivée", "De nuit, un transfert réservé évite de chercher son chemin dans la médina"],
      s: [
        ["Avant de partir", "Notez l'adresse exacte et le numéro de téléphone de votre hébergement, et prévenez-le de votre heure d'arrivée. Si vous dormez dans un riad de la médina, demandez-lui s'il peut venir vous chercher au point de dépose le plus proche."],
        ["À l'aéroport", "Vous pouvez retirer des dirhams aux distributeurs automatiques et acheter une carte SIM marocaine dans le hall d'arrivée, pratique pour appeler votre riad ou utiliser une application de carte."],
        ["Rejoindre votre hébergement", "Des taxis attendent à la sortie, mais de nuit le plus serein reste un transfert réservé à l'avance : le chauffeur vous attend avec une pancarte à votre nom, même si votre vol a du retard, et vous dépose au plus près de votre hébergement."],
        ["Dans la médina la nuit", "Les ruelles sont calmes et souvent peu éclairées. Suivez le personnel de votre riad plutôt que des inconnus qui proposent de vous guider, et gardez le téléphone de votre riad à portée de main."]
      ]
    },
    ar: {
      t: "الوصول إلى مراكش ليلًا: ما يجب أن تعرفه",
      d: "رحلة متأخرة؟ نصائح للوصول إلى فندقك أو رياضك بهدوء: النقل، المال، شريحة الهاتف والمدينة القديمة ليلًا.",
      facts: ["تتوفر أجهزة الصراف الآلي في المطار", "يمكن شراء شريحة هاتف مغربية فور الوصول", "ليلًا، يجنبك النقل المحجوز البحث عن طريقك في المدينة القديمة"],
      s: [
        ["قبل السفر", "دوّن العنوان الدقيق ورقم هاتف مكان إقامتك، وأخبرهم بموعد وصولك. إذا كنت ستقيم في رياض داخل المدينة القديمة، اسألهم إن كان بإمكانهم استقبالك عند أقرب نقطة توقف."],
        ["في المطار", "يمكنك سحب الدراهم من أجهزة الصراف الآلي وشراء شريحة هاتف مغربية في قاعة الوصول، وهذا مفيد للاتصال بالرياض أو استعمال تطبيق الخرائط."],
        ["الوصول إلى مكان إقامتك", "تنتظر سيارات الأجرة عند المخرج، لكن ليلًا يبقى النقل المحجوز مسبقًا الأكثر راحة: ينتظرك السائق بلافتة تحمل اسمك حتى لو تأخرت رحلتك، ويوصلك إلى أقرب نقطة من مكان إقامتك."],
        ["في المدينة القديمة ليلًا", "الأزقة هادئة وغالبًا ما تكون قليلة الإضاءة. اتبع عامل الرياض بدل الغرباء الذين يعرضون إرشادك، واحتفظ برقم هاتف الرياض في متناولك."]
      ]
    },
    en: {
      t: "Arriving in Marrakech at night: what to know",
      d: "Late flight? Simple tips to reach your hotel or riad calmly: transfer, cash, SIM card and the medina at night.",
      facts: ["Cash machines are available at the airport", "You can buy a Moroccan SIM card as soon as you land", "At night, a booked transfer saves you from finding your way through the medina"],
      s: [
        ["Before you leave", "Write down the exact address and phone number of your accommodation, and tell them your arrival time. If you're staying in a riad in the medina, ask whether someone can meet you at the nearest drop-off point."],
        ["At the airport", "You can withdraw dirhams from the cash machines and buy a Moroccan SIM card in the arrivals hall, handy to call your riad or use a map app."],
        ["Getting to your accommodation", "Taxis wait outside, but at night the most relaxed option is a transfer booked in advance: your driver waits with a sign showing your name, even if your flight is late, and drops you as close as possible to where you're staying."],
        ["In the medina at night", "The lanes are quiet and often dimly lit. Follow your riad's staff rather than strangers offering to guide you, and keep your riad's phone number handy."]
      ]
    },
    es: {
      t: "Llegar a Marrakech de noche: lo que debe saber",
      d: "¿Vuelo tardío? Consejos sencillos para llegar a su hotel o riad con tranquilidad: traslado, dinero, tarjeta SIM y la medina de noche.",
      facts: ["Hay cajeros automáticos en el aeropuerto", "Puede comprar una tarjeta SIM marroquí nada más llegar", "De noche, un traslado reservado le evita buscar el camino por la medina"],
      s: [
        ["Antes de salir", "Anote la dirección exacta y el teléfono de su alojamiento y avíseles de su hora de llegada. Si se aloja en un riad de la medina, pregunte si pueden ir a buscarle al punto de llegada más cercano."],
        ["En el aeropuerto", "Puede sacar dírhams en los cajeros automáticos y comprar una tarjeta SIM marroquí en la sala de llegadas, práctico para llamar a su riad o usar una aplicación de mapas."],
        ["Llegar a su alojamiento", "Hay taxis esperando a la salida, pero de noche lo más tranquilo es un traslado reservado con antelación: el conductor le espera con un cartel con su nombre, aunque su vuelo se retrase, y le deja lo más cerca posible de su alojamiento."],
        ["En la medina de noche", "Los callejones son tranquilos y a menudo poco iluminados. Siga al personal de su riad en lugar de a desconocidos que se ofrecen a guiarle, y tenga a mano el teléfono de su riad."]
      ]
    },
    de: {
      t: "Nachts in Marrakech ankommen: Das sollten Sie wissen",
      d: "Später Flug? Einfache Tipps, um entspannt zu Hotel oder Riad zu kommen: Transfer, Bargeld, SIM-Karte und die Medina bei Nacht.",
      facts: ["Am Flughafen gibt es Geldautomaten", "Eine marokkanische SIM-Karte kann man gleich nach der Landung kaufen", "Nachts erspart ein gebuchter Transfer die Wegsuche durch die Medina"],
      s: [
        ["Vor der Abreise", "Notieren Sie die genaue Adresse und Telefonnummer Ihrer Unterkunft und teilen Sie Ihre Ankunftszeit mit. Wohnen Sie in einem Riad in der Medina, fragen Sie, ob man Sie am nächstgelegenen Halteplatz abholen kann."],
        ["Am Flughafen", "An den Geldautomaten können Sie Dirham abheben, und in der Ankunftshalle bekommen Sie eine marokkanische SIM-Karte, praktisch, um Ihr Riad anzurufen oder eine Karten-App zu nutzen."],
        ["Zur Unterkunft", "Draußen warten Taxis, doch nachts ist ein vorab gebuchter Transfer am entspanntesten: Der Fahrer wartet mit einem Namensschild, auch bei Verspätung, und bringt Sie so nah wie möglich an Ihre Unterkunft."],
        ["Nachts in der Medina", "Die Gassen sind ruhig und oft schwach beleuchtet. Folgen Sie dem Personal Ihres Riads statt Fremden, die Ihnen den Weg zeigen wollen, und halten Sie die Telefonnummer Ihres Riads bereit."]
      ]
    },
    nl: {
      t: "'s Nachts aankomen in Marrakech: wat u moet weten",
      d: "Late vlucht? Eenvoudige tips om rustig uw hotel of riad te bereiken: transfer, contant geld, simkaart en de medina bij nacht.",
      facts: ["Op de luchthaven zijn geldautomaten", "U kunt direct na aankomst een Marokkaanse simkaart kopen", "'s Nachts voorkomt een geboekte transfer dat u zelf de weg door de medina moet zoeken"],
      s: [
        ["Voor vertrek", "Noteer het exacte adres en telefoonnummer van uw verblijf en geef uw aankomsttijd door. Logeert u in een riad in de medina, vraag dan of iemand u kan opvangen op het dichtstbijzijnde afzetpunt."],
        ["Op de luchthaven", "U kunt dirham opnemen bij de geldautomaten en in de aankomsthal een Marokkaanse simkaart kopen, handig om uw riad te bellen of een kaartenapp te gebruiken."],
        ["Naar uw verblijf", "Buiten wachten taxi's, maar 's nachts is een vooraf geboekte transfer het meest ontspannen: de chauffeur wacht met een naambord, ook als uw vlucht vertraagd is, en zet u zo dicht mogelijk bij uw verblijf af."],
        ["'s Nachts in de medina", "De steegjes zijn rustig en vaak slecht verlicht. Volg het personeel van uw riad in plaats van onbekenden die aanbieden u te gidsen, en houd het telefoonnummer van uw riad bij de hand."]
      ]
    },
    it: {
      t: "Arrivare a Marrakech di notte: cosa sapere",
      d: "Volo in tarda serata? Consigli semplici per raggiungere con calma il Suo hotel o riad: transfer, contanti, SIM e la medina di notte.",
      facts: ["In aeroporto ci sono sportelli bancomat", "Si può acquistare una SIM marocchina appena atterrati", "Di notte, un transfer prenotato Le evita di orientarsi da solo nella medina"],
      s: [
        ["Prima di partire", "Annoti l'indirizzo esatto e il numero di telefono dell'alloggio e comunichi l'orario di arrivo. Se dorme in un riad nella medina, chieda se qualcuno può venire a prenderLa nel punto di arrivo più vicino."],
        ["In aeroporto", "Può prelevare dirham agli sportelli bancomat e acquistare una SIM marocchina nella sala arrivi, utile per chiamare il riad o usare un'app di mappe."],
        ["Raggiungere l'alloggio", "I taxi aspettano fuori, ma di notte la soluzione più tranquilla è un transfer prenotato in anticipo: l'autista La attende con un cartello con il Suo nome, anche se il volo è in ritardo, e La lascia il più vicino possibile all'alloggio."],
        ["Nella medina di notte", "I vicoli sono silenziosi e spesso poco illuminati. Segua il personale del riad piuttosto che sconosciuti che si offrono di accompagnarLa, e tenga a portata di mano il numero del riad."]
      ]
    }
  }
];

if (typeof module !== "undefined") module.exports = { GUIDES: GUIDES, GUIDE_UI: GUIDE_UI };
