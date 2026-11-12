const PHOTO_AI_LABEL = "ภาพตัวอย่าง (สร้างด้วย AI) ไม่ใช่ห้องจริง";
const SCENE_TH = {
  "living room": "ห้องนั่งเล่น",
  "bedroom": "ห้องนอน",
  "kitchen": "ครัว",
  "bathroom": "ห้องน้ำ",
  "city view": "วิวเมือง",
  "studio living area": "พื้นที่นั่งเล่นสตูดิโอ",
  "kitchenette": "ครัวเล็ก",
  "work desk": "มุมทำงาน",
  "river view": "วิวแม่น้ำ",
  "second bedroom": "ห้องนอนที่สอง"
};
const AREA_SLUGS = {
  "ทองหล่อ": "thonglor",
  "พร้อมพงษ์": "phrom-phong",
  "เอกมัย": "ekkamai",
  "พระโขนง": "phrakhanong",
  "อ่อนนุช": "on-nut",
  "อโศก": "asoke",
  "อารีย์": "ari",
  "พระราม 9": "rama-9",
  "เจริญนคร": "charoennakhon",
  "บางนา": "bangna"
};
const LINE_OA = "@576yhgtz";
const LINE_HREF = "https://line.me/R/ti/p/%40576yhgtz";

const iconBack = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-8 7 8 7"/></svg>`;
const iconCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>`;
const iconClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const SITE_BASE = (typeof location!=='undefined' && /\/movecondo(\/|$)/.test(location.pathname)) ? '/movecondo/' : '/';
function roomHref(id){ return SITE_BASE + 'rooms/' + String(id).toLowerCase() + '/'; }
function areaHref(area){ return SITE_BASE + 'areas/' + (AREA_SLUGS[area]||'') + '/'; }
function photoUrl(id, file, kind){
  const base = SITE_BASE + "images/rooms/" + String(id).toLowerCase() + "/";
  if(kind==="cover") return base + "cover.webp";
  if(kind==="thumb") return base + String(file).replace(".webp","-th.webp");
  return base + file;
}
function listingPhotos(id){
  return (PHOTOS[id]||[]).map(p => ({
    ...p,
    gallery: photoUrl(id, p.file, "gallery"),
    thumb: photoUrl(id, p.file, "thumb"),
    cover: p.file==="1.webp" ? photoUrl(id, p.file, "cover") : undefined
  }));
}
function coverSrc(id){
  const p = (PHOTOS[id]||[])[0];
  return p ? photoUrl(id, p.file, "cover") : "";
}
function photoImg(src, alt, cls, w, h, eager){
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<img class="${cls||""}" src="${src}" alt="${alt}" width="${w}" height="${h}" ${load} draggable="false">`;
}
const LISTINGS = [{"id": "MC-001", "project": "Aspire Onnut Station", "area": "อ่อนนุช", "price": 22000, "size": 34, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 2, "transit": "BTS อ่อนนุช", "floorRange": "1-5", "deposit": "2 months", "lastVerified": "2026-11-11", "blurb": "ให้เช่า Aspire Onnut Station | 1 Bed 34 ตร.ม. ห้องมุม 22,000 บ./เดือน | BTS อ่อนนุช 200 ม. | พร้อมอยู่\n\n1 Bedroom | 1 Bathroom\n34 SQ.M. | Corner Unit\nBuilt-in Furniture | Warm Brow", "amenities": ["เฟอร์นิเจอร์บิลต์อิน", "ห้องมุม"]}, {"id": "MC-002", "project": "Bangkok Feliz Sukhumvit 69-2", "area": "พระโขนง", "price": 13500, "size": 34, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": null, "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 1, "transit": "BTS พระโขนง", "floorRange": "6-10", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า Bangkok Feliz Sukhumvit 69 | 1 Bed 34 SQM. 13,500 บาท/เดือน | ใกล้ BTS พระโขนง 100 เมตร\n\nทำเลสุขุมวิท 69 ติด BTS พระโขนง เดินเพียง 100 เมตรถึงสถานี เดินทางสะดวก เข้าเมืองง่", "amenities": ["เฟอร์นิเจอร์ครบ", "หันทิศเหนือ", "วิวเปิดโล่ง ไม่มีตึกบัง"]}, {"id": "MC-003", "project": "Blocs 77", "area": "อ่อนนุช", "price": 18000, "size": 40, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": null, "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 5, "transit": "BTS อ่อนนุช", "floorRange": "11-15", "deposit": "2 months", "lastVerified": "2026-11-08", "blurb": "ให้เช่า Blocs 77 Sukhumvit 77 | 1 Bed 40 SQM. 18,000 บาท/เดือน | วิวคลอง ใกล้ BTS อ่อนนุช 400 m.\n\nทำเลสุขุมวิท 77 ใกล้ BTS อ่อนนุช เดินทางสะดวก ใกล้ T77 Community และแหล่งช้อปปิ้ง ", "amenities": ["หันทิศใต้", "วิวคลองพระโขนง", "ใกล้ T77 Community", "ใกล้ Big C อ่อนนุช", "ใกล้ Lotus's อ่อนนุช", "ใกล้ Habito Mall"]}, {"id": "MC-004", "project": "Ceil By Sansiri", "area": "เอกมัย", "price": 25000, "size": 46, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 16, "transit": "BTS เอกมัย", "floorRange": "6-10", "deposit": "2 months", "lastVerified": "2026-11-10", "blurb": "ให้เช่า Ceil By Sansiri - Ekkamai 12 - 1 Bedroom 46 Sq.m 25,000 บ./เดือน | ห้องมุม วิวสวย พร้อมเข้าอยู่\n\n• 1 ห้องนอน | 1 ห้องนั่งเล่น | 1 ห้องน้ำ\n• ขนาด 46 ตร.ม. | ห้องมุม\n• วิวสวย", "amenities": ["ห้องมุม", "วิว 270 องศา", "เฟอร์นิเจอร์ครบ", "สระว่ายน้ำ", "ฟิตเนส", "สวน", "ที่จอดรถ 1 คัน", "รถรับส่งฟรีไป BTS เอกมัย"]}, {"id": "MC-005", "project": "Chapter Thonglor 25", "area": "ทองหล่อ", "price": 22000, "size": 35, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 26, "transit": "BTS พร้อมพงษ์", "floorRange": "1-5", "deposit": "2 months", "lastVerified": "2026-11-08", "blurb": "ให้เช่า Chapter Thonglor 25 1 Bedroom 35 Sq.m 22,000 บ./เดือน พร้อมเข้าอยู่\n\n• 1 ห้องนอน | 1 ห้องนั่งเล่น | 1 ห้องน้ำ\n• ขนาด 35 ตร.ม.\n\nเฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ\n\nสิ่งอำนวยค", "amenities": ["เฟอร์นิเจอร์ครบ", "สระว่ายน้ำ", "ฟิตเนส"]}, {"id": "MC-006", "project": "IDEO Mobi Sukhumvit 81", "area": "อ่อนนุช", "price": 24000, "size": 46, "beds": "2 ห้องนอน", "type": "2 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 2, "transit": "BTS อ่อนนุช", "floorRange": "16-20", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า IDEO Mobi Sukhumvit 81 | 2 Bed 1 Bath 46 Sqm. ห้องมุม | 24,000 บ./เดือน ติด BTS อ่อนนุช | พร้อมอยู่\n\nรายละเอียดห้อง | Room Details\n• 2 Bedrooms 1 Bathroom 46 SQ.M.\n• Corner", "amenities": ["ห้องมุม", "เฟอร์นิเจอร์ครบ", "พร้อมเข้าอยู่"]}, {"id": "MC-007", "project": "Kawa Haus", "area": "อ่อนนุช", "price": 19000, "size": 33, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 14, "transit": "BTS อ่อนนุช", "floorRange": "1-5", "deposit": "2 months", "lastVerified": "2026-11-10", "blurb": "ให้เช่า Kawa Haus 1 Bed 33 Sq.m. 19,000 บ./เดือน มีรถรับ-ส่ง ใกล้ BTS อ่อนนุช, Bangkok Prep, Habito Mall พร้อมอยู่\n\n1 ห้องนอน | 1 ห้องน้ำ\nขนาด 33 ตร.ม.\n\nเฟอร์นิเจอร์ + เครื่องใช้ไฟ", "amenities": ["เฟอร์นิเจอร์ครบ", "ฟิตเนส", "สระว่ายน้ำ", "บ่อแช่น้ำอุ่น–เย็น", "Co-working space", "Co-kitchen", "รถรับ–ส่งใน T77 Sansiri Campus และไป BTS อ่อนนุช"]}, {"id": "MC-008", "project": "Kawa Haus", "area": "อ่อนนุช", "price": 20000, "size": 35, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 14, "transit": "BTS อ่อนนุช", "floorRange": "1-5", "deposit": "2 months", "lastVerified": "2026-11-10", "blurb": "ให้เช่า Kawa Haus 1 Bed 35 ตร.ม. 20,000 บ./เดือน | ใกล้ BTS อ่อนนุช, Bangkok Prep, Habito Mall พร้อมอยู่\n\n1 ห้องนอน | 1 ห้องน้ำ\nขนาด 35 ตร.ม.\n\nเฟอร์นิเจอร์ + เครื่องใช้ไฟฟ้าครบ พร้", "amenities": ["เฟอร์นิเจอร์ครบ", "ฟิตเนส", "สระว่ายน้ำ", "บ่อแช่น้ำอุ่น–เย็น", "Co-working space", "Co-kitchen", "รถรับ–ส่งใน T77 และไป BTS อ่อนนุช"]}, {"id": "MC-009", "project": "Kawa Haus", "area": "อ่อนนุช", "price": 23000, "size": 38, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": null, "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 14, "transit": "BTS อ่อนนุช", "floorRange": "6-10", "deposit": "2 months", "lastVerified": "2026-11-12", "blurb": "ให้เช่า Kawa Haus 1 Bedroom 38 Sq.m 23,000 บ./เดือน ห้องมุม วิวสระ และคลอง ใกล้ BTS อ่อนนุช มีรถรับ-ส่ง\n\n• 1 ห้องนอน 1 ห้องน้ำ ห้องมุม\n• ขนาด 38 ตร.ม.\n\nตกแต่งและเฟอร์นิเจอร์ครบ สวย", "amenities": ["ห้องมุม", "เฟอร์นิเจอร์ครบ", "วิวสระและคลอง", "รถรับ–ส่ง"]}, {"id": "MC-010", "project": "Life Sukhumvit 48", "area": "พระโขนง", "price": 16000, "size": 30.5, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 6, "transit": "BTS พระโขนง", "floorRange": "6-10", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า Life Sukhumvit 48 | 1 Bed 30.5 ตร.ม. 16,000 บ./เดือน ใกล้ BTS พระโขนง | พร้อมอยู่\n\n1 Bedroom 1 Bathroom\n30.5 SQ.M.\nFully Furnished & Fully Equipped\n1 Parking Space\n\nใกล้ BT", "amenities": ["เฟอร์นิเจอร์ครบ", "ที่จอดรถ 1 คัน"]}, {"id": "MC-011", "project": "Mori Haus", "area": "อ่อนนุช", "price": 28000, "size": 47, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 14, "transit": "BTS อ่อนนุช", "floorRange": "1-5", "deposit": "2 months", "lastVerified": "2026-11-10", "blurb": "ให้เช่า Mori Haus - 1 Bedroom 47 Sq.m. 28,000 บ./เดือน มีอ่างอาบน้ำ T77 Community ใกล้ BTS อ่อนนุช มีรถรับ-ส่ง พร้อมเข้าอยู่ทันที\n\nทำเลย่านอ่อนนุช – T77 (Sansiri Community) เดินทาง", "amenities": ["อ่างอาบน้ำ", "เฟอร์นิเจอร์ครบ", "โทรทัศน์", "เครื่องซักผ้า", "ตู้เย็น", "ไมโครเวฟ", "กลอนดิจิทัล", "สระว่ายน้ำกลางแจ้ง", "ฟิตเนส", "สวน", "ระบบคีย์การ์ด", "รถรับ–ส่งและรถกอล์ฟฟรี", "วิวสระว่ายน้ำ"]}, {"id": "MC-012", "project": "Nia By Sansiri", "area": "อ่อนนุช", "price": 25000, "size": 48, "beds": "2 ห้องนอน", "type": "2 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 13, "transit": "BTS อ่อนนุช", "floorRange": "11-15", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า Nia By Sansiri สุขุมวิท 71 | 2 Bed 1 Bath 48 ตร.ม. ห้องมุม | 25,000 /เดือน ใกล้ BTS อ่อนนุช\n\nรายละเอียดห้อง\n• 2 ห้องนอน 1 ห้องน้ำ\n• ขนาด 48 ตร.ม.\n• เตียงขนาด 5 ฟุตทั้ง 2 ห้", "amenities": ["ห้องมุม", "เฟอร์นิเจอร์ครบ", "เตียง 5 ฟุต สองห้อง", "สระว่ายน้ำ", "ฟิตเนส", "Co-working space", "สวนบนดาดฟ้า"]}, {"id": "MC-013", "project": "Noble Ora", "area": "ทองหล่อ", "price": 55000, "size": 115, "beds": "2 ห้องนอน", "type": "2 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 19, "transit": "BTS ทองหล่อ", "floorRange": "11-15", "deposit": "2 months", "lastVerified": "2026-11-08", "blurb": "Noble Ora for Rent | 2 Bedrooms | 115 SQ.M. Near BTS Thong Lo 600 m. 55,000 THB/month\n\nSpacious 2-bedroom, 2-bathroom unit, fully furnished and ready to move in.\n\nRoom Details\n• 2 ", "amenities": ["เฟอร์นิเจอร์ครบ", "อ่างอาบน้ำ", "สระว่ายน้ำ", "ฟิตเนส"]}, {"id": "MC-014", "project": "Oka Haus", "area": "ทองหล่อ", "price": 29000, "size": 41, "beds": "2 ห้องนอน", "type": "2 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 18, "transit": "BTS ทองหล่อ", "floorRange": "31-35", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า Oka Haus 2 Bedroom 41 Sq.m 29,000 บ./เดือน ใกล้ BTS ทองหล่อ พร้อมเข้าอยู่\n\n• 2 ห้องนอน | 1 ห้องนั่งเล่น | 1 ห้องน้ำ\n• ขนาด 41 ตร.ม.\n\nเฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ\n\nสิ่ง", "amenities": ["เฟอร์นิเจอร์ครบ", "สระว่ายน้ำ", "ฟิตเนส"]}, {"id": "MC-015", "project": "Rhythm Ekkamai", "area": "เอกมัย", "price": 24000, "size": 30, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 4, "transit": "BTS เอกมัย", "floorRange": "6-10", "deposit": "2 months", "lastVerified": "2026-11-10", "blurb": "ให้เช่า Rhythm Ekkamai | 1 Bedroom 30 SQM. 24,000 บาท/เดือน ห้องมุม ใกล้ BTS เอกมัย 300 ม. พร้อมเข้าอยู่\n\nทำเลเอกมัย เดินทางสะดวก ใกล้แหล่งไลฟ์สไตล์ย่านเอกมัย–ทองหล่อ\n\nรายละเอียดห้", "amenities": ["ห้องมุม", "เฟอร์นิเจอร์ครบ", "หันทิศตะวันออก", "สระว่ายน้ำ", "ฟิตเนส", "สวน", "รปภ. 24 ชั่วโมง"]}, {"id": "MC-016", "project": "The Alcove Thonglor 10", "area": "เอกมัย", "price": 35000, "size": 76, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 16, "transit": "BTS เอกมัย", "floorRange": "16-20", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า The Alcove Thonglor 10 - 1 Bedroom 76 Sq.m 35,000 บ./เดือน ใกล้ BTS เอกมัย ทองหล่อ พร้อมเข้าอยู่\n\n• 1 ห้องนอน | 1 ห้องนั่งเล่น | 1 ห้องน้ำ\n• ขนาด 76 ตร.ม.\n\nเฟอร์นิเจอร์และเ", "amenities": ["เฟอร์นิเจอร์ครบ", "สระว่ายน้ำ", "ฟิตเนส"]}, {"id": "MC-017", "project": "The Base Park West", "area": "อ่อนนุช", "price": 16000, "size": 31, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 10, "transit": "BTS อ่อนนุช", "floorRange": "16-20", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า The Base Park West Sukhumvit 77 | 16,000 บ./เดือน | 1 Bed 31 ตร.ม. ห้องมุม | ใกล้ BTS อ่อนนุช | พร้อมเข้าอยู่\n\n• 1 ห้องนอน 1 ห้องน้ำ ห้องมุม\n• ขนาด 31 ตร.ม.\n• วิวเมือง ทางด", "amenities": ["ห้องมุม", "เฟอร์นิเจอร์ครบ", "วิวเมือง / ทางด่วน", "สระว่ายน้ำ", "ฟิตเนส", "สวน", "ที่จอดรถ", "ระบบคีย์การ์ด"]}, {"id": "MC-018", "project": "The Line Sukhumvit 71", "area": "พระโขนง", "price": 35000, "size": 61.1, "beds": "2 ห้องนอน", "type": "2 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 6, "transit": "BTS พระโขนง", "floorRange": "6-10", "deposit": "2 months", "lastVerified": "2026-11-08", "blurb": "ให้เช่า The Line Sukhumvit 71 | 2 Bedroom 2 Bathroom | 61.1 SQM. | 35,000 บาท/เดือน\n\nทำเลสุขุมวิท 71 ใกล้ BTS พระโขนง เพียง 450 เมตร เดินทางสะดวก เชื่อมต่อเอกมัยและทองหล่อ\n\nรายละเอ", "amenities": ["เฟอร์นิเจอร์ครบ", "สระว่ายน้ำ", "ฟิตเนส", "Co-working space", "สวน", "รปภ. 24 ชั่วโมง"]}, {"id": "MC-019", "project": "The Niche Pride Thonglor-Petchaburi", "area": "ทองหล่อ", "price": 16000, "size": 36, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "2026-11-30", "status": "OCCUPIED", "statusLabel": "ว่าง 30 พ.ย.", "walk": 28, "transit": "MRT เพชรบุรี", "floorRange": "21-25", "deposit": "2 months", "lastVerified": "2026-11-08", "blurb": "ให้เช่า The Niche Pride Thonglor-Petchaburi 1 Bed 36 Sq.m 16,000 บ./เดือน วิวสูง วิวโล่ง ว่าง 30 พ.ย. นี้\n\n• ห้อง Fully Furnished พร้อมเข้าอยู่\n• หันทิศใต้ วิวฝั่งทองหล่อ–อโศก ไม่ม", "amenities": ["เฟอร์นิเจอร์ครบ", "หันทิศใต้", "วิวโล่งฝั่งทองหล่อ–อโศก", "รถรับ–ส่งไป BTS ทองหล่อ และ MRT เพชรบุรี"]}, {"id": "MC-020", "project": "The Room Sukhumvit 21", "area": "อโศก", "price": 30000, "size": 53.09, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": "now", "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 7, "transit": "MRT เพชรบุรี", "floorRange": "21-25", "deposit": "2 months", "lastVerified": "2026-11-07", "blurb": "ให้เช่า The Room สุขุมวิท 21 1 Bedroom 53.09 Sq.m 30,000 บ./เดือน วิวสวย ใกล้ MRT เพชรบุรี 550 เมตร พร้อมเข้าอยู่\n\n• 1 ห้องนอน | 1 ห้องนั่งเล่น | 1 ห้องน้ำ\n• ขนาด 53.09 ตร.ม.\n• วิว", "amenities": ["เฟอร์นิเจอร์ครบ", "สระว่ายน้ำ", "ฟิตเนส", "ห้องสมุด", "สวน", "ที่จอดรถ"]}, {"id": "MC-021", "project": "The Teak Sukhumvit 39", "area": "พร้อมพงษ์", "price": 28000, "size": 41, "beds": "1 ห้องนอน", "type": "1 ห้องนอน", "pets": false, "available": null, "status": "AVAILABLE", "statusLabel": "ว่าง", "walk": 18, "transit": "BTS พร้อมพงษ์", "floorRange": "6-10", "deposit": "2 months", "lastVerified": "2026-11-08", "blurb": "ให้เช่า The Teak Sukhumvit 39 - 1 Bed Plus 41 Sq.m (มีอ่างอาบน้ำ) 28,000 บ./เดือน ใกล้ BTS พร้อมพงษ์\n\n• 1 ห้องนอน 1 ห้องน้ำ พร้อมอ่างอาบน้ำ\n• 41 Sq.m.\n• ห้องนั่งเล่นและพื้นที่รับปร", "amenities": ["อ่างอาบน้ำ", "เฟอร์นิเจอร์ครบ", "มีชุดเครื่องนอน", "ห้องนั่งเล่นและพื้นที่รับประทานอาหาร", "ครัว/pantry พร้อมอุปกรณ์พื้นฐาน"]}];
const PHOTOS = {"MC-001": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}], "MC-002": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}], "MC-003": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 960, "h": 720}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 720, "h": 960}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 960, "h": 720}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 960, "h": 720}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 960, "h": 720}], "MC-004": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 1080, "h": 810}, {"file": "10.webp", "label": "ภาพที่ 10", "w": 1080, "h": 810}], "MC-005": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}], "MC-006": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 1080, "h": 810}, {"file": "10.webp", "label": "ภาพที่ 10", "w": 1080, "h": 810}], "MC-007": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}], "MC-008": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}], "MC-009": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}], "MC-010": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 960, "h": 720}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}], "MC-011": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 1080, "h": 810}], "MC-012": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 1080, "h": 810}, {"file": "10.webp", "label": "ภาพที่ 10", "w": 1080, "h": 810}], "MC-013": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}], "MC-014": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 810, "h": 1080}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 810, "h": 1080}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 810, "h": 1080}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 810, "h": 1080}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 810, "h": 1080}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 810, "h": 1080}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 813, "h": 1080}, {"file": "10.webp", "label": "ภาพที่ 10", "w": 1080, "h": 813}, {"file": "11.webp", "label": "ภาพที่ 11", "w": 1080, "h": 813}, {"file": "12.webp", "label": "ภาพที่ 12", "w": 1080, "h": 810}, {"file": "13.webp", "label": "ภาพที่ 13", "w": 1080, "h": 810}], "MC-015": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 810, "h": 1080}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 810, "h": 1080}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 810, "h": 1080}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 810, "h": 1080}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 810, "h": 1080}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 810, "h": 1080}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 810, "h": 1080}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 810, "h": 1080}], "MC-016": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 810, "h": 1080}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 810, "h": 1080}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 810, "h": 1080}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 810, "h": 1080}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 810, "h": 1080}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 810, "h": 1080}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 720, "h": 960}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 810, "h": 1080}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 810, "h": 1080}], "MC-017": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 793}], "MC-018": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 1080, "h": 810}], "MC-019": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 1080, "h": 810}], "MC-020": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 810, "h": 1080}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 810, "h": 1080}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 810, "h": 1080}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 810, "h": 1080}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 810, "h": 1080}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 810, "h": 1080}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 810, "h": 1080}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 810, "h": 1080}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 810, "h": 1080}, {"file": "10.webp", "label": "ภาพที่ 10", "w": 810, "h": 1080}, {"file": "11.webp", "label": "ภาพที่ 11", "w": 810, "h": 1080}, {"file": "12.webp", "label": "ภาพที่ 12", "w": 810, "h": 1080}, {"file": "13.webp", "label": "ภาพที่ 13", "w": 810, "h": 1080}], "MC-021": [{"file": "1.webp", "label": "ภาพที่ 1", "w": 1080, "h": 810}, {"file": "2.webp", "label": "ภาพที่ 2", "w": 1080, "h": 810}, {"file": "3.webp", "label": "ภาพที่ 3", "w": 1080, "h": 810}, {"file": "4.webp", "label": "ภาพที่ 4", "w": 1080, "h": 810}, {"file": "5.webp", "label": "ภาพที่ 5", "w": 1080, "h": 810}, {"file": "6.webp", "label": "ภาพที่ 6", "w": 1080, "h": 810}, {"file": "7.webp", "label": "ภาพที่ 7", "w": 1080, "h": 810}, {"file": "8.webp", "label": "ภาพที่ 8", "w": 1080, "h": 810}, {"file": "9.webp", "label": "ภาพที่ 9", "w": 1080, "h": 810}, {"file": "10.webp", "label": "ภาพที่ 10", "w": 1080, "h": 810}]};


