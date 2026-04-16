--
-- PostgreSQL database dump
--

\restrict 27bKJd22LMsXy1WUXB5J5OBrkgHIJT7kCXzJ6GRAF0oURgG7f4XpogKedWYs3Jv

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: PlaceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlaceStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."PlaceStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'SUPERADMIN',
    'OWNER'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    full_name text,
    phone text,
    password_hash text NOT NULL,
    role public."Role" DEFAULT 'OWNER'::public."Role" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    must_change_password boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: amenities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.amenities (
    id integer NOT NULL,
    slug text NOT NULL,
    name_es text NOT NULL,
    name_en text NOT NULL,
    "group" text
);


ALTER TABLE public.amenities OWNER TO postgres;

--
-- Name: amenities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.amenities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.amenities_id_seq OWNER TO postgres;

--
-- Name: amenities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.amenities_id_seq OWNED BY public.amenities.id;


--
-- Name: category_amenities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_amenities (
    category_id integer NOT NULL,
    amenity_id integer NOT NULL
);


ALTER TABLE public.category_amenities OWNER TO postgres;

--
-- Name: place_amenities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place_amenities (
    place_id integer NOT NULL,
    amenity_id integer NOT NULL
);


ALTER TABLE public.place_amenities OWNER TO postgres;

--
-- Name: place_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place_images (
    id integer NOT NULL,
    place_id integer NOT NULL,
    image_url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.place_images OWNER TO postgres;

--
-- Name: place_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.place_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.place_images_id_seq OWNER TO postgres;

--
-- Name: place_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.place_images_id_seq OWNED BY public.place_images.id;


--
-- Name: place_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place_translations (
    id integer NOT NULL,
    place_id integer NOT NULL,
    language_code text NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.place_translations OWNER TO postgres;

--
-- Name: place_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.place_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.place_translations_id_seq OWNER TO postgres;

--
-- Name: place_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.place_translations_id_seq OWNED BY public.place_translations.id;


--
-- Name: places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.places (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    phone text,
    whatsapp text,
    website_url text,
    social_url text,
    icon text,
    is_active boolean DEFAULT true NOT NULL,
    accommodation_type text,
    cancellation_policy text,
    house_rules text,
    stars integer DEFAULT 0 NOT NULL,
    best_time text,
    estimated_duration text,
    opening_hours text,
    price_adult double precision DEFAULT 0 NOT NULL,
    price_child double precision DEFAULT 0 NOT NULL,
    price_local double precision DEFAULT 0 NOT NULL,
    slogan text,
    featured_dish text,
    menu_url text,
    price_range integer DEFAULT 1 NOT NULL,
    address text,
    capacity integer DEFAULT 0 NOT NULL,
    delivery boolean DEFAULT false NOT NULL,
    pickup boolean DEFAULT false NOT NULL,
    requires_reservation boolean DEFAULT false NOT NULL,
    stay_time text,
    status public."PlaceStatus" DEFAULT 'PENDING'::public."PlaceStatus" NOT NULL,
    cuisine text
);


ALTER TABLE public.places OWNER TO postgres;

--
-- Name: places_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.places_id_seq OWNER TO postgres;

--
-- Name: places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.places_id_seq OWNED BY public.places.id;


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: amenities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amenities ALTER COLUMN id SET DEFAULT nextval('public.amenities_id_seq'::regclass);


--
-- Name: place_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_images ALTER COLUMN id SET DEFAULT nextval('public.place_images_id_seq'::regclass);


--
-- Name: place_translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_translations ALTER COLUMN id SET DEFAULT nextval('public.place_translations_id_seq'::regclass);


--
-- Name: places id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places ALTER COLUMN id SET DEFAULT nextval('public.places_id_seq'::regclass);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, slug) FROM stdin;
1	hotel
2	restaurant
3	tourist_spot
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, full_name, phone, password_hash, role, is_active, must_change_password, created_at) FROM stdin;
1	admin@travelyx.com	Super Admin	\N	$2b$10$zmNpmpC.jRQB/FT6YYs0buawWZvxwGEqwQvTLgkOAtQPaBzFncgCu	SUPERADMIN	t	f	2026-04-06 18:13:32.265
13	mmmarxcan@gmail.com	Brayan Alejandro 	123556	$2b$10$Bm/x8koza6/9tR1icTr77.5ZdcvOntuR6elDL53XkssWC.mAE2Iqy	OWNER	t	f	2026-04-06 19:25:54.694
14	algo@gmail.com	ejemplo	885356346	$2b$10$giwIrQCrckI4swBiQroA/OJanidy7vzioYvQBzsgzm28DYFnhhi9i	OWNER	t	f	2026-04-06 19:28:34.68
\.


