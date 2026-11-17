# ประกาศขาย / Sale listings

MoveCondo ตอนนี้มีคอนโดให้เช่าเป็นหลัก ส่วนประกาศขายอ่านจากไฟล์ข้อมูลด้านล่าง เมื่อมีประกาศในไฟล์นี้ หน้า `/buy/` และหน้าห้องขายจะถูกสร้างให้อัตโนมัติ ถ้ายังไม่มีรายการ หน้าเหล่านั้นจะแสดงสถานะว่างพร้อมปุ่ม LINE ให้เจ้าของลงประกาศ

Sale listings are data-driven. Do not invent or publish example listings as real. An empty `listings` array keeps the Buy pages in the empty state.

## ไฟล์ที่เกี่ยวข้อง / Files

| ไฟล์ | หน้าที่ |
| --- | --- |
| `data/sale-listings.json` | แหล่งข้อมูลหลัก (array `listings`) |
| `images/sale/<slug>/` | รูปของแต่ละประกาศ เช่น `1.webp`, `2.webp` |
| `tools/build-sale-pages.py` | สร้างหน้า `/buy/`, `/buy/<slug>/`, `/type/<kind>/` และอัปเดต `const SALE_LISTINGS` ใน `assets/app.js` |
| `tools/build-agent-files.py` | อัปเดต sitemap และ llms (จะเรียกสคริปต์ด้านบนให้) |

อย่าใส่ประกาศตัวอย่างลงใน `data/sale-listings.json` จนกว่าจะพร้อมเผยแพร่จริง

## สคีมา / Schema

`data/sale-listings.json` ต้องเป็นออบเจ็กต์ที่มีคีย์ `listings` เป็นอาร์เรย์ รายการที่พร้อมเผยแพร่มีฟิลด์ดังนี้

**จำเป็น / Required**

| ฟิลด์ | ชนิด | ความหมาย |
| --- | --- | --- |
| `slug` | string | ใช้ใน URL เท่านั้น เช่น `/buy/noble-state-39-1-bed/` ใช้ตัวพิมพ์เล็ก a-z, 0-9 และขีดกลาง **ห้ามเป็นรหัสห้อง และห้ามแสดงในหน้าเว็บ** |
| `propertyType` | string | หนึ่งใน `condo` · `house` · `land` · `office` · `warehouse` · `other` |
| `project` | string | ชื่อโครงการหรือทรัพย์ |
| `area` | string | ย่านเป็นภาษาไทย เช่น `พร้อมพงษ์` |
| `salePrice` | integer | ราคาขายเป็นบาท (เช่น `7500000` แสดงผลเป็น ฿7,500,000) |
| `photos` | string[] | path จากรากเว็บ ต้องขึ้นต้นด้วย `images/sale/` และไฟล์ต้องมีอยู่จริง |
| `descriptionTh` | string | คำอธิบายภาษาไทย (ห้ามมีข้อมูลเจ้าของ เบอร์โทร รหัสห้อง ข้อความเรื่องสัตว์เลี้ยง หรือ LINE ID) |
| `descriptionEn` | string | คำอธิบายภาษาอังกฤษ (กฎเดียวกัน) |
| `lastVerified` | string | วันที่ตรวจข้อมูลล่าสุด `YYYY-MM-DD` |

**แนะนำ / Recommended**

| ฟิลด์ | ชนิด | ความหมาย |
| --- | --- | --- |
| `areaSlug` | string | slug ย่านที่มีอยู่แล้วใน `areas/` เช่น `phrom-phong` |
| `station` | string | สถานีใกล้สุด เช่น `BTS พร้อมพงษ์` |
| `stationDistanceM` | integer | ระยะทางถึงสถานีเป็นเมตร เช่น `450` |
| `bedrooms` | integer | จำนวนห้องนอน (`0` = สตูดิโอ) เว้นว่างได้ถ้าเป็นที่ดิน |
| `size` | number | พื้นที่ตารางเมตร เก็บทศนิยมได้ เช่น `34.74` |
| `floor` | string | ชั้นจริง เช่น `"12A"` หรือ `"4"` แสดงในหน้าเว็บเป็น ชั้น 12A |

**ทางเลือก / Optional**

| ฟิลด์ | ชนิด | ความหมาย |
| --- | --- | --- |
| `areaEn` | string | ชื่อย่านภาษาอังกฤษ ถ้าไม่ใส่ ระบบใช้ค่า `area` |
| `stationEn` | string | ชื่อสถานีภาษาอังกฤษ |
| `bathrooms` | integer | จำนวนห้องน้ำ |
| `lat`, `lng` | number | พิกัดสำหรับ JSON-LD เท่านั้น ไม่ต้องใส่ถ้าไม่ชัวร์ |
| `published` | boolean | ถ้าเป็น `false` จะไม่ถูกเผยแพร่ (สำหรับฉบับร่าง) |
| `status` | string | ค่าเริ่มต้นถือว่าพร้อมเผยแพร่ ค่า `draft` / `sold` / `hidden` จะถูกข้าม |

