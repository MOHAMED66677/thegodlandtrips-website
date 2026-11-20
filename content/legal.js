/* =========================================================
   LEGAL PAGE: legal notice, privacy policy, booking terms
   ---------------------------------------------------------
   1) Fill in LEGAL_INFO below with the agency's official details.
      Every empty field appears on the page as a highlighted
      "[To complete]" box until it is filled.
   2) Have the texts checked by the agency's accountant or a lawyer
      (and the Arabic/Spanish versions by native speakers).
   ========================================================= */
var LEGAL_INFO = {
  companyName: "",      // e.g. "TheGodLandTrips SARL"
  legalForm: "",        // e.g. "SARL", "SARL AU", "Auto-entrepreneur"
  address: "",          // registered office (full postal address)
  rc: "",               // Registre de Commerce number (+ city)
  ice: "",              // Identifiant Commun de l'Entreprise
  taxId: "",            // Identifiant Fiscal (IF)
  director: "",         // publication director (manager's full name)
  tourismLicense: "",   // tourist transport / travel agency licence number
  insurance: "",        // professional liability insurer + policy number
  cndp: "",             // CNDP declaration / authorisation number
  updated: "2026-11-20",

  // Policies written in each language (leave "" to show "[To complete]")
  retention:    { fr: "", ar: "", en: "", es: "" },  // e.g. "24 mois" / "24 months"
  payment:      { fr: "", ar: "", en: "", es: "" },  // e.g. "acompte de 30 % à la réservation, solde au chauffeur"
  cancellation: { fr: "", ar: "", en: "", es: "" },  // e.g. "gratuite jusqu'à 24 h avant le service"
  waiting:      { fr: "", ar: "", en: "", es: "" }   // e.g. "60 minutes après l'atterrissage"
};