--
-- Data for Name: amenities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.amenities (id, slug, name_es, name_en, "group") FROM stdin;
4	ac	Aire Acondicionado	Air Conditioning	\N
7	reservations	Reservaciones	Reservations	\N
8	alcohol	Venta de Alcohol	Alcohol	\N
11	tours	Tours Guiados	Guided Tours	\N
13	high_speed_wifi	Internet de Alta Velocidad	High-speed Internet	Conectividad
14	workspace	Zona de Trabajo	Work Zone	Conectividad
18	jacuzzi	Jacuzzi	Jacuzzi	Bienestar
19	restaurant	Restaurante Propio	On-site Restaurant	Alimentación
20	bar	Bar	Bar	Alimentación
22	cafeteria	Cafetería	Cafetería	Alimentación
24	airport_shuttle	Traslado al Aeropuerto	Airport Transfer	Logística
25	reception_24h	Recepción 24h	24h Reception	Logística
28	no_smoking	Prohibido Fumar	No Smoking	Extras
2	wifi	Wi-Fi Gratis	Free Wi-Fi	Servicios
3	parking	Estacionamiento	Parking	Servicios
1	pool	Piscina	Swimming Pool	Bienestar
16	gym	Gimnasio	Gym	Bienestar
17	spa	Spa	Spa	Bienestar
21	breakfast	Desayuno Incluido	Breakfast Included	Hospedaje
38	live_music	Música en Vivo	Live Music	Ambiente
39	romantic	Ambiente Romántico	Romantic	Ambiente
5	terrace	Terraza / Exterior	Terrace	Ambiente
6	vegan	Opción Vegana	Vegan Option	Dieta
42	gluten_free	Menú Sin Gluten	Gluten Free	Dieta
43	liquor_bar	Barra de Licores	Liquor Bar	Bebidas
45	hiking	Senderismo	Hiking	Turismo
46	photo_spot	Zona de Fotos	Photo Spot	Turismo
47	signage	Señalización Informativa	Signage	Servicios
48	no_flash	Sin Flash	No Flash	Reglas
49	wifi_free	Wi-Fi Gratis	Free Wi-Fi	Conectividad
50	parking_free	Estacionamiento Gratis	Free Parking	Logística
10	accessibility	Accesibilidad Motriz	Wheelchair Accessible	Servicios
9	pet_friendly	Pet Friendly	Pet Friendly	Ambiente
53	clean_point	Punto de Reciclaje	Recycling Point	Sostenibilidad
54	pool_rooftop	Alberca en Rooftop	Rooftop Pool	Bienestar
55	gym_24h	Gimnasio 24/7	24/7 Gym	Bienestar
56	spa_full	Spa & Masajes	Spa & Massage	Bienestar
57	jacuzzi_priv	Jacuzzi Privado	Private Jacuzzi	Bienestar
37	room_service	Servicio al Cuarto	Room Service	Servicios
59	breakfast_buff	Desayuno Buffet	Buffet Breakfast	Alimentación
60	shuttle_airport	Traslado al Aeropuerto	Airport Shuttle	Logística
61	coworking_area	Zona de Coworking	Coworking Space	Conectividad
62	adults_only	Solo Adultos	Adults Only	Ambiente
63	kids_club_hotel	Kids Club	Kids Club	Servicios
64	live_music_res	Música en Vivo	Live Music	Ambiente
65	ocean_view	Vista al Mar	Ocean View	Ambiente
66	romantic_vibes	Cena Romántica	Romantic Dinner	Ambiente
67	terrace_outdoor	Terraza al Aire Libre	Outdoor Terrace	Ambiente
68	valet_parking	Valet Parking	Valet Parking	Logística
69	vegan_options	Opciones Veganas	Vegan Options	Dieta
70	gluten_free_res	Platillos Sin Gluten	Gluten Free	Dieta
71	wine_cellar_res	Cava de Vinos	Wine Cellar	Bebidas
72	craft_beer	Cerveza Artesanal	Craft Beer	Bebidas
73	bar_mixology	Coctelería de Autor	Signature Cocktails	Bebidas
74	kids_area_res	Área Infantil	Kids Area	Servicios
75	sports_tv	Transmisión de Deportes	Sports TV	Ambiente
44	guided_tours	Tours Guiados	Guided Tours	Experiencia
77	hiking_trails	Senderos / Caminata	Hiking Trails	Experiencia
78	birdwatching	Avistamiento de Aves	Birdwatching	Experiencia
79	mangrove_tour	Tour en Manglares	Mangrove Tour	Experiencia
80	photo_spot_3	Punto para Fotos	Photo Spot	Experiencia
81	visitor_center	Centro de Visitantes	Visitor Center	Instalaciones
82	restrooms_pub	Baños Públicos	Public Restrooms	Instalaciones
83	hydration_point	Zona de Hidratación	Hydration Station	Instalaciones
84	signage_info	Señalización Informativa	Info Signage	Instalaciones
85	lockers_safe	Lockers / Casilleros	Lockers	Servicios
86	no_plastic_zone	Zona Libre de Plástico	Plastic Free	Sostenibilidad
87	protected_area	Área Protegida	Protected Area	Sostenibilidad
88	night_show	Show Nocturno / Luces	Night Show	Experiencia
\.