ห้ามใส่ชื่อเจ้าของ เบอร์โทร LINE ID เลขห้อง (unit number) หรือรหัสห้องในไฟล์นี้ถ้าจะไปโชว์บนหน้าเว็บ สคีมาไม่มีฟิลด์สำหรับข้อมูลเหล่านั้นโดยเจตนา

## วิธีเพิ่มประกาศขาย 1 รายการ / How to add one listing

1. คัดกรองรูปก่อนลง ห้ามมีใบหน้า เบอร์โทร ป้ายชื่อ เอกสาร หรือเงาสะท้อนในกระจก ลายน้ำชื่อเอเจนต์หรือช่องทางติดต่อให้เบลอ หรือตัดรูปนั้นออก
2. ตั้ง `slug` ที่อ่านรู้เรื่อง ไม่ซ้ำ และไม่มีรหัสห้อง เช่น `noble-state-39-1-bed`
3. วางรูปไว้ที่ `images/sale/<slug>/` ชื่อ `1.webp`, `2.webp`, … (เรียงตามลำดับที่อยากให้แสดง) จะมีไฟล์ thumb ชื่อ `1-th.webp` ก็ได้ แต่ไม่บังคับ
4. เพิ่มออบเจ็กต์ลงใน `listings` ภายใน `data/sale-listings.json`
5. จากรากรีโป รัน

   ```bash
   python3 tools/build-sale-pages.py
   python3 tools/build-agent-files.py
   ```

   สคริปต์แรกจะผิดพลาดทันทีถ้าฟิลด์ไม่ครบ รูปไม่เจอ หรือมีข้อความที่ห้าม
6. เปิดตรวจ `/buy/` และ `/buy/<slug>/` แล้วคอมมิตพร้อมรูป แล้วพุชขึ้น `main`

แท็บซื้อบนหน้าแรกจะชี้ไปที่ `/buy/` การค้นหาภายใต้แท็บซื้อจะไปหน้านี้ (หรือหน้าห้องขายถ้ามีรายการที่ตรง) หมวด คอนโด ใต้แท็บซื้อไปที่ `/buy/` หมวดอื่นไปที่ `/type/house/` ฯลฯ พร้อม `?intent=buy`

## ตัวอย่างเท่านั้น — ยังไม่เผยแพร่ / EXAMPLE ONLY — not published

ตัวอย่างด้านล่างเป็นเพียงรูปแบบสำหรับผู้ที่กำลังจะลงประกาศ **อย่าคัดลอกใส่ `data/sale-listings.json` จนกว่าจะตรวจรูปครบและตั้งใจเผยแพร่จริง** ไฟล์ข้อมูลที่ออนไลน์ตอนนี้เป็น `{ "listings": [] }` จึงยังไม่มีประกาศขายบนเว็บ

```json
{
  "listings": [
    {
      "slug": "noble-state-39-1-bed",
      "propertyType": "condo",
      "project": "Noble State 39",
      "area": "พร้อมพงษ์",
      "areaSlug": "phrom-phong",
      "areaEn": "Phrom Phong",
      "station": "BTS พร้อมพงษ์",
      "stationEn": "BTS Phrom Phong",
      "stationDistanceM": 450,
      "bedrooms": 1,
      "size": 34.74,
      "salePrice": 7500000,
      "floor": "12A",
      "photos": [
        "images/sale/noble-state-39-1-bed/1.webp",
        "images/sale/noble-state-39-1-bed/2.webp"
      ],
      "descriptionTh": "คอนโด 1 ห้องนอน ขนาด 34.74 ตร.ม. ที่ Noble State 39 ย่านพร้อมพงษ์ ใกล้ BTS พร้อมพงษ์ ประมาณ 450 เมตร",
      "descriptionEn": "A 1-bedroom condo of 34.74 sq.m. at Noble State 39 in Phrom Phong, about 450 m from BTS Phrom Phong.",
      "lastVerified": "2026-11-17"
    }
  ]
}
```

ตัวเลขในตัวอย่างนี้ตรงกับข้อมูลที่เจ้าของเตรียมไว้ แต่เป็นเพียงตัวอย่างในเอกสารนี้เท่านั้น จนกว่าจะถูกเพิ่มใน `data/sale-listings.json` พร้อมรูปที่ตรวจแล้ว จึงจะขึ้นบนเว็บ