/* Texts. {tokens} are replaced by LEGAL_INFO / SITE values. */
var LEGAL_TEXT = {
  /* ============================ FRANÇAIS ============================ */
  fr: {
    pageTitle: "Mentions légales et confidentialité",
    intro: "Cette page présente l'entreprise qui édite le site {site}, la façon dont vos informations sont utilisées et les conditions de nos services.",
    back: "Retour à l'accueil",
    toc: "Sur cette page",
    updated: "Dernière mise à jour",
    todo: "À compléter",
    labels: { company: "raison sociale", legalForm: "forme juridique", address: "adresse du siège", rc: "n° RC", ice: "n° ICE", taxId: "n° IF", director: "nom du responsable", license: "n° d'autorisation", insurance: "assureur et n° de police", cndp: "n° de déclaration CNDP", retention: "durée", payment: "modalités de paiement", cancellation: "conditions d'annulation", waiting: "temps d'attente inclus" },
    sections: [
      { id: "editor", title: "1. Éditeur du site", blocks: [
        { dl: [["Raison sociale", "{company}"], ["Forme juridique", "{legalForm}"], ["Siège social", "{address}"], ["Contact", "{contact}"], ["Registre de commerce (RC)", "{rc}"], ["ICE", "{ice}"], ["Identifiant fiscal (IF)", "{taxId}"], ["Directeur de la publication", "{director}"], ["Autorisation de transport touristique / agence", "{license}"], ["Assurance responsabilité civile professionnelle", "{insurance}"]] }
      ]},
      { id: "hosting", title: "2. Hébergement", blocks: [
        "Le site est hébergé par GitHub, Inc. (service GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis."
      ]},
      { id: "credits", title: "3. Crédits", blocks: [
        { ul: [
          "Photos d'illustration : Unsplash (licence Unsplash), en attendant les photos de l'agence.",
          "Cartes : Google Maps. Recherche d'adresses : Photon (komoot), données © contributeurs OpenStreetMap. Estimation des trajets : OSRM.",
          "Polices de caractères : Inter, Space Grotesk et Cairo (licence SIL Open Font License)."
        ]}
      ]},
      { id: "privacy", title: "4. Protection des données personnelles", blocks: [
        "Nous respectons la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel. Pour les visiteurs résidant dans l'Union européenne, nous appliquons également les principes du RGPD.",
        { h3: "Responsable du traitement" },
        "{company}, {address}. Contact : {contact}. Déclaration auprès de la CNDP : {cndp}.",
        { h3: "Données collectées" },
        { ul: [
          "Par le formulaire de devis : votre nom, votre numéro WhatsApp ou votre e-mail, le service souhaité, les lieux de départ et de destination, la date et le nombre de passagers.",
          "Ces informations ne sont pas enregistrées sur le site : c'est vous qui nous les envoyez, par WhatsApp (service de Meta) ou par e-mail, en validant le message préparé par le formulaire."
        ]},
        { h3: "Pourquoi nous les utilisons" },
        "Uniquement pour répondre à votre demande, établir votre devis et organiser votre transfert ou votre activité. Elles ne sont ni vendues ni utilisées à des fins publicitaires.",
        { h3: "Durée de conservation" },
        "Vos échanges sont conservés le temps nécessaire au traitement de votre demande et au suivi de votre réservation, au maximum {retention}.",
        { h3: "Services tiers utilisés par le site" },
        { ul: [
          "Recherche d'adresses : le texte que vous tapez dans les champs « Départ » et « Destination » est envoyé à Photon (komoot, Allemagne) pour proposer des suggestions, et les positions choisies sont envoyées à OSRM pour estimer la durée du trajet.",
          "Google Maps : la carte intégrée et les liens « Ouvrir dans Google Maps » sont fournis par Google, qui peut utiliser ses propres cookies selon sa politique de confidentialité.",
          "Statistiques : lorsqu'elles sont activées, nous utilisons un service de mesure d'audience anonyme et sans cookies (GoatCounter ou Cloudflare Web Analytics).",
          "Préférences : votre choix de langue et de thème (clair ou sombre) est enregistré uniquement dans votre navigateur, sans aucun suivi."
        ]},
        { h3: "Vos droits" },
        "Vous pouvez à tout moment demander l'accès à vos données, leur rectification ou leur suppression, ou vous opposer à leur utilisation, en nous contactant : {contact}. Vous pouvez également saisir la CNDP (www.cndp.ma) ou, si vous résidez dans l'Union européenne, l'autorité de protection des données de votre pays."
      ]},
      { id: "terms", title: "5. Réservation, paiement et annulation", blocks: [
        "Toute demande envoyée depuis le site est une demande de devis, sans engagement. La réservation devient ferme après l'envoi de notre devis et votre confirmation écrite (WhatsApp ou e-mail).",
        { h3: "Prix et paiement" },
        "Le prix applicable est celui indiqué dans le devis accepté. Modalités de paiement : {payment}.",
        { h3: "Annulation et modification" },
        "{cancellation}.",
        { h3: "Retards et temps d'attente" },
        "Pour les transferts depuis l'aéroport, nous suivons votre vol et adaptons l'heure de prise en charge à l'heure réelle d'atterrissage. Temps d'attente inclus : {waiting}.",
        { h3: "Activités" },
        "Les participants doivent respecter les consignes de sécurité des moniteurs. Certaines activités (quad, buggy, montgolfière, parapente, jet ski…) sont soumises à des conditions d'âge, de santé ou de météo, précisées dans le devis. En cas de météo défavorable, l'activité peut être reportée ou annulée pour votre sécurité.",
        { h3: "Droit applicable" },
        "Ces conditions sont régies par le droit marocain. En cas de litige, une solution amiable sera recherchée en priorité ; à défaut, les tribunaux compétents de Marrakech pourront être saisis."
      ]}
    ]
  },

  /* ============================ العربية ============================ */
  ar: {
    pageTitle: "الإشعار القانوني والخصوصية",
    intro: "تعرّف هذه الصفحة بالشركة التي تنشر الموقع {site}، وبطريقة استخدام معلوماتك، وبشروط خدماتنا.",
    back: "العودة إلى الرئيسية",
    toc: "في هذه الصفحة",
    updated: "آخر تحديث",
    todo: "يُستكمل لاحقًا",
    labels: { company: "اسم الشركة", legalForm: "الشكل القانوني", address: "عنوان المقر", rc: "رقم السجل التجاري", ice: "رقم التعريف الموحد للمقاولة", taxId: "رقم التعريف الضريبي", director: "اسم المسؤول", license: "رقم الترخيص", insurance: "شركة التأمين ورقم البوليصة", cndp: "رقم التصريح لدى اللجنة الوطنية", retention: "المدة", payment: "طريقة الدفع", cancellation: "شروط الإلغاء", waiting: "مدة الانتظار المشمولة" },
    sections: [
      { id: "editor", title: "1. ناشر الموقع", blocks: [
        { dl: [["اسم الشركة", "{company}"], ["الشكل القانوني", "{legalForm}"], ["المقر الاجتماعي", "{address}"], ["التواصل", "{contact}"], ["السجل التجاري", "{rc}"], ["رقم التعريف الموحد للمقاولة (ICE)", "{ice}"], ["رقم التعريف الضريبي (IF)", "{taxId}"], ["مدير النشر", "{director}"], ["ترخيص النقل السياحي / الوكالة", "{license}"], ["تأمين المسؤولية المدنية المهنية", "{insurance}"]] }
      ]},
      { id: "hosting", title: "2. الاستضافة", blocks: [
        "يستضيف الموقعَ شركةُ GitHub, Inc. (خدمة GitHub Pages)، 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107، الولايات المتحدة الأمريكية."
      ]},
      { id: "credits", title: "3. حقوق المحتوى", blocks: [
        { ul: [
          "الصور التوضيحية: Unsplash (ترخيص Unsplash)، في انتظار صور الوكالة.",
          "الخرائط: خرائط Google. البحث عن العناوين: Photon (komoot)، البيانات © المساهمون في OpenStreetMap. تقدير المسارات: OSRM.",
          "الخطوط: Inter وSpace Grotesk وCairo (ترخيص SIL Open Font License)."
        ]}
      ]},
      { id: "privacy", title: "4. حماية المعطيات الشخصية", blocks: [
        "نحترم القانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي. وبالنسبة للزوار المقيمين في الاتحاد الأوروبي، نطبق أيضًا مبادئ اللائحة العامة لحماية البيانات (RGPD).",
        { h3: "المسؤول عن المعالجة" },
        "{company}، {address}. التواصل: {contact}. التصريح لدى اللجنة الوطنية لمراقبة حماية المعطيات (CNDP): {cndp}.",
        { h3: "المعطيات التي نجمعها" },
        { ul: [
          "عبر استمارة طلب عرض السعر: اسمك، رقم واتساب أو بريدك الإلكتروني، الخدمة المطلوبة، مكان الانطلاق والوجهة، التاريخ وعدد الركاب.",
          "لا تُحفظ هذه المعلومات في الموقع: أنت من يرسلها إلينا عبر واتساب (خدمة تابعة لشركة Meta) أو عبر البريد الإلكتروني، عند تأكيد الرسالة التي تُعدّها الاستمارة."
        ]},
        { h3: "لماذا نستخدمها" },
        "فقط للرد على طلبك، وإعداد عرض السعر، وتنظيم نقلك أو نشاطك. لا تُباع ولا تُستخدم لأغراض إشهارية.",
        { h3: "مدة الاحتفاظ" },
        "نحتفظ بمراسلاتك طوال المدة اللازمة لمعالجة طلبك ومتابعة حجزك، وبحد أقصى {retention}.",
        { h3: "خدمات خارجية يستخدمها الموقع" },
        { ul: [
          "البحث عن العناوين: يُرسل النص الذي تكتبه في حقلي «نقطة الانطلاق» و«الوجهة» إلى خدمة Photon (komoot، ألمانيا) لاقتراح العناوين، وتُرسل المواقع المختارة إلى OSRM لتقدير مدة الطريق.",
          "خرائط Google: الخريطة المدمجة وروابط «افتح في خرائط Google» تقدمها شركة Google، التي قد تستخدم ملفات تعريف الارتباط الخاصة بها وفق سياسة الخصوصية لديها.",
          "الإحصاءات: عند تفعيلها، نستخدم خدمة لقياس الزيارات مجهولة الهوية ودون ملفات تعريف الارتباط (GoatCounter أو Cloudflare Web Analytics).",
          "التفضيلات: يُحفظ اختيارك للغة وللوضع (فاتح أو داكن) في متصفحك فقط، دون أي تتبع."
        ]},
        { h3: "حقوقك" },
        "يمكنك في أي وقت طلب الاطلاع على معطياتك أو تصحيحها أو حذفها، أو الاعتراض على استخدامها، بالتواصل معنا: {contact}. كما يمكنك اللجوء إلى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي (www.cndp.ma)، أو إلى سلطة حماية البيانات في بلدك إذا كنت مقيمًا في الاتحاد الأوروبي."
      ]},
      { id: "terms", title: "5. الحجز والدفع والإلغاء", blocks: [
        "كل طلب يُرسل من الموقع هو طلب عرض سعر دون أي التزام. يصبح الحجز نهائيًا بعد إرسال عرض السعر وتأكيدك الكتابي (عبر واتساب أو البريد الإلكتروني).",
        { h3: "السعر والدفع" },
        "السعر المعتمد هو المذكور في عرض السعر المقبول. طريقة الدفع: {payment}.",
        { h3: "الإلغاء والتعديل" },
        "{cancellation}.",
        { h3: "التأخير ومدة الانتظار" },
        "بالنسبة للنقل من المطار، نتابع رحلتك الجوية ونضبط موعد الاستقبال حسب وقت الهبوط الفعلي. مدة الانتظار المشمولة: {waiting}.",
        { h3: "الأنشطة" },
        "يجب على المشاركين احترام تعليمات السلامة التي يقدمها المؤطرون. تخضع بعض الأنشطة (الكواد، الباغي، المنطاد، الطيران الشراعي، الجت سكي…) لشروط تتعلق بالسن أو الصحة أو الطقس، تُذكر في عرض السعر. وفي حال سوء الأحوال الجوية، يمكن تأجيل النشاط أو إلغاؤه حفاظًا على سلامتك.",
        { h3: "القانون المطبق" },
        "تخضع هذه الشروط للقانون المغربي. في حال نشوب نزاع، يُبحث أولًا عن حل ودي، وإلا يمكن اللجوء إلى المحاكم المختصة بمراكش."
      ]}
    ]
  },

  /* ============================ ENGLISH ============================ */
  en: {
    pageTitle: "Legal notice and privacy",
    intro: "This page presents the company that publishes the website {site}, how your information is used, and the terms of our services.",
    back: "Back to home",
    toc: "On this page",
    updated: "Last updated",
    todo: "To complete",
    labels: { company: "company name", legalForm: "legal form", address: "registered address", rc: "RC number", ice: "ICE number", taxId: "tax ID (IF)", director: "manager's name", license: "licence number", insurance: "insurer and policy number", cndp: "CNDP declaration number", retention: "duration", payment: "payment terms", cancellation: "cancellation terms", waiting: "included waiting time" },
    sections: [
      { id: "editor", title: "1. Website publisher", blocks: [
        { dl: [["Company name", "{company}"], ["Legal form", "{legalForm}"], ["Registered office", "{address}"], ["Contact", "{contact}"], ["Trade register (RC)", "{rc}"], ["ICE", "{ice}"], ["Tax ID (IF)", "{taxId}"], ["Publication director", "{director}"], ["Tourist transport / travel agency licence", "{license}"], ["Professional liability insurance", "{insurance}"]] }
      ]},
      { id: "hosting", title: "2. Hosting", blocks: [
        "The website is hosted by GitHub, Inc. (GitHub Pages service), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States."
      ]},
      { id: "credits", title: "3. Credits", blocks: [
        { ul: [
          "Illustration photos: Unsplash (Unsplash licence), until the agency's own photos are added.",
          "Maps: Google Maps. Address search: Photon (komoot), data © OpenStreetMap contributors. Route estimates: OSRM.",
          "Fonts: Inter, Space Grotesk and Cairo (SIL Open Font License)."
        ]}
      ]},
      { id: "privacy", title: "4. Personal data protection", blocks: [
        "We comply with Moroccan Law No. 09-08 on the protection of individuals with regard to the processing of personal data. For visitors living in the European Union, we also apply the principles of the GDPR.",
        { h3: "Data controller" },
        "{company}, {address}. Contact: {contact}. CNDP declaration: {cndp}.",
        { h3: "Data we collect" },
        { ul: [
          "Through the quote form: your name, your WhatsApp number or email, the service you want, the pick-up and drop-off places, the date and the number of passengers.",
          "This information is not stored on the website: you send it to us yourself, by WhatsApp (a Meta service) or by email, when you confirm the message prepared by the form."
        ]},
        { h3: "Why we use it" },
        "Only to answer your request, prepare your quote and organise your transfer or activity. It is never sold or used for advertising.",
        { h3: "How long we keep it" },
        "Our exchanges with you are kept as long as needed to handle your request and follow up your booking, for a maximum of {retention}.",
        { h3: "Third-party services used by the website" },
        { ul: [
          "Address search: the text you type in the \"From\" and \"To\" fields is sent to Photon (komoot, Germany) to suggest addresses, and the chosen positions are sent to OSRM to estimate the drive time.",
          "Google Maps: the embedded map and the \"Open in Google Maps\" links are provided by Google, which may use its own cookies under its privacy policy.",
          "Statistics: when enabled, we use an anonymous, cookie-free visitor statistics service (GoatCounter or Cloudflare Web Analytics).",
          "Preferences: your language and theme (light or dark) choices are saved only in your browser, with no tracking."
        ]},
        { h3: "Your rights" },
        "You can ask at any time to access, correct or delete your data, or object to its use, by contacting us: {contact}. You can also contact the CNDP (www.cndp.ma) or, if you live in the European Union, the data protection authority of your country."
      ]},
      { id: "terms", title: "5. Booking, payment and cancellation", blocks: [
        "Every request sent from the website is a quote request, with no commitment. A booking becomes firm once we have sent our quote and you have confirmed it in writing (WhatsApp or email).",
        { h3: "Price and payment" },
        "The applicable price is the one stated in the accepted quote. Payment terms: {payment}.",
        { h3: "Cancellation and changes" },
        "{cancellation}.",
        { h3: "Delays and waiting time" },
        "For airport transfers, we track your flight and adjust the pick-up time to the actual landing time. Included waiting time: {waiting}.",
        { h3: "Activities" },
        "Participants must follow the instructors' safety instructions. Some activities (quad, buggy, hot-air balloon, paragliding, jet ski…) have age, health or weather conditions, which are stated in the quote. In bad weather, an activity may be postponed or cancelled for your safety.",
        { h3: "Governing law" },
        "These terms are governed by Moroccan law. In case of dispute, an amicable solution will be sought first; failing that, the competent courts of Marrakech may be seized."
      ]}
    ]
  },

  /* ============================ ESPAÑOL ============================ */
  es: {
    pageTitle: "Aviso legal y privacidad",
    intro: "Esta página presenta a la empresa que edita el sitio {site}, cómo se utiliza su información y las condiciones de nuestros servicios.",
    back: "Volver al inicio",
    toc: "En esta página",
    updated: "Última actualización",
    todo: "Por completar",
    labels: { company: "razón social", legalForm: "forma jurídica", address: "domicilio social", rc: "n.º RC", ice: "n.º ICE", taxId: "n.º IF", director: "nombre del responsable", license: "n.º de autorización", insurance: "aseguradora y n.º de póliza", cndp: "n.º de declaración CNDP", retention: "duración", payment: "condiciones de pago", cancellation: "condiciones de cancelación", waiting: "tiempo de espera incluido" },
    sections: [
      { id: "editor", title: "1. Editor del sitio", blocks: [
        { dl: [["Razón social", "{company}"], ["Forma jurídica", "{legalForm}"], ["Domicilio social", "{address}"], ["Contacto", "{contact}"], ["Registro mercantil (RC)", "{rc}"], ["ICE", "{ice}"], ["Identificador fiscal (IF)", "{taxId}"], ["Director de la publicación", "{director}"], ["Autorización de transporte turístico / agencia", "{license}"], ["Seguro de responsabilidad civil profesional", "{insurance}"]] }
      ]},
      { id: "hosting", title: "2. Alojamiento", blocks: [
        "El sitio está alojado por GitHub, Inc. (servicio GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, Estados Unidos."
      ]},
      { id: "credits", title: "3. Créditos", blocks: [
        { ul: [
          "Fotos ilustrativas: Unsplash (licencia Unsplash), a la espera de las fotos de la agencia.",
          "Mapas: Google Maps. Búsqueda de direcciones: Photon (komoot), datos © colaboradores de OpenStreetMap. Estimación de trayectos: OSRM.",
          "Tipografías: Inter, Space Grotesk y Cairo (licencia SIL Open Font License)."
        ]}
      ]},
      { id: "privacy", title: "4. Protección de datos personales", blocks: [
        "Respetamos la ley marroquí n.º 09-08 relativa a la protección de las personas físicas respecto al tratamiento de datos personales. Para los visitantes residentes en la Unión Europea, aplicamos también los principios del RGPD.",
        { h3: "Responsable del tratamiento" },
        "{company}, {address}. Contacto: {contact}. Declaración ante la CNDP: {cndp}.",
        { h3: "Datos que recogemos" },
        { ul: [
          "Mediante el formulario de presupuesto: su nombre, su número de WhatsApp o su correo, el servicio deseado, los lugares de salida y destino, la fecha y el número de pasajeros.",
          "Esta información no se guarda en el sitio: es usted quien nos la envía, por WhatsApp (servicio de Meta) o por correo, al confirmar el mensaje preparado por el formulario."
        ]},
        { h3: "Para qué la usamos" },
        "Únicamente para responder a su solicitud, preparar su presupuesto y organizar su traslado o actividad. Nunca se vende ni se usa con fines publicitarios.",
        { h3: "Plazo de conservación" },
        "Nuestros intercambios se conservan el tiempo necesario para tramitar su solicitud y hacer el seguimiento de su reserva, como máximo {retention}.",
        { h3: "Servicios de terceros que usa el sitio" },
        { ul: [
          "Búsqueda de direcciones: el texto que escribe en los campos «Salida» y «Destino» se envía a Photon (komoot, Alemania) para sugerir direcciones, y las posiciones elegidas se envían a OSRM para estimar la duración del trayecto.",
          "Google Maps: el mapa integrado y los enlaces «Abrir en Google Maps» los proporciona Google, que puede usar sus propias cookies según su política de privacidad.",
          "Estadísticas: cuando están activadas, usamos un servicio de medición de audiencia anónimo y sin cookies (GoatCounter o Cloudflare Web Analytics).",
          "Preferencias: su elección de idioma y de tema (claro u oscuro) se guarda solo en su navegador, sin ningún seguimiento."
        ]},
        { h3: "Sus derechos" },
        "Puede solicitar en cualquier momento el acceso, la rectificación o la supresión de sus datos, u oponerse a su uso, contactándonos: {contact}. También puede dirigirse a la CNDP (www.cndp.ma) o, si reside en la Unión Europea, a la autoridad de protección de datos de su país."
      ]},
      { id: "terms", title: "5. Reserva, pago y cancelación", blocks: [
        "Toda solicitud enviada desde el sitio es una solicitud de presupuesto, sin compromiso. La reserva es firme después del envío de nuestro presupuesto y de su confirmación por escrito (WhatsApp o correo).",
        { h3: "Precio y pago" },
        "El precio aplicable es el indicado en el presupuesto aceptado. Condiciones de pago: {payment}.",
        { h3: "Cancelación y modificación" },
        "{cancellation}.",
        { h3: "Retrasos y tiempo de espera" },
        "En los traslados desde el aeropuerto, seguimos su vuelo y adaptamos la hora de recogida a la hora real de aterrizaje. Tiempo de espera incluido: {waiting}.",
        { h3: "Actividades" },
        "Los participantes deben respetar las instrucciones de seguridad de los monitores. Algunas actividades (quad, buggy, globo, parapente, moto de agua…) tienen condiciones de edad, salud o meteorología, que se indican en el presupuesto. Con mal tiempo, la actividad puede aplazarse o cancelarse por su seguridad.",
        { h3: "Ley aplicable" },
        "Estas condiciones se rigen por el derecho marroquí. En caso de litigio se buscará primero una solución amistosa; en su defecto, serán competentes los tribunales de Marrakech."
      ]}
    ]
  }
};

if (typeof module !== "undefined") module.exports = { LEGAL_INFO: LEGAL_INFO, LEGAL_TEXT: LEGAL_TEXT };
