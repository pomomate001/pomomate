-- 014_add_expanded_tags.sql
-- Idempotent migration to add new high-traffic tags across 9 categories (excluding games)
-- as well as high-impact study, exam, and productivity tags for PomoMate Discover.

INSERT INTO tags (slug, name_tr, name_en, category, icon, sort_order) VALUES
-- music (10)
('acoustic', 'Akustik', 'Acoustic', 'music', '🎸', 21),
('soul', 'Soul', 'Soul', 'music', '🎷', 22),
('funk', 'Funk', 'Funk', 'music', '🕺', 23),
('disco', 'Disko', 'Disco', 'music', '🪩', 24),
('techno', 'Tekno', 'Techno', 'music', '🔊', 25),
('house', 'House', 'House', 'music', '🏠', 26),
('ambient', 'Ambient', 'Ambient', 'music', '☁️', 27),
('opera', 'Opera', 'Opera', 'music', '🎭', 28),
('gospel', 'Gospel', 'Gospel', 'music', '🙌', 29),
('salsa', 'Salsa', 'Salsa', 'music', '💃', 30),

-- language (10)
('hindi-urdu', 'Hintçe / Urduca', 'Hindi / Urdu', 'language', '🗣️', 26),
('indonesian', 'Endonezyaca', 'Indonesian', 'language', '🇮🇩', 27),
('tagalog', 'Tagalogca', 'Tagalog', 'language', '🇵🇭', 28),
('swahili', 'Svahili', 'Swahili', 'language', '🌍', 29),
('hebrew', 'İbranice', 'Hebrew', 'language', '🇮🇱', 30),
('finnish', 'Fince', 'Finnish', 'language', '🇫🇮', 31),
('norwegian', 'Norveççe', 'Norwegian', 'language', '🇳🇴', 32),
('danish', 'Danca', 'Danish', 'language', '🇩🇰', 33),
('klingon', 'Klingonca', 'Klingon', 'language', '👽', 34),
('sign-language', 'İşaret Dili', 'Sign Language', 'language', '🤟', 35),

-- subject (10 + 9 exam/study)
('computer-science', 'Bilgisayar Bilimi', 'Computer Science', 'subject', '💻', 31),
('botany', 'Botanik', 'Botany', 'subject', '🌿', 32),
('zoology', 'Zooloji', 'Zoology', 'subject', '🦓', 33),
('paleontology', 'Paleontoloji', 'Paleontology', 'subject', '🦖', 34),
('meteorology', 'Meteoroloji', 'Meteorology', 'subject', '⛈️', 35),
('geology', 'Jeoloji', 'Geology', 'subject', '🪨', 36),
('theology', 'Teoloji', 'Theology', 'subject', '📖', 37),
('mythology', 'Mitoloji', 'Mythology', 'subject', '⚡', 38),
('education', 'Eğitim', 'Education', 'subject', '🏫', 39),
('journalism', 'Gazetecilik', 'Journalism', 'subject', '📰', 40),
('yks', 'YKS / Üniversite Hazırlık', 'YKS Exam Prep', 'subject', '🎯', 41),
('kpss', 'KPSS', 'KPSS Exam', 'subject', '📑', 42),
('tus', 'TUS (Tıpta Uzmanlık)', 'TUS Medical Exam', 'subject', '🩺', 43),
('ales', 'ALES', 'ALES Exam', 'subject', '📊', 44),
('dgs', 'DGS', 'DGS Exam', 'subject', '📐', 45),
('lgs', 'LGS', 'LGS Exam', 'subject', '🎒', 46),
('vize-final', 'Vize / Final', 'Midterm / Finals', 'subject', '📝', 47),
('ielts-toefl', 'IELTS / TOEFL', 'IELTS / TOEFL', 'subject', '🗣️', 48),
('thesis', 'Tez / Makale Yazımı', 'Thesis / Academic Writing', 'subject', '🖋️', 49),

-- tech (10)
('typescript', 'TypeScript', 'TypeScript', 'tech', '🟦', 26),
('ruby', 'Ruby', 'Ruby', 'tech', '♦️', 27),
('php', 'PHP', 'PHP', 'tech', '🐘', 28),
('go', 'Go', 'Go', 'tech', '🐹', 29),
('rust', 'Rust', 'Rust', 'tech', '⚙️', 30),
('csharp', 'C#', 'C#', 'tech', '🔷', 31),
('html-css', 'HTML / CSS', 'HTML / CSS', 'tech', '🎨', 32),
('aws', 'AWS', 'AWS', 'tech', '☁️', 33),
('docker', 'Docker', 'Docker', 'tech', '🐳', 34),
('kubernetes', 'Kubernetes', 'Kubernetes', 'tech', '☸️', 35),

-- creative (10)
('makeup', 'Makyaj', 'Makeup', 'creative', '💄', 21),
('nail-art', 'Nail Art', 'Nail Art', 'creative', '💅', 22),
('interior-design', 'İç Mimarlık', 'Interior Design', 'creative', '🛋️', 23),
('architecture-design', 'Mimari Tasarım', 'Architecture Design', 'creative', '🏗️', 24),
('knitting', 'Örgü / Tığ', 'Knitting / Crochet', 'creative', '🧶', 25),
('sewing', 'Dikiş', 'Sewing', 'creative', '🪡', 26),
('woodworking', 'Ahşap İşçiliği', 'Woodworking', 'creative', '🪚', 27),
('metalworking', 'Metal İşçiliği', 'Metalworking', 'creative', '⚒️', 28),
('glassblowing', 'Cam Üfleme', 'Glassblowing', 'creative', '🔥', 29),
('jewelry-making', 'Takı Tasarımı', 'Jewelry Making', 'creative', '💍', 30),