--
-- Data for Name: category_amenities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category_amenities (category_id, amenity_id) FROM stdin;
1	2
2	2
3	2
1	3
2	3
3	3
1	1
1	16
1	17
1	21
2	38
2	39
2	5
2	6
2	42
2	43
3	45
3	46
3	47
3	48
1	49
2	49
3	49
1	50
2	50
3	50
1	10
2	10
3	10
1	9
2	9
3	9
1	53
2	53
3	53
1	54
1	55
1	56
1	57
1	37
1	59
1	60
1	61
1	62
1	63
2	64
2	65
2	66
2	67
2	68
2	69
2	70
2	71
2	72
2	73
2	74
2	75
3	44
3	77
3	78
3	79
3	80
3	81
3	82
3	83
3	84
3	85
3	86
3	87
3	88
\.


--
-- Data for Name: place_amenities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place_amenities (place_id, amenity_id) FROM stdin;
\.


--
-- Data for Name: place_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place_images (id, place_id, image_url, sort_order) FROM stdin;
\.


--
-- Data for Name: place_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place_translations (id, place_id, language_code, description) FROM stdin;
91	45	es	Monumento emblemático que rinde homenaje al fundador del puerto de Progreso. Punto de inicio del Malecón Tradicional y referencia histórica imprescindible para conocer la identidad del puerto.
92	46	es	Espacio público frente al mar con áreas de descanso, bancas y jardinería. Ideal para sentarse a contemplar el atardecer sobre el Golfo de México y el imponente muelle de Progreso.
93	47	es	El parador fotográfico más popular del puerto. Las letras tridimensionales de Progreso con fondo del mar son el recuerdo obligatorio de cualquier visita al malecón.
94	48	es	Museo interactivo de clase mundial dedicado al impacto del asteroide Chicxulub en las costas de Yucatán y su papel en la extinción de los dinosaurios. Exhibiciones inmersivas, fósiles reales y tecnología de realidad aumentada.
95	49	es	Joya arquitectónica de principios del siglo XX cuya singular forma escalonada recuerda a un pastel de bodas. Símbolo del glamour veraniego de la élite meridana y uno de los edificios históricos más fotografiados de la costa yucateca.
96	50	es	Muelle de madera que conecta el Malecón Tradicional con el Internacional. Su tono oscuro le dio el apodo popular "Muelle de Chocolate". Perfecto para caminar al atardecer y tomar fotografías con vista al muelle de cruceros más largo del mundo.
97	51	es	Hotel familiar con ambiente tranquilo y cercano al malecón. Habitaciones cómodas y servicio atento, ideal para familias que buscan disfrutar de las playas de Progreso sin gastar de más.
98	52	es	Modernas suites directamente frente al mar con balcón privado y vista panorámica al Golfo de México. Incluye desayuno continental, acceso a la playa y servicio de cuartos. Ubicación privilegiada en el corazón del malecón.
99	53	es	Hotel boutique inaugurado en 2022 en un icónico edificio remodelado del malecón. Diseño mediterráneo con alberca infinita, habitaciones únicas con vista al mar y acceso directo a la playa. Considerado uno de los mejores hoteles de la costa yucateca.
100	54	es	Una institución del malecón de Progreso desde 1985. Famoso por sus botanas yucatecas de cortesía al pedir bebidas: ceviches, calamares, pescaditos fritos y más. Imprescindible para vivir la experiencia auténtica del puerto frente al mar.
101	55	es	El restaurante más legendario del malecón de Progreso, fundado en 1991 por el chef Saint Bonnet. Especialidad en cocina de mariscos con toques franceses: ceviche de pulpo, filete relleno de mariscos y langosta. Una experiencia gastronómica imprescindible.
102	56	es	Restaurante-bar con estilo náutico a pie del malecón. Especialistas en mariscos del Golfo: ceviches, aguachiles, filete zarandeado y combinados de mariscos. Un favorito entre los pescadores locales y turistas que buscan sabor auténtico.
103	57	es	Restaurante de cocina de mar con terrraza frente al océano. Se distingue por su selección diaria de mariscos ultrafresco del Golfo de México, preparados de forma tradicional yucateca con el toque de las recetas de la abuela.
104	58	es	Beach club con estética estilo Tulum, pequeña alberca en el centro del restaurante y vista al mar. Famoso por sus camarones al coco, tostadas de ceviche y cocteles refrescantes. Perfecto para un día de playa relajado con buena vibra.
105	59	es	Concepto gastronómico "Eco Chic" considerado uno de los mejores restaurantes del malecón. Ofrece cocina de autor con productos del mar: langosta, pulpo, ceviches y parrilla premium. Terraza abierta con brisas del Golfo e impresionantes atardeceres.
106	60	es	Amplio restaurante de "Cocina de Mar" con terraza frente al Golfo y palapas a pie de playa. Menú extenso desde desayunos hasta cenas: cebiches, pescado sarandeado, molcajetes y cocteles. Uno de los favoritos para grupos grandes en el malecón.
107	61	es	Marisquería con palapa y vista al mar, reconocida por la frescura de sus ingredientes y la generosidad de sus porciones. Desde el desayuno con mariscadas hasta la cena, el sabor casero de Chichí es un secreto a voces en el puerto.
108	62	es	El restaurante boutique del Hotel Scappata: fusión mediterránea, italiana y de mariscos en un ambiente elegante frente al mar. Sus pizzas al horno de leña, risottos y carpaccios de pulpo son los favoritos de la crítica gastronómica yucateca.
109	63	es	Restaurante-café de playa con vista al Golfo y camastros incluidos para los comensales. Ambiente relajado con música lo-fi y brisa marina. Famoso por sus desayunos gourmet, acai bowls y brunchs de fin de semana. El spot perfecto para quien busca calidad y tranquilidad.
110	64	es	Auténtica taquería de inspiración oaxaqueña en pleno boulevard del malecón. Famosa por sus huaraches, tlayudas, queso fundido y tacos al pastor con ingredientes traídos directamente de Oaxaca. Un festín de sabores del sur de México a buen precio.
111	65	es	Sucursal de la reconocida cadena de pizzerías yucatecas. Masa casera crujiente con ingredientes frescos, disponible en versiones clásicas y especiales de la casa. También ofrece pastas, baguettes y ensaladas. Con servicio a domicilio.
112	66	es	Restaurante familiar con cocina yucateca y de mariscos en el corazón del centro de Progreso. Sazón casero y ambiente acogedor para disfrutar de platos típicos de la región como el poc chuc, tikin xic y cochinita pibil.
113	53	en	Boutique hotel opened in 2022 in an iconic refurbished building on the boardwalk. Mediterranean design with infinity pool, unique rooms with sea views and direct access to the beach. Considered one of the best hotels on the Yucatecan coast.
114	55	en	The most legendary restaurant on the Malecon de Progreso, founded in 1991 by chef Saint Bonnet. Specializing in seafood cuisine with French touches: octopus ceviche, fillet stuffed with seafood and lobster. An unmissable dining experience.
115	47	en	The most popular photo stop in the port. The three-dimensional letters of Progreso con fondo del mar are the obligatory souvenir of any visit to the boardwalk.
116	60	en	Spacious restaurant "Cocina de Mar" with a terrace facing the Gulf and palapas on the beach. Extensive menu from breakfasts to dinners: ceviches, sarandeado fish, molcajetes and cocktails. One of the favorites for large groups on the boardwalk.
117	46	en	Public space facing the sea with rest areas, benches and gardening. Ideal to sit and watch the sunset over the Gulf of Mexico and the imposing Progreso pier.
118	45	en	Iconic monument that pays tribute to the founder of the port of Progreso. Starting point of the Traditional Malecon and essential historical reference to know the identity of the port.
119	52	en	Modern suites directly facing the sea with private balconies and panoramic views of the Gulf of Mexico. Includes continental breakfast, beach access and room service. Privileged location in the heart of the boardwalk.
120	51	en	Family hotel with a quiet atmosphere and close to the boardwalk. Comfortable rooms and attentive service, ideal for families looking to enjoy the beaches of Progreso without overspending.
121	62	en	The boutique restaurant of the Hotel Scappata: Mediterranean, Italian and seafood fusion in an elegant atmosphere facing the sea. Its wood-burning pizzas, risottos, and octopus carpaccios are favorites of Yucatecan food critics.
122	61	en	Seafood with palapa and sea view, renowned for the freshness of its ingredients and the generosity of its portions. From breakfast with seafood to dinner, the homemade flavor of Chichí is an open secret in the port.
123	64	en	Authentic taqueria of Oaxacan inspiration on the boulevard of the Malecon. Famous for its huaraches, tlayudas, melted cheese and tacos al pastor with ingredients brought directly from Oaxaca. A feast of flavours from southern Mexico at a good price.
124	66	en	Family restaurant with Yucatecan and seafood cuisine in the heart of downtown Progreso. Homemade seasoning and cozy atmosphere to enjoy typical dishes of the region such as poc chuc, tikin xic and cochinita pibil.
125	58	en	Beach club with Tulum style aesthetics, small pool in the center of the restaurant and sea view. Famous for its coconut shrimp, ceviche toast and refreshing cocktails. Perfect for a relaxed beach day with good vibes.
126	65	en	Branch of the renowned chain of Yucatecan pizzerias. Crispy homemade dough with fresh ingredients, available in classic and special versions of the house. It also offers pastas, baguettes, and salads. With home delivery service.
127	54	en	An institution on the Malecón de Progreso since 1985. Famous for its complimentary Yucatecan snacks when ordering drinks: ceviches, squid, fried fish and more. Essential to live the authentic experience of the port facing the sea.
128	49	en	Architectural jewel of the early twentieth century whose unique stepped shape resembles a wedding cake. Symbol of the summer glamour of the southern elite and one of the most photographed historic buildings on the Yucatecan coast.
129	63	en	Restaurant and beach cafe with views of the Gulf and bunk beds included for diners. Relaxed atmosphere with lo-fi music and sea breeze. Famous for its gourmet breakfasts, acai bowls and weekend brunches. The perfect spot for those looking for quality and tranquility.
130	56	en	Restaurant-bar with nautical style at the foot of the boardwalk. Gulf seafood specialists: ceviches, aguachiles, shaken steak and seafood blends. A favorite among local fishermen and tourists looking for authentic flavor.
131	48	en	World-class interactive museum dedicated to the impact of the asteroid Chicxulub off the coast of Yucatan and its role in the extinction of the dinosaurs. Immersive exhibits, real fossils and augmented reality technology.
132	50	en	Wooden dock that connects the Traditional Malecón with the Internacional. Its dark tone gave it the popular nickname “Chocolate Pier.” Perfect for walking at sunset and taking pictures overlooking the longest cruise ship dock in the world.
133	57	en	Seafood restaurant with an oceanfront terrace. It is distinguished by its daily selection of ultra-fresh seafood from the Gulf of Mexico, prepared in a traditional Yucatecan way with the touch of grandmother's recipes.
134	59	en	"Eco Chic" gastronomic concept considered one of the best restaurants on the boardwalk. It offers signature cuisine with seafood: lobster, octopus, ceviches and premium grill. Open terrace with Gulf breezes and stunning sunsets.
\.


