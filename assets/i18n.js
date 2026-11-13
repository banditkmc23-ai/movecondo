/* MoveCondo i18n — Thai (default) / English.
 * Thai stays the source of truth in the HTML and in app.js. In English mode this file
 * translates visible text, a few attributes, the page title and the meta description,
 * using the central dictionary below, then keeps translating anything app.js / map3d.js /
 * area-illo.js render later (MutationObserver). Switching language reloads the page with
 * ?lang=en or without the param (Thai), and the choice is remembered in localStorage.
 * Rules: never output the LINE ID or owner details.
 */
(function (global) {
  "use strict";
  var KEY = "mc-lang";
  var TH_RE = /[\u0E00-\u0E7F]/;

  function readLang() {
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (q === "en" || q === "th") { try { localStorage.setItem(KEY, q); } catch (e) {} return q; }
    try { var s = localStorage.getItem(KEY); if (s === "en" || s === "th") return s; } catch (e) {}
    return "th";
  }
  var LANG = readLang();

  /* ---------- Proper names (Thai script → English) ---------- */
  var AREA = {
    "ทองหล่อ": "Thonglor", "พร้อมพงษ์": "Phrom Phong", "เอกมัย": "Ekkamai", "พระโขนง": "Phra Khanong",
    "อ่อนนุช": "On Nut", "อโศก": "Asok", "อารีย์": "Ari", "พระราม 9": "Rama 9",
    "เจริญนคร": "Charoen Nakhon", "บางนา": "Bang Na",
    "ชิดลม": "Chit Lom", "พระราม 4": "Rama 4", "สามย่าน-สีลม": "Sam Yan–Silom", "ห้วยขวาง": "Huai Khwang"
  };
  var NAMES = {
    "BTS อ่อนนุช": "BTS On Nut", "BTS ทองหล่อ": "BTS Thong Lo", "BTS พร้อมพงษ์": "BTS Phrom Phong",
    "BTS เอกมัย": "BTS Ekkamai", "BTS พระโขนง": "BTS Phra Khanong", "BTS อโศก": "BTS Asok",
    "BTS อารีย์": "BTS Ari", "BTS บางนา": "BTS Bang Na", "BTS กรุงธนบุรี": "BTS Krung Thon Buri",
    "BTS อุดมสุข": "BTS Udom Suk", "BTS เจริญนคร": "BTS Charoen Nakhon", "BTS เจริญนคร (สายสีทอง)": "BTS Charoen Nakhon (Gold Line)",
    "BTS นานา": "BTS Nana", "BTS ชิดลม": "BTS Chit Lom", "BTS เพลินจิต": "BTS Phloen Chit", "BTS ราชดำริ": "BTS Ratchadamri",
    "BTS บางจาก": "BTS Bang Chak", "BTS ปุณณวิถี": "BTS Punnawithi", "BTS สุรศักดิ์": "BTS Surasak", "BTS ช่องนนทรี": "BTS Chong Nonsi",
    "BTS ศาลาแดง": "BTS Sala Daeng", "MRT สามย่าน": "MRT Sam Yan", "MRT คลองเตย": "MRT Khlong Toei", "MRT ห้วยขวาง": "MRT Huai Khwang",
    "MRT สุทธิสาร": "MRT Sutthisan", "MRT ลุมพินี": "MRT Lumphini", "MRT สีลม": "MRT Si Lom",
    "MRT พระราม 9": "MRT Phra Ram 9", "MRT เพชรบุรี": "MRT Phetchaburi", "MRT สุขุมวิท": "MRT Sukhumvit",
    "MRT ศูนย์การประชุมแห่งชาติสิริกิติ์": "MRT Queen Sirikit National Convention Centre",
    "MRT ศูนย์วัฒนธรรมแห่งประเทศไทย": "MRT Thailand Cultural Centre",
    "BTS อโศก / MRT สุขุมวิท": "BTS Asok / MRT Sukhumvit",
    "BTS สายสุขุมวิท": "BTS Sukhumvit Line", "MRT สายสีน้ำเงิน": "MRT Blue Line", "BTS สายสีทอง": "BTS Gold Line",
    "สายสุขุมวิท": "Sukhumvit Line", "สายสีลม": "Silom Line", "สายสีน้ำเงิน": "Blue Line", "สายสีทอง": "Gold Line",
    "สายสีเขียว": "Green Line",
    "ถนนสุขุมวิท": "Sukhumvit Rd", "ถนนอโศก": "Asok Montri Rd", "ถนนพหลโยธิน": "Phahonyothin Rd",
    "ถนนรัชดาภิเษก": "Ratchadaphisek Rd", "ถนนพระราม 9": "Rama 9 Rd", "ถนนเจริญนคร": "Charoen Nakhon Rd",
    "ถนนบางนา-ตราด": "Bang Na–Trat Rd", "แม่น้ำเจ้าพระยา": "Chao Phraya River",
    "ตลาดอ่อนนุช": "On Nut Market", "Lotus's อ่อนนุช": "Lotus's On Nut", "Big C อ่อนนุช": "Big C On Nut",
    "สวนหลวง ร.9": "Suan Luang Rama IX Park", "สวนเบญจสิริ": "Benchasiri Park", "สวนเบญจกิติ": "Benjakitti Park",
    "ฟอร์จูนทาวน์": "Fortune Town", "เซ็นทรัล": "Central", "เซ็นทรัลพระราม 9": "Central Rama 9",
    "เซ็นทรัล พระราม 9": "Central Rama 9", "ฮั่วเซ่งฮง เซ็นทรัลพระราม 9": "Hua Seng Hong Central Rama 9",
    "เซ็นทรัล บางนา": "Central Bangna", "เมกาบางนา": "Mega Bangna", "Donki Mall ทองหล่อ": "Donki Mall Thonglor",
    "คลองพระโขนง": "Phra Khanong Canal", "ทางด่วนฉลองรัช": "Chalong Rat Expressway",
    "สุขุมวิท": "Sukhumvit", "สุขุมวิท 69": "Sukhumvit 69", "สุขุมวิท 77": "Sukhumvit 77", "สุขุมวิท 71": "Sukhumvit 71",
    "สุขุมวิท 21": "Sukhumvit 21", "เอกมัยซอย 12": "Ekkamai Soi 12", "สยาม": "Siam", "สาทร": "Sathorn", "ธนบุรี": "Thonburi"
  };
  Object.keys(AREA).forEach(function (k) { NAMES[k] = AREA[k]; NAMES["ย่าน" + k] = AREA[k]; });

  /* ---------- UI and content strings (exact match, whitespace-normalised) ---------- */
  var EXACT = {
    /* header / nav / footer */
    "ข้ามไปยังเนื้อหา": "Skip to content",
    "ย้ายคอนโด · หาคอนโดเช่าที่ใช่": "Find a condo that fits",
    "MoveCondo ย้ายคอนโด · หาคอนโดเช่าที่ใช่": "MoveCondo · Find a condo that fits",
    "หลัก": "Main", "หน้าแรก": "Home", "จับคู่ห้อง": "Match me", "สำรวจย่าน": "Explore areas",
    "เริ่มจับคู่ห้อง": "Start matching", "เส้นทาง": "Breadcrumb",
    "MoveCondo · ย้ายคอนโด": "MoveCondo", "· ย้ายคอนโด": "", "หาคอนโดเช่าที่ใช่ในกรุงเทพฯ": "Find the right rental condo in Bangkok",
    "MoveCondo (ย้ายคอนโด) — หาคอนโดเช่าที่ใช่ในกรุงเทพฯ": "MoveCondo — Find the right rental condo in Bangkok",
    "MoveCondo ย้ายคอนโด หาคอนโดเช่าที่ใช่ในกรุงเทพฯ ดูห้องจริง จับคู่จากงบและทำเล แล้วทัก LINE ได้เลย": "MoveCondo helps you find the right rental condo in Bangkok. See real rooms, match by budget and location, then chat with us on LINE.",
    /* hero */
    "หาคอนโดเช่าที่": "Find a rental condo", "ตรงกับคุณ": "that fits you",
    "ดูห้องจริงใกล้รถไฟฟ้าในกรุงเทพฯ แล้วเลือกห้องที่ใช่": "See real rooms near the BTS and MRT in Bangkok, then pick the one that fits.",
    "ดูห้องว่าง": "See available rooms",
    "ค้นหาคอนโดที่ใช่สำหรับคุณ": "Find the right condo for you", "ค้นหา": "Search", "ค้นหาคอนโด": "Search condos",
    "ไม่พบห้องที่ตรงกับคำค้นหา": "No rooms match your search", "ล้างคำค้นหา": "Clear search", "บ้านไม้กรอบกระจกใต้ต้นไม้ใหญ่": "A glass-framed wooden house under a big tree",
    /* listings */
    "ประกาศเช่า": "For rent", "คอนโดเช่าที่คัดมาให้": "Hand-picked rental condos",
    "ว่าง": "Available", "พร้อมเข้าอยู่": "Ready to move in", "สอบถามวันเข้าอยู่": "Ask for move-in date",
    "มีรถ shuttle": "Shuttle available", "บาท/เดือน": "THB/month",
    /* areas */
    "สำรวจทำเล": "Explore locations", "ย่านที่อยากอยู่ ใกล้รถไฟฟ้า": "Areas to live in, near the train",
    "ย่านใกล้รถไฟฟ้าในกรุงเทพฯ": "Areas near the train in Bangkok", "ย่านใกล้รถไฟฟ้า": "Areas near the train",
    "อ่านบรรยากาศ การเดินทาง และร้านดังใกล้สถานี ร้านอาหาร คาเฟ่ และสถานที่ในหมวดนี้เป็นสถานที่จริงที่เปิดให้บริการ": "Read about the vibe, getting around and popular spots near each station. The restaurants, cafés and places listed here are real and open for business.",
    "เลือกย่านแล้วอ่านบรรยากาศ การเดินทาง และร้านดังใกล้สถานี ร้านอาหาร คาเฟ่ และสถานที่ในหมวดร้านดังเป็นสถานที่จริงที่เปิดให้บริการ": "Pick an area to read about the vibe, getting around and popular spots near the station. The restaurants, cafés and places under Popular spots are real and open for business.",
    "เลือกย่าน": "Choose an area", "ย่านทั้งหมด": "All areas", "กรองประเภทร้าน": "Filter by type",
    "เดินทางด้วยรถไฟฟ้า": "Getting around by train", "เดินทางด้วยรถไฟฟ้า:": "Getting around by train:",
    "ไลฟ์สไตล์รอบย่าน": "Lifestyle around the area", "ไลฟ์สไตล์รอบย่าน:": "Lifestyle around the area:",
    "การเดินทางและไลฟ์สไตล์": "Getting around & lifestyle",
    "สถานี": "Station", "ร้านดัง": "Popular spots", "ภาพประกอบ ไม่ใช่แผนที่จริง": "Illustration, not an actual map",
    "ร้านดังใกล้คอนโด": "Popular spots near the condo", "ร้านดังใกล้สถานี": "Popular spots near the station",
    "ร้านอาหาร คาเฟ่ และจุดฮิตใกล้สถานี": "Restaurants, cafés and hot spots near the station",
    "สถานที่เหล่านี้เป็นร้านและสถานที่จริงที่เปิดให้บริการ ระยะเวลาโดยประมาณ คำนวณจากสถานีรถไฟฟ้า": "These are real shops and places that are open for business. Times are estimates from the train station.",
    "ระยะเวลาโดยประมาณ คำนวณจากสถานีรถไฟฟ้า ระยะทางคิดจากสถานีรถไฟฟ้า ไม่ใช่จากอาคารคอนโด และไม่มีคะแนนหรือจำนวนรีวิวสมมติ": "Times are estimates from the train station. Distances are measured from the station, not from the condo building, and there are no made-up ratings or review counts.",
    "สถานที่จริงใกล้โครงการ · ระยะเดินเป็นค่าประมาณ": "Real places near the project · walking times are estimates",
    "ระยะเดินเป็นค่าประมาณจากสถานี": "Walking times are estimates from the station",
    "หน้านี้รวบรวมบรรยากาศย่าน ร้านดังใกล้สถานี และการเดินทาง ร้านอาหารและคาเฟ่เป็นสถานที่จริงที่เปิดให้บริการ": "This page covers the area's vibe, popular spots near the station, and getting around. The restaurants and cafés are real and open for business.",
    "แผนที่ 3 มิติรอบสถานี": "3D map around the station",
    "สถานีรถไฟฟ้าและร้านดังใกล้เคียง — หมุน เอียง และซูมได้ อาคารแสดงเป็นสามมิติเมื่อซูมใกล้ เมื่อมีประกาศห้องจริง จะปักหมุดคอนโดสีน้ำตาลแดงบนแผนที่นี้": "Train stations and popular spots nearby. Rotate, tilt and zoom; buildings turn 3D when you zoom in. When real rooms are listed, condos are pinned in terracotta on this map.",
    "ยังไม่มีประกาศในย่านนี้": "No listings in this area yet", "สำรวจย่านอื่น หรือทัก LINE เพื่อบอกความต้องการ": "Explore other areas, or chat on LINE and tell us what you need.",
    "คอนโดเช่าในย่านนี้": "Rental condos in this area", "ห้องให้เช่าในย่านนี้": "Rooms for rent in this area",
    "เครดิตภาพ": "Photo credits", "เปิดใน Google Maps": "Open in Google Maps", "แผนที่": "Map",
    "ทั้งหมด": "All", "ช็อปปิ้ง": "Shopping", "คาเฟ่": "Café", "ร้านอาหาร": "Restaurant", "บาร์": "Bar", "สวน": "Park", "สปา": "Spa",
    "นั่งรถ": "By car", "คอนโด": "Condo", "ตำแหน่งโดยประมาณ": "Approximate location", "รีเซ็ตมุมมอง": "Reset view",
    "กำลังเตรียมแผนที่…": "Preparing the map…", "ใช้ Ctrl + เลื่อนเพื่อซูมแผนที่": "Use Ctrl + scroll to zoom the map",
    "ใช้ ⌘ + เลื่อนเพื่อซูมแผนที่": "Use ⌘ + scroll to zoom the map",
    "โหลดข้อมูลแผนที่ไม่สำเร็จ": "Couldn't load the map data", "โหลดไลบรารีแผนที่ไม่สำเร็จ": "Couldn't load the map library",
    "เบราว์เซอร์นี้ไม่รองรับแผนที่ 3 มิติ": "This browser doesn't support the 3D map",
    "ดูรายการสถานีและร้านดังด้านล่างได้เลย": "See the list of stations and popular spots below.",
    "OpenFreeMap © OpenMapTiles · ข้อมูลจาก OpenStreetMap": "OpenFreeMap © OpenMapTiles · Data from OpenStreetMap",
    "OpenFreeMap © OpenMapTiles · ข้อมูลจาก OpenStreetMap · พิกัดสถานีจาก Wikipedia |": "OpenFreeMap © OpenMapTiles · Data from OpenStreetMap · Station coordinates from Wikipedia |",
    "OpenFreeMap © OpenMapTiles · ข้อมูลจาก OpenStreetMap · พิกัดสถานีจาก Wikipedia": "OpenFreeMap © OpenMapTiles · Data from OpenStreetMap · Station coordinates from Wikipedia",
    /* area profiles */
    "ย่านอยู่อาศัยที่ใช้ชีวิตประจำวันได้ครบ รอบสถานีมีตลาดและร้านค้า": "A residential area with everything for daily life; markets and shops around the station.",
    "สถานี BTS อ่อนนุชอยู่บนสายสีเขียว เดินทางเข้ากลางเมืองได้โดยตรง และต่อลงใต้ได้ต่อเนื่อง": "BTS On Nut is on the Green Line, with a direct ride into the city centre and onward to the south.",
    "รอบสถานีมีตลาดเช้า ร้านอาหารในซอย และสวนชุมชน เหมาะกับคนที่อยากได้ความสะดวกแบบไม่ต้องอยู่ใจกลางที่สุด": "Around the station there are morning markets, restaurants in the sois and a community park. Good for people who want convenience without living in the very centre.",
    "ย่านไลฟ์สไตล์บนเส้นสุขุมวิท ร้านอาหารรอบสถานีคึกคักยามเย็น": "A lifestyle area on Sukhumvit; restaurants around the station are lively in the evening.",
    "ขึ้นรถไฟฟ้าสายสีเขียวได้ที่สถานีทองหล่อ ต่อสถานีใกล้เคียงได้โดยไม่ต้องเปลี่ยนสาย": "Take the Green Line from Thong Lo station and reach nearby stations without changing lines.",
    "บรรยากาศย่านเน้นร้านอาหารและพื้นที่นั่งเล่นในซอย เหมาะกับคนที่อยากได้ทั้งความสะดวกและการออกไปหาอะไรกินใกล้บ้าน": "The area is all about restaurants and places to hang out in the sois. Good for people who want convenience and lots to eat close to home.",
    "ย่านกลางสุขุมวิท เดินทางต่อบนสายสีเขียวได้สะดวก": "Central Sukhumvit, with easy onward travel on the Green Line.",
    "สถานี BTS พร้อมพงษ์อยู่บนสายสีเขียว ต่อขึ้นเหนือหรือลงใต้ได้โดยไม่ต้องเปลี่ยนสาย": "BTS Phrom Phong is on the Green Line; go north or south without changing lines.",
    "รอบสถานีมีสวน ร้านอาหาร และแหล่งไลฟ์สไตล์ในระยะเดิน เหมาะกับครอบครัวหรือคนที่อยากได้พื้นที่มากขึ้น": "A park, restaurants and lifestyle spots are within walking distance of the station. Good for families or anyone who wants more space.",
    "บรรยากาศอยู่อาศัยสงบกว่าย่านข้างเคียง แต่ยังเดินทางต่อบนเส้นเดียวกันได้สะดวก": "Quieter and more residential than its neighbours, while still easy to travel along the same line.",
    "สถานี BTS เอกมัยอยู่บนสายสีเขียว ต่อเข้ากลางเมืองหรือลงไปย่านอื่นบนเส้นสุขุมวิทได้ตรงๆ": "BTS Ekkamai is on the Green Line, with direct rides into the centre or to other areas along Sukhumvit.",
    "ซอยค่อนข้างเงียบ มีร้านกาแฟและพื้นที่สีเขียวขนาดย่อม เหมาะกับคนที่อยู่อาศัยยาว": "Fairly quiet sois with coffee shops and small green spaces. Good for long-term living.",
    "ย่านที่กำลังเติบโตบนเส้นเดียวกับอ่อนนุชและเอกมัย ตัวเลือกห้องในช่วงงบกลางค่อนข้างหลากหลาย": "A growing area on the same line as On Nut and Ekkamai, with a good range of mid-budget rooms.",
    "ขึ้น BTS พระโขนง แล้วเลื่อนบนสายสีเขียวได้ทั้งขึ้นเหนือและลงใต้โดยไม่เปลี่ยนสาย": "Take BTS Phra Khanong and ride the Green Line north or south without changing lines.",
    "รอบสถานีมีตลาดและร้านอาหารท้องถิ่น บรรยากาศเป็นย่านอยู่อาศัยมากกว่าย่านเที่ยวกลางคืน": "Markets and local restaurants around the station; more residential than nightlife.",
    "ใจกลางเมือง เชื่อมต่อได้หลายเส้นทาง เน้นความสะดวกในการเดินทางเป็นหลัก": "The heart of the city, connected to several lines, all about easy commuting.",
    "สถานี BTS อโศกเชื่อมต่อพื้นที่กลางสุขุมวิทได้เร็ว และต่อรถไฟฟ้าสายอื่นในระยะเดินได้": "BTS Asok gets you around central Sukhumvit quickly, with other train lines within walking distance.",
    "รอบสถานีหนาแน่นด้วยอาคารสำนักงานและร้านอาหาร เหมาะกับคนที่อยากอยู่ใกล้ที่ทำงาน": "The station is surrounded by office buildings and restaurants. Good for people who want to live near work.",
    "บรรยากาศย่านคาเฟ่และที่อยู่อาศัยระยะยาว": "A café neighbourhood for long-term living.",
    "ขึ้น BTS อารีย์ บนสายสีเขียว เดินทางเข้าสยามและต่อลงใต้ได้โดยไม่ต้องย้ายสาย": "Take BTS Ari on the Green Line to Siam and further south without changing lines.",
    "ซอยเดินเล่นได้ มีร้านกาแฟและพื้นที่สีเขียวขนาดย่อม เหมาะกับคนที่อยากได้จังหวะช้ากว่าย่านธุรกิจ": "Walkable sois with coffee shops and small green spaces. Good for people who want a slower pace than the business districts.",
    "ย่านธุรกิจฝั่งตะวันออก โทนสงบ ใกล้สถานีใต้ดินมากกว่าสายสีเขียว": "A calm eastern business district, closer to the MRT than to the Green Line.",
    "ใช้ MRT พระราม 9 เป็นหลัก แล้วต่อสายสีน้ำเงินเข้ากลางเมืองหรือออกนอกได้": "MRT Phra Ram 9 is the main station; ride the Blue Line into the centre or out of town.",
    "รอบสถานีมีอาคารสำนักงานและพื้นที่พักรับประทานอาหาร เหมาะกับคนที่ทำงานในย่านนี้": "Office buildings and places to eat around the station. Good for people who work in the area.",
    "ย่านริมแม่น้ำฝั่งธนบุรี บรรยากาศอยู่อาศัยริมน้ำและเดินทางเข้าสาทรได้": "A riverside area on the Thonburi side, with waterfront living and easy access to Sathorn.",
    "ใช้ BTS กรุงธนบุรีเป็นสถานีหลัก แล้วต่อเข้าสายอื่นหรือเดินทางต่อเข้าเมืองได้": "BTS Krung Thon Buri is the main station, with connections to other lines and into the city.",
    "รอบย่านมีทางเดินริมน้ำ ร้านอาหาร และพื้นที่พักผ่อน เหมาะกับคนที่อยากได้อากาศโล่งกว่าย่านกลาง": "Riverside walkways, restaurants and places to relax. Good for people who want more open air than the centre.",
    "ย่านตะวันออกใกล้ทางขึ้นลงเมืองและรถไฟฟ้าสายสีเขียว": "An eastern area near the expressway ramps and the Green Line.",
    "ขึ้น BTS บางนา แล้วย้อนเข้ากลางเมืองบนสายสีเขียวได้ตลอดเส้น": "Take BTS Bang Na and ride the Green Line all the way into the centre.",
    "พื้นที่กว้างกว่าย่านในเมือง มีตลาดและร้านอาหารครอบครัวในระยะเดินหรือต่อรถสั้นๆ": "More space than inner-city areas, with markets and family restaurants within walking distance or a short ride.",
    /* FAQ / contact */
    "คำถามที่พบบ่อย": "FAQ", "ก่อนเริ่มหาห้อง": "Before you start looking",
    "สนใจห้องไหน ติดต่ออย่างไร": "How do I ask about a room?", "ทัก": "Message us on",
    "แล้วบอกชื่อโครงการหรือห้องที่สนใจได้เลย": "and tell us the project or room you're interested in.",
    "ร้านดังในแต่ละย่านเป็นสถานที่จริงหรือไม่": "Are the popular spots in each area real?",
    "ใช่ ร้านอาหาร คาเฟ่ บาร์ และสถานที่ในหมวดร้านดังเป็นสถานที่จริงที่เปิดให้บริการ ระยะทางเป็นค่าประมาณจากสถานีหรือจากโครงการเมื่อมีพิกัด": "Yes. The restaurants, cafés, bars and places under Popular spots are real and open for business. Distances are estimates from the station, or from the project when we have its coordinates.",
    "ใช่ ร้านอาหาร คาเฟ่ บาร์ และสถานที่ในหมวดร้านดังเป็นสถานที่จริงที่เปิดให้บริการ ระยะทางเป็นค่าประมาณจากสถานีรถไฟฟ้า": "Yes. The restaurants, cafés, bars and places under Popular spots are real and open for business. Distances are estimates from the train station.",
    "ติดต่อ MoveCondo ได้อย่างไร": "How do I contact MoveCondo?", "ได้เลย": "anytime.",
    "สนใจห้องไหน ทักมาได้เลย": "Like a room? Just message us", "บอกรหัสห้องในแชท เราจะช่วยตอบเรื่องห้องนั้น": "Tell us the room in the chat and we'll answer your questions about it.",
    "ทัก LINE": "Chat on LINE", "ติดต่อ LINE": "Chat on LINE", "ติดต่อผ่าน LINE": "Contact us on LINE",
    "ทัก MoveCondo ได้ที่ LINE ปุ่มนี้ไม่ได้ใส่ข้อความล่วงหน้า": "Message MoveCondo on LINE. This button doesn't pre-fill any message.",
    "ปิด": "Close", "ติดต่อเรื่องห้องนี้": "Ask about this room",
    /* 404 */
    "ไม่พบหน้านี้": "Page not found", "ไม่พบหน้านี้ | MoveCondo": "Page not found | MoveCondo",
    "ลิงก์นี้อาจย้ายแล้ว หรือยังไม่มีในเว็บ MoveCondo (ย้ายคอนโด)": "This link may have moved, or it doesn't exist on MoveCondo yet.",
    "กลับหน้าแรก": "Back to home",
    /* matcher */
    "หาห้องที่ใช่ใน 30 วินาที": "Find your room in 30 seconds",
    "เลือกทำเล งบ และสิ่งที่ขาดไม่ได้ แล้วดูห้องที่เข้ากันจากประกาศจริง": "Pick a location, budget and must-haves, then see matching rooms from real listings.",
    "ทำเลที่ต้องการ": "Preferred location", "เลือกได้หลายย่าน": "Pick any number", "แบบห้อง": "Room type",
    "ไม่จำกัด": "Any", "1 ห้องนอน": "1 bedroom", "2 ห้องนอน": "2 bedrooms", "2 ห้องนอน+": "2+ bedrooms", "งบค่าเช่า": "Monthly budget",
    "งบต่ำสุด": "Minimum budget", "งบสูงสุด": "Maximum budget", "ขนาดห้องขั้นต่ำ": "Minimum size",
    "เดินถึงสถานี": "Walk to station", "สัญญาขั้นต่ำ": "Minimum lease", "1 ปี": "1 year", "วันที่ย้ายเข้าได้": "Move-in date",
    "สิ่งที่ขาดไม่ได้": "Must-haves", "เลือกได้หลายข้อ": "Pick any number",
    "สระว่ายน้ำ": "Swimming pool", "ฟิตเนส": "Gym", "เครื่องซักผ้า": "Washing machine", "ห้องมุม": "Corner unit",
    "รถรับส่ง/shuttle": "Shuttle", "อ่างอาบน้ำ": "Bathtub", "ที่จอดรถ": "Parking", "Co-working space": "Co-working space",
    "ดูห้องที่ตรงที่สุด": "See best matches", "ปรับความต้องการ": "Adjust preferences",
    "ห้องที่เข้ากันกับคุณ": "Rooms that match you",
    "เรียงตามความเหมาะสมจากงบ ทำเล ขนาด และสิ่งที่คุณเลือก": "Sorted by how well they fit your budget, location, size and picks.",
    "เข้ากัน": "Match", "สัญญา 1 ปี": "1-year lease", "ย้ายเข้าได้": "Move-in OK",
    /* room page */
    "รายละเอียด": "Details", "ไฮไลต์ห้อง": "Room highlights", "เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้า": "Furniture & appliances",
    "การเดินทางและสถานที่ใกล้": "Getting around & nearby", "ส่วนกลางโครงการ": "Building facilities",
    "ขนาด": "Size", "ชั้น": "Floor", "เงินมัดจำ": "Deposit", "ล่วงหน้า": "Advance rent", "วันเข้าอยู่": "Move-in",
    "สถานีใกล้ที่สุด": "Nearest station", "ระยะเดิน": "Walking time", "1 เดือน": "1 month", "2 เดือน": "2 months", "3 เดือน": "3 months",
    "แผนที่ 3 มิติ": "3D map", "สถานีรถไฟฟ้าและร้านดังใกล้เคียงในรัศมีประมาณ 1.5 กม.": "Train stations and popular spots within about 1.5 km.",
    "ภาพก่อนหน้า": "Previous photo", "ภาพถัดไป": "Next photo",
    /* room features & amenities */
    "โทนน้ำตาลอุ่นและครีม": "Warm brown and cream tones", "ลมผ่านสบายตลอดวัน": "Pleasant breeze all day",
    "เฟอร์นิเจอร์บิลต์อิน": "Built-in furniture", "หันทิศเหนือ": "North-facing", "วิวเปิดโล่ง ไม่มีตึกบัง": "Open view, no buildings in the way",
    "เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ": "Fully furnished with appliances", "หันทิศใต้": "South-facing", "วิวคลองพระโขนง": "Phra Khanong Canal view",
    "วิว 270 องศา": "270-degree view", "มีห้องนั่งเล่น": "Living room", "สวนหย่อม": "Garden", "ที่จอดรถ 1 คัน": "1 parking space",
    "รถรับ-ส่งฟรีไป BTS เอกมัย": "Free shuttle to BTS Ekkamai", "รถรับส่งฟรีไป BTS เอกมัย": "Free shuttle to BTS Ekkamai",
    "เฟอร์นิเจอร์ครบ": "Fully furnished", "บ่อแช่น้ำอุ่น–เย็น": "Hot and cold plunge pools",
    "รถรับ-ส่งใน T77 Sansiri Campus และไป BTS อ่อนนุช": "Shuttle within T77 Sansiri Campus and to BTS On Nut",
    "รถรับ–ส่งใน T77 Sansiri Campus และไป BTS อ่อนนุช": "Shuttle within T77 Sansiri Campus and to BTS On Nut",
    "รถรับ-ส่งใน T77 และไป BTS อ่อนนุช": "Shuttle within T77 and to BTS On Nut", "รถรับ–ส่งใน T77 และไป BTS อ่อนนุช": "Shuttle within T77 and to BTS On Nut",
    "วิวสระและคลอง": "Pool and canal view", "ตกแต่งและเฟอร์นิเจอร์ครบ": "Fully decorated and furnished",
    "มีรถรับ-ส่ง": "Shuttle service", "รถรับ–ส่ง": "Shuttle service", "วิวสระว่ายน้ำ": "Pool view", "เตียงนอนนุ่ม": "Comfortable bed",
    "โทรทัศน์": "TV", "ตู้เย็น": "Fridge", "ตู้เย็น / Freezer": "Fridge / freezer", "ไมโครเวฟ": "Microwave", "กลอนดิจิทัล": "Digital door lock",
    "สระว่ายน้ำกลางแจ้ง": "Outdoor swimming pool", "สวนและพื้นที่สีเขียว": "Garden and green space", "ระบบคีย์การ์ด": "Key-card access",
    "รถรับ-ส่งและรถกอล์ฟฟรี": "Free shuttle and golf cart", "รถรับ–ส่งและรถกอล์ฟฟรี": "Free shuttle and golf cart",
    "300 ม. ถึง Big C และตลาดอาหาร": "300 m to Big C and a food market",
    "ตรงข้าม Bangkok Prep International School": "Opposite Bangkok Prep International School",
    "เตียงขนาด 5 ฟุตทั้ง 2 ห้อง": "5-ft beds in both bedrooms", "สวนบนดาดฟ้า": "Rooftop garden",
    "2 ห้องน้ำ": "2 bathrooms", "หันทิศตะวันออก รับแสงธรรมชาติช่วงเช้า": "East-facing, natural morning light",
    "สวนพักผ่อน": "Relaxation garden", "ระบบรักษาความปลอดภัย 24 ชั่วโมง": "24-hour security",
    "ใกล้แหล่งไลฟ์สไตล์ย่านเอกมัย–ทองหล่อ": "Near the Ekkamai–Thonglor lifestyle area", "วิวเมืองและทางด่วน": "City and expressway view",
    "สวนส่วนกลาง": "Shared garden", "เชื่อมต่อเอกมัยและทองหล่อ": "Easy access to Ekkamai and Thonglor",
    "วิวสูงวิวโล่งฝั่งทองหล่อ–อโศก ไม่มีตึกบัง": "High, open view toward Thonglor–Asok, nothing in the way",
    "รถรับ-ส่งไป BTS ทองหล่อ และ MRT เพชรบุรี": "Shuttle to BTS Thong Lo and MRT Phetchaburi",
    "วิวสวยสบายตา": "Pleasant view", "ห้องสมุด": "Library", "ห้องนั่งเล่นและพื้นที่รับประทานอาหาร": "Living and dining area",
    "ชุดเครื่องนอน": "Bedding set", "เครื่องใช้ไฟฟ้าครบ": "Full set of appliances", "ครัว / pantry พร้อมอุปกรณ์พื้นฐาน": "Kitchen / pantry with basic equipment",
    "หันทิศตะวันออก": "East-facing", "วิวสวย": "Nice view", "Co-kitchen": "Co-kitchen", "พร้อมอยู่": "Ready to move in",
    "วิวเปิดโล่ง": "Open view", "ใกล้ทางด่วนฉลองรัช": "Near the Chalong Rat Expressway", "ใกล้ย่านทองหล่อ": "Near Thonglor",
    "ใกล้ย่านเอกมัยและทองหล่อ": "Near Ekkamai and Thonglor", "สวนสาธารณะ": "Park", "ห้องนั่งเล่น": "Living room",
    /* room summaries (faithful translations of the Thai summaries) */
    "ห้องมุมเฟอร์นิเจอร์บิลต์อิน โทนน้ำตาลอุ่นและครีม ลมผ่านสบายตลอดวัน ที่ Aspire Onnut Station ย่านอ่อนนุช ใกล้ Lotus's On Nut": "Corner unit with built-in furniture in warm brown and cream tones and a pleasant breeze all day, at Aspire Onnut Station in On Nut, near Lotus's On Nut.",
    "ห้องหันทิศเหนือ วิวเปิดโล่งไม่มีตึกบัง เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ ที่ Bangkok Feliz สุขุมวิท 69 ย่านพระโขนง": "North-facing unit with an open, unobstructed view, fully furnished with appliances, at Bangkok Feliz Sukhumvit 69 in Phra Khanong.",
    "ห้องหันทิศใต้ วิวคลองพระโขนง ที่ Blocs 77 สุขุมวิท 77 ย่านอ่อนนุช ใกล้ T77 Community และแหล่งช้อปปิ้ง": "South-facing unit with a Phra Khanong Canal view, at Blocs 77 Sukhumvit 77 in On Nut, near T77 Community and shopping.",
    "ห้องมุมวิว 270 องศา เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ Ceil By Sansiri เอกมัยซอย 12 มีรถรับ-ส่งฟรีไป BTS เอกมัย": "Corner unit with a 270-degree view, fully furnished and ready to move in, at Ceil By Sansiri, Ekkamai Soi 12, with a free shuttle to BTS Ekkamai.",
    "ห้องเฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ พร้อมเข้าอยู่ ที่ Chapter Thonglor 25 ย่านทองหล่อ มีสระว่ายน้ำและฟิตเนส": "Fully furnished unit with appliances, ready to move in, at Chapter Thonglor 25 in Thonglor, with a swimming pool and gym.",
    "ห้องมุมเฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ IDEO Mobi Sukhumvit 81 ย่านอ่อนนุช": "Fully furnished corner unit, ready to move in, at IDEO Mobi Sukhumvit 81 in On Nut.",
    "ห้องเฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ Kawa Haus ย่านอ่อนนุช มีรถรับ-ส่งใน T77 และไป BTS อ่อนนุช ใกล้ Habito Mall และ Bangkok Prep": "Fully furnished unit, ready to move in, at Kawa Haus in On Nut, with a shuttle within T77 and to BTS On Nut, near Habito Mall and Bangkok Prep.",
    "ห้องมุมวิวสระและคลอง เฟอร์นิเจอร์ครบ ที่ Kawa Haus ย่านอ่อนนุช มีรถรับ-ส่ง": "Fully furnished corner unit with pool and canal views, at Kawa Haus in On Nut, with a shuttle service.",
    "ห้องเฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ พร้อมที่จอดรถ 1 คัน ที่ Life Sukhumvit 48 ย่านพระโขนง": "Fully furnished unit with appliances and 1 parking space, at Life Sukhumvit 48 in Phra Khanong.",
    "ห้องมีอ่างอาบน้ำ วิวสระว่ายน้ำ ที่ Mori Haus ใน T77 Community ย่านอ่อนนุช มีรถรับ-ส่งและรถกอล์ฟฟรี ใกล้ Habito Mall และ Bangkok Prep": "Unit with a bathtub and a pool view, at Mori Haus in T77 Community, On Nut, with a free shuttle and golf cart, near Habito Mall and Bangkok Prep.",
    "ห้องมุม เตียง 5 ฟุตทั้งสองห้อง เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ Nia By Sansiri สุขุมวิท 71 ย่านอ่อนนุช": "Corner unit with 5-ft beds in both bedrooms, fully furnished and ready to move in, at Nia By Sansiri Sukhumvit 71 in On Nut.",
    "ห้องกว้าง 2 ห้องน้ำ มีอ่างอาบน้ำ เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ Noble Ora ย่านทองหล่อ": "Spacious unit with 2 bathrooms and a bathtub, fully furnished and ready to move in, at Noble Ora in Thonglor.",
    "ห้อง 2 ห้องนอนมีห้องนั่งเล่น เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ Oka Haus ย่านทองหล่อ มีสระว่ายน้ำและฟิตเนส": "2-bedroom unit with a living room, fully furnished and ready to move in, at Oka Haus in Thonglor, with a swimming pool and gym.",
    "ห้องมุมหันทิศตะวันออก รับแสงเช้า เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ Rhythm Ekkamai ย่านเอกมัย ใกล้แหล่งไลฟ์สไตล์เอกมัย–ทองหล่อ": "East-facing corner unit with morning light, fully furnished and ready to move in, at Rhythm Ekkamai in Ekkamai, near the Ekkamai–Thonglor lifestyle area.",
    "ห้องมีห้องนั่งเล่น เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ The Alcove Thonglor 10 ใกล้ย่านเอกมัยและทองหล่อ": "Unit with a living room, fully furnished and ready to move in, at The Alcove Thonglor 10, near Ekkamai and Thonglor.",
    "ห้องมุมวิวเมืองและทางด่วน เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ The Base Park West สุขุมวิท 77 ย่านอ่อนนุช": "Corner unit with city and expressway views, fully furnished and ready to move in, at The Base Park West Sukhumvit 77 in On Nut.",
    "ห้อง 2 ห้องน้ำ เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ The Line Sukhumvit 71 ย่านพระโขนง เดินทางต่อเอกมัยและทองหล่อได้สะดวก": "Unit with 2 bathrooms, fully furnished and ready to move in, at The Line Sukhumvit 71 in Phra Khanong, with easy access to Ekkamai and Thonglor.",
    "ห้องหันทิศใต้ วิวโล่งฝั่งทองหล่อ–อโศก เฟอร์นิเจอร์ครบ ที่ The Niche Pride Thonglor-Petchaburi มีรถรับ-ส่งไป BTS ทองหล่อและ MRT เพชรบุรี": "South-facing unit with an open view toward Thonglor–Asok, fully furnished, at The Niche Pride Thonglor-Petchaburi, with a shuttle to BTS Thong Lo and MRT Phetchaburi.",
    "ห้องมีห้องนั่งเล่น วิวสวย เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่ ที่ The Room สุขุมวิท 21 ย่านอโศก มีห้องสมุด สระว่ายน้ำ และฟิตเนส": "Unit with a living room and a nice view, fully furnished and ready to move in, at The Room Sukhumvit 21 in Asok, with a library, swimming pool and gym.",
    "ห้อง 1 Bed Plus มีอ่างอาบน้ำ ห้องนั่งเล่นและพื้นที่รับประทานอาหาร ที่ The Teak Sukhumvit 39 ย่านพร้อมพงษ์ เฟอร์นิเจอร์ครบพร้อมชุดเครื่องนอน": "1 Bed Plus unit with a bathtub, living room and dining area, at The Teak Sukhumvit 39 in Phrom Phong, fully furnished with bedding.",
    "นัดชมห้อง": "Book a viewing", "รับคำขอนัดชมแล้ว": "Viewing request received", "ทัก LINE เพื่อบอกห้องที่สนใจได้เลยค่ะ": "Chat on LINE to tell us which room you're interested in.",
    "นัดชมผ่าน LINE ได้เลย": "book a viewing via LINE", "ชื่อผู้เข้าชม": "Visitor name", "ใช้ชื่อสมมติได้": "A nickname is fine",
    "วันที่นัด": "Date", "ช่วงเวลา": "Time", "ยืนยันนัดชม": "Confirm viewing", "ยกเลิก": "Cancel", "ดูรายละเอียด": "View details", "นัดชมห้อง": "Book a viewing",
    "ใกล้รถไฟฟ้า": "Near the train",
    /* 248-room import: types, floor bands, paging, soon-available, new area pages */
    "สตูดิโอ": "Studio", "ดูเพล็กซ์": "Duplex", "1+1 ห้องนอน": "1+1 bedrooms", "1 ห้องนอน (ดูเพล็กซ์)": "1-bedroom duplex",
    "ชั้นต่ำ (1–10)": "Low floor (1–10)", "ชั้นกลาง (11–20)": "Mid floor (11–20)", "ชั้นสูง (21 ขึ้นไป)": "High floor (21+)",
    "ดูเพิ่มเติม": "Show more", "กำลังจะว่าง": "Available soon",
    "2 ห้องนอน 2 ห้องนั่งเล่น": "2 bedrooms, 2 living rooms",
    /* search v2 + project pages */
    "ค้นหาแบบละเอียด": "Advanced search", "ผลการค้นหา": "Search results", "ตัวกรอง": "Filters", "เรียงตาม": "Sort by",
    "แนะนำ": "Recommended", "ราคาต่ำไปสูง": "Price: low to high", "ราคาสูงไปต่ำ": "Price: high to low", "ขนาดใหญ่ไปเล็ก": "Size: largest first",
    "ลงประกาศล่าสุด": "Newest", "คำค้นหา": "Keyword", "ชื่อโครงการ ย่าน หรือสถานี": "Project, area or station",
    "ค่าเช่าต่อเดือน (บาท)": "Monthly rent (THB)", "ค่าเช่าต่ำสุด": "Minimum rent", "ค่าเช่าสูงสุด": "Maximum rent", "ต่ำสุด": "Min", "สูงสุด": "Max",
    "ขนาดห้อง (ตร.ม.)": "Room size (sq.m.)", "ขนาดเล็กสุด": "Minimum size", "ขนาดใหญ่สุด": "Maximum size", "เล็กสุด": "Min", "ใหญ่สุด": "Max",
    "3 ห้องนอนขึ้นไป / ทาวน์โฮม": "3+ bedrooms / townhome", "สถานีรถไฟฟ้า BTS/MRT": "BTS/MRT station", "ล้างทั้งหมด": "Clear all",
    "ไม่พบห้อง": "No rooms found", "โครงการ": "Projects", "โครงการคอนโด": "Condo project", "ห้องว่างในโครงการนี้": "Available rooms in this project",
    "รวมห้องที่กำลังจะว่างภายใน 30 วัน": "Includes rooms becoming available within 30 days",
    "ดูห้องว่างทั้งหมดในโครงการนี้": "See all available rooms in this project", "4 ห้องน้ำ": "4 bathrooms", "ห้องน้ำ": "Bathrooms",
    "หน้านี้รวบรวมห้องให้เช่าในย่านนี้ ข้อมูลการเดินทางเป็นข้อมูลทั่วไปของย่าน": "This page lists rooms for rent in this area. Travel notes are general information about the area.",
    "ย่านใจกลางเมืองรอบถนนเพลินจิต หลังสวน และชิดลม ใกล้ห้างใหญ่และออฟฟิศ": "Central Bangkok around Phloen Chit, Lang Suan and Chit Lom, close to major malls and offices.",
    "ย่านริมถนนพระราม 4 ใกล้ศูนย์การประชุมแห่งชาติสิริกิติ์และสวนเบญจกิติ": "Along Rama 4 Road, near the Queen Sirikit National Convention Centre and Benjakitti Park.",
    "ย่านเมืองเก่าและย่านธุรกิจ ใกล้จุฬาฯ สามย่าน และถนนสีลม": "Around Chulalongkorn University, Sam Yan and the Silom business district.",
    "ย่านรัชดาภิเษก–ห้วยขวาง ตามแนว MRT สายสีน้ำเงิน": "The Ratchadaphisek–Huai Khwang area along the MRT Blue Line."
  };

  /* Context-specific overrides: [css selector, thai, english] */
  var CTX = [
    [".match-form, .sel-chip, .match-breakdown, .match-tags, .tag-ok, .tag-no", "สวน", "Garden"],
    [".hood-illo", "ร้านดัง", "Places"],
    [".detail-heading", "รายละเอียด", "About this room"]
  ];

  var TH_MONTH = { "ม.ค.": "Jan", "ก.พ.": "Feb", "มี.ค.": "Mar", "เม.ย.": "Apr", "พ.ค.": "May", "มิ.ย.": "Jun",
    "ก.ค.": "Jul", "ส.ค.": "Aug", "ก.ย.": "Sep", "ต.ค.": "Oct", "พ.ย.": "Nov", "ธ.ค.": "Dec" };
  function thDate(d, m, y) {
    var out = d + " " + (TH_MONTH[m] || m);
    if (y) { var n = parseInt(y, 10); out += " " + (n > 2400 ? n - 543 : n); }
    return out;
  }
  function plural(n, one, many) { return String(n).replace(/,/g, "") === "1" ? one : many; }

  function name(s) {
    s = String(s).trim();
    if (NAMES[s] != null) return NAMES[s];
    if (EXACT[s] != null) return EXACT[s];
    return replaceNames(s);
  }
  var NAME_KEYS = null;
  function replaceNames(s) {
    if (!TH_RE.test(s)) return s;
    if (!NAME_KEYS) NAME_KEYS = Object.keys(NAMES).sort(function (a, b) { return b.length - a.length; });
    var out = s;
    for (var i = 0; i < NAME_KEYS.length && TH_RE.test(out); i++) {
      var k = NAME_KEYS[i];
      if (out.indexOf(k) !== -1) out = out.split(k).join(NAMES[k]);
    }
    return out;
  }

  var RULES = [
    [/^ประมาณ (\d+) นาที · มีรถ shuttle$/, function (m) { return "About " + m[1] + " min · shuttle"; }],
    [/^พบ (\d+) ห้อง$/, function (m) { return m[1] + plural(m[1], " room found", " rooms found"); }],
    [/^ดู (\d+) ห้อง$/, function (m) { return "Show " + m[1] + plural(m[1], " room", " rooms"); }],
    [/^(\d+) ห้อง$/, function (m) { return m[1] + plural(m[1], " room", " rooms"); }],
    [/^(\d+) ห้องว่าง$/, function (m) { return m[1] + " available"; }],
    [/^(\d+) ห้องในโครงการนี้$/, function (m) { return m[1] + plural(m[1], " room in this project", " rooms in this project"); }],
    [/^ไม่เกิน ([\d,]+)$/, function (m) { return "Up to " + m[1]; }],
    [/^([\d,]+) ขึ้นไป$/, function (m) { return m[1] + "+"; }],
    [/^([\d,]+)–([\d,]+) บาท$/, function (m) { return m[1] + "–" + m[2] + " THB"; }],
    [/^([\d,]+)–([\d,]+) บาท\/เดือน$/, function (m) { return m[1] + "–" + m[2] + " THB/month"; }],
    [/^ตั้งแต่ ([\d,]+) บาท$/, function (m) { return "From " + m[1] + " THB"; }],
    [/^ไม่เกิน ([\d,]+) บาท$/, function (m) { return "Up to " + m[1] + " THB"; }],
    [/^ตั้งแต่ (\d+) ตร\.ม\.$/, function (m) { return "From " + m[1] + " sq.m."; }],
    [/^ไม่เกิน (\d+) ตร\.ม\.$/, function (m) { return "Up to " + m[1] + " sq.m."; }],
    [/^ห้องให้เช่าใน (.+)$/, function (m) { return "Rooms for rent at " + name(m[1]); }],
    [/^ดูห้องอื่นในย่าน(.+)$/, function (m) { return "More rooms in " + name(m[1]); }],
    [/^(.+) ย่าน(.+) คอนโดให้เช่า (\d+) ห้อง \| MoveCondo$/, function (m) { return m[1] + ", " + name(m[2]) + " — " + m[3] + plural(m[3], " room", " rooms") + " for rent | MoveCondo"; }],
    [/^([\d,]+(?:\.\d+)?) บาท\/เดือน$/, function (m) { return m[1] + " THB/month"; }],
    [/^([\d,]+) – ([\d,]+) บาท\/เดือน$/, function (m) { return m[1] + " – " + m[2] + " THB/month"; }],
    [/^([\d,]+) บาท$/, function (m) { return m[1] + " THB"; }],
    [/^(\d+(?:\.\d+)?) ตร\.ม\.$/, function (m) { return m[1] + " sq.m."; }],
    [/^(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?) ตร\.ม\.$/, function (m) { return m[1] + "–" + m[2] + " sq.m."; }],
    [/^กำลังจะว่าง · ว่าง (\d+) (\S+?)(?: (\d{4}))?$/, function (m) { return "Available from " + thDate(m[1], m[2], m[3]); }],
    [/^สถานีใกล้ย่านนี้ ได้แก่ (.+)$/, function (m) { return "Stations near this area: " + m[1].split(" และ ").map(name).join(" and "); }],
    [/^(\d+) ห้องนอน (\d+(?:\.\d+)?) ตร\.ม\.$/, function (m) { return m[1] + " bed · " + m[2] + " sq.m."; }],
    [/^(\d+) ห้องนอน$/, function (m) { return m[1] + plural(m[1], " bedroom", " bedrooms"); }],
    [/^(\d+) ห้องน้ำ$/, function (m) { return m[1] + plural(m[1], " bathroom", " bathrooms"); }],
    [/^(\d+) (เดือน|ปี)$/, function (m) { return m[1] + (m[2] === "ปี" ? plural(m[1], " year", " years") : plural(m[1], " month", " months")); }],
    [/^ประมาณ (\d+) นาทีถึง (.+)$/, function (m) { return "About " + m[1] + " min to " + name(m[2]); }],
    [/^เดินประมาณ (\d+) นาทีถึง (.+)$/, function (m) { return "About " + m[1] + " min walk to " + name(m[2]); }],
    [/^(\d+) นาทีถึง (.+)$/, function (m) { return m[1] + " min to " + name(m[2]); }],
    [/^ประมาณ (\d+) นาที$/, function (m) { return "About " + m[1] + " min"; }],
    [/^ประมาณ (\d+) นาทีจากสถานี$/, function (m) { return "About " + m[1] + " min from the station"; }],
    [/^ใช้เวลาประมาณ (\d+) นาทีจากสถานี \((.+)\)$/, function (m) { return "About " + m[1] + " min from the station (" + tr(m[2]) + ")"; }],
    [/^ประมาณ ([\d.]+) เมตร(?: เส้นตรงจาก(คอนโด|สถานี))?$/, function (m) { return "About " + m[1] + " m" + (m[2] ? " in a straight line from the " + (m[2] === "คอนโด" ? "condo" : "station") : ""); }],
    [/^ประมาณ ([\d.]+) กม\.(?: เส้นตรงจาก(คอนโด|สถานี))?$/, function (m) { return "About " + m[1] + " km" + (m[2] ? " in a straight line from the " + (m[2] === "คอนโด" ? "condo" : "station") : ""); }],
    [/^(เดิน|รถ|รถไฟฟ้า)ประมาณ (\d+) นาที$/, function (m) { return "About " + m[2] + " min " + ({ "เดิน": "walk", "รถ": "by car", "รถไฟฟ้า": "by train" })[m[1]]; }],
    [/^(เดิน|รถ|รถไฟฟ้า)ประมาณ (\d+) นาทีถึง (.+)$/, function (m) { return "About " + m[2] + " min " + ({ "เดิน": "walk", "รถ": "by car", "รถไฟฟ้า": "by train" })[m[1]] + " to " + name(m[3]); }],
    [/^เดิน (\d+) นาทีถึง (.+)$/, function (m) { return m[1] + " min walk to " + name(m[2]); }],
    [/^เดิน ~?(\d+) นาที$/, function (m) { return "~" + m[1] + " min walk"; }],
    [/^(\d+) นาที$/, function (m) { return m[1] + " min"; }],
    [/^≤ (\d+) นาที$/, function (m) { return "≤ " + m[1] + " min"; }],
    [/^จาก (.+)$/, function (m) { return "from " + name(m[1]); }],
    [/^ชั้น (\d+)\s*[–-]\s*(\d+)$/, function (m) { return "Floors " + m[1] + "–" + m[2]; }],
    [/^ช่วงชั้น (\d+)\s*[–-]\s*(\d+)$/, function (m) { return "Floors " + m[1] + "–" + m[2]; }],
    [/^ชั้น (\d+[A-Z]?)$/, function (m) { return "Floor " + m[1]; }],
    [/^ชั้น (\d+[A-Z]?)\s*[–-]\s*(\d+[A-Z]?)$/, function (m) { return "Floors " + m[1] + "–" + m[2]; }],
    [/^ตรง (\d+) จาก (\d+) ข้อ$/, function (m) { return "Matches " + m[1] + " of " + m[2]; }],
    [/^พบ (\d+) ห้องที่ตรง$/, function (m) { return m[1] + plural(m[1], " matching room", " matching rooms"); }],
    [/^(\d+) ห้องจากโครงการใกล้รถไฟฟ้า$/, function (m) { return m[1] + " rooms in projects near the train"; }],
    [/^(\d+) ห้องในย่านนี้$/, function (m) { return m[1] + plural(m[1], " room in this area", " rooms in this area"); }],
    [/^✓ (.+)$/, function (m) { return "✓ " + tr(m[1]); }],
    [/^✕ (.+)$/, function (m) { return "✕ " + tr(m[1]); }],
    [/^ข้อมูลล่าสุด (\d+) (\S+) (\d{4})$/, function (m) { return "Last updated " + thDate(m[1], m[2], m[3]); }],
    [/^ว่าง (\d+) (\S+?)(?: (\d{4}))?$/, function (m) { return "Available " + thDate(m[1], m[2], m[3]); }],
    [/^(?:· )?คะแนนจาก Google \((\d+) (\S+) (\d{4})\)$/, function (m) { return (/^·/.test(m[0]) ? "· " : "") + "Google rating (" + thDate(m[1], m[2], m[3]) + ")"; }],
    [/^([\d.]+) จาก ([\d,]+) รีวิว · คะแนนจาก Google \((\d+) (\S+) (\d{4})\)$/, function (m) { return m[1] + " from " + m[2] + " reviews · Google rating (" + thDate(m[3], m[4], m[5]) + ")"; }],
    [/^สถานี · (.+)$/, function (m) { return "Station · " + name(m[1]); }],
    [/^(.+) \((\d+)\)$/, function (m) { var t = tr(m[1]); return TH_RE.test(t) ? null : t + " (" + m[2] + ")"; }],
    [/^ย่านนี้อยู่ใกล้ (.+) โดยทั่วไปเดินถึงสถานีได้ประมาณ (\d+) นาที$/, function (m) { return "This area is near " + name(m[1]) + "; the station is usually about " + m[2] + " min on foot."; }],
    [/^ย่านนี้อยู่ใกล้สถานี โดยทั่วไปเดินถึงได้ประมาณ (\d+) นาที$/, function (m) { return "This area is close to the station, usually about " + m[1] + " min on foot."; }],
    [/^เดินถึง (.+?)(:?)$/, function (m) { return "Walk to " + name(m[1]) + m[2]; }],
    [/^ทัก LINE เรื่องย่าน(.+)$/, function (m) { return "Ask on LINE about " + name(m[1]); }],
    [/^อ่านหน้าย่าน(.+)$/, function (m) { return "Read the " + name(m[1]) + " guide"; }],
    [/^ทำเลย่าน(.+)$/, function (m) { return name(m[1]) + " location"; }],
    [/^ห้องอื่นในย่าน(.+)$/, function (m) { return "Other rooms in " + name(m[1]); }],
    [/^ภาพประกอบแผนที่อย่างง่ายของย่าน(.+) ไม่ใช่แผนที่จริง$/, function (m) { return "Simple illustrated map of " + name(m[1]) + ", not an actual map"; }],
    [/^แผนที่ 3 มิติย่าน(.*)$/, function (m) { return "3D map of " + name(m[1]); }],
    [/^แผนที่ 3 มิติ (.+)$/, function (m) { return "3D map: " + m[1]; }],
    [/^ภาพห้อง (.+?) ย่าน(.+) ภาพที่ (\d+)$/, function (m) { return m[1] + ", " + name(m[2]) + " — photo " + m[3]; }],
    [/^ห้อง (.+?) ย่าน(.+) ภาพที่ (\d+)$/, function (m) { return m[1] + ", " + name(m[2]) + " — photo " + m[3]; }],
    [/^ห้อง (.+?) ย่าน(.+)$/, function (m) { return m[1] + ", " + name(m[2]); }],
    [/^ภาพห้อง (.+)$/, function (m) { return "Photos of " + m[1]; }],
    [/^ดูห้อง (.+)$/, function (m) { return "View " + m[1]; }],
    [/^ดูภาพที่ ?(\d+)$/, function (m) { return "View photo " + m[1]; }],
    [/^ภาพที่ (\d+)$/, function (m) { return "Photo " + m[1]; }],
    [/^ภาพ: (.+)$/, function (m) { return "Photos: " + creditNames(m[1]); }],
    [/^รหัส (MC-\d+)$/, function (m) { return "Code " + m[1]; }],
    [/^ใกล้ ?(.+)$/, function (m) { var n = name(m[1]); return TH_RE.test(n) ? null : "Near " + n; }],
    [/^(.+) ย่าน(.+) (\d+) ห้องนอน ([\d.]+) ตร\.ม\. ให้เช่า ([\d,]+) บาท\/เดือน \| MoveCondo$/, function (m) {
      return m[1] + ", " + name(m[2]) + " — " + m[3] + "-bedroom, " + m[4] + " sq.m. for rent, " + m[5] + " THB/month | MoveCondo"; }],
    [/^(.+) ย่าน(.+?) (?:(.+?) )?ให้เช่า ([\d,]+) บาท\/เดือน \| MoveCondo$/, function (m) {
      var t = m[3] ? tr(m[3]) : ""; if (TH_RE.test(t)) return null;
      return m[1] + ", " + name(m[2]) + " — " + (t ? t + " " : "") + "for rent, " + m[4] + " THB/month | MoveCondo"; }],
    [/^(.+?) ([\d.]+(?:\s*[–-]\s*[\d.]+)?) ตร\.ม\.$/, function (m) { var t = tr(m[1]); return TH_RE.test(t) ? null : t + ", " + m[2] + " sq.m."; }],
    [/^ย่าน(.+) — ร้านดังและการเดินทาง \| MoveCondo$/, function (m) { return name(m[1]) + " — Popular spots & getting around | MoveCondo"; }],
    [/^สำรวจย่าน ?(.+?) (?:ใกล้ (.+?) )?ร้านดังใกล้สถานี การเดินทาง และไลฟ์สไตล์ย่าน — (.+)$/, function (m) {
      var tail = m[3] === "มีคอนโดเช่าจริงให้ดูแล้วที่ MoveCondo" ? "real rental condos are now listed on MoveCondo." :
        (m[3] === "MoveCondo กำลังเพิ่มห้องจริงเร็ว ๆ นี้" ? "MoveCondo is adding real rooms soon." : tr(m[3]));
      return "Explore " + name(m[1]) + (m[2] ? " near " + name(m[2]) : "") + ": popular spots near the station, getting around and local lifestyle — " + tail; }],
    [/^(.+) ย่าน(.+)$/, function (m) { var a = name(m[2]); return TH_RE.test(a) || TH_RE.test(m[1]) ? null : m[1] + ", " + a; }],
    [/^ย่าน(.+)$/, function (m) { var a = name(m[1]); return TH_RE.test(a) ? null : a; }]
  ];

  function creditNames(s) {
    /* Keep author names and licences as written; translate Thai venue names in brackets. */
    return s.replace(/\(([^)]+)\)/g, function (all, inner) { return "(" + name(inner) + ")"; });
  }

  var CACHE = Object.create(null);
  function tr(src, el) {
    if (src == null) return src;
    var s = String(src).replace(/\s+/g, " ").trim();
    if (!s || !TH_RE.test(s)) return s;
    if (el && el.closest) {
      for (var c = 0; c < CTX.length; c++) {
        if (CTX[c][1] === s && el.closest(CTX[c][0])) return CTX[c][2];
      }
    }
    if (s in CACHE) return CACHE[s];
    var out = translate(s);
    CACHE[s] = out;
    return out;
  }
  function translate(s) {
    if (EXACT[s] != null) return EXACT[s];
    if (NAMES[s] != null) return NAMES[s];
    for (var i = 0; i < RULES.length; i++) {
      var m = s.match(RULES[i][0]);
      if (m) { var r = RULES[i][1](m); if (r != null) return r; }
    }
    if (s.indexOf(" · ") !== -1) {
      var parts = s.split(" · ").map(function (p) { return tr(p); });
      return parts.filter(function (p) { return p !== ""; }).join(" · ");
    }
    var rn = replaceNames(s);
    if (!TH_RE.test(rn)) return rn;
    if (global.__mcI18nDebug) (global.__mcI18nMissing = global.__mcI18nMissing || {})[s] = 1;
    return s;
  }

  /* ---------- DOM translation ---------- */
  var SKIP_SEL = "script, style, noscript, textarea, [data-i18n-skip], .lang-toggle";
  var ATTRS = ["alt", "aria-label", "title", "placeholder"];
  var DONE = typeof WeakMap !== "undefined" ? new WeakMap() : null;

  function skipNode(el) {
    return !el || (el.closest && el.closest(SKIP_SEL));
  }
  function textNode(n) {
    var v = n.nodeValue;
    if (!v || !TH_RE.test(v)) return;
    var el = n.parentElement;
    if (skipNode(el)) return;
    var core = v.replace(/\s+/g, " ").trim();
    var t = tr(core, el);
    if (t === core) return;
    var lead = /^\s/.test(v) ? " " : "", trail = /\s$/.test(v) ? " " : "";
    n.nodeValue = t === "" ? "" : lead + t + trail;
  }
  function attrs(el) {
    if (skipNode(el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (v && TH_RE.test(v)) { var t = tr(v, el); if (t !== v) el.setAttribute(a, t); }
    }
    if (el.tagName === "A") localizeLink(el);
    var de = el.getAttribute("data-en");
    if (de && !el.__mcEn && TH_RE.test(el.textContent || "")) { el.__mcEn = 1; el.textContent = de; }
  }
  function localizeLink(a) {
    var h = a.getAttribute("href");
    if (h == null || /^(#|[a-z]+:|\/\/)/i.test(h) || /[?&]lang=/.test(h)) return;
    var hashAt = h.indexOf("#"), base = hashAt === -1 ? h : h.slice(0, hashAt), hash = hashAt === -1 ? "" : h.slice(hashAt);
    if (/\.(xml|txt|json|png|jpe?g|webp|svg|pdf)$/i.test(base)) return;
    a.setAttribute("href", base + (base.indexOf("?") === -1 ? "?" : "&") + "lang=en" + hash);
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { textNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { if (skipNode(root)) return; attrs(root); }
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
    var n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) textNode(n);
      else attrs(n);
    }
  }
  function head() {
    var t = tr(document.title);
    if (t !== document.title) document.title = t;
    var sel = 'meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]';
    document.querySelectorAll(sel).forEach(function (m) {
      var c = m.getAttribute("content"); if (c && TH_RE.test(c)) m.setAttribute("content", tr(c));
    });
    var loc = document.querySelector('meta[property="og:locale"]'); if (loc) loc.setAttribute("content", "en_US");
    var can = document.querySelector('link[rel="canonical"]');
    if (can) { var h = can.getAttribute("href") || ""; if (!/[?&]lang=en/.test(h)) can.setAttribute("href", h.split("#")[0] + (h.indexOf("?") === -1 ? "?" : "&") + "lang=en"); }
  }

  /* Translate data that area-illo.js measures before drawing, so its overlap-free layout uses English widths. */
  function localizeIlloSpec() {
    var spec = global.AREA_ILLO_SPEC;
    if (!spec || spec.__en) return;
    Object.keys(spec).forEach(function (k) {
      var s = spec[k];
      if (s.road) s.road = name(s.road);
      ["station", "transfer", "cross", "river"].forEach(function (f) { if (s[f] && s[f].name) s[f].name = name(s[f].name); });
      (s.places || []).forEach(function (p) { if (p.name) p.name = name(p.name); if (p.short) p.short = name(p.short); });
    });
    spec.__en = true;
  }

  /* ---------- Toggle ---------- */
  function urlFor(lang) {
    var u = new URL(location.href);
    if (lang === "en") u.searchParams.set("lang", "en"); else u.searchParams.delete("lang");
    return u.pathname + (u.searchParams.toString() ? "?" + u.searchParams.toString() : "") + u.hash;
  }
  function paintToggle() {
    document.querySelectorAll(".lang-toggle [data-lang]").forEach(function (a) {
      var on = a.getAttribute("data-lang") === LANG;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      a.setAttribute("href", urlFor(a.getAttribute("data-lang")));
    });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".lang-toggle [data-lang]");
    if (!a) return;
    e.preventDefault();
    var lang = a.getAttribute("data-lang");
    try { localStorage.setItem(KEY, lang); } catch (err) {}
    if (lang === LANG) return;
    location.assign(urlFor(lang));
  });

  var api = { lang: LANG, t: function (s) { return LANG === "en" ? tr(s) : s; }, dict: EXACT, names: NAMES };
  global.MC_I18N = api;

  function start() {
    paintToggle();
    if (LANG !== "en") { document.documentElement.classList.remove("mc-i18n-wait"); return; }
    document.documentElement.lang = "en";
    document.documentElement.classList.add("mc-en");
    head();
    walk(document.body);
    var obs = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === "characterData") textNode(r.target);
        else if (r.type === "attributes") { if (r.target.nodeType === 1) attrs(r.target); }
        else for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
      }
      if (document.title && TH_RE.test(document.title)) document.title = tr(document.title);
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(["href"]) });
    var canonUrl = urlFor("en");
    if (location.pathname + location.search + location.hash !== canonUrl) {
      try { history.replaceState(history.state, "", canonUrl); } catch (e) {}
    }
    requestAnimationFrame(function () { document.documentElement.classList.remove("mc-i18n-wait"); });
  }

  if (LANG === "en") {
    document.documentElement.lang = "en";
    /* Runs before app.js's DOMContentLoaded render (this script is earlier in document order). */
    localizeIlloSpec();
    document.addEventListener("DOMContentLoaded", localizeIlloSpec);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(typeof window !== "undefined" ? window : this);