const NEARBY = {
  "ทองหล่อ": {
    "station": "BTS ทองหล่อ",
    "places": [
      {
        "name": "theCOMMONS",
        "category": "ช็อปปิ้ง",
        "station": "BTS ทองหล่อ",
        "mode": "รถ",
        "minutes": 8,
        "mapsQuery": "theCOMMONS Thonglor Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "CPS Coffee Sukhumvit 53",
        "category": "คาเฟ่",
        "station": "BTS ทองหล่อ",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "CPS Coffee Sukhumvit 53 Thonglor Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "Baan Ice",
        "category": "ร้านอาหาร",
        "station": "BTS ทองหล่อ",
        "mode": "เดิน",
        "minutes": 10,
        "mapsQuery": "Baan Ice Thonglor Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "Rabbit Hole",
        "category": "บาร์",
        "station": "BTS ทองหล่อ",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Rabbit Hole Thonglor Bangkok",
        "x": 70,
        "y": 66
      },
      {
        "name": "Folk Lane",
        "category": "คาเฟ่",
        "station": "BTS ทองหล่อ",
        "mode": "เดิน",
        "minutes": 12,
        "mapsQuery": "Folk Lane Sukhumvit 38 Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  },
  "พร้อมพงษ์": {
    "station": "BTS พร้อมพงษ์",
    "places": [
      {
        "name": "EmQuartier",
        "category": "ช็อปปิ้ง",
        "station": "BTS พร้อมพงษ์",
        "mode": "เดิน",
        "minutes": 3,
        "mapsQuery": "EmQuartier Phrom Phong Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "EmSphere",
        "category": "ช็อปปิ้ง",
        "station": "BTS พร้อมพงษ์",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "EmSphere Phrom Phong Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "Audrey Cafe EmQuartier",
        "category": "คาเฟ่",
        "station": "BTS พร้อมพงษ์",
        "mode": "เดิน",
        "minutes": 4,
        "mapsQuery": "Audrey Cafe EmQuartier Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "สวนเบญจสิริ",
        "category": "สวน",
        "station": "BTS พร้อมพงษ์",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "Benjasiri Park พร้อมพงษ์",
        "x": 70,
        "y": 66
      },
      {
        "name": "Err Urban Rustic Thai",
        "category": "ร้านอาหาร",
        "station": "BTS พร้อมพงษ์",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Err Urban Rustic Thai Sukhumvit 32 Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  },
  "เอกมัย": {
    "station": "BTS เอกมัย",
    "places": [
      {
        "name": "Gateway Ekkamai",
        "category": "ช็อปปิ้ง",
        "station": "BTS เอกมัย",
        "mode": "เดิน",
        "minutes": 2,
        "mapsQuery": "Gateway Ekkamai Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "Donki Mall Ekkamai",
        "category": "ช็อปปิ้ง",
        "station": "BTS เอกมัย",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "Donki Mall Ekkamai Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "Kaizen Coffee",
        "category": "คาเฟ่",
        "station": "BTS เอกมัย",
        "mode": "รถ",
        "minutes": 6,
        "mapsQuery": "Kaizen Coffee Ekkamai Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "Wattana Panich",
        "category": "ร้านอาหาร",
        "station": "BTS เอกมัย",
        "mode": "รถ",
        "minutes": 8,
        "mapsQuery": "Wattana Panich Ekkamai Bangkok",
        "x": 70,
        "y": 66
      },
      {
        "name": "Iron Balls Distillery & Bar",
        "category": "บาร์",
        "station": "BTS เอกมัย",
        "mode": "เดิน",
        "minutes": 10,
        "mapsQuery": "Iron Balls Ekkamai Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  },
  "พระโขนง": {
    "station": "BTS พระโขนง",
    "places": [
      {
        "name": "W District",
        "category": "ช็อปปิ้ง",
        "station": "BTS พระโขนง",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "W District Phra Khanong Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "Hands and Heart Coffee Roasters",
        "category": "คาเฟ่",
        "station": "BTS พระโขนง",
        "mode": "เดิน",
        "minutes": 10,
        "mapsQuery": "Hands and Heart Coffee Roasters Sukhumvit 67 Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "Épicurien French Bakery",
        "category": "คาเฟ่",
        "station": "BTS พระโขนง",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "Epicurien French Bakery W District Phra Khanong",
        "x": 30,
        "y": 70
      },
      {
        "name": "Shakariki432",
        "category": "ร้านอาหาร",
        "station": "BTS พระโขนง",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Shakariki432 Phra Khanong Bangkok",
        "x": 70,
        "y": 66
      }
    ]
  },
  "อ่อนนุช": {
    "station": "BTS อ่อนนุช",
    "places": [
      {
        "name": "Lotus's อ่อนนุช",
        "category": "ช็อปปิ้ง",
        "station": "BTS อ่อนนุช",
        "mode": "เดิน",
        "minutes": 3,
        "mapsQuery": "Lotus's On Nut Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "ตลาดอ่อนนุช",
        "category": "ช็อปปิ้ง",
        "station": "BTS อ่อนนุช",
        "mode": "เดิน",
        "minutes": 10,
        "mapsQuery": "ตลาดอ่อนนุช On Nut Market Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "THE WOOD LAND",
        "category": "คาเฟ่",
        "station": "BTS อ่อนนุช",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "THE WOOD LAND cafe Sukhumvit 52 On Nut Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "THE NEIGHBORWOOD",
        "category": "คาเฟ่",
        "station": "BTS อ่อนนุช",
        "mode": "เดิน",
        "minutes": 10,
        "mapsQuery": "THE NEIGHBORWOOD T77 On Nut Bangkok",
        "x": 70,
        "y": 66
      },
      {
        "name": "สวนหลวง ร.9",
        "category": "สวน",
        "station": "BTS อ่อนนุช",
        "mode": "รถ",
        "minutes": 20,
        "mapsQuery": "สวนหลวง ร.9 Suan Luang Rama IX Park Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  },
  "อารีย์": {
    "station": "BTS อารีย์",
    "places": [
      {
        "name": "NANA Coffee Roasters",
        "category": "คาเฟ่",
        "station": "BTS อารีย์",
        "mode": "เดิน",
        "minutes": 6,
        "mapsQuery": "NANA Coffee Roasters Ari Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "Ongtong Khaosoi",
        "category": "ร้านอาหาร",
        "station": "BTS อารีย์",
        "mode": "เดิน",
        "minutes": 2,
        "mapsQuery": "Ongtong Khaosoi Ari Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "Lay Lao",
        "category": "ร้านอาหาร",
        "station": "BTS อารีย์",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Lay Lao Ari Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "After You Dessert Cafe La Villa Aree",
        "category": "คาเฟ่",
        "station": "BTS อารีย์",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "After You La Villa Aree Bangkok",
        "x": 70,
        "y": 66
      },
      {
        "name": "GUMP'S Ari",
        "category": "ช็อปปิ้ง",
        "station": "BTS อารีย์",
        "mode": "เดิน",
        "minutes": 10,
        "mapsQuery": "GUMP'S Ari Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  },
  "เจริญนคร": {
    "station": "BTS กรุงธนบุรี",
    "places": [
      {
        "name": "ICONSIAM",
        "category": "ช็อปปิ้ง",
        "station": "BTS เจริญนคร (สายสีทอง)",
        "mode": "รถไฟฟ้า",
        "minutes": 5,
        "mapsQuery": "ICONSIAM Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "SookSiam",
        "category": "ช็อปปิ้ง",
        "station": "BTS เจริญนคร (สายสีทอง)",
        "mode": "รถไฟฟ้า",
        "minutes": 5,
        "mapsQuery": "SookSiam ICONSIAM Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "After You Dessert Cafe ICONSIAM",
        "category": "คาเฟ่",
        "station": "BTS เจริญนคร (สายสีทอง)",
        "mode": "รถไฟฟ้า",
        "minutes": 5,
        "mapsQuery": "After You ICONSIAM Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "Nara Thai Cuisine ICONSIAM",
        "category": "ร้านอาหาร",
        "station": "BTS เจริญนคร (สายสีทอง)",
        "mode": "รถไฟฟ้า",
        "minutes": 5,
        "mapsQuery": "Nara Thai Cuisine ICONSIAM Bangkok",
        "x": 70,
        "y": 66
      },
      {
        "name": "Lhong 1919",
        "category": "ช็อปปิ้ง",
        "station": "BTS กรุงธนบุรี",
        "mode": "รถ",
        "minutes": 10,
        "mapsQuery": "Lhong 1919 Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  },
  "อโศก": {
    "station": "BTS อโศก / MRT สุขุมวิท",
    "places": [
      {
        "name": "Terminal 21 Asok",
        "category": "ช็อปปิ้ง",
        "station": "BTS อโศก / MRT สุขุมวิท",
        "mode": "เดิน",
        "minutes": 2,
        "mapsQuery": "Terminal 21 Asok Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "After You Dessert Cafe Terminal 21 Asok",
        "category": "คาเฟ่",
        "station": "BTS อโศก / MRT สุขุมวิท",
        "mode": "เดิน",
        "minutes": 3,
        "mapsQuery": "After You Terminal 21 Asok Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "Cabbages & Condoms",
        "category": "ร้านอาหาร",
        "station": "BTS อโศก",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Cabbages and Condoms Sukhumvit 12 Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "Bartels Asok",
        "category": "คาเฟ่",
        "station": "BTS อโศก",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Bartels Asok Bangkok",
        "x": 70,
        "y": 66
      },
      {
        "name": "สวนเบญจกิติ",
        "category": "สวน",
        "station": "MRT ศูนย์การประชุมแห่งชาติสิริกิติ์",
        "mode": "รถไฟฟ้า",
        "minutes": 5,
        "mapsQuery": "Benjakitti Forest Park Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  },
  "พระราม 9": {
    "station": "MRT พระราม 9",
    "places": [
      {
        "name": "เซ็นทรัลพระราม 9",
        "category": "ช็อปปิ้ง",
        "station": "MRT พระราม 9",
        "mode": "เดิน",
        "minutes": 4,
        "mapsQuery": "Central Rama 9 Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "ฮั่วเซ่งฮง เซ็นทรัลพระราม 9",
        "category": "ร้านอาหาร",
        "station": "MRT พระราม 9",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "Hua Seng Hong Central Rama 9 Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "ฟอร์จูนทาวน์",
        "category": "ช็อปปิ้ง",
        "station": "MRT พระราม 9",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Fortune Town Rama 9 Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "After You Dessert Cafe Esplanade Ratchadapisek",
        "category": "คาเฟ่",
        "station": "MRT ศูนย์วัฒนธรรมแห่งประเทศไทย",
        "mode": "รถไฟฟ้า",
        "minutes": 5,
        "mapsQuery": "After You Esplanade Ratchadapisek Bangkok",
        "x": 70,
        "y": 66
      }
    ]
  },
  "บางนา": {
    "station": "BTS บางนา",
    "places": [
      {
        "name": "เซ็นทรัล บางนา",
        "category": "ช็อปปิ้ง",
        "station": "BTS บางนา",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "Central Bangna Bangkok",
        "x": 42,
        "y": 38
      },
      {
        "name": "BITEC",
        "category": "ช็อปปิ้ง",
        "station": "BTS บางนา",
        "mode": "เดิน",
        "minutes": 5,
        "mapsQuery": "BITEC Bang Na Bangkok",
        "x": 72,
        "y": 32
      },
      {
        "name": "SAMA Garden",
        "category": "สวน",
        "station": "BTS บางนา",
        "mode": "เดิน",
        "minutes": 8,
        "mapsQuery": "SAMA Garden BITEC Bang Na Bangkok",
        "x": 30,
        "y": 70
      },
      {
        "name": "เมกาบางนา",
        "category": "ช็อปปิ้ง",
        "station": "BTS อุดมสุข",
        "mode": "รถ",
        "minutes": 15,
        "mapsQuery": "Mega Bangna Bangkok",
        "x": 70,
        "y": 66
      },
      {
        "name": "After You Dessert Cafe Megabangna",
        "category": "คาเฟ่",
        "station": "BTS อุดมสุข",
        "mode": "รถ",
        "minutes": 15,
        "mapsQuery": "After You Mega Bangna Bangkok",
        "x": 52,
        "y": 56
      }
    ]
  }
};
const NEARBY_NOTE = "ระยะเวลาโดยประมาณ คำนวณจากสถานีรถไฟฟ้า";

const AREAS = ["ทองหล่อ", "พร้อมพงษ์", "เอกมัย", "พระโขนง", "อ่อนนุช", "อโศก", "อารีย์", "พระราม 9", "เจริญนคร", "บางนา"];

const AREA_PROFILES = {
  "ทองหล่อ": { line:"BTS สายสุขุมวิท", station:"BTS ทองหล่อ", walkTypical:5, vibe:"ย่านไลฟ์สไตล์บนเส้นสุขุมวิท ร้านอาหารรอบสถานีคึกคักยามเย็น", travel:"ขึ้นรถไฟฟ้าสายสีเขียวได้ที่สถานีทองหล่อ ต่อสถานีใกล้เคียงได้โดยไม่ต้องเปลี่ยนสาย", lifestyle:"บรรยากาศย่านเน้นร้านอาหารและพื้นที่นั่งเล่นในซอย เหมาะกับคนที่อยากได้ทั้งความสะดวกและการออกไปหาอะไรกินใกล้บ้าน", nearby:[
    {name:"สถานี BTS ทองหล่อ", kind:"รถไฟฟ้า", walk:5, mode:"เดิน", x:34, y:74},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:6, mode:"เดิน", x:68, y:40},
    {name:"สวนสาธารณะในซอย", kind:"สวน", walk:9, mode:"เดิน", x:28, y:36},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:7, mode:"เดิน", x:72, y:68},
    {name:"ศูนย์การค้าในย่าน", kind:"ช้อปปิ้ง", walk:11, mode:"เดิน", x:30, y:72}
  ]},
  "เอกมัย": { line:"BTS สายสุขุมวิท", station:"BTS เอกมัย", walkTypical:4, vibe:"บรรยากาศอยู่อาศัยสงบกว่าย่านข้างเคียง แต่ยังเดินทางต่อบนเส้นเดียวกันได้สะดวก", travel:"สถานี BTS เอกมัยอยู่บนสายสีเขียว ต่อเข้ากลางเมืองหรือลงไปย่านอื่นบนเส้นสุขุมวิทได้ตรงๆ", lifestyle:"ซอยค่อนข้างเงียบ มีร้านกาแฟและพื้นที่สีเขียวขนาดย่อม เหมาะกับคนที่อยู่อาศัยยาว", nearby:[
    {name:"สถานี BTS เอกมัย", kind:"รถไฟฟ้า", walk:4, mode:"เดิน", x:34, y:74},
    {name:"สวนออกกำลังกาย", kind:"สวน", walk:7, mode:"เดิน", x:26, y:38},
    {name:"ตลาดเช้าชุมชน", kind:"ตลาด", walk:8, mode:"เดิน", x:70, y:34},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:6, mode:"เดิน", x:74, y:70},
    {name:"ร้านหนังสือชุมชน", kind:"ไลฟ์สไตล์", walk:10, mode:"เดิน", x:32, y:74}
  ]},
  "พระโขนง": { line:"BTS สายสุขุมวิท", station:"BTS พระโขนง", walkTypical:5, vibe:"ย่านที่กำลังเติบโตบนเส้นเดียวกับอ่อนนุชและเอกมัย ตัวเลือกห้องในช่วงงบกลางค่อนข้างหลากหลาย", travel:"ขึ้น BTS พระโขนง แล้วเลื่อนบนสายสีเขียวได้ทั้งขึ้นเหนือและลงใต้โดยไม่เปลี่ยนสาย", lifestyle:"รอบสถานีมีตลาดและร้านอาหารท้องถิ่น บรรยากาศเป็นย่านอยู่อาศัยมากกว่าย่านเที่ยวกลางคืน", nearby:[
    {name:"สถานี BTS พระโขนง", kind:"รถไฟฟ้า", walk:4, mode:"เดิน", x:34, y:74},
    {name:"ตลาดเช้าชุมชน", kind:"ตลาด", walk:6, mode:"เดิน", x:68, y:36},
    {name:"สวนสาธารณะในซอย", kind:"สวน", walk:9, mode:"เดิน", x:26, y:40},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:7, mode:"เดิน", x:76, y:66},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:8, mode:"เดิน", x:30, y:74}
  ]},
  "อ่อนนุช": { line:"BTS สายสุขุมวิท", station:"BTS อ่อนนุช", walkTypical:5, vibe:"ย่านอยู่อาศัยที่ใช้ชีวิตประจำวันได้ครบ รอบสถานีมีตลาดและร้านค้า", travel:"สถานี BTS อ่อนนุชอยู่บนสายสีเขียว เดินทางเข้ากลางเมืองได้โดยตรง และต่อลงใต้ได้ต่อเนื่อง", lifestyle:"รอบสถานีมีตลาดเช้า ร้านอาหารในซอย และสวนชุมชน เหมาะกับคนที่อยากได้ความสะดวกแบบไม่ต้องอยู่ใจกลางที่สุด", nearby:[
    {name:"สถานี BTS อ่อนนุช", kind:"รถไฟฟ้า", walk:3, mode:"เดิน", x:34, y:74},
    {name:"ตลาดเช้าชุมชน", kind:"ตลาด", walk:6, mode:"เดิน", x:70, y:34},
    {name:"สวนสาธารณะในซอย", kind:"สวน", walk:8, mode:"เดิน", x:26, y:38},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:7, mode:"เดิน", x:76, y:68},
    {name:"ศูนย์การค้าในย่าน", kind:"ช้อปปิ้ง", walk:12, mode:"เดิน", x:30, y:74}
  ]},
  "อโศก": { line:"BTS สายสุขุมวิท", station:"BTS อโศก", walkTypical:5, vibe:"ใจกลางเมือง เชื่อมต่อได้หลายเส้นทาง เน้นความสะดวกในการเดินทางเป็นหลัก", travel:"สถานี BTS อโศกเชื่อมต่อพื้นที่กลางสุขุมวิทได้เร็ว และต่อรถไฟฟ้าสายอื่นในระยะเดินได้", lifestyle:"รอบสถานีหนาแน่นด้วยอาคารสำนักงานและร้านอาหาร เหมาะกับคนที่อยากอยู่ใกล้ที่ทำงาน", nearby:[
    {name:"สถานี BTS อโศก", kind:"รถไฟฟ้า", walk:4, mode:"เดิน", x:34, y:74},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:5, mode:"เดิน", x:70, y:36},
    {name:"สวนสาธารณะในซอย", kind:"สวน", walk:10, mode:"เดิน", x:24, y:40},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:6, mode:"เดิน", x:76, y:70},
    {name:"ศูนย์การค้าในย่าน", kind:"ช้อปปิ้ง", walk:8, mode:"เดิน", x:28, y:74}
  ]},
  "อารีย์": { line:"BTS สายสุขุมวิท", station:"BTS อารีย์", walkTypical:4, vibe:"บรรยากาศย่านคาเฟ่และที่อยู่อาศัยระยะยาว", travel:"ขึ้น BTS อารีย์ บนสายสีเขียว เดินทางเข้าสยามและต่อลงใต้ได้โดยไม่ต้องย้ายสาย", lifestyle:"ซอยเดินเล่นได้ มีร้านกาแฟและพื้นที่สีเขียวขนาดย่อม เหมาะกับคนที่อยากได้จังหวะช้ากว่าย่านธุรกิจ", nearby:[
    {name:"สถานี BTS อารีย์", kind:"รถไฟฟ้า", walk:4, mode:"เดิน", x:34, y:74},
    {name:"ร้านหนังสือชุมชน", kind:"ไลฟ์สไตล์", walk:6, mode:"เดิน", x:68, y:34},
    {name:"สวนออกกำลังกาย", kind:"สวน", walk:8, mode:"เดิน", x:26, y:38},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:7, mode:"เดิน", x:74, y:68},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:5, mode:"เดิน", x:30, y:74}
  ]},
  "พระราม 9": { line:"MRT สายสีน้ำเงิน", station:"MRT พระราม 9", walkTypical:6, vibe:"ย่านธุรกิจฝั่งตะวันออก โทนสงบ ใกล้สถานีใต้ดินมากกว่าสายสีเขียว", travel:"ใช้ MRT พระราม 9 เป็นหลัก แล้วต่อสายสีน้ำเงินเข้ากลางเมืองหรือออกนอกได้", lifestyle:"รอบสถานีมีอาคารสำนักงานและพื้นที่พักรับประทานอาหาร เหมาะกับคนที่ทำงานในย่านนี้", nearby:[
    {name:"สถานี MRT พระราม 9", kind:"รถไฟฟ้า", walk:6, mode:"เดิน", x:34, y:74},
    {name:"ศูนย์การค้าในย่าน", kind:"ช้อปปิ้ง", walk:8, mode:"เดิน", x:70, y:34},
    {name:"สวนสาธารณะในซอย", kind:"สวน", walk:11, mode:"เดิน", x:24, y:40},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:7, mode:"เดิน", x:76, y:68},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:6, mode:"เดิน", x:30, y:74}
  ]},
  "เจริญนคร": { line:"BTS สายสีทอง", station:"BTS กรุงธนบุรี", walkTypical:10, vibe:"ย่านริมแม่น้ำฝั่งธนบุรี บรรยากาศอยู่อาศัยริมน้ำและเดินทางเข้าสาทรได้", travel:"ใช้ BTS กรุงธนบุรีเป็นสถานีหลัก แล้วต่อเข้าสายอื่นหรือเดินทางต่อเข้าเมืองได้", lifestyle:"รอบย่านมีทางเดินริมน้ำ ร้านอาหาร และพื้นที่พักผ่อน เหมาะกับคนที่อยากได้อากาศโล่งกว่าย่านกลาง", nearby:[
    {name:"สถานี BTS กรุงธนบุรี", kind:"รถไฟฟ้า", walk:10, mode:"เดิน", x:34, y:74},
    {name:"ทางเดินริมน้ำชุมชน", kind:"ไลฟ์สไตล์", walk:8, mode:"เดิน", x:70, y:36},
    {name:"สวนสาธารณะในซอย", kind:"สวน", walk:9, mode:"เดิน", x:26, y:40},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:11, mode:"เดิน", x:76, y:68},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:7, mode:"เดิน", x:30, y:74}
  ]},
  "บางนา": { line:"BTS สายสุขุมวิท", station:"BTS บางนา", walkTypical:7, vibe:"ย่านตะวันออกใกล้ทางขึ้นลงเมืองและรถไฟฟ้าสายสีเขียว", travel:"ขึ้น BTS บางนา แล้วย้อนเข้ากลางเมืองบนสายสีเขียวได้ตลอดเส้น", lifestyle:"พื้นที่กว้างกว่าย่านในเมือง มีตลาดและร้านอาหารครอบครัวในระยะเดินหรือต่อรถสั้นๆ", nearby:[
    {name:"สถานี BTS บางนา", kind:"รถไฟฟ้า", walk:7, mode:"เดิน", x:34, y:74},
    {name:"ตลาดเช้าชุมชน", kind:"ตลาด", walk:8, mode:"เดิน", x:70, y:34},
    {name:"สวนออกกำลังกาย", kind:"สวน", walk:9, mode:"เดิน", x:26, y:40},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:8, mode:"เดิน", x:76, y:68},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:6, mode:"เดิน", x:30, y:74}
  ]},
  "พร้อมพงษ์": { line:"BTS สายสุขุมวิท", station:"BTS พร้อมพงษ์", walkTypical:6, vibe:"ย่านกลางสุขุมวิท เดินทางต่อบนสายสีเขียวได้สะดวก", travel:"สถานี BTS พร้อมพงษ์อยู่บนสายสีเขียว ต่อขึ้นเหนือหรือลงใต้ได้โดยไม่ต้องเปลี่ยนสาย", lifestyle:"รอบสถานีมีสวน ร้านอาหาร และแหล่งไลฟ์สไตล์ในระยะเดิน เหมาะกับครอบครัวหรือคนที่อยากได้พื้นที่มากขึ้น", nearby:[
    {name:"สถานี BTS พร้อมพงษ์", kind:"รถไฟฟ้า", walk:6, mode:"เดิน", x:34, y:74},
    {name:"สวนสาธารณะในซอย", kind:"สวน", walk:8, mode:"เดิน", x:26, y:38},
    {name:"ลานอาหารชุมชน", kind:"อาหาร", walk:5, mode:"เดิน", x:70, y:34},
    {name:"คลินิกใกล้สถานี", kind:"สุขภาพ", walk:7, mode:"เดิน", x:76, y:68},
    {name:"ศูนย์การค้าในย่าน", kind:"ช้อปปิ้ง", walk:9, mode:"เดิน", x:30, y:74}
  ]}
};

const GALLERY_SCENES = [
  { id:"living", label:"ห้องนั่งเล่น" },
  { id:"kitchen", label:"ครัว" },
  { id:"bedroom", label:"ห้องนอน" },
  { id:"balcony", label:"ระเบียง" }
];

let homeArea = "อ่อนนุช";
let hoodPin = 0;
let galleryIdx = 0;

const TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function thDate(iso){
  const [y,m,d] = iso.split("-").map(Number);
  return `${d} ${TH_MONTHS[m-1]} ${y+543}`;
}
function money(n){ return n.toLocaleString("th-TH"); }
function vsMarket(l){
  const pct = Math.round(((l.avg - l.price) / l.avg) * 100);
  if (pct >= 2) return { kind:"good", text:`ถูกกว่าค่าเฉลี่ยในโครงการ ${pct}%`, pct };
  if (pct <= -2) return { kind:"high", text:`สูงกว่าค่าเฉลี่ยในโครงการ ${Math.abs(pct)}%`, pct };
  return { kind:"mid", text:"ใกล้เคียงค่าเฉลี่ยในโครงการ", pct };
}
function pos(price, min, max){
  const p = (price - min) / (max - min);
  return Math.min(92, Math.max(8, p * 100));
}
function artHTML(art, scene){
  const sc = scene || "living";
  return `<div class="art c${art%6} scene-${sc}" aria-hidden="true">
    <div class="sky"></div><div class="wall"></div><div class="floor"></div>
    <div class="win"></div><div class="sill"></div>
    <div class="sofa"></div><div class="plant"></div>
    <div class="counter"></div><div class="cabinet"></div>
    <div class="bed"></div><div class="pillow"></div>
    <div class="rail"></div><div class="city"></div>
  </div>`;
}
function tagsHTML(l){
  return `<div class="tags">
    ${l.transit && l.walk!=null ? `<span class="tag bts">${l.walk} นาทีถึง ${l.transit}</span>` : (l.transit?`<span class="tag bts">${l.transit}</span>`:"")}
    <span class="tag">${l.size} ตร.ม. · ${l.beds}</span>
  </div>`;
}
function mktHTML(l, wide){
  const v = vsMarket(l);
  const now = pos(l.price, l.min, l.max);
  const avg = pos(l.avg, l.min, l.max);
  return `<div class="${wide?"mkt-box":"mkt-mini"}">
    <div class="mkt-caption ${v.kind}">${v.text} <span class="ex">ตัวเลขตัวอย่าง</span></div>
    <div class="bar" title="ช่วงราคาจำลองในโครงการเดียวกัน">
      <i class="rng"></i>
      <i class="avg" style="left:${avg}%"></i>
      <i class="now" style="left:${now}%"></i>
    </div>
    ${wide ? `<div class="mkt-scale"><span>ต่ำสุด ${money(l.min)}</span><span>เฉลี่ย ${money(l.avg)}</span><span>สูงสุด ${money(l.max)}</span></div>` : ``}
  </div>`;
}
function cardHTML(l, score, breakdown){
  const href = roomHref(l.id);
  const alt = `ห้อง ${l.project} ย่าน${l.area}`;
  const files = (PHOTOS[l.id]||[]).slice(0,5);
  const badge = l.statusLabel||"ว่าง";
  let media;
  if(files.length>1){
    const figs = files.map((p,i)=>{
      const src = photoUrl(l.id, p.file);
      const lazy = i===0 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
      return `<figure class="card-slide"><img src="${src}" alt="${alt} ภาพที่ ${i+1}" width="800" height="450" ${lazy} draggable="false"></figure>`;
    }).join("");
    const dots = files.map((_,i)=>`<button type="button" class="card-dot${i===0?" on":""}" aria-label="ภาพที่ ${i+1}" aria-current="${i===0?"true":"false"}"></button>`).join("");
    media = `<div class="card-slider" data-card-slider data-listing="${l.id}">
      <a class="card-track" draggable="false" href="${href}" aria-label="ดูห้อง ${l.project}">${figs}</a>
      ${score!=null?`<span class="score-pill"><span>เข้ากัน</span>${score}%</span>`:""}
      <span class="badge-vacant">${badge}</span>
      <div class="card-dots">${dots}</div>
    </div>`;
  } else {
    const src = files[0] ? photoUrl(l.id, files[0].file) : coverSrc(l.id);
    media = `<div class="cover">
      ${src?`<a href="${href}"><img class="cover-photo" src="${src}" alt="${alt}" width="800" height="450" loading="lazy" decoding="async"></a>`:""}
      ${score!=null?`<span class="score-pill"><span>เข้ากัน</span>${score}%</span>`:""}
      <span class="badge-vacant">${badge}</span>
    </div>`;
  }
  const bits = [l.area, l.type||l.beds, l.size?`${l.size} ตร.ม.`:null];
  const shuttleIds = new Set(["MC-004","MC-007","MC-008","MC-009","MC-011","MC-012","MC-019"]);
  if(l.walk!=null && l.transit) bits.push(`${l.walk} นาทีถึง ${l.transit}` + (shuttleIds.has(l.id) ? " · มีรถ shuttle" : ""));
  else if(l.transit) bits.push(l.transit + (shuttleIds.has(l.id) ? " · มีรถ shuttle" : ""));
  const meta = bits.filter(Boolean).join(" · ");
  let matchBits = "";
  if(score!=null && breakdown && breakdown.length){
    const ok = breakdown.filter(i=>i.ok);
    matchBits = `<div class="match-meta"><span class="match-frac">ตรง ${ok.length} จาก ${breakdown.length} ข้อ</span></div>`
      + (ok.length ? `<div class="match-tags">${ok.map(i=>`<span class="match-tag">✓ ${i.label}</span>`).join("")}</div>` : "");
  }
  return `<article class="card">
    ${media}
    <a class="card-body" href="${href}">
      <h3>${l.project}</h3>
      <div class="price">${money(l.price)} บาท/เดือน</div>
      <div class="meta">${meta}</div>
      ${matchBits}
    </a>
  </article>`;
}
function nearbyPlaces(area){
  const block = NEARBY[area];
  return block ? block.places.slice() : [];
}
function areaNearby(area){
  return nearbyPlaces(area).map(n => Object.assign({ kind:n.category, walk:n.minutes }, n));
}
function mapsUrl(p){
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.mapsQuery || (p.name + " Bangkok"));
}
function placeTime(p){
  const verb = p.mode || "เดิน";
  return verb + "ประมาณ " + p.minutes + " นาที";
}
const PLACE_PHOTOS = [
  {
    "slug": "benchasiri-park",
    "file": "images/places/benchasiri-park.webp",
    "names": [
      "Benchasiri Park",
      "สวนเบญจสิริ"
    ],
    "author": "Slyronit",
    "license": "CC BY-SA 4.0",
    "credit": "Slyronit / CC BY-SA 4.0",
    "w": 1200,
    "h": 900
  },
  {
    "slug": "emquartier",
    "file": "images/places/emquartier.webp",
    "names": [
      "EmQuartier"
    ],
    "author": "กสิณธร ราชโอรส",
    "license": "CC BY-SA 4.0",
    "credit": "กสิณธร ราชโอรส / CC BY-SA 4.0",
    "w": 1200,
    "h": 901
  },
  {
    "slug": "emsphere",
    "file": "images/places/emsphere.webp",
    "names": [
      "EmSphere"
    ],
    "author": "Dharmadana",
    "license": "CC BY 4.0",
    "credit": "Dharmadana / CC BY 4.0",
    "w": 1200,
    "h": 900
  },
  {
    "slug": "terminal-21-asok",
    "file": "images/places/terminal-21-asok.webp",
    "names": [
      "Terminal 21 Asok"
    ],
    "author": "Sry85",
    "license": "CC BY-SA 3.0",
    "credit": "Sry85 / CC BY-SA 3.0",
    "w": 1200,
    "h": 900
  },
  {
    "slug": "gateway-ekkamai",
    "file": "images/places/gateway-ekkamai.webp",
    "names": [
      "Gateway Ekamai",
      "Gateway Ekkamai"
    ],
    "author": "Amin",
    "license": "CC BY-SA 4.0",
    "credit": "Amin / CC BY-SA 4.0",
    "w": 1200,
    "h": 1600
  },
  {
    "slug": "iconsiam",
    "file": "images/places/iconsiam.webp",
    "names": [
      "ICONSIAM"
    ],
    "author": "Slyronit",
    "license": "CC BY-SA 4.0",
    "credit": "Slyronit / CC BY-SA 4.0",
    "w": 1200,
    "h": 900
  },
  {
    "slug": "lhong-1919",
    "file": "images/places/lhong-1919.webp",
    "names": [
      "Lhong 1919"
    ],
    "author": "Supanut Arunoprayote",
    "license": "CC BY 4.0",
    "credit": "Supanut Arunoprayote / CC BY 4.0",
    "w": 1200,
    "h": 650
  },
  {
    "slug": "central-bangna",
    "file": "images/places/central-bangna.webp",
    "names": [
      "เซ็นทรัล บางนา"
    ],
    "author": "กสิณธร ราชโอรส",
    "license": "CC BY-SA 4.0",
    "credit": "กสิณธร ราชโอรส / CC BY-SA 4.0",
    "w": 1200,
    "h": 901
  },
  {
    "slug": "benjakitti-park",
    "file": "images/places/benjakitti-park.webp",
    "names": [
      "สวนเบญจกิติ"
    ],
    "author": "Slyronit",
    "license": "CC BY-SA 4.0",
    "credit": "Slyronit / CC BY-SA 4.0",
    "w": 1200,
    "h": 900
  },
  {
    "slug": "suan-luang-rama-9",
    "file": "images/places/suan-luang-rama-9.webp",
    "names": [
      "สวนหลวง ร.9"
    ],
    "author": "Boonlert",
    "license": "CC0",
    "credit": "Boonlert / CC0",
    "w": 1200,
    "h": 865
  },
  {
    "slug": "central-rama-9",
    "file": "images/places/central-rama-9.webp",
    "names": [
      "เซ็นทรัลพระราม 9"
    ],
    "author": "Magnamonkun",
    "license": "CC BY 3.0",
    "credit": "Magnamonkun / CC BY 3.0",
    "w": 1200,
    "h": 717
  },
  {
    "slug": "bitec",
    "file": "images/places/bitec.webp",
    "names": [
      "BITEC"
    ],
    "author": "Pescov",
    "license": "CC BY-SA 4.0",
    "credit": "Pescov / CC BY-SA 4.0",
    "w": 600,
    "h": 450
  },
  {
    "slug": "mega-bangna",
    "file": "images/places/mega-bangna.webp",
    "names": [
      "เมกาบางนา",
      "Mega Bangna"
    ],
    "author": "Sry85",
    "license": "CC BY-SA 4.0",
    "credit": "Sry85 / CC BY-SA 4.0",
    "w": 600,
    "h": 450
  }
];
function placePhotoFor(name){
  const key = String(name||"").trim().toLowerCase();
  return PLACE_PHOTOS.find(p => (p.names||[]).some(n => String(n).trim().toLowerCase()===key)) || null;
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}
let famousFilter = { hood:"all", detail:"all" };
const FAMOUS_CHIPS = [
  ["all","ทั้งหมด"],
  ["ร้านอาหาร","ร้านอาหาร"],
  ["คาเฟ่","คาเฟ่"],
  ["บาร์","บาร์"],
  ["ช็อปปิ้ง","ช็อปปิ้ง"],
  ["สวน","สวน"]
];
function iconCafe(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8.5h11.5v6.2A4.3 4.3 0 0 1 12.2 19H9.3A4.3 4.3 0 0 1 5 14.7V8.5z"/><path d="M16.5 10h2.2a2.4 2.4 0 1 1 0 4.8h-2.2"/><path d="M8.2 3.2c.2 1.1-.3 1.8-.3 2.7M11.5 3.2c.2 1.1-.3 1.8-.3 2.7M14.8 3.2c.2 1.1-.3 1.8-.3 2.7"/><path d="M5 20.5h11.5"/></svg>`; }
function iconFork(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v7M4.6 3v5.2A1.4 1.4 0 0 0 6 9.6h0A1.4 1.4 0 0 0 7.4 8.2V3M7.4 3v7M6 9.6V21M15.5 3v18M15.5 3c3.2 1.4 4.4 4.2 4.4 7.4h-4.4"/></svg>`; }
function iconGlass(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12L12 13 6 4z"/><path d="M12 13v6.2"/><path d="M8 21h8"/></svg>`; }
function iconBag(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.3 11.2c0-4.3 2.4-6.4 3.7-6.4s2.4 2.1 2.4 4.2"/><path d="M11.7 11.2c0-4.3 2.4-6.4 3.7-6.4s2.4 2.1 2.4 4.2"/><path d="M5.6 11.2h12.8l-1.2 10.3H6.8L5.6 11.2z"/></svg>`; }
function placeKindIcon(kind){
  if(kind==="รถไฟฟ้า") return iconTransit();
  if(kind==="สวน") return iconLeaf();
  if(kind==="คาเฟ่") return iconCafe();
  if(kind==="ร้านอาหาร") return iconFork();
  if(kind==="บาร์") return iconGlass();
  if(kind==="ช็อปปิ้ง") return iconBag();
  return iconPin();
}
function famousHTML(area, scope){
  const all = areaNearby(area);
  const filt = famousFilter[scope] || "all";
  const rows = filt==="all" ? all : all.filter(p => p.category===filt);
  const chips = FAMOUS_CHIPS.map(([id,label])=>{
    const n = id==="all" ? all.length : all.filter(p=>p.category===id).length;
    if (id!=="all" && n===0) return "";
    return `<button type="button" class="chip ${filt===id?"on":""}" data-famous-filter="${id}" data-famous-scope="${scope}" aria-pressed="${filt===id?"true":"false"}">${label} (${n})</button>`;
  }).join("");
  const withPhoto = rows.filter(p => placePhotoFor(p.name));
  const withoutPhoto = rows.filter(p => !placePhotoFor(p.name));
  const ordered = withPhoto.concat(withoutPhoto);
  const usedPhotos = [];
  withPhoto.forEach(p => {
    const ph = placePhotoFor(p.name);
    if (ph && !usedPhotos.some(u => u.slug===ph.slug)) usedPhotos.push(ph);
  });
  const cards = ordered.length ? ordered.map(p => {
    const photo = placePhotoFor(p.name);
    const body = `<div class="famous-body"><div class="cat">${escapeHtml(p.category)}</div><h3>${escapeHtml(p.name)}</h3><div class="time">${escapeHtml(placeTime(p))} · จาก ${escapeHtml(p.station||"")}</div><a class="maps" href="${mapsUrl(p)}" target="_blank" rel="noopener noreferrer">เปิดใน Google Maps</a></div>`;
    if (photo) {
      return `<article class="famous-card has-photo"><div class="famous-media"><img src="${SITE_BASE}${photo.file}" alt="${escapeHtml(p.name)}" width="${photo.w}" height="${photo.h}" loading="lazy" decoding="async"><span class="place-photo-credit">${escapeHtml(photo.credit)}</span></div>${body}</article>`;
    }
    return `<article class="famous-card is-text">${body}</article>`;
  }).join("") : `<div class="famous-empty">ยังไม่มีรายการในหมวดนี้สำหรับย่าน${area}</div>`;
  const photoNotes = usedPhotos.length ? `<details class="place-photo-notes"><summary>เครดิตภาพ</summary><p>ภาพ: ${usedPhotos.map(ph => `${escapeHtml(ph.author)} (${escapeHtml(ph.names[0])}), ${escapeHtml(ph.license)}, Wikimedia Commons`).join(" · ")}</p></details>` : "";
  return `
  <section class="famous" id="famous-${scope}">
    <div class="eyebrow">ร้านดังใกล้คอนโด</div>
    <h2>ร้านอาหาร คาเฟ่ และจุดฮิตใกล้สถานี</h2>
    <p class="lead-note">สถานที่เหล่านี้เป็นร้านและสถานที่จริงที่เปิดให้บริการ ${NEARBY_NOTE}</p>
    <div class="famous-filters" aria-label="กรองประเภทร้าน">${chips}</div>
    <div class="famous-grid">${cards}</div>
    <p class="famous-disclaimer">${NEARBY_NOTE} ระยะทางคิดจากสถานีรถไฟฟ้า ไม่ใช่จากอาคารคอนโด และไม่มีคะแนนหรือจำนวนรีวิวสมมติ</p>
    ${photoNotes}
  </section>`;
}
function iconTransit(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11h16M6 11V8a4 4 0 014-4h4a4 4 0 014 4v3"/><path d="M6 16h.01M18 16h.01M5 11v5h14v-5"/><path d="M3 20h3M18 20h3"/></svg>`; }
function iconWalk(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2"/><path d="M9 22l3-7 3 7M8 13l4-2 2 3 3 1"/></svg>`; }
function iconPin(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>`; }
function iconCal(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4M16 4v4M4 11h16"/></svg>`; }
function iconPaw(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="8" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="17" cy="8" r="1.6"/><path d="M12 11c-2.8 0-5 2-5 4.2 0 1.8 1.6 2.8 5 2.8s5-1 5-2.8c0-2.2-2.2-4.2-5-4.2z"/></svg>`; }
function iconLeaf(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.8 19.5c7.2-1.2 13.4-8.2 14.6-15.7C12.2 5 6 11.8 4.8 19.5z"/><path d="M4.8 19.5C8.2 14 13 9.4 19.4 5.5"/></svg>`; }
function miniMapHTML(places, homeLabel, active, prefix){
  const roads = `<i class="road-h" style="top:46%"></i><i class="road-h" style="top:72%"></i><i class="road-v" style="left:42%"></i><i class="road-v" style="left:66%"></i>`;
  const pins = [`<button type="button" class="map-pin home" style="left:58%;top:48%" disabled aria-label="ตำแหน่งย่าน"><span class="dot"></span></button>`].concat(
    places.map((n,i)=>`<button type="button" class="map-pin ${i===active?"on":""}" style="left:${n.x}%;top:${n.y}%" data-pin="${i}" data-pin-scope="${prefix}" aria-pressed="${i===active?"true":"false"}" aria-label="${n.name} ${n.mode} ${n.walk} นาที"><span class="lbl">${n.name}</span><span class="dot"></span></button>`)
  ).join("");
  return `<div class="mini-map" aria-hidden="true"><div class="grid-lines"></div>${roads}${pins}<div class="map-note">แผนที่ประกอบ · ไม่ได้เชื่อมแผนที่จริง</div></div>`;
}
function placesHTML(places, active, prefix){
  return `<div class="places">${places.map((n,i)=>`<button type="button" class="place-item ${i===active?"on":""}" data-pin="${i}" data-pin-scope="${prefix}" aria-pressed="${i===active?"true":"false"}"><span class="ico">${placeKindIcon(n.kind)}</span><span>${n.name}<small>${n.mode} ${n.walk} นาที · ${n.kind}</small></span></button>`).join("")}</div>`;
}
function hoodHTML(){
  const area = homeArea;
  const prof = AREA_PROFILES[area];
  const chips = AREAS.map(a=>`<button type="button" class="chip ${a===area?"on":""}" data-area="${a}" aria-pressed="${a===area?"true":"false"}">${a}</button>`).join("");
  return `
  <div class="hood" id="hood">
    <div class="eyebrow">สำรวจทำเล</div>
    <h2>ย่านที่อยากอยู่ ใกล้รถไฟฟ้า</h2>
    <p class="lead" style="color:var(--muted);max-width:54ch;margin-top:8px">เลือกย่านแล้วอ่านบรรยากาศ การเดินทาง และร้านดังใกล้สถานี ร้านอาหาร คาเฟ่ และสถานที่ในหมวดร้านดังเป็นสถานที่จริงที่เปิดให้บริการ</p>
    <div class="hood-chips" aria-label="เลือกย่าน">${chips}</div>
    <div class="hood-layout">
      <div class="hood-copy">
        <div class="eyebrow">${prof.line}</div>
        <h2>${area}</h2>
        <p class="lead">${prof.vibe}</p>
        <div class="hood-points">
          <div class="hood-point"><div class="ic">${iconTransit()}</div><div><h3>เดินทางด้วยรถไฟฟ้า</h3><p>${prof.travel}</p></div></div>
          <div class="hood-point"><div class="ic">${iconLeaf()}</div><div><h3>ไลฟ์สไตล์รอบย่าน</h3><p>${prof.lifestyle}</p></div></div>
          <div class="hood-point"><div class="ic">${iconWalk()}</div><div><h3>เดินถึง ${prof.station}</h3><p>ย่านนี้อยู่ใกล้ ${prof.station} โดยทั่วไปเดินถึงสถานีได้ประมาณ ${prof.walkTypical} นาที</p></div></div>
        </div>
        <a class="btn btn-md btn-primary" href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">ทัก LINE เรื่องย่าน${area}</a>
        <a class="btn btn-md btn-ghost" href="${areaHref(area)}">อ่านหน้าย่าน${area}</a>
      </div>
      <div class="hood-visual-wrap">
        ${areaIlloHTML(area)}
        <p class="vis-cap">ภาพประกอบ ไม่ใช่แผนที่จริง</p>
      </div>
    </div>
    ${famousHTML(area, "hood")}
    <div class="hood-rooms">
      
    </div>
  </div>`;
}
function paintHood(){
  const el = document.getElementById("hood");
  if(!el) return;
  const y = window.scrollY;
  el.outerHTML = hoodHTML();
  window.scrollTo(0, y);
}
function faqHTML(){
  return `<div class="faq-wrap">
        <div class="eyebrow">คำถามที่พบบ่อย</div>
        <h2>ก่อนเริ่มหาห้อง</h2>
        <details class="faq"><summary>สนใจห้องไหน ติดต่ออย่างไร</summary><p>ทัก <a href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">LINE</a> แล้วบอกชื่อโครงการหรือห้องที่สนใจได้เลย</p></details>
        <details class="faq"><summary>ร้านดังในแต่ละย่านเป็นสถานที่จริงหรือไม่</summary><p>ใช่ ร้านอาหาร คาเฟ่ บาร์ และสถานที่ในหมวดร้านดังเป็นสถานที่จริงที่เปิดให้บริการ ระยะทางเป็นค่าประมาณจากสถานีหรือจากโครงการเมื่อมีพิกัด</p></details>
        <details class="faq"><summary>ติดต่อ MoveCondo ได้อย่างไร</summary><p>ทัก <a href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">LINE</a> ได้เลย</p></details>
    </div>`;
}
function comingSoonHTML(){
  return `<div class="coming-soon" role="status">
      <div class="eyebrow">ประกาศเช่า</div>
      <h2>กำลังเพิ่มห้องจริงเร็ว ๆ นี้</h2>
      <p>ขณะนี้เรากำลังเตรียมประกาศคอนโดเช่าจริง ในระหว่างนี้สำรวจย่าน ร้านอาหาร และคาเฟ่ใกล้สถานีได้เลย หรือทัก LINE เพื่อบอกความต้องการ</p>
      <div class="hero-actions" style="justify-content:center">
        <a class="btn btn-md btn-primary" href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">ทัก LINE</a>
      </div>
    </div>`;
}
function areaChipsHTML(prefix){
  prefix = prefix || "";
  return AREAS.map(a=>`<a class="chip" href="${areaHref(a)}">${a}</a>`).join(" ");
}

let homeSearchQuery = "";
let homeSearchScroll = false;
let heroSearchDocBound = false;

function normSearch(s){
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}
function areaAliases(area){
  const row = (typeof AREA_ALIASES !== "undefined" ? AREA_ALIASES : []).find(a => a[0] === area);
  return row ? row[1] : [area];
}
function areasMatchingQuery(q){
  const n = normSearch(q);
  if(!n) return [];
  return AREAS.filter(area => {
    if(normSearch(area).includes(n) || n.includes(normSearch(area))) return true;
    return areaAliases(area).some(a => {
      const an = normSearch(a);
      return an.includes(n) || n.includes(an);
    });
  });
}
function listingMatchesQuery(l, q){
  const n = normSearch(q);
  if(!n) return true;
  const bits = [l.project, l.area, l.transit, l.type, l.beds, ...(areaAliases(l.area))];
  if(l.transit) bits.push(String(l.transit).replace(/^(BTS|MRT)\s+/i, ""));
  if(normSearch(bits.join(" ")).includes(n)) return true;
  if(areasMatchingQuery(q).includes(l.area)) return true;
  if(/(1\s*bed|1br|1\s*นอน|หนึ่งห้อง)/i.test(q) && /1/.test(l.type || "") && !/2/.test(l.type || "")) return true;
  if(/(2\s*bed|2br|2\s*นอน|สองห้อง)/i.test(q) && /2/.test(l.type || "")) return true;
  return false;
}
function heroSearchHTML(){
  const q = escapeHtml(homeSearchQuery || "");
  const hideClear = homeSearchQuery ? "" : " hidden";
  const filled = homeSearchQuery ? " is-filled" : "";
  return `<div class="hero-search">
      <form class="hero-search-form" role="search" action="#listings">
        <div class="hero-search-pill${filled}">
          <span class="hero-search-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
          <span class="hero-search-placeholder" aria-hidden="true" data-i18n="search.placeholder">ค้นหาคอนโดที่ใช่สำหรับคุณ</span>
          <input class="hero-search-input" type="search" name="q" value="${q}"
            placeholder="ค้นหาคอนโดที่ใช่สำหรับคุณ"
            data-i18n="search.placeholder" data-i18n-placeholder="Find the right condo for you"
            maxlength="80" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            enterkeyhint="search" aria-label="ค้นหาคอนโด" data-i18n-aria-label="Search condos"
            aria-autocomplete="list" aria-controls="hero-search-suggest" aria-expanded="false" />
          <button type="button" class="hero-search-clear"${hideClear} aria-label="ล้างคำค้นหา" data-i18n="search.clear" data-i18n-aria-label="Clear search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <button type="submit" class="hero-search-submit" aria-label="ค้นหา" data-i18n="search.submit" data-i18n-aria-label="Search">
            <svg class="hero-search-submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <span class="hero-search-submit-label">ค้นหา</span>
          </button>
        </div>
        <div class="hero-search-suggest" id="hero-search-suggest" role="listbox" hidden></div>
      </form>
    </div>`;
}
function searchEmptyHTML(){
  return `<div class="search-empty" role="status">
      <p data-i18n="search.empty">ไม่พบห้องที่ตรงกับคำค้นหา</p>
      <div class="search-empty-actions">
        <a class="btn btn-md btn-primary" href="#/match" data-i18n="nav.match">จับคู่ห้อง</a>
        <button type="button" class="btn btn-md btn-ghost" data-clear-search data-i18n="search.clear">ล้างคำค้นหา</button>
      </div>
    </div>`;
}
function applyHomeSearch(raw, scroll){
  const next = String(raw || "").trim();
  homeSearchQuery = next;
  homeSearchScroll = !!scroll;
  const hash = next ? "#/?q=" + encodeURIComponent(next) : "#/";
  const cur = location.hash || "#/";
  const same = cur === hash || (next === "" && (cur === "" || cur === "#" || cur === "#/"));
  if(same) render();
  else location.hash = hash;
}
function paintSearchSuggest(box, q){
  const suggest = box.querySelector(".hero-search-suggest");
  const input = box.querySelector(".hero-search-input");
  if(!suggest || !input) return;
  const n = normSearch(q);
  if(!n){ suggest.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
  const areas = areasMatchingQuery(q);
  const rooms = LISTINGS.filter(l => listingMatchesQuery(l, q));
  if(!areas.length && !rooms.length){
    suggest.innerHTML = `<div class="hero-suggest-group"><div class="hero-suggest-label" data-i18n="search.empty">ไม่พบห้องที่ตรงกับคำค้นหา</div>
      <a class="hero-suggest-item" href="#/match" role="option" data-i18n="nav.match">จับคู่ห้อง</a></div>`;
    suggest.hidden = false;
    input.setAttribute("aria-expanded", "true");
    return;
  }
  let html = "";
  if(areas.length){
    html += `<div class="hero-suggest-group"><div class="hero-suggest-label" data-i18n="search.areas">ย่าน</div>` +
      areas.map(a => `<button type="button" class="hero-suggest-item" role="option" data-search-area="${escapeHtml(a)}"><b>ย่าน${escapeHtml(a)}</b><span>${LISTINGS.filter(l=>l.area===a).length} ห้อง</span></button>`).join("") +
      `</div>`;
  }
  if(rooms.length){
    const shown = rooms.slice(0, 6);
    html += `<div class="hero-suggest-group"><div class="hero-suggest-label" data-i18n="search.rooms">ห้อง</div>` +
      shown.map(l => `<a class="hero-suggest-item" role="option" href="${roomHref(l.id)}"><b>${escapeHtml(l.project)}</b><span>${escapeHtml(l.area)} · ${money(l.price)}</span></a>`).join("") +
      `</div>`;
    if(rooms.length){
      html += `<button type="button" class="hero-suggest-all" data-search-apply="${escapeHtml(q)}">พบ ${rooms.length} ห้องที่ตรง</button>`;
    }
  }
  suggest.innerHTML = html;
  suggest.hidden = false;
  input.setAttribute("aria-expanded", "true");
}
function bindHeroSearch(){
  const box = document.querySelector("#view-home.on .hero-search") || document.querySelector(".hero-search");
  if(!box || box.dataset.bound === "1") return;
  box.dataset.bound = "1";
  const form = box.querySelector(".hero-search-form");
  const input = box.querySelector(".hero-search-input");
  const clear = box.querySelector(".hero-search-clear");
  const suggest = box.querySelector(".hero-search-suggest");
  if(!form || !input) return;
  const pill = box.querySelector(".hero-search-pill");
  const syncClear = () => {
    const filled = !!input.value.trim();
    if(clear) clear.hidden = !filled;
    if(pill) pill.classList.toggle("is-filled", filled);
  };
  syncClear();
  input.addEventListener("input", () => {
    syncClear();
    paintSearchSuggest(box, input.value);
  });
  input.addEventListener("focus", () => { if(input.value.trim()) paintSearchSuggest(box, input.value); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if(suggest) suggest.hidden = true;
    input.setAttribute("aria-expanded", "false");
    applyHomeSearch(input.value, true);
  });
  if(clear){
    clear.addEventListener("click", (e) => {
      e.preventDefault();
      input.value = "";
      syncClear();
      if(suggest) suggest.hidden = true;
      applyHomeSearch("", false);
      input.focus();
    });
  }
  box.addEventListener("click", (e) => {
    const areaBtn = e.target.closest("[data-search-area]");
    if(areaBtn){
      e.preventDefault();
      applyHomeSearch(areaBtn.dataset.searchArea, true);
      return;
    }
    const allBtn = e.target.closest("[data-search-apply]");
    if(allBtn){
      e.preventDefault();
      applyHomeSearch(allBtn.dataset.searchApply, true);
    }
  });
  if(!heroSearchDocBound){
    heroSearchDocBound = true;
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".hero-search").forEach(b => {
        const s = b.querySelector(".hero-search-suggest");
        const i = b.querySelector(".hero-search-input");
        if(s && !b.contains(e.target)){
          s.hidden = true;
          if(i) i.setAttribute("aria-expanded", "false");
        }
      });
    });
    document.addEventListener("keydown", (e) => {
      if(e.key !== "Escape") return;
      document.querySelectorAll(".hero-search-suggest").forEach(s => { s.hidden = true; });
      document.querySelectorAll(".hero-search-input").forEach(i => i.setAttribute("aria-expanded", "false"));
    });
  }
}

function homeView(){
  const q = (homeSearchQuery || "").trim();
  const matched = q ? LISTINGS.filter(l => listingMatchesQuery(l, q)) : LISTINGS;
  const cards = matched.map(l => cardHTML(l)).join("");
  const countLine = q
    ? (matched.length ? `พบ ${matched.length} ห้องที่ตรง` : "")
    : `${LISTINGS.length} ห้องจากโครงการใกล้รถไฟฟ้า`;
  const body = matched.length ? `<div class="grid">${cards}</div>` : searchEmptyHTML();
  return `
  <div class="hero">
    <div class="hero-copy">
      <div class="hero-kicker">MoveCondo · ย้ายคอนโด</div>
      <h1>หาคอนโดเช่าที่ <em class="hero-phrase">ตรงกับคุณ</em></h1>
      <p class="lead">ดูห้องจริงใกล้รถไฟฟ้าในกรุงเทพฯ แล้วเลือกห้องที่ใช่</p>
      ${heroSearchHTML()}
    </div>
    <div class="hero-visual">
      <img
        src="images/hero-home-sm.webp?v=20261112ac"
        srcset="images/hero-home-sm.webp?v=20261112ac 700w, images/hero-home.webp?v=20261112ac 1200w"
        sizes="(min-width: 1024px) 50vw, 100vw"
        width="1200"
        height="900"
        alt="บ้านไม้กรอบกระจกใต้ต้นไม้ใหญ่"
        decoding="async"
      />
    </div>
  </div>
  <div class="section" id="listings">
    <div class="section-head"><div><div class="eyebrow">ประกาศเช่า</div><h2>คอนโดเช่าที่คัดมาให้</h2>${countLine ? `<p>${countLine}</p>` : ""}</div></div>
    ${body}
  </div>
  <div class="band">${hoodHTML()}</div>
  ${faqHTML()}
  <div class="contact-cta" id="contact"><h2>สนใจห้องไหน ทักมาได้เลย</h2><p>บอกรหัสห้องในแชท เราจะช่วยตอบเรื่องห้องนั้น</p><a class="btn btn-lg btn-line" href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">ทัก LINE</a></div>`;
}

const MUST_OPTS = [
  { id:"pool", label:"สระว่ายน้ำ", re:/สระว่ายน้ำ/ },
  { id:"fitness", label:"ฟิตเนส", re:/ฟิตเนส/ },
  { id:"washer", label:"เครื่องซักผ้า", re:/เครื่องซักผ้า/ },
  { id:"corner", label:"ห้องมุม", re:/ห้องมุม/ },
  { id:"shuttle", label:"รถรับส่ง/shuttle", re:/รถรับ|shuttle/i },
  { id:"garden", label:"สวน", re:/สวน/ },
  { id:"tub", label:"อ่างอาบน้ำ", re:/อ่างอาบน้ำ/ },
  { id:"parking", label:"ที่จอดรถ", re:/ที่จอดรถ/ },
  { id:"cowork", label:"Co-working space", re:/Co-working/i }
];
function listingHasMust(l, id){
  const opt = MUST_OPTS.find(o=>o.id===id);
  if(!opt) return false;
  return (l.amenities||[]).some(a=>opt.re.test(a));
}
function listingType(l){
  return l.type || l.beds || "";
}
function isTwoBed(l){
  return /^2/.test(listingType(l));
}
function isOneBed(l){
  return /1 ห้องนอน/.test(listingType(l));
}
function normPrefs(p){
  p = p || {};
  const areas = Array.isArray(p.areas) ? p.areas.slice() : (p.area && p.area!=="any" ? [p.area] : []);
  return {
    areas,
    type: p.type || "any",
    budgetMin: p.budgetMin != null ? Number(p.budgetMin) : 13500,
    budgetMax: p.budgetMax != null ? Number(p.budgetMax) : (p.budget != null ? Number(p.budget) : 55000),
    size: p.size != null ? Number(p.size) : 0,
    walk: p.walk != null ? Number(p.walk) : 0,
    contract: p.contract || "any",
    moveIn: p.moveIn || "2026-12-01",
    must: Array.isArray(p.must) ? p.must.slice() : [],
    pets: p.pets || "no"
  };
}
function listingAvailable(l){
  return l.available || (l.status==="AVAILABLE" ? "2026-11-12" : "9999-12-31");
}
function typeMatches(l, type){
  if(!type || type==="any") return true;
  if(type==="1 ห้องนอน") return isOneBed(l);
  if(type==="2 ห้องนอน+") return isTwoBed(l);
  return listingType(l)===type;
}
function listingPasses(l, p){
  p = normPrefs(p);
  if(p.areas.length && !p.areas.includes(l.area)) return false;
  if(!typeMatches(l, p.type)) return false;
  if(l.price < p.budgetMin || l.price > p.budgetMax) return false;
  if(p.size && l.size < p.size) return false;
  if(p.walk && (l.walk==null || l.walk > p.walk)) return false;
  for(let i=0;i<p.must.length;i++){ if(!listingHasMust(l, p.must[i])) return false; }
  return true;
}
function matchBreakdown(l, p){
  p = normPrefs(p);
  const items = [];
  if(p.areas.length) items.push({ key:"area", label:l.area, ok:p.areas.includes(l.area) });
  if(p.type && p.type!=="any") items.push({ key:"type", label:listingType(l), ok:typeMatches(l, p.type) });
  items.push({ key:"budget", label:money(l.price)+" บาท", ok:l.price>=p.budgetMin && l.price<=p.budgetMax });
  if(p.size) items.push({ key:"size", label:l.size+" ตร.ม.", ok:l.size>=p.size });
  if(p.walk) items.push({ key:"walk", label:"เดิน "+l.walk+" นาที", ok:l.walk!=null && l.walk<=p.walk });
  if(p.contract==="1y") items.push({ key:"contract", label:"สัญญา 1 ปี", ok:true });
  if(p.moveIn) items.push({ key:"move", label:"ย้ายเข้าได้", ok:listingAvailable(l)<=p.moveIn });
  p.must.forEach(id=>{
    const opt = MUST_OPTS.find(o=>o.id===id);
    if(opt) items.push({ key:id, label:opt.label, ok:listingHasMust(l, id) });
  });
  return items;
}
function iconStep(name){
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  if(name==="pin") return `<svg ${common}><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>`;
  if(name==="bed") return `<svg ${common}><path d="M3 11.5V19"/><path d="M21 19V11.5"/><path d="M3 16h18"/><path d="M3 11.5h18"/><path d="M6 11.5V8.5A2.5 2.5 0 0 1 8.5 6h3A2.5 2.5 0 0 1 14 8.5V11.5"/></svg>`;
  if(name==="wallet") return `<svg ${common}><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="14.2" r="1.2"/></svg>`;
  if(name==="ruler") return `<svg ${common}><rect x="3.5" y="7" width="17" height="10" rx="1.8"/><path d="M7 7v4M11 7v3M15 7v4M19 7v3"/></svg>`;
  if(name==="walk") return `<svg ${common}><circle cx="13" cy="5" r="2"/><path d="M8 21l3.2-6.2 2.2 2.2V21"/><path d="M9 12.5l4-3 3.2 2.4 3.3-1.4"/></svg>`;
  if(name==="cal") return `<svg ${common}><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`;
  if(name==="doc") return `<svg ${common}><path d="M7 3.5h7.5L20 9v11.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M14.5 3.5V9H20"/><path d="M9 13h7M9 16.5h5"/></svg>`;
  return `<svg ${common}><path d="M12 3.8l2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.3-4.4 2.3.8-5L4.8 9l5-.7L12 3.8z"/></svg>`;
}
function selChip(value, label, on){
  return `<button type="button" class="sel-chip${on?" on":""}" data-chip-val="${value}" aria-pressed="${on?"true":"false"}">${label}</button>`;
}
function moneyPlain(n){
  return Number(n).toLocaleString("th-TH");
}
function matchView(prefs){
  const p = normPrefs(prefs);
  const areaChips = AREAS.map(a=>selChip(a, a, p.areas.includes(a))).join("");
  const typeChips = [
    selChip("any", "ไม่จำกัด", !p.type || p.type==="any"),
    selChip("1 ห้องนอน", "1 ห้องนอน", p.type==="1 ห้องนอน"),
    selChip("2 ห้องนอน+", "2 ห้องนอน+", p.type==="2 ห้องนอน+")
  ].join("");
  const sizeChips = [
    [0,"ไม่จำกัด"],[30,"30 ตร.ม."],[35,"35 ตร.ม."],[40,"40 ตร.ม."],[50,"50 ตร.ม."],[70,"70 ตร.ม."]
  ].map(([v,lb])=>selChip(String(v), lb, Number(p.size)===Number(v))).join("");
  const walkChips = [
    [0,"ไม่จำกัด"],[5,"≤ 5 นาที"],[10,"≤ 10 นาที"],[15,"≤ 15 นาที"]
  ].map(([v,lb])=>selChip(String(v), lb, Number(p.walk)===Number(v))).join("");
  const contractChips = [
    selChip("any", "ไม่จำกัด", p.contract!=="1y"),
    selChip("1y", "1 ปี", p.contract==="1y")
  ].join("");
  const mustChips = MUST_OPTS.map(o=>selChip(o.id, o.label, p.must.includes(o.id))).join("");
  const matched = LISTINGS.filter(l=>listingPasses(l, p)).length;
  return `
  <div class="page-hero match-hero">
    <a class="back" href="#/">${iconBack} กลับหน้าแรก</a>
    <div class="eyebrow">จับคู่ห้อง</div>
    <h1>หาห้องที่ใช่ใน 30 วินาที</h1>
    <p>เลือกทำเล งบ และสิ่งที่ขาดไม่ได้ แล้วดูห้องที่เข้ากันจากประกาศจริง</p>
  </div>
  <form class="form-card match-form" id="matchForm">
    <div class="match-step">
      <div class="match-step-h">${iconStep("pin")}<span>ทำเลที่ต้องการ</span><em>เลือกได้หลายย่าน</em></div>
      <div class="chip-select" data-chip-field="areas" data-multi="true">${areaChips}</div>
    </div>
    <div class="match-step">
      <div class="match-step-h">${iconStep("bed")}<span>แบบห้อง</span></div>
      <div class="chip-select" data-chip-field="type">${typeChips}</div>
    </div>
    <div class="match-step">
      <div class="match-step-h">${iconStep("wallet")}<span>งบค่าเช่า</span><strong id="budgetLabel">${moneyPlain(p.budgetMin)} – ${moneyPlain(p.budgetMax)} บาท/เดือน</strong></div>
      <div class="range-dual">
        <div class="range-rail" aria-hidden="true"><div class="range-fill" id="budgetFill"></div></div>
        <input type="range" id="budgetMin" name="budgetMin" min="13500" max="55000" step="500" value="${p.budgetMin}" aria-label="งบต่ำสุด">
        <input type="range" id="budgetMax" name="budgetMax" min="13500" max="55000" step="500" value="${p.budgetMax}" aria-label="งบสูงสุด">
      </div>
    </div>
    <div class="match-step">
      <div class="match-step-h">${iconStep("ruler")}<span>ขนาดห้องขั้นต่ำ</span></div>
      <div class="chip-select" data-chip-field="size">${sizeChips}</div>
    </div>
    <div class="match-step">
      <div class="match-step-h">${iconStep("walk")}<span>เดินถึงสถานี</span></div>
      <div class="chip-select" data-chip-field="walk">${walkChips}</div>
    </div>
    <div class="match-step">
      <div class="match-step-h">${iconStep("doc")}<span>สัญญาขั้นต่ำ</span></div>
      <div class="chip-select" data-chip-field="contract">${contractChips}</div>
    </div>
    <div class="match-step">
      <div class="match-step-h">${iconStep("cal")}<span>วันที่ย้ายเข้าได้</span></div>
      <input class="inp" id="moveIn" name="moveIn" type="date" value="${p.moveIn}" min="2026-11-12" />
    </div>
    <div class="match-step">
      <div class="match-step-h">${iconStep("star")}<span>สิ่งที่ขาดไม่ได้</span><em>เลือกได้หลายข้อ</em></div>
      <div class="chip-select" data-chip-field="must" data-multi="true">${mustChips}</div>
    </div>
    <div class="match-foot">
      <div class="match-count" id="matchCount" aria-live="polite">พบ ${matched} ห้องที่ตรง</div>
      <button class="btn btn-lg btn-primary" type="submit">ดูห้องที่ตรงที่สุด</button>
    </div>
  </form>`;
}

function readMatchForm(form){
  if(!form) return normPrefs(prefs);
  const onOf = (field)=>[...form.querySelectorAll(`[data-chip-field="${field}"] .sel-chip.on`)].map(b=>b.getAttribute("data-chip-val"));
  const areas = onOf("areas");
  const type = onOf("type")[0] || "any";
  const size = Number(onOf("size")[0] || 0);
  const walk = Number(onOf("walk")[0] || 0);
  const contract = onOf("contract")[0] || "any";
  let min = Number((form.querySelector("#budgetMin")||{}).value || 13500);
  let max = Number((form.querySelector("#budgetMax")||{}).value || 55000);
  if(min>max){ const t=min; min=max; max=t; }
  return normPrefs({
    areas, type, size, walk, contract,
    budgetMin:min, budgetMax:max,
    moveIn: (form.querySelector("#moveIn")||{}).value || "2026-12-01",
    must: onOf("must"),
    pets: "no"
  });
}
function paintBudgetSlider(form){
  if(!form) return;
  const a = form.querySelector("#budgetMin");
  const b = form.querySelector("#budgetMax");
  const fill = form.querySelector("#budgetFill");
  const lab = form.querySelector("#budgetLabel");
  if(!a || !b) return;
  let min = Number(a.value), max = Number(b.value);
  if(min>max){ const t=min; min=max; max=t; }
  const lo=13500, hi=55000, span=hi-lo;
  if(fill){
    fill.style.left = ((min-lo)/span*100)+"%" ;
    fill.style.width = ((max-min)/span*100)+"%";
  }
  if(lab) lab.textContent = moneyPlain(min)+" – "+moneyPlain(max)+" บาท/เดือน";
}
function refreshMatchCount(form){
  const p = readMatchForm(form);
  const n = LISTINGS.filter(l=>listingPasses(l, p)).length;
  const el = form.querySelector("#matchCount");
  if(el) el.textContent = "พบ "+n+" ห้องที่ตรง";
  paintBudgetSlider(form);
}
function bindMatchForm(){
  const form = document.getElementById("matchForm");
  if(!form || form.dataset.bound==="1") return;
  form.dataset.bound = "1";
  paintBudgetSlider(form);
  form.addEventListener("click", (e)=>{
    const chip = e.target.closest(".sel-chip");
    if(!chip) return;
    e.preventDefault();
    const group = chip.closest(".chip-select");
    if(!group) return;
    if(group.dataset.multi==="true"){
      chip.classList.toggle("on");
      chip.setAttribute("aria-pressed", chip.classList.contains("on") ? "true" : "false");
    } else {
      group.querySelectorAll(".sel-chip").forEach(b=>{
        const on = b===chip;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on?"true":"false");
      });
    }
    refreshMatchCount(form);
  });
  form.addEventListener("input", (e)=>{
    if(e.target.id==="budgetMin" || e.target.id==="budgetMax"){
      const a = form.querySelector("#budgetMin");
      const b = form.querySelector("#budgetMax");
      if(a && b && Number(a.value)>Number(b.value)){
        if(e.target.id==="budgetMin") b.value = a.value;
        else a.value = b.value;
      }
    }
    refreshMatchCount(form);
  });
}

let prefs = null;
let filters = { seg:false, pets:false, walk5:false, area:null };

function scoreListing(l, p){
  if(!p) return null;
  p = normPrefs(p);
  const bits = matchBreakdown(l, p);
  const hit = bits.filter(b=>b.ok).length;
  const total = bits.length || 1;
  let s = Math.round(20 + (hit/total)*70);
  if(p.areas.length && p.areas.includes(l.area)) s += 6;
  else if(p.areas.length) s -= 8;
  if(l.price>=p.budgetMin && l.price<=p.budgetMax){
    const mid = (p.budgetMin+p.budgetMax)/2;
    const slack = Math.abs(l.price-mid) / Math.max(p.budgetMax-p.budgetMin, 1);
    if(slack>0.7) s -= 2;
  } else if(l.price <= p.budgetMax*1.08 && l.price >= p.budgetMin*0.92) s -= 4;
  else s -= 18;
  if(p.pets==="yes"){ s += l.pets ? 18 : -26; }
  return Math.max(24, Math.min(98, Math.round(s)));
}

function resultsView(){
  const p = normPrefs(prefs || {});
  const rows = LISTINGS.map(l => ({ l, score: scoreListing(l, p), bits: matchBreakdown(l, p) })).sort((a,b)=>b.score-a.score);
  const cards = rows.map(r => cardHTML(r.l, r.score, r.bits)).join("");
  return `
  <div class="page-hero">
    <a class="back" href="#/match">${iconBack} ปรับความต้องการ</a>
    <h1>ห้องที่เข้ากันกับคุณ</h1>
    <p>เรียงตามความเหมาะสมจากงบ ทำเล ขนาด และสิ่งที่คุณเลือก</p>
  </div>
  <div class="section" id="listings"><div class="grid grid-results">${cards}</div></div>
  <div class="section" id="areas">
    <div class="section-head"><div><div class="eyebrow">สำรวจทำเล</div><h2>ย่านใกล้รถไฟฟ้า</h2></div></div>
    <nav class="hood-chips" aria-label="ย่านทั้งหมด">${areaChipsHTML()}</nav>
  </div>`;
}


function setGallery(idx){
  const stage = document.getElementById("galleryStage");
  if(!stage) return;
  if(stage.querySelector(".gallery-track") && window.MoveCondoCarousel){
    const api = (stage.closest(".gallery-hero")||stage).__mcCarousel;
    if(api && api.go) { api.go(idx, true); return; }
  }
  const photos = listingPhotos(stage.dataset.listing);
  if(!photos.length) return;
  galleryIdx = (idx + photos.length) % photos.length;
  const sc = photos[galleryIdx];
  const artBox = stage.querySelector(".gallery-art");
  if(artBox){
    const alt = `ภาพตัวอย่าง${sc.label} — ไม่ใช่ห้องจริง`;
    artBox.innerHTML = photoImg(sc.gallery, alt, "gallery-photo", 1400, 788, true);
  }
  const root = stage.closest(".gallery-hero") || stage.parentElement;
  const lab = stage.querySelector(".scene-label");
  if(lab) lab.innerHTML = `<span>${PHOTO_AI_LABEL}</span><b>${sc.label}</b>`;
  const count = root.querySelector(".gal-count");
  if(count) count.textContent = `${String(galleryIdx+1).padStart(2,"0")} / ${String(photos.length).padStart(2,"0")}`;
  root.querySelectorAll(".thumb").forEach((th,i)=>{
    const on = i===galleryIdx;
    th.classList.toggle("on", on);
    th.setAttribute("aria-pressed", on ? "true" : "false");
  });
}
function paintNearby(scope, idx){
  const places = document.querySelectorAll(`[data-pin-scope="${scope}"]`);
  places.forEach(el=>{
    const on = Number(el.dataset.pin)===idx;
    el.classList.toggle("on", on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if(scope==="hood") hoodPin = idx;
}
function detailView(id){
  const l = LISTINGS.find(x=>x.id===id) || LISTINGS[0];
  const sc = scoreListing(l, prefs);
  galleryIdx = 0;
  const photos = listingPhotos(l.id);
  const scene = photos[galleryIdx] || photos[0] || { label:"ภาพตัวอย่าง" };
  const places = areaNearby(l.area, l.walk);
  const prof = AREA_PROFILES[l.area];
  const thumbs = photos.map((s,i)=>`<button type="button" class="thumb ${i===galleryIdx?"on":""}" data-gal="${i}" aria-label="ดูภาพ${s.label}" aria-pressed="${i===galleryIdx?"true":"false"}">${photoImg(s.thumb, s.label, "", 320, 180, false)}</button>`).join("");
  const heroAlt = scene ? `ภาพตัวอย่าง${scene.label} — ไม่ใช่ห้องจริง` : "ภาพตัวอย่างห้อง";
  const heroSrc = scene ? scene.gallery : "";
  return `
  <div class="page-hero" style="margin-bottom:0">
    <a class="back" href="#/results">${iconBack} กลับผลการจับคู่</a>
  </div>
  <div class="gallery-hero" id="gallery">
    <div class="gallery-stage" id="galleryStage" data-listing="${l.id}" aria-roledescription="carousel" aria-label="ภาพตัวอย่างห้อง">
      <div class="gallery-art">${heroSrc ? photoImg(heroSrc, heroAlt, "gallery-photo", 1400, 788, true) : ""}</div>
      
      ${sc!=null?`<span class="score-pill"><span>เข้ากัน</span>${sc}%</span>`:""}
      <div class="scene-label"><span>${PHOTO_AI_LABEL}</span><b>${scene.label}</b></div>
    </div>
    <div class="gallery-nav">
      <div class="thumbs">${thumbs}</div>
      <div class="gal-ctrl">
        <span class="gal-count">${String(galleryIdx+1).padStart(2,"0")} / ${String(photos.length).padStart(2,"0")}</span>
        <button type="button" class="gal-btn" data-gal="prev" aria-label="ภาพก่อนหน้า">${iconBack}</button>
        <button type="button" class="gal-btn" data-gal="next" aria-label="ภาพถัดไป"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
    </div>
  </div>
  <nav class="detail-subnav" aria-label="ในหน้านี้">
    <a href="#gallery">ภาพห้อง</a>
    <a href="#highlights">จุดเด่น</a>
    <a href="#nearby">ร้านดัง</a>
    <a href="#details">รายละเอียด</a>
  </nav>
  <div class="detail">
    <div class="detail-main">
      <section class="nearby-box" id="highlights" style="padding:18px">
        <div class="eyebrow">จุดเด่นห้อง</div>
        <h2 style="font-size:22px;letter-spacing:-.02em;margin-bottom:12px">สิ่งที่ควรรู้ก่อนนัดชม</h2>
        <div class="hl-row">
          <div class="hl"><div class="ic">${iconWalk()}</div><div><h3>เดินถึงรถไฟฟ้า</h3><b>เดิน ${l.walk} นาทีถึง ${l.transit}</b></div></div>
          <div class="hl"><div class="ic">${iconPin()}</div><div><h3>ขนาดและแบบห้อง</h3><b>${l.size} ตร.ม. · ${l.beds}${l.floorRange?" · ช่วงชั้น "+l.floorRange:""}</b></div></div>
          <div class="hl"><div class="ic">${iconCal()}</div><div><h3>ย้ายเข้าได้</h3><b>${thDate(l.available)}</b></div></div>
        </div>
      </section>
      <section class="nearby-box" id="nearby">
        <div class="hd">
          <div class="eyebrow">ทำเลย่าน${l.area}</div>
          <h2>ใกล้สถานีและร้านดังในย่าน</h2>
          <p>${prof ? prof.vibe : ""} แผนที่ด้านล่างเป็นภาพประกอบ ไม่ได้เชื่อมแผนที่จริง · ระยะทางในรายการร้านดังเป็นค่าประมาณจากสถานี</p>
        </div>
        ${miniMapHTML(places, l.project, 0, "detail")}
        <div style="padding:0 18px 8px">${famousHTML(l.area, "detail")}</div>
        <div style="padding:0 18px 18px"><a class="btn btn-sm btn-ghost" href="#/" data-jump-area="${l.area}">อ่านเรื่องย่าน${l.area}</a></div>
      </section>
      <section class="detail-more" id="details">
        <div class="eyebrow">รายละเอียด</div>
        <h2>ห้องชุดตัวอย่างนี้</h2>
        <p class="desc">${l.blurb} ชื่อโครงการและตัวเลขเป็นตัวอย่างสำหรับนำเสนอแนวทาง ไม่ใช่ห้องที่มีอยู่จริง ส่วนร้านดังในย่านเป็นสถานที่จริงที่เปิดให้บริการ</p>
        <div class="facts">
          <div class="fact">เงินมัดจำ<b>${money(l.deposit)} บาท</b></div>
          <div class="fact">ชั้นที่<b>${l.floor}</b></div>
          <div class="fact">ขนาดและแบบห้อง<b>${l.size} ตร.ม. · ${l.beds}</b></div>
          <div class="fact">ทำเล<b>${l.area} · ${l.transit}</b></div>
          <div class="fact">ย้ายเข้าได้<b>${thDate(l.available)}</b></div>
          <div class="fact">ยืนยันว่าว่างล่าสุด<b>${thDate(l.confirmed)}</b></div>
        </div>
        <div class="amen-label">สิ่งอำนวยความสะดวกในโครงการ (ตัวอย่าง)</div>
        <div class="amen-list">${(l.amenities||[]).map(a=>`<span class="amen-chip">${a}</span>`).join("")}</div>
      </section>
    </div>
    <aside class="detail-panel">
      <h1>${l.project}</h1>
      <div class="meta">${l.area} · ${l.size} ตร.ม. · ${l.beds}</div>
      <div class="detail-price">${money(l.price)} <small>บาท/เดือน</small></div>
      <div class="vacant-row">ยืนยันว่าว่างล่าสุดเมื่อ ${thDate(l.confirmed)}</div>
      ${tagsHTML(l)}
      ${mktHTML(l,true)}
      <p class="desc">นัดชมผ่านปุ่มด้านล่าง หรือทัก LINE ไม่มีเบอร์โทรหรือชื่อเจ้าของในหน้านี้</p>
      <div class="cta-row">
        <button class="btn btn-lg btn-primary" type="button" data-book="${l.id}">นัดชมห้อง</button>
        <a class="btn btn-lg btn-line" href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">ติดต่อ LINE</a>
      </div>
    </aside>
  </div>`;
}

function stickyFor(id){
  const l = LISTINGS.find(x=>x.id===id);
  if(!l) return "";
  return `<button class="btn btn-md btn-primary" type="button" data-book="${l.id}">นัดชมห้อง</button>
          <a class="btn btn-md btn-line" href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">ติดต่อ LINE</a>`;
}

function lineModalHTML(id){
  const code = "";
  return `<div class="modal">
    <h3 id="lineTitle">ติดต่อผ่าน LINE</h3>
    <p>ทัก MoveCondo ได้ที่ LINE${code} ปุ่มนี้ไม่ได้ใส่ข้อความล่วงหน้า</p>
    <a class="btn btn-md btn-primary btn-full" href="${LINE_HREF}" target="_blank" rel="noopener noreferrer">ทัก LINE</a>
    <button class="btn btn-md btn-ghost btn-full" type="button" data-close="line" style="margin-top:8px">ปิด</button>
  </div>`;
}

function viewModalHTML(id, done){
  const l = LISTINGS.find(x=>x.id===id) || LISTINGS[0];
  if(done){
    return `<div class="modal"><div class="ok-box">
      <div class="icon-tile">${iconCheck}</div>
      <h3 id="viewTitle">รับคำขอนัดชมแล้ว</h3>
      <p>ทัก LINE เพื่อบอกห้องที่สนใจได้เลยค่ะ</p>
      <button class="btn btn-md btn-primary" type="button" data-close="view">ปิด</button>
    </div></div>`;
  }
  return `<div class="modal">
    <h3 id="viewTitle">นัดชมห้อง</h3>
    <p>${l ? (l.project+" · "+l.area) : "MoveCondo"} · นัดชมผ่าน LINE ได้เลย</p>
    <form id="bookForm" data-book-id="${l.id}">
      <div class="fields">
        <div class="field"><label for="bn">ชื่อผู้เข้าชม</label><input class="inp" id="bn" name="name" placeholder="ใช้ชื่อสมมติได้" required /></div>
        <div class="field"><label for="bd">วันที่นัด</label><input class="inp" id="bd" name="date" type="date" min="2026-11-13" value="2026-11-20" required /></div>
        <div class="field"><label for="bt">ช่วงเวลา</label>
          <select class="inp" id="bt" name="time">
            <option>10:00–11:00</option>
            <option selected>13:00–14:00</option>
            <option>16:00–17:00</option>
            <option>18:00–19:00</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-md btn-primary btn-full" type="submit">ยืนยันนัดชม</button>
        <button class="btn btn-md btn-ghost btn-full" type="button" data-close="view">ยกเลิก</button>
      </div>
    </form>
  </div>`;
}

function parseHash(){
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  const q = new URLSearchParams(qs||"");
  const parts = path.split("/").filter(Boolean);
  return { parts, q };
}

function setNav(name){
  document.querySelectorAll("nav.main a").forEach(a=>{
    a.classList.toggle("on", a.dataset.nav===name);
  });
}

function render(){
  const { parts, q } = parseHash();
  const home = document.getElementById("view-home");
  const match = document.getElementById("view-match");
  const results = document.getElementById("view-results");
  const detail = document.getElementById("view-detail");
  const sticky = document.getElementById("stickyCta");
  const lineModal = document.getElementById("lineModal");
  if(lineModal) lineModal.innerHTML = lineModalHTML();
  if(!home || !match || !results){
    // Static room/area pages: keep server-rendered content, only refresh modals.
    return;
  }
  [home,match,results,detail].forEach(v=>{ if(v) v.classList.remove("on"); });
  if(sticky){ sticky.classList.remove("show"); sticky.innerHTML = ""; }

  if(q.get("seg")==="20-40") filters.seg = true;
  if(q.get("area") && AREAS.includes(q.get("area"))) filters.area = q.get("area");
  galleryIdx = 0;
  if(q.get("demo")==="1" && !prefs){
    prefs = { areas:["อ่อนนุช"], budgetMin:13500, budgetMax:35000, size:30, moveIn:"2026-12-01", pets:"no" };
  }

  const top = parts[0] || "home";
  document.body.classList.toggle("match-view", top==="match");
  if(top==="match"){
    match.classList.add("on"); match.innerHTML = matchView(prefs); setNav("match"); bindMatchForm();
  } else if(top==="results"){
    results.classList.add("on"); results.innerHTML = resultsView(); setNav((q.get("seg")==="20-40" || filters.seg) ? "results" : "match");
  } else if(top==="listing"){
    document.body.classList.remove("match-view");
    location.replace(SITE_BASE);
    return;
  } else {
    const qq = (q.get("q") || "").trim();
    homeSearchQuery = qq;
    home.classList.add("on"); home.innerHTML = homeView(); setNav("home");
    bindHeroSearch();
  }
  const scrollListings = homeSearchScroll;
  homeSearchScroll = false;
  if(scrollListings){
    requestAnimationFrame(() => {
      const el = document.getElementById("listings");
      if(el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else {
    window.scrollTo(0,0);
  }
  if (window.MoveCondoCarousel) window.MoveCondoCarousel.scan();
}


/* ---- Area name aliases (used by home search) ---- */
const AREA_ALIASES = [
  ["พระราม 9", ["พระราม 9","พระรามเก้า","rama 9","rama9"]],
  ["พระโขนง", ["พระโขนง","phra khanong","phrakhanong"]],
  ["อ่อนนุช", ["อ่อนนุช","on nut","onnut"]],
  ["ทองหล่อ", ["ทองหล่อ","ทองหลอ","thonglor","thong lo"]],
  ["เอกมัย", ["เอกมัย","ekkamai","ekamai"]],
  ["อารีย์", ["อารีย์","อารี"]],
  ["บางนา", ["บางนา","bangna","bang na"]],
  ["อโศก", ["อโศก","asoke","asok"]],
  ["พร้อมพงษ์", ["พร้อมพงษ์","พร้อมพง","phrom phong","prompong"]],
  ["เจริญนคร", ["เจริญนคร","charoen nakhon","charoennakhon","กรุงธนบุรี"]]
];


window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", ()=>{ render(); });
document.addEventListener("click", (e) => {
  const clearBtn = e.target.closest("[data-clear-search]");
  if(clearBtn){
    e.preventDefault();
    applyHomeSearch("", false);
  }
});

document.addEventListener("click", (e)=>{
  const listing = e.target.closest("[data-open-listing]");
  if(listing && !e.target.closest(".acts, [data-book]")){
      if(listing.tagName==="A") return;
      location.href = roomHref(listing.dataset.openListing);
      return;
    }
  const areaBtn = e.target.closest("[data-area]");
  if(areaBtn){
    homeArea = areaBtn.dataset.area;
    hoodPin = 0;
    famousFilter.hood = "all";
    paintHood();
    return;
  }
  if (e.target.closest("a.maps")) return;
  const fam = e.target.closest("[data-famous-filter]");
  if(fam){
    famousFilter[fam.dataset.famousScope] = fam.dataset.famousFilter;
    if (fam.dataset.famousScope==="hood") paintHood();
    else {
      const el = document.getElementById("famous-detail");
      const { parts } = parseHash();
      const listing = LISTINGS.find(x=>x.id===parts[1]) || LISTINGS[0];
      if (el && listing) el.outerHTML = famousHTML(listing.area, "detail");
    }
    return;
  }
  const jump = e.target.closest("[data-jump-area]");
  if(jump){
    e.preventDefault();
    homeArea = jump.dataset.jumpArea;
    hoodPin = 0;
    location.hash = "#/";
    requestAnimationFrame(()=> {
      const el = document.getElementById("hood");
      if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
    });
    return;
  }
  const gal = e.target.closest("[data-gal]");
  if(gal){
    const v = gal.dataset.gal;
    if(v==="prev") setGallery(galleryIdx-1);
    else if(v==="next") setGallery(galleryIdx+1);
    else setGallery(Number(v));
    return;
  }
  const pin = e.target.closest("[data-pin]");
  if(pin){
    const scope = pin.dataset.pinScope || "detail";
    if(scope==="hood"){ hoodPin = Number(pin.dataset.pin); paintHood(); }
    else paintNearby(scope, Number(pin.dataset.pin));
    return;
  }
  const petsBtn = e.target.closest("[data-pets]");
  if(petsBtn){
    document.querySelectorAll("[data-pets]").forEach(b=>b.classList.toggle("on", b===petsBtn));
    const hidden = document.getElementById("pets");
    if(hidden) hidden.value = petsBtn.dataset.pets;
    return;
  }
  const filterBtn = e.target.closest("[data-filter]");
  if(filterBtn){
    const k = filterBtn.dataset.filter;
    if(k==="area") filters.area = filters.area ? null : filters.area;
    else filters[k] = !filters[k];
    document.getElementById("view-results").innerHTML = resultsView();
    return;
  }
  if(e.target.closest("[data-open='line']")){
    const btn = e.target.closest("[data-open='line']");
    const lineId = btn.dataset.listing || null;
    const modal = document.getElementById("lineModal");
    modal.innerHTML = lineModalHTML(lineId);
    modal.classList.add("on");
    return;
  }
  if(e.target.closest("[data-copy-line]")){
    const ta = document.getElementById("lineMsg");
    const btn = e.target.closest("[data-copy-line]");
    if(ta){
      const done = () => { btn.textContent = "คัดลอกแล้ว"; };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(ta.value).then(done).catch(()=>{ ta.select(); document.execCommand("copy"); done(); });
      } else { ta.select(); document.execCommand("copy"); done(); }
    }
    return;
  }
  if(e.target.closest("[data-close='line']")){
    document.getElementById("lineModal").classList.remove("on");
    return;
  }
  const book = e.target.closest("[data-book]");
  if(book){
    const modal = document.getElementById("viewModal");
    modal.innerHTML = viewModalHTML(book.dataset.book, false);
    modal.classList.add("on");
    return;
  }
  if(e.target.closest("[data-close='view']")){
    document.getElementById("viewModal").classList.remove("on");
    return;
  }
});

document.addEventListener("submit", (e)=>{
  if(e.target.id==="matchForm"){
    e.preventDefault();
    const fd = new FormData(e.target);
    prefs = readMatchForm(e.target);
    filters = { seg:false, pets:false, walk5:false, area: prefs.areas[0] || null };
    location.hash = "#/results";
    if((location.hash||"")==="#/results") render();
    return;
  }
  if(e.target.id==="bookForm"){
    e.preventDefault();
    const id = e.target.dataset.bookId;
    const modal = document.getElementById("viewModal");
    modal.innerHTML = viewModalHTML(id, true);
    return;
  }
});

document.addEventListener("click", (e)=>{
  if(e.target.classList.contains("overlay")) e.target.classList.remove("on");
});


  let galPointerX = null, galPointerY = null, galTracking = false;
  function galStart(x, y, fromStage){
    if(!fromStage) return;
    if(document.querySelector("#galleryStage .gallery-track")) return;
    galPointerX = x; galPointerY = y; galTracking = true;
  }
  function galEnd(x, y){
    if(!galTracking || galPointerX == null) { galTracking = false; return; }
    const dx = x - galPointerX, dy = y - galPointerY;
    galPointerX = galPointerY = null; galTracking = false;
    if(Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return;
    setGallery(galleryIdx + (dx < 0 ? 1 : -1));
  }
  document.addEventListener("pointerdown", e => {
    galStart(e.clientX, e.clientY, !!e.target.closest("#galleryStage"));
  }, {passive:true});
  document.addEventListener("pointerup", e => galEnd(e.clientX, e.clientY));
  document.addEventListener("pointercancel", () => { galTracking = false; galPointerX = galPointerY = null; });
  document.addEventListener("touchstart", e => {
    const st = e.target.closest("#galleryStage");
    if(!st || !e.changedTouches[0]) return;
    galStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY, true);
  }, {passive:true});
  document.addEventListener("touchend", e => {
    const t = e.changedTouches[0];
    if(t) galEnd(t.clientX, t.clientY);
  }, {passive:true});

document.addEventListener("keydown", (e)=>{
  if (e.key === "Escape"){
    document.querySelectorAll(".overlay.on").forEach(o => o.classList.remove("on"));
    return;
  }
  if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && document.getElementById("galleryStage") && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName||""))){
    e.preventDefault();
    setGallery(galleryIdx + (e.key==="ArrowRight" ? 1 : -1));
    return;
  }
  if (e.key !== "Tab") return;
  const trap = document.querySelector(".overlay.on .modal");
  if (!trap) return;
  const els = [...trap.querySelectorAll("button, a, input, select, textarea, [href]")].filter(el => !el.disabled && el.getAttribute("aria-hidden")!=="true");
  if (!els.length) return;
  const first = els[0], last = els[els.length-1];
  if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});