--
-- Data for Name: places; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.places (id, owner_id, category_id, name, lat, lng, phone, whatsapp, website_url, social_url, icon, is_active, accommodation_type, cancellation_policy, house_rules, stars, best_time, estimated_duration, opening_hours, price_adult, price_child, price_local, slogan, featured_dish, menu_url, price_range, address, capacity, delivery, pickup, requires_reservation, stay_time, status, cuisine) FROM stdin;
45	14	3	Estatua de Juan Miguel Castro	21.2879	-89.664	\N	\N	\N	\N	🗿	t	\N	\N	\N	0	\N	\N	Abierto 24hs	0	0	0	\N	\N	\N	1	Calle 19 x 80, Malecón Tradicional, Progreso	0	f	f	f	\N	APPROVED	\N
46	14	3	Parque de la Paz (Malecón)	21.2883	-89.66	\N	\N	\N	\N	🌿	t	\N	\N	\N	0	\N	\N	Abierto 24hs	0	0	0	\N	\N	\N	1	Calle 71, Boulevard Turístico Malecón, Progreso	0	f	f	f	\N	APPROVED	\N
47	14	3	Letras de Progreso (Parador Fotográfico)	21.2885	-89.6576	\N	\N	\N	\N	📷	t	\N	\N	\N	0	\N	\N	Abierto 24hs	0	0	0	\N	\N	\N	1	Calle 19 x 72, Boulevard Turístico Malecón, Progreso	0	f	f	f	\N	APPROVED	\N
48	14	3	Museo del Meteorito "El Origen"	21.28845	-89.6574	\N	\N	\N	\N	☄️	t	\N	\N	\N	0	\N	1.5 Horas	Lun–Dom: 10:00 AM – 7:00 PM	200	100	0	\N	\N	\N	1	Calle 19 x 68-70, Boulevard Turístico Malecón, Progreso	0	f	f	f	\N	APPROVED	\N
49	14	3	La Casa del Pastel	21.28874	-89.652	\N	\N	\N	\N	🍰	t	\N	\N	\N	0	\N	\N	Abierto 24hs (exterior)	0	0	0	\N	\N	\N	1	Calle 19 x 60, Playa Progreso, Progreso	0	f	f	f	\N	APPROVED	\N
50	14	3	Muelle de Chocolate	21.2891	-89.6661	\N	\N	\N	\N	🍫	t	\N	\N	\N	0	\N	\N	Abierto 24hs	0	0	0	\N	\N	\N	1	Final del Malecón Internacional, Progreso	0	f	f	f	\N	APPROVED	\N
51	14	1	Hotel Playa Linda	21.2876	-89.6613	+52 969 935 0222	\N	\N	\N	🏨	t	Hotel Familiar	\N	\N	2	\N	\N	Recepción 24hs	0	0	0	A pasos del mar	\N	\N	1	Calle 76 x 19 y 21, Centro, Progreso	0	f	f	f	\N	APPROVED	\N
52	14	1	Hotel & Suites Domani	21.2884	-89.6576	+52 969 935 0800	\N	https://hoteldomani.com	\N	🌊	t	Hotel de Playa	\N	\N	3	\N	\N	Recepción 24hs	0	0	0	Despierte frente al mar	\N	\N	2	C. 19 #144 F, entre 72 y 74, frente al mar, Centro, Progreso	0	f	f	f	\N	APPROVED	\N
53	14	1	Hotel Scappata	21.28855	-89.6545	\N	\N	https://hotelscappata.com	\N	🏛️	t	Hotel Boutique	Cancelación gratuita hasta 48h antes	\N	4	\N	\N	Recepción 24hs	0	0	0	Lujo mediterráneo frente al mar	\N	\N	3	C. 19, Boulevard Turístico Malecón, Progreso	0	f	f	f	\N	APPROVED	\N
54	14	2	Eladio's Bar & Restaurant	21.28775	-89.6639	+52 969 935 0102	\N	\N	\N	🍺	t	\N	\N	\N	0	\N	\N	Lun–Dom: 9:00 AM – 11:00 PM	0	0	0	El clásico con botanas ilimitadas	Botanas Yucatecas + Margaritas	\N	1	Calle 80 & 19, Colonia Centro, Progreso	200	f	f	f	\N	APPROVED	yucatecan
55	14	2	Le Saint Bonnet	21.288	-89.6621	+52 969 935 0174	\N	https://lesaintbonnet.com	\N	🦞	t	\N	\N	\N	0	\N	\N	Lun–Dom: 1:00 PM – 10:00 PM	0	0	0	Alta cocina frente al muelle desde 1991	Pescado relleno de mariscos	\N	3	Calle 19 #150-DK, entre 78 y 80, Centro, Progreso	80	f	f	t	\N	APPROVED	seafood
56	14	2	El Marinero Restaurant Bar	21.2881	-89.6613	\N	\N	\N	\N	⚓	t	\N	\N	\N	0	\N	\N	Lun–Dom: 8:00 AM – 10:00 PM	0	0	0	\N	Ceviche de pulpo y camarones al coco	\N	2	C. 76 #123A, Boulevard Turístico Malecón, Progreso	100	f	f	f	\N	APPROVED	seafood
57	14	2	Altavela Seafood	21.288	-89.6601	\N	\N	\N	\N	🌊	t	\N	\N	\N	0	\N	\N	Lun–Dom: 9:00 AM – 9:00 PM	0	0	0	\N	Mariscos frescos del Golfo	\N	2	Calle 19 #50C x 74 y 76, Centro, Progreso	0	f	f	f	\N	APPROVED	seafood
58	14	2	Mayaka Sea Food & Snacks	21.2884	-89.6596	\N	\N	\N	\N	🥥	t	\N	\N	\N	0	\N	\N	Lun–Dom: 9:00 AM – 9:00 PM	0	0	0	\N	Camarones al coco + ceviche mixto	\N	2	C. 19 #150, Centro, Progreso	70	f	f	f	\N	APPROVED	seafood
59	14	2	Almadía Progreso	21.2884	-89.6584	\N	\N	https://almadia.mx	\N	⛵	t	\N	\N	\N	0	\N	\N	Lun–Dom: 8:00 AM – 11:00 PM	0	0	0	Eco Chic frente al mar	Pulpo a la yucateca + Tacos de langosta	\N	3	C. 19 #138, Boulevard Turístico Malecón, Progreso	150	f	f	t	\N	APPROVED	seafood
60	14	2	Mobula	21.28845	-89.6582	\N	\N	\N	\N	🐟	t	\N	\N	\N	0	\N	\N	Lun–Dom: 8:00 AM – 12:00 AM	0	0	0	\N	Arroz con mariscos + Pescado del día	\N	2	Boulevard Turístico Malecón, Progreso	180	f	f	f	\N	APPROVED	seafood
61	14	2	Los Mariscos de Chichí	21.28843	-89.6578	+52 999 994 1607	\N	\N	\N	🦐	t	\N	\N	\N	0	\N	\N	Lun–Dom: 8:00 AM – 11:00 PM	0	0	0	\N	Aguachile negro + Ceviche de pulpo	\N	2	C. 19 #144D, Centro, Progreso	90	f	f	f	\N	APPROVED	seafood
62	14	2	Restaurante Scappata Casa Di Mare	21.28853	-89.65455	\N	\N	https://hotelscappata.com	\N	🍕	t	\N	\N	\N	0	\N	\N	Lun–Dom: 7:00 AM – 11:00 PM	0	0	0	\N	Pizza al horno de leña + Pasta con mariscos	\N	3	C. 19, Boulevard Turístico Malecón, Progreso	100	f	f	t	\N	APPROVED	italian
63	14	2	Toast and Coast	21.28848	-89.6569	\N	\N	\N	\N	🥂	t	\N	\N	\N	0	\N	\N	Lun–Dom: 8:00 AM – 9:00 PM	0	0	0	\N	Desayunos gourmet + Fish & Chips	\N	2	C. 19 #142, entre 68 y 70, Boulevard Turístico Malecón, Progreso	60	f	f	f	\N	APPROVED	breakfast
64	14	2	MIXE Taquería Oaxaca Progreso	21.2883	-89.66045	\N	\N	\N	\N	🌮	t	\N	\N	\N	0	\N	\N	Lun–Dom: 9:00 AM – 1:00 AM	0	0	0	\N	Huaraches con chorizo + Tacos al pastor	\N	1	C. 71 #1687, Boulevard Turístico Malecón, Progreso	50	f	f	f	\N	APPROVED	mexican
65	14	2	Messina's Pizza	21.2882	-89.6602	\N	\N	\N	\N	🍕	t	\N	\N	\N	0	\N	\N	Lun–Dom: 12:00 PM – 11:00 PM	0	0	0	\N	Pizzas artesanales	\N	1	C. 71 #5, Boulevard Turístico Malecón, Progreso	0	t	f	f	\N	APPROVED	italian
66	14	2	RESTAURANTE TOMMY'S	21.28823	-89.656	\N	\N	\N	\N	🍽️	t	\N	\N	\N	0	\N	\N	Lun–Dom: 10:00 AM – 10:00 PM	0	0	0	\N	\N	\N	2	Calle 69 #150, Centro, Progreso	0	f	f	f	\N	APPROVED	yucatecan
\.


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Category_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 14, true);


