import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navbar
    select_branch: "Select Branch",
    login: "Login",
    sign_up: "Sign Up",
    my_profile: "My Profile",
    my_orders: "My Orders",
    settings: "Settings",
    logout: "Logout",
    search_placeholder: "Ask Simba AI: 'I need breakfast items'...",
    
    // Home
    show_filters: "Show Filters",
    hide_filters: "Hide Filters",
    active_filters: "Active Filters:",
    clear_all: "Clear All",
    filters_title: "Filters",
    price_range: "Price Range (RWF)",
    categories: "Categories",
    show_more: "Show More",
    show_less: "Show Less",
    hero_badge: "Rwanda's No. 1 Supermarket",
    hero_title_1: "Freshness",
    hero_title_2: "Delivered",
    hero_description: "A testament to Rwanda's economic resurgence, meeting all your daily needs—from fresh food to furniture and beyond.",
    shop_now: "Shop Now",
    results_for: "Results for your selection",
    view_all: "View All",
    no_matches: "No matches found",
    no_matches_desc: "Try adjusting your filters or search terms to find what you're looking for.",
    select_branch_reminder: "Please select a branch to see real-time stock levels and place orders.",

    // Footer
    footer_desc: "Rwanda's leading online supermarket. Fresh products delivered to your doorstep.",
    shop: "Shop",
    support: "Support",
    stay_updated: "Stay Updated",
    newsletter_desc: "Subscribe to our newsletter for latest offers.",
    all_rights: "All rights reserved.",
    groceries: "Groceries",
    electronics: "Electronics",
    home_kitchen: "Home & Kitchen",
    personal_care: "Personal Care",
    contact_us: "Contact Us",
    faqs: "FAQs",
    shipping_policy: "Shipping Policy",
    returns: "Returns",

    // ProductCard
    out_of_stock: "Out of Stock",
    only_left: "Only {stock} Left",
    in_stock: "In Stock",
    add_to_cart: "Add to Cart",

    // Cart
    cart_title: "My Cart",
    your_cart: "Your Cart",
    empty_cart: "Your cart is empty",
    empty_cart_desc: "Looks like you haven't added anything to your cart yet. Explore our products and find something you love!",
    total: "Total",
    checkout: "Checkout",
    subtotal: "Subtotal",
    summary: "Order Summary",
    continue_shopping: "Continue Shopping",
    remove: "Remove",
    delivery_fee: "Delivery Fee",
    free: "FREE",
    proceed_to_checkout: "Proceed to Checkout",
    secure_checkout_badge: "Secure Checkout powered by Simba",
    start_shopping: "Start Shopping",

    // Checkout
    secure_checkout: "Secure Checkout",
    select_pickup_location: "Select Pickup Location",
    where_collect: "Where will you collect your items?",
    choose_branch: "Choose a Simba branch",
    select_pickup_time: "Select Pickup Time",
    when_arriving: "When will you be arriving?",
    choose_time: "Choose a time slot",
    momo_deposit: "MoMo Deposit",
    secure_order_deposit: "Secure your order with a small deposit",
    deposit_desc: "To confirm your order, a refundable deposit of {amount} RWF is required. This prevents no-shows and ensures your items are ready when you arrive.",
    remaining_balance_desc: "Remaining balance is paid at the supermarket counter.",
    mtn_phone: "MTN Phone Number",
    grand_total: "Grand Total",
    pay_now: "Pay Now (Deposit)",
    pay_at_pickup: "Pay at Pickup",
    creating_order: "Creating your order...",
    connecting_momo: "Connecting to MoMo...",
    waiting_confirmation: "Waiting for confirmation...",
    confirm_prompt: "Please confirm the {amount} RWF prompt on your phone.",
    secure_pickup_badge: "Secure Pickup at Simba",
    fill_all_details: "Please fill in all pickup and payment details.",
    payment_failed: "Payment failed or was cancelled.",
    payment_timeout: "Payment timeout. Please check your MoMo app.",
    
    // Product Detail
    description: "Description",
    similar_products: "Similar Products",
    add_to_cart_btn: "Add to Cart",
    added_to_cart: "Added to Cart",
    back_to_shop: "Back to Shop",
    product_not_found: "Product Not Found",
    product_not_found_desc: "We couldn't find the product you're looking for. It might have been removed or the link is incorrect.",
    home: "Home",
    save_percent: "SAVE 20%",
    fast_delivery: "Fast Delivery",
    quality: "Quality",
    you_may_also_like: "You May Also Like",
    no_stock: "No Stock",
    select_branch_btn: "Select branch",

    // Category Page
    collection: "Collection",
    items_count: "{count} Items",
    under_5k: "Under 5k",
    clear_active_filters: "Clear Active Filters",

    // Auth
    login_title: "Login to Simba",
    register_title: "Join Simba Supermarket",
    email_label: "Email",
    password_label: "Password",
    full_name_label: "Full Name",
    account_type_label: "Account Type",
    assigned_branch_label: "Assigned Branch",
    logging_in: "Logging in...",
    creating_account: "Creating account...",
    dont_have_account: "Don't have an account?",
    already_have_account: "Already have an account?",
    register_here: "Register here",
    login_here: "Login here",
    back_to_home: "Back to Home",
    client_role: "Client (Shopper)",
    manager_role: "Branch Manager",
    staff_role: "Branch Staff",
    select_branch_placeholder: "Select your branch",
    forgot_password: "Forgot Password?",
    connect_with_google: "Connect with Google",
    reset_password_title: "Reset Your Password",
    send_reset_link: "Send Reset Link",
    back_to_login: "Back to Login",
    new_password_label: "New Password",
    confirm_password_label: "Confirm New Password",
    update_password: "Update Password",
    reset_link_sent: "Reset link sent to your email.",
    password_updated: "Password updated successfully!",
    
    // AI Chat
    ai_welcome: "Hello! I'm Simba AI. How can I help you find something today?",
    ai_thinking: "AI Thinking",
    recommended_items: "Recommended Items",
    type_message: "Type your message...",
    chat_with_ai: "Chat with Simba AI"
  },
  fr: {
    // Navbar
    select_branch: "Choisir une succursale",
    login: "Connexion",
    sign_up: "S'inscrire",
    my_profile: "Mon Profil",
    my_orders: "Mes Commandes",
    settings: "Paramètres",
    logout: "Déconnexion",
    search_placeholder: "Demandez à Simba AI: 'J'ai besoin d'articles de petit-déjeuner'...",

    // Home
    show_filters: "Afficher les filtres",
    hide_filters: "Masquer les filtres",
    active_filters: "Filtres actifs:",
    clear_all: "Tout effacer",
    filters_title: "Filtres",
    price_range: "Fourchette de prix (RWF)",
    categories: "Catégories",
    show_more: "Afficher plus",
    show_less: "Afficher moins",
    hero_badge: "Supermarché n°1 au Rwanda",
    hero_title_1: "Fraîcheur",
    hero_title_2: "Livrée",
    hero_description: "Un témoignage de la renaissance économique du Rwanda, répondant à tous vos besoins quotidiens—de la nourriture fraîche aux meubles et au-delà.",
    shop_now: "Acheter maintenant",
    results_for: "Résultats pour votre sélection",
    view_all: "Voir tout",
    no_matches: "Aucun résultat trouvé",
    no_matches_desc: "Essayez d'ajuster vos filtres ou vos termes de recherche pour trouver ce que vous cherchez.",
    select_branch_reminder: "Veuillez sélectionner une succursale pour voir les niveaux de stock en temps réel et passer des commandes.",

    // Footer
    footer_desc: "Le premier supermarché en ligne du Rwanda. Produits frais livrés à votre porte.",
    shop: "Boutique",
    support: "Support",
    stay_updated: "Restez à jour",
    newsletter_desc: "Inscrivez-vous à notre newsletter pour les dernières offres.",
    all_rights: "Tous droits réservés.",
    groceries: "Épicerie",
    electronics: "Électronique",
    home_kitchen: "Maison & Cuisine",
    personal_care: "Soins personnels",
    contact_us: "Contactez-nous",
    faqs: "FAQs",
    shipping_policy: "Politique d'expédition",
    returns: "Retours",

    // ProductCard
    out_of_stock: "En rupture de stock",
    only_left: "Plus que {stock} restants",
    in_stock: "En stock",
    add_to_cart: "Ajouter au panier",

    // Cart
    cart_title: "Mon Panier",
    your_cart: "Votre Panier",
    empty_cart: "Votre panier est vide",
    empty_cart_desc: "Il semble que vous n'ayez encore rien ajouté à votre panier. Explorez nos produits et trouvez quelque chose que vous aimez !",
    total: "Total",
    checkout: "Payer",
    subtotal: "Sous-total",
    summary: "Résumé de la commande",
    continue_shopping: "Continuer vos achats",
    remove: "Supprimer",
    delivery_fee: "Frais de livraison",
    free: "GRATUIT",
    proceed_to_checkout: "Passer à la caisse",
    secure_checkout_badge: "Paiement sécurisé par Simba",
    start_shopping: "Commencer vos achats",

    // Checkout
    secure_checkout: "Paiement Sécurisé",
    select_pickup_location: "Lieu de ramassage",
    where_collect: "Où allez-vous récupérer vos articles ?",
    choose_branch: "Choisissez une succursale Simba",
    select_pickup_time: "Heure de ramassage",
    when_arriving: "Quand allez-vous arriver ?",
    choose_time: "Choisissez un créneau horaire",
    momo_deposit: "Dépôt MoMo",
    secure_order_deposit: "Sécurisez votre commande avec un petit dépôt",
    deposit_desc: "Pour confirmer votre commande, un dépôt remboursable de {amount} RWF est requis. Cela évite les absences et garantit que vos articles sont prêts à votre arrivée.",
    remaining_balance_desc: "Le solde restant est payé au comptoir du supermarché.",
    mtn_phone: "Numéro de téléphone MTN",
    grand_total: "Total général",
    pay_now: "Payer maintenant (Dépôt)",
    pay_at_pickup: "Payer au ramassage",
    creating_order: "Création de votre commande...",
    connecting_momo: "Connexion à MoMo...",
    waiting_confirmation: "En attente de confirmation...",
    confirm_prompt: "Veuillez confirmer l'invite de {amount} RWF sur votre téléphone.",
    secure_pickup_badge: "Ramassage sécurisé chez Simba",
    fill_all_details: "Veuillez remplir tous les détails de ramassage et de paiement.",
    payment_failed: "Le paiement a échoué ou a été annulé.",
    payment_timeout: "Délai de paiement dépassé. Veuillez vérifier votre application MoMo.",

    // Product Detail
    description: "Description",
    similar_products: "Produits similaires",
    add_to_cart_btn: "Ajouter au panier",
    added_to_cart: "Ajouté au panier",
    back_to_shop: "Retour à la boutique",
    product_not_found: "Produit non trouvé",
    product_not_found_desc: "Nous n'avons pas pu trouver le produit que vous recherchez. Il a peut-être été supprimé ou le lien est incorrect.",
    home: "Accueil",
    save_percent: "ÉCONOMISEZ 20%",
    fast_delivery: "Livraison rapide",
    quality: "Qualité",
    you_may_also_like: "Vous aimerez peut-être aussi",
    no_stock: "Pas de stock",
    select_branch_btn: "Choisir une branche",

    // Category Page
    collection: "Collection",
    items_count: "{count} Articles",
    under_5k: "Moins de 5k",
    clear_active_filters: "Effacer les filtres actifs",

    // Auth
    login_title: "Connexion à Simba",
    register_title: "Rejoindre Simba Supermarket",
    email_label: "Email",
    password_label: "Mot de passe",
    full_name_label: "Nom complet",
    account_type_label: "Type de compte",
    assigned_branch_label: "Succursale assignée",
    logging_in: "Connexion en cours...",
    creating_account: "Création du compte...",
    dont_have_account: "Vous n'avez pas de compte ?",
    already_have_account: "Vous avez déjà un compte ?",
    register_here: "Inscrivez-vous ici",
    login_here: "Connectez-vous ici",
    back_to_home: "Retour à l'accueil",
    client_role: "Client (Acheteur)",
    manager_role: "Gérant de succursale",
    staff_role: "Personnel de succursale",
    select_branch_placeholder: "Sélectionnez votre succursale",
    forgot_password: "Mot de passe oublié ?",
    connect_with_google: "Se connecter avec Google",
    reset_password_title: "Réinitialiser votre mot de passe",
    send_reset_link: "Envoyer le lien",
    back_to_login: "Retour à la connexion",
    new_password_label: "Nouveau mot de passe",
    confirm_password_label: "Confirmer le mot de passe",
    update_password: "Mettre à jour",
    reset_link_sent: "Lien envoyé à votre adresse email.",
    password_updated: "Mot de passe mis à jour avec succès !",

    // AI Chat
    ai_welcome: "Bonjour ! Je suis Simba AI. Comment puis-je vous aider à trouver quelque chose aujourd'hui ?",
    ai_thinking: "Réflexion de l'IA",
    recommended_items: "Articles recommandés",
    type_message: "Tapez votre message...",
    chat_with_ai: "Discuter avec Simba AI"
  },
  kin: {
    // Navbar
    select_branch: "Hitamo Ishami",
    login: "Injira",
    sign_up: "Iyandikishe",
    my_profile: "Umwirondoro wanjye",
    my_orders: "Ibyo nategetse",
    settings: "Igenamiterere",
    logout: "Sohoka",
    search_placeholder: "Baza Simba AI: 'Nkeneye ibyo kurya by'igitondo'...",

    // Home
    show_filters: "Yerekana Utuyunguruzo",
    hide_filters: "Hisha Utuyunguruzo",
    active_filters: "Utuyunguruzo dukoreshwa:",
    clear_all: "Siba byose",
    filters_title: "Utuyunguruzo",
    price_range: "Ikiguzi (RWF)",
    categories: "Ibyiciro",
    show_more: "Yerekana ibindi",
    show_less: "Yerekana bike",
    hero_badge: "Supermarket ya mbere mu Rwanda",
    hero_title_1: "Ibiryo Bishya",
    hero_title_2: "Bikugezeho",
    hero_description: "Ikimenyetso cy'izahuka ry'ubukungu bw'u Rwanda, duhaza ibyo ukeneye byose buri munsi—kuva ku biryo bishya kugeza ku bikoresho byo munzu n'ibindi.",
    shop_now: "Gura ubu",
    results_for: "Ibisubizo by'ibyo wahisemo",
    view_all: "Reba byose",
    no_matches: "Nta bisubizo bibonetse",
    no_matches_desc: "Gerageza guhindura utuyunguruzo cyangwa ibyo ushakisha kugira ngo ubone icyo ukeneye.",
    select_branch_reminder: "Hitamo ishami kugira ngo urebe ibihari ubashe no kugura.",

    // Footer
    footer_desc: "Supermarket ya mbere ikorera kuri interineti mu Rwanda. Ibiryo bishya bikugezeho ku muryango.",
    shop: "Iduka",
    support: "Ubufasha",
    stay_updated: "Menya amakuru mashya",
    newsletter_desc: "Iyandikishe kugira ngo ubone amakuru y'inyungu nshya.",
    all_rights: "Uburenganzira bwose ni ubwacu.",
    groceries: "Ibiribwa",
    electronics: "Ibikoresho by'ikoranabuhanga",
    home_kitchen: "Ibikoresho byo mu rugo",
    personal_care: "Iby'isuku",
    contact_us: "Twandikire",
    faqs: "Ibibazo bikunze kubazwa",
    shipping_policy: "Amategeko yo kohereza",
    returns: "Ibisubizwa",

    // ProductCard
    out_of_stock: "Ntabihari",
    only_left: "Hasigaye {stock} gusa",
    in_stock: "Bihari",
    add_to_cart: "Shyira mu gitebo",

    // Cart
    cart_title: "Ibiri mu gitebo",
    your_cart: "Igitebo cyawe",
    empty_cart: "Igitebo cyawe ntakirimo",
    empty_cart_desc: "Urabona nta kintu na kimwe urashyira mu gitebo cyawe. Reba ibyo dufite uhitemo ibyo ukunda!",
    total: "Byose hamwe",
    checkout: "Ishyura",
    subtotal: "Igiciro mbumbe",
    summary: "Inshamake y'ibyo uze kugura",
    continue_shopping: "Komeza guhaha",
    remove: "Siba",
    delivery_fee: "Ikiguzi cyo kugezwaho ibintu",
    free: "BY'UBUNTU",
    proceed_to_checkout: "Jya kwishyura",
    secure_checkout_badge: "Kwishyura bifite umutekano na Simba",
    start_shopping: "Tangira guhaha",

    // Checkout
    secure_checkout: "Kwishyura Umutekano",
    select_pickup_location: "Hitamo aho uzafatira ibintu",
    where_collect: "Ni hehe uzafatira ibyo waguze?",
    choose_branch: "Hitamo ishami rya Simba",
    select_pickup_time: "Hitamo igihe uzafatira ibintu",
    when_arriving: "Uzaza ryari?",
    choose_time: "Hitamo isaha",
    momo_deposit: "Ingwate ya MoMo",
    secure_order_deposit: "Rinda ibyo wategetse utanga ingwate nshya",
    deposit_desc: "Kugira ngo wemeze ibyo wategetse, urasabwa gutanga ingwate y'amafaranga {amount} RWF asubizwa. Ibi bituma ibyo waguze biba biteguye igihe uziye.",
    remaining_balance_desc: "Ayasigaye yishyurirwa kuri supermarket uje gufata ibintu.",
    mtn_phone: "Nimero ya MTN",
    grand_total: "Igiciro cyose hamwe",
    pay_now: "Ishyura ubu (Ingwate)",
    pay_at_pickup: "Ishyura uje gufata ibintu",
    creating_order: "Turimo gutegura ibyo watumije...",
    connecting_momo: "Turimo guhura na MoMo...",
    waiting_confirmation: "Tegereze kwemeza...",
    confirm_prompt: "Emeza kwishyura {amount} RWF kuri terefone yawe.",
    secure_pickup_badge: "Gufata ibintu bifite umutekano muri Simba",
    fill_all_details: "Andika neza aho uzafatira n'uburyo bwo kwishyura.",
    payment_failed: "Kwishyura ntibyagenze neza cyangwa byahagaritswe.",
    payment_timeout: "Igihe cyo kwishyura cyarenze. Reba muri porogaramu ya MoMo.",

    // Product Detail
    description: "Ibisobanuro",
    similar_products: "Ibindi bisa n'ibi",
    add_to_cart_btn: "Shyira mu gitebo",
    added_to_cart: "Byashyizwe mu gitebo",
    back_to_shop: "Subira mu duka",
    product_not_found: "Igicuruzwa nticyabonetse",
    product_not_found_desc: "Ntitwashoboye kubona igicuruzwa ushaka. Gishobora kuba cyakuweho cyangwa imenyekanisha ririho ririmo amakosa.",
    home: "Ahabanza",
    save_percent: "GABANYIRIZWA 20%",
    fast_delivery: "Kugezwaho vuba",
    quality: "Ubwiza",
    you_may_also_like: "Ibindi washima",
    no_stock: "Ntabihari",
    select_branch_btn: "Hitamo ishami",

    // Category Page
    collection: "Ibyatoranyijwe",
    items_count: "Ibintu {count}",
    under_5k: "Munsi ya 5k",
    clear_active_filters: "Siba utuyunguruzo twose",

    // Auth
    login_title: "Injira muri Simba",
    register_title: "Iyandikishe muri Simba Supermarket",
    email_label: "Email",
    password_label: "Ijambo ry'ibanga",
    full_name_label: "Amazina yose",
    account_type_label: "Ubwoko bwa konti",
    assigned_branch_label: "Ishami ukoreramo",
    logging_in: "Turimo kwinjira...",
    creating_account: "Turimo gukora konti...",
    dont_have_account: "Nta konti ufite?",
    already_have_account: "Ufite konti umaze kuyikora?",
    register_here: "Iyandikishe hano",
    login_here: "Injira hano",
    back_to_home: "Subira ahabanza",
    client_role: "Umukiriya (Uguha)",
    manager_role: "Umuyobozi w'ishami",
    staff_role: "Umukozi w'ishami",
    select_branch_placeholder: "Hitamo ishami ryawe",
    forgot_password: "Waba wibagiwe ijambo ry'ibanga?",
    connect_with_google: "Koresha Google kwinjira",
    reset_password_title: "Hindura ijambo ry'ibanga",
    send_reset_link: "Ohereza aho guhindurira",
    back_to_login: "Subira ahabanza kwinjira",
    new_password_label: "Ijambo ry'ibanga rishya",
    confirm_password_label: "Emeza ijambo ry'ibanga",
    update_password: "Hindura ubu",
    reset_link_sent: "Ubutumwa bwo guhindura bwoherejwe kuri email yawe.",
    password_updated: "Ijambo ry'ibanga ryahindutse neza!",

    // AI Chat
    ai_welcome: "Muraho! Ndi Simba AI. Nagufasha ute kubona icyo ukeneye uyu munsi?",
    ai_thinking: "AI iri gutekereza",
    recommended_items: "Ibyo twaguhitiramo",
    type_message: "Andika ubutumwa...",
    chat_with_ai: "Ganira na Simba AI"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('simba_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('simba_lang', language);
  }, [language]);

  const t = (key) => {
    if (!translations[language]) {
      return translations['en'][key] || key;
    }
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