-- sport (10)
('badminton', 'Badminton', 'Badminton', 'sport', '🏸', 16),
('table-tennis', 'Masa Tenisi', 'Table Tennis', 'sport', '🏓', 17),
('golf', 'Golf', 'Golf', 'sport', '⛳', 18),
('baseball', 'Beyzbol', 'Baseball', 'sport', '⚾', 19),
('rugby', 'Ragbi', 'Rugby', 'sport', '🏉', 20),
('cricket', 'Kriket', 'Cricket', 'sport', '🏏', 21),
('ice-hockey', 'Buz Hokeyi', 'Ice Hockey', 'sport', '🏒', 22),
('skiing', 'Kayak', 'Skiing', 'sport', '⛷️', 23),
('snowboarding', 'Snowboard', 'Snowboarding', 'sport', '🏂', 24),
('surfing', 'Sörf', 'Surfing', 'sport', '🏄', 25),

-- entertainment (10)
('sitcom', 'Sitcom', 'Sitcom', 'entertainment', '🛋️', 16),
('sci-fi', 'Bilim Kurgu', 'Sci-Fi', 'entertainment', '👽', 17),
('fantasy', 'Fantastik', 'Fantasy', 'entertainment', '🐉', 18),
('thriller', 'Gerilim', 'Thriller', 'entertainment', '🔪', 19),
('horror', 'Korku', 'Horror', 'entertainment', '👻', 20),
('comedy', 'Komedi', 'Comedy', 'entertainment', '😂', 21),
('drama', 'Dram', 'Drama', 'entertainment', '🎭', 22),
('action', 'Aksiyon', 'Action', 'entertainment', '💥', 23),
('romance', 'Romantik', 'Romance', 'entertainment', '❤️', 24),
('animation-movie', 'Animasyon Film', 'Animation Movie', 'entertainment', '🎨', 25),

-- lifestyle (10 + 5 productivity/habits)
('veganism', 'Vegan Yaşam', 'Veganism', 'lifestyle', '🥗', 16),
('vegetarianism', 'Vejetaryen', 'Vegetarianism', 'lifestyle', '🥦', 17),
('fitness-lifestyle', 'Sağlıklı Yaşam', 'Healthy Lifestyle', 'lifestyle', '🥑', 18),
('digital-nomad', 'Dijital Göçebe', 'Digital Nomad', 'lifestyle', '💻', 19),
('van-life', 'Karavan Hayatı', 'Van Life', 'lifestyle', '🚐', 20),
('homesteading', 'Kendi Kendine Yetme', 'Homesteading', 'lifestyle', '🏡', 21),
('parenting', 'Ebeveynlik', 'Parenting', 'lifestyle', '👶', 22),
('spirituality', 'Maneviyat', 'Spirituality', 'lifestyle', '✨', 23),
('productivity', 'Üretkenlik', 'Productivity', 'lifestyle', '⏱️', 24),
('finance', 'Kişisel Finans', 'Personal Finance', 'lifestyle', '💰', 25),
('deep-work', 'Derin Odaklanma (Deep Work)', 'Deep Work', 'lifestyle', '🧠', 26),
('early-bird', 'Erken Kalkma (5 AM Club)', 'Early Bird / 5 AM Club', 'lifestyle', '🌅', 27),
('dopamine-detox', 'Dopamin Detoksu', 'Dopamine Detox', 'lifestyle', '🧘‍♂️', 28),
('time-management', 'Zaman Yönetimi', 'Time Management', 'lifestyle', '⏳', 29),
('morning-routine', 'Sabah Rutini', 'Morning Routine', 'lifestyle', '☀️', 30),

-- hobby (10)
('magic-tricks', 'Sihirbazlık', 'Magic Tricks', 'hobby', '🎩', 11),
('juggling', 'Hokkabazlık', 'Juggling', 'hobby', '🤹', 12),
('bird-watching', 'Kuş Gözlemciliği', 'Bird Watching', 'hobby', '🦅', 13),
('astronomy-hobby', 'Amatör Astronomi', 'Amateur Astronomy', 'hobby', '🔭', 14),
('foraging', 'Doğadan Toplayıcılık', 'Foraging', 'hobby', '🍄', 15),
('aquarium', 'Akvaryum', 'Aquarium', 'hobby', '🐠', 16),
('bonsai', 'Bonsai', 'Bonsai', 'hobby', '🌳', 17),
('calligraphy-hobby', 'Hat Sanatı', 'Calligraphy', 'hobby', '🖋️', 18),
('scrapbooking', 'Scrapbooking', 'Scrapbooking', 'hobby', '📔', 19),
('lockpicking', 'Kilit Açma', 'Lockpicking', 'hobby', '🔓', 20)

ON CONFLICT (slug) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Prioritize exam and academic preparation tags to the top of the subject category
UPDATE tags SET sort_order = sort_order + 10 WHERE category = 'subject' AND slug NOT IN ('yks', 'kpss', 'lgs', 'vize-final', 'ales', 'tus', 'dgs', 'ielts-toefl', 'thesis');
UPDATE tags SET sort_order = 1 WHERE slug = 'yks';
UPDATE tags SET sort_order = 2 WHERE slug = 'kpss';
UPDATE tags SET sort_order = 3 WHERE slug = 'lgs';
UPDATE tags SET sort_order = 4 WHERE slug = 'vize-final';
UPDATE tags SET sort_order = 5 WHERE slug = 'ales';
UPDATE tags SET sort_order = 6 WHERE slug = 'tus';
UPDATE tags SET sort_order = 7 WHERE slug = 'dgs';
UPDATE tags SET sort_order = 8 WHERE slug = 'ielts-toefl';
UPDATE tags SET sort_order = 9 WHERE slug = 'thesis';