--
-- Name: amenities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.amenities_id_seq', 88, true);


--
-- Name: place_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.place_images_id_seq', 1, false);


--
-- Name: place_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.place_translations_id_seq', 134, true);


--
-- Name: places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.places_id_seq', 66, true);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: amenities amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amenities
    ADD CONSTRAINT amenities_pkey PRIMARY KEY (id);


--
-- Name: category_amenities category_amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_amenities
    ADD CONSTRAINT category_amenities_pkey PRIMARY KEY (category_id, amenity_id);


--
-- Name: place_amenities place_amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_amenities
    ADD CONSTRAINT place_amenities_pkey PRIMARY KEY (place_id, amenity_id);


--
-- Name: place_images place_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_images
    ADD CONSTRAINT place_images_pkey PRIMARY KEY (id);


--
-- Name: place_translations place_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_translations
    ADD CONSTRAINT place_translations_pkey PRIMARY KEY (id);


--
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: amenities_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX amenities_slug_key ON public.amenities USING btree (slug);


--
-- Name: place_translations_place_id_language_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX place_translations_place_id_language_code_key ON public.place_translations USING btree (place_id, language_code);


--
-- Name: category_amenities category_amenities_amenity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_amenities
    ADD CONSTRAINT category_amenities_amenity_id_fkey FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: category_amenities category_amenities_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_amenities
    ADD CONSTRAINT category_amenities_category_id_fkey FOREIGN KEY (category_id) REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: place_amenities place_amenities_amenity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_amenities
    ADD CONSTRAINT place_amenities_amenity_id_fkey FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: place_amenities place_amenities_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_amenities
    ADD CONSTRAINT place_amenities_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: place_images place_images_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_images
    ADD CONSTRAINT place_images_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: place_translations place_translations_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_translations
    ADD CONSTRAINT place_translations_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: places places_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_category_id_fkey FOREIGN KEY (category_id) REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: places places_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 27bKJd22LMsXy1WUXB5J5OBrkgHIJT7kCXzJ6GRAF0oURgG7f4XpogKedWYs3Jv

