/**
 * STEM Codex & Badge Collection Data
 * สารานุกรมความรู้และตราสัญลักษณ์เกียรติยศสะเต็ม สำหรับนักเรียน ป.4-ป.6
 */

export interface CodexCard {
  id: string;
  category: 'S' | 'T' | 'E' | 'M' | 'INTEGRATED';
  categoryLabel: string;
  categoryColor: string; // Tailwind color classes
  badgeColor: string;
  title: string;
  subtitle: string;
  icon: string;
  companionId: 'leaf' | 'mia' | 'noa' | 'bloopie';
  companionName: string;
  stageUnlock: number; // 1: S, 2: T, 3: E, 4: M, 5: Boss
  summary: string;
  keyConcepts: {
    title: string;
    description: string;
  }[];
  realWorldExample: string;
  funFact: string;
  audioText: string;
}

export interface StemBadge {
  id: string;
  stageId: number;
  name: string;
  title: string;
  category: 'Science' | 'Technology' | 'Engineering' | 'Mathematics' | 'Master';
  icon: string;
  gemColor: string;
  borderColor: string;
  bgGradient: string;
  description: string;
  criteria: string;
  quote: string;
}

export const STEM_BADGES: StemBadge[] = [
  {
    id: 'badge-s',
    stageId: 1,
    name: 'ตราผู้พิทักษ์พฤกษาวิทยา',
    title: 'Science Guardian Badge',
    category: 'Science',
    icon: '🌱',
    gemColor: 'from-emerald-400 to-green-600',
    borderColor: 'border-emerald-500',
    bgGradient: 'from-emerald-50 to-green-100',
    description: 'มอบให้แก่ผู้เชี่ยวชาญการสังเกตธรรมชาติ พลังงานสะอาด และวัฏจักรของสิ่งมีชีวิต',
    criteria: 'ผ่านด่านที่ 1: หมู่บ้านเริ่มต้น (Science)',
    quote: '"ธรรมชาติคือห้องเรียนที่กว้างใหญ่ที่สุดในโลก"',
  },
  {
    id: 'badge-t',
    stageId: 2,
    name: 'ตราจอมเวทอัลกอริทึม',
    title: 'Technology Wizard Badge',
    category: 'Technology',
    icon: '💻',
    gemColor: 'from-amber-400 to-yellow-600',
    borderColor: 'border-amber-500',
    bgGradient: 'from-amber-50 to-yellow-100',
    description: 'มอบให้แก่ผู้มีทักษะการคิดเชิงคำนวณ จัดลำดับคำสั่ง และมีความปลอดภัยบนโลกไซเบอร์',
    criteria: 'ผ่านด่านที่ 2: ป่าดอกไม้สีทอง (Technology)',
    quote: '"การคิดอย่างเป็นขั้นตอน เปลี่ยนปัญหาใหญ่ให้กลายเป็นเรื่องง่าย"',
  },
  {
    id: 'badge-e',
    stageId: 3,
    name: 'ตราปรมาจารย์วิศวกรรมฟันเฟือง',
    title: 'Engineering Master Badge',
    category: 'Engineering',
    icon: '⚙️',
    gemColor: 'from-blue-400 to-indigo-600',
    borderColor: 'border-blue-500',
    bgGradient: 'from-blue-50 to-indigo-100',
    description: 'มอบให้แก่นักออกแบบโครงสร้าง ผู้เข้าใจกลไกฟันเฟือง รอก และวงจรไฟฟ้าประยุกต์',
    criteria: 'ผ่านด่านที่ 3: หุบเขาน้ำตกฟันเฟือง (Engineering)',
    quote: '"ความแข็งแรงของสะพาน ไม่ได้อยู่ที่น้ำหนัก แต่อยู่ที่การออกแบบโครงสร้าง"',
  },
  {
    id: 'badge-m',
    stageId: 4,
    name: 'ตราพหูสูตคณิตพิชิตจำนวน',
    title: 'Mathematics Sage Badge',
    category: 'Mathematics',
    icon: '📐',
    gemColor: 'from-purple-400 to-pink-600',
    borderColor: 'border-purple-500',
    bgGradient: 'from-purple-50 to-pink-100',
    description: 'มอบให้แก่ผู้เชี่ยวชาญการคิดคำนวณเงินทอน เศษส่วน รูปทรงเรขาคณิต และแกนสมมาตร',
    criteria: 'ผ่านด่านที่ 4: ถ้ำคริสตัลตัวเลข (Mathematics)',
    quote: '"คณิตศาสตร์คือภาษาของจักรวาลที่ซ่อนอยู่ในธรรมชาติทุกสิ่ง"',
  },
  {
    id: 'badge-boss',
    stageId: 5,
    name: 'ตรามหาผู้กล้ากอบกู้เกาะสะเต็ม',
    title: 'Grand STEM Champion Badge',
    category: 'Master',
    icon: '👑',
    gemColor: 'from-amber-300 via-rose-500 to-purple-600',
    borderColor: 'border-yellow-400',
    bgGradient: 'from-yellow-100 via-amber-100 to-rose-100',
    description: 'เกียรติยศสูงสุด! มอบให้แก่ผู้บูรณาการทั้ง 4 ศาสตร์ S-T-E-M เพื่อกอบกู้พลังงานของเกาะได้สำเร็จ',
    criteria: 'ผ่านด่านที่ 5: ปราสาทแห่งความสุข (Boss Stage)',
    quote: '"พลังที่ยิ่งใหญ่ที่สุด คือการรวมพลังความคิดสร้างสรรค์เพื่อแก้ปัญหา"',
  },
];

export const CODEX_CARDS: CodexCard[] = [
  // ==========================================
  // SCIENCE (วิทยาศาสตร์) - 3 การ์ด
  // ==========================================
  {
    id: 'codex-s1',
    category: 'S',
    categoryLabel: 'วิทยาศาสตร์ (Science)',
    categoryColor: 'bg-emerald-600 text-white',
    badgeColor: 'border-emerald-500 text-emerald-800 bg-emerald-50',
    title: 'หลักการความหนาแน่น & แรงลอยตัว',
    subtitle: 'ทำไมเรือเหล็กลำใหญ่จึงลอยน้ำได้?',
    icon: '🚢',
    companionId: 'leaf',
    companionName: 'ลีฟ (Leaf)',
    stageUnlock: 1,
    summary: 'วัตถุจะลอยน้ำได้ เมื่อมีความหนาแน่นเฉลี่ยน้อยกว่าน้ำ หรือมีปริมาตรที่ช่วยสร้างแรงพยุงน้ำมากพอ',
    keyConcepts: [
      {
        title: 'ความหนาแน่น (Density)',
        description: 'คือมวลของวัตถุต่อปริมาตร วัตถุที่หนาแน่นน้อยกว่าน้ำจะลอย วัตถุที่หนาแน่นมากกว่าน้ำจะจม',
      },
      {
        title: 'แรงพยุงของน้ำ (Buoyant Force)',
        description: 'น้ำจะมีแรงดันพยุงวัตถุขึ้นเสมอ เท่ากับน้ำหนักของน้ำที่ถูกวัตถุนั้นแทนที่ (หลักการอาร์คิมิดีส)',
      },
      {
        title: 'ทำไมเรือเหล็กไม่จม?',
        description: 'แม้เหล็กจะหนัก แต่ท้องเรือถูกออกแบบให้โปร่งและกลวง มีอากาศอยู่ข้างใน ทำให้ความหนาแน่นเฉลี่ยทั้งลำน้อยกว่าน้ำ จึงลอยได้อย่างปลอดภัย',
      },
    ],
    realWorldExample: 'เสื้อชูชีพ แพยาง เรือบรรทุกสินค้า และเรือดำน้ำที่ปรับน้ำเข้า-ออกเพื่อดำหรือลอย',
    funFact: 'ก้อนดินน้ำมันถ้าปั้นเป็นก้อนกลมจะจมน้ำ แต่ถ้าแผ่ดินน้ำมันก้อนเดิมให้เป็นรูปกระทงหรือเรือกลวง มันจะลอยน้ำได้ทันที!',
    audioText: 'หลักการความหนาแน่นและแรงลอยตัว วัตถุจะลอยน้ำได้เมื่อมีความหนาแน่นน้อยกว่าน้ำ เรือเหล็กลอยได้เพราะท้องเรือโปร่งกลวง มีอากาศช่วยให้ความหนาแน่นเฉลี่ยน้อยกว่าน้ำจ้ะ',
  },
  {
    id: 'codex-s2',
    category: 'S',
    categoryLabel: 'วิทยาศาสตร์ (Science)',
    categoryColor: 'bg-emerald-600 text-white',
    badgeColor: 'border-emerald-500 text-emerald-800 bg-emerald-50',
    title: 'แผงโซลาร์เซลล์ & พลังงานหมุนเวียน',
    subtitle: 'เปลี่ยนแสงแดดร้อนแรงเป็นไฟฟ้าสะอาด',
    icon: '☀️',
    companionId: 'leaf',
    companionName: 'ลีฟ (Leaf)',
    stageUnlock: 1,
    summary: 'แผงโซลาร์เซลล์แปลงพลังงานแสงอาทิตย์เป็นพลังงานไฟฟ้าสะอาด ไร้มลพิษ และไม่มีวันหมด',
    keyConcepts: [
      {
        title: 'พลังงานแสงอาทิตย์',
        description: 'สารกึ่งตัวนำซิลิคอนในแผงโซลาร์เซลล์ เมื่อได้รับแสงอาทิตย์จะกระตุ้นให้อิเล็กตรอนเคลื่อนที่ เกิดเป็นกระแสไฟฟ้า',
      },
      {
        title: 'พลังงานหมุนเวียน (Renewable Energy)',
        description: 'พลังงานธรรมชาติที่หมุนเวียนกลับมาใช้ได้เรื่อยๆ เช่น แสงแดด ลม น้ำ ไม่ก่อให้เกิดก๊าซเรือนกระจก',
      },
    ],
    realWorldExample: 'โซลาร์เซลล์บนหลังคาบ้าน โคมไฟถนนพลังแสงอาทิตย์ และเครื่องคิดเลขพลังงานแสง',
    funFact: 'แสงจากดวงอาทิตย์เดินทางมาถึงโลกใช้เวลาเพียงประมาณ 8 นาที 20 วินาทีเท่านั้น!',
    audioText: 'แผงโซลาร์เซลล์แปลงพลังงานแสงอาทิตย์ให้เป็นพลังงานไฟฟ้าสะอาด ช่วยลดภาวะโลกร้อน และเป็นพลังงานหมุนเวียนที่ใช้ไม่มีวันหมด',
  },
  {
    id: 'codex-s3',
    category: 'S',
    categoryLabel: 'วิทยาศาสตร์ (Science)',
    categoryColor: 'bg-emerald-600 text-white',
    badgeColor: 'border-emerald-500 text-emerald-800 bg-emerald-50',
    title: 'วัฏจักรของน้ำ & การเกิดฝน',
    subtitle: 'การเดินทางมหัศจรรย์ของหยดน้ำในธรรมชาติ',
    icon: '🌧️',
    companionId: 'leaf',
    companionName: 'ลีฟ (Leaf)',
    stageUnlock: 1,
    summary: 'น้ำระเหยเป็นไอ ควบแน่นเป็นเมฆ รวมตัวตกลงมาเป็นฝน แล้วไหลกลับสู่แหล่งน้ำ หมุนเวียนไม่รู้จบ',
    keyConcepts: [
      {
        title: 'การระเหย (Evaporation)',
        description: 'ความร้อนจากแสงแดดทำให้น้ำในทะเลและแม่น้ำเปลี่ยนสถานะจากของเหลวกลายเป็นไอน้ำลอยขึ้นฟ้า',
      },
      {
        title: 'การควบแน่น (Condensation)',
        description: 'ไอน้ำลอยสูงขึ้นเจอความเย็น ก่อตัวรวมกันเป็นละอองน้ำเล็กๆ กลายเป็นก้อนเมฆสีขาว',
      },
      {
        title: 'หยาดน้ำฟ้า (Precipitation)',
        description: 'เมื่อละอองน้ำในเมฆหนักเกินกว่าที่อากาศจะพยุงไว้ได้ ก็จะตกลงมาเป็นหยดน้ำฝนลงสู่พื้นดิน',
      },
    ],
    realWorldExample: 'การตากผ้าเปียกให้แห้งด้วยแดด และหยดน้ำเกาะข้างแก้วน้ำเย็น',
    funFact: 'น้ำที่เราดื่มในวันนี้ อาจเป็นหยดน้ำเดียวกับที่ไดโนเสาร์เคยดื่มเมื่อ 100 ล้านปีก่อน เพราะน้ำในโลกหมุนเวียนในวัฏจักรเดิมเสมอ!',
    audioText: 'วัฏจักรของน้ำ แสงแดดทำให้น้ำระเหยเป็นไอ ควบแน่นเป็นก้อนเมฆ และตกลงมาเป็นฝน หมุนเวียนหล่อเลี้ยงสิ่งมีชีวิตบนโลกตลอดไป',
  },

  // ==========================================
  // TECHNOLOGY (เทคโนโลยี) - 3 การ์ด
  // ==========================================
  {
    id: 'codex-t1',
    category: 'T',
    categoryLabel: 'เทคโนโลยี (Technology)',
    categoryColor: 'bg-amber-600 text-white',
    badgeColor: 'border-amber-500 text-amber-800 bg-amber-50',
    title: 'อัลกอริทึม & ลำดับขั้นตอนคำสั่ง',
    subtitle: 'คิดอย่างเป็นลำดับเพื่อแก้ปัญหาทุกเรื่อง',
    icon: '📋',
    companionId: 'mia',
    companionName: 'มีอา (Mia)',
    stageUnlock: 2,
    summary: 'อัลกอริทึมคือชุดขั้นตอนคำสั่งที่ชัดเจน เรียงลำดับจากก่อนไปหลัง เพื่อให้ได้ผลลัพธ์ที่ถูกต้อง',
    keyConcepts: [
      {
        title: 'ความชัดเจน ไม่กำกวม',
        description: 'คอมพิวเตอร์และหุ่นยนต์ต้องการคำสั่งที่ละเอียด ชัดเจน เช่น "เดินหน้า 3 ก้าว เลี้ยวขวา 90 องศา"',
      },
      {
        title: 'การจัดลำดับ (Sequencing)',
        description: 'ขั้นตอนต้องเรียงอย่างถูกต้อง ถ้าสลับขั้นตอน ผลลัพธ์อาจผิดพลาด เช่น ต้องใส่ถุงเท้าก่อนใส่รองเท้าเสมอ',
      },
      {
        title: 'การหาข้อผิดพลาด (Debugging)',
        description: 'เมื่อโปรแกรมทำงานผิดพลาด นักเขียนโปรแกรมจะไล่ตรวจดูทีละขั้นตอนเพื่อแก้ไขจุดที่ผิด',
      },
    ],
    realWorldExample: 'สูตรทำขนมเค้ก คู่มือต่อตัวต่อเลโก้ และโค้ดสั่งให้หุ่นยนต์ดูดฝุ่นเดินทำความสะอาดบ้าน',
    funFact: 'คำว่า "Algorithm" ตั้งตามชื่อของนักคณิตศาสตร์ชาวเปอร์เซีย "อัลคอวาริซมี (Al-Khwarizmi)" ผู้คิดค้นหลักการคำนวณ!',
    audioText: 'อัลกอริทึมคือลำดับขั้นตอนคำสั่งที่ชัดเจน เพื่อแก้ปัญหาอย่างเป็นระบบ เหมือนสูตรการทำอาหารที่ต้องทำตามลำดับอย่างถูกต้อง',
  },
  {
    id: 'codex-t2',
    category: 'T',
    categoryLabel: 'เทคโนโลยี (Technology)',
    categoryColor: 'bg-amber-600 text-white',
    badgeColor: 'border-amber-500 text-amber-800 bg-amber-50',
    title: 'การตรวจสอบเงื่อนไข (If-Then-Else)',
    subtitle: 'สอนให้คอมพิวเตอร์ตัดสินใจได้เหมือนมนุษย์',
    icon: '🔀',
    companionId: 'mia',
    companionName: 'มีอา (Mia)',
    stageUnlock: 2,
    summary: 'การตัดสินใจด้วยเงื่อนไข "ถ้า...จริง ให้ทำอย่างหนึ่ง ถ้าไม่จริง ให้ทำอีกอย่างหนึ่ง"',
    keyConcepts: [
      {
        title: 'โครงสร้างเงื่อนไข',
        description: 'ถ้า (เงื่อนไขเป็นจริง) ➔ ทำคำสั่ง A, ถ้าไม่ใช่ ➔ ทำคำสั่ง B',
      },
      {
        title: 'ตัวอย่างในชีวิตประจำวัน',
        description: 'ถ้า (ฝนตก) ➔ พกร่มออกจากบ้าน, ถ้า (ฝนไม่ตก) ➔ สวมหมวกกันแดด',
      },
    ],
    realWorldExample: 'ไฟเขียวไฟแดงอัตโนมัติ ประตูเลื่อนเซนเซอร์ และระบบเปิดไฟอัตโนมัติเมื่อท้องฟ้ามืด',
    funFact: 'ปัญญาประดิษฐ์ (AI) ในรถยนต์ไร้คนขับ ใช้การตรวจสอบเงื่อนไขหลายล้านครั้งต่อวินาทีเพื่อหยุดเมื่อมีคนข้ามถนน!',
    audioText: 'การตรวจสอบเงื่อนไข ถ้า-แล้ว ถ้าฝนตกให้กางร่ม ถ้าไม่ตกให้เดินต่อ คอมพิวเตอร์ใช้เงื่อนไขนี้เพื่อช่วยตัดสินใจจ้ะ',
  },
  {
    id: 'codex-t3',
    category: 'T',
    categoryLabel: 'เทคโนโลยี (Technology)',
    categoryColor: 'bg-amber-600 text-white',
    badgeColor: 'border-amber-500 text-amber-800 bg-amber-50',
    title: 'ความปลอดภัยบนโลกไซเบอร์ & รหัสผ่าน',
    subtitle: 'เกราะป้องกันตัวตนและข้อมูลสำคัญบนอินเทอร์เน็ต',
    icon: '🛡️',
    companionId: 'mia',
    companionName: 'มีอา (Mia)',
    stageUnlock: 2,
    summary: 'ตั้งรหัสผ่านที่คาดเดายาก ไม่เปิดเผยข้อมูลส่วนตัว และไม่กดลิงก์แปลกปลอมจากคนแปลกหน้า',
    keyConcepts: [
      {
        title: 'รหัสผ่านที่แข็งแรง (Strong Password)',
        description: 'มีความยาวอย่างน้อย 8 ตัวอักษร ผสมตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และสัญลักษณ์ ไม่ใช้วันเกิดหรือ 123456',
      },
      {
        title: 'ข้อมูลส่วนตัวห้ามเปิดเผย (Personal Data)',
        description: 'เลขบัตรประชาชน รหัสผ่าน เบอร์โทรศัพท์ และที่อยู่บ้าน ต้องเก็บเป็นความลับเสมอ',
      },
    ],
    realWorldExample: 'การสแกนใบหน้า/ลายนิ้วมือ และการยืนยันตัวตนแบบสองชั้น (2FA)',
    funFact: 'รหัสผ่านที่คนไทยและทั่วโลกใช้มากที่สุดจนถูกแฮกง่ายที่สุดคือ "123456" และ "password" อย่าใช้เด็ดขาดนะ!',
    audioText: 'ความปลอดภัยไซเบอร์ ตั้งรหัสผ่านให้ปลอดภัยอย่างน้อย 8 ตัวอักษร และห้ามบอกรหัสผ่านหรือข้อมูลส่วนตัวกับคนแปลกหน้า',
  },

  // ==========================================
  // ENGINEERING (วิศวกรรม) - 3 การ์ด
  // ==========================================
  {
    id: 'codex-e1',
    category: 'E',
    categoryLabel: 'วิศวกรรม (Engineering)',
    categoryColor: 'bg-blue-600 text-white',
    badgeColor: 'border-blue-500 text-blue-800 bg-blue-50',
    title: 'โครงสร้างสะพานสามเหลี่ยม Truss',
    subtitle: 'ทำไมรูปทรงสามเหลี่ยมจึงแข็งแรงที่สุด?',
    icon: '🌉',
    companionId: 'noa',
    companionName: 'โนอา (Noa)',
    stageUnlock: 3,
    summary: 'โครงสร้างสามเหลี่ยม (Truss) กระจายแรงกดและแรงดึงได้สมดุลที่สุด ไม่บิดเบี้ยวหรือพังทลายง่าย',
    keyConcepts: [
      {
        title: 'ความมั่นคงของรูปสามเหลี่ยม',
        description: 'รูปสี่เหลี่ยมเมื่อโดนกดด้านข้างจะโย้เบี้ยวเป็นสี่เหลี่ยมด้านขนาน แต่รูปสามเหลี่ยมจะไม่เปลี่ยนรูปทรงจนกว่าคานจะหัก',
      },
      {
        title: 'การกระจายแรง (Force Distribution)',
        description: 'เมื่อมีน้ำหนักกดลงมาที่ยอดสามเหลี่ยม แรงจะถูกถ่ายทอดออกไปยังขาทั้งสองข้างอย่างสมดุล',
      },
    ],
    realWorldExample: 'สะพานพระราม 6 โครงหลังคาบ้าน หอคอยไอเฟล และเสาไฟฟ้าแรงสูง',
    funFact: 'หอไอเฟลในประเทศฝรั่งเศสสร้างจากโครงสร้างถักสามเหลี่ยมน้ำหนักเบา แต่ทนทานต่อลมพายุมานานกว่า 130 ปี!',
    audioText: 'โครงสร้างสะพานสามเหลี่ยม ทรัส เป็นรูปทรงที่กระจายแรงได้ดีที่สุด ไม่บิดงอ จึงนิยมใช้สร้างสะพานและโครงหลังคาบ้าน',
  },
  {
    id: 'codex-e2',
    category: 'E',
    categoryLabel: 'วิศวกรรม (Engineering)',
    categoryColor: 'bg-blue-600 text-white',
    badgeColor: 'border-blue-500 text-blue-800 bg-blue-50',
    title: 'กลไกฟันเฟือง & เครื่องผ่อนแรง',
    subtitle: 'เปลี่ยนทิศทางและผ่อนแรงด้วยกลศาสตร์ง่ายๆ',
    icon: '⚙️',
    companionId: 'noa',
    companionName: 'โนอา (Noa)',
    stageUnlock: 3,
    summary: 'ฟันเฟืองและรอกช่วยทดแรงและเปลี่ยนทิศทางการหมุน ทำให้มนุษย์ยกของหนักได้ง่ายขึ้น',
    keyConcepts: [
      {
        title: 'ฟันเฟืองสองตัวขบกัน',
        description: 'เมื่อเฟืองตัวหนึ่งหมุนตามเข็มนาฬิกา เฟืองอีกตัวที่ขบอยู่จะหมุนทวนเข็มนาฬิกาเสมอ',
      },
      {
        title: 'อัตราทดเกียร์ (Gear Ratio)',
        description: 'เฟืองเล็กหมุนเร็วแต่แรงน้อย เฟืองใหญ่หมุนช้าแต่ให้แรงบิดมหาศาล เหมือนเกียร์จักรยานขึ้นเขา',
      },
    ],
    realWorldExample: 'โซ่จักรยาน ลิฟต์โดยสาร นาฬิกาไขลาน และเครนยกตู้คอนเทนเนอร์',
    funFact: 'อาร์คิมิดีสเคยกล่าวไว้ว่า "ขอคานที่ยาวพอและจุดหมุนที่มั่นคง ฉันจะงัดโลกให้เคลื่อนที่ได้!"',
    audioText: 'ฟันเฟืองและเครื่องผ่อนแรงช่วยเปลี่ยนทิศทางการหมุนและช่วยให้เรายกของหนักๆ ได้อย่างง่ายดาย',
  },
  {
    id: 'codex-e3',
    category: 'E',
    categoryLabel: 'วิศวกรรม (Engineering)',
    categoryColor: 'bg-blue-600 text-white',
    badgeColor: 'border-blue-500 text-blue-800 bg-blue-50',
    title: 'วงจรไฟฟ้าอย่างง่าย & สวิตช์',
    subtitle: 'ทางเดินของกระแสไฟฟ้าเปิด-ปิดตามสั่ง',
    icon: '💡',
    companionId: 'noa',
    companionName: 'โนอา (Noa)',
    stageUnlock: 3,
    summary: 'กระแสไฟฟ้าจะไหลได้ครบวงจร (Closed Circuit) เมื่อไม่มีจุดขาด สวิตช์ทำหน้าที่เปิด-ปิดสะพานไฟ',
    keyConcepts: [
      {
        title: 'วงจรปิด (Closed Circuit)',
        description: 'สายไฟเชื่อมต่อครบ ไฟฟ้าไหลได้ หลอดไฟสว่าง',
      },
      {
        title: 'วงจรเปิด (Open Circuit)',
        description: 'สายไฟขาดหรือสวิตช์ปิด ไฟฟ้าหยุดไหล หลอดไฟดับ',
      },
    ],
    realWorldExample: 'ไฟฉาย สวิตช์ไฟผนังบ้าน และของเล่นบังคับวิทยุ',
    funFact: 'ร่างกายของมนุษย์เรานำไฟฟ้าได้เพราะมีน้ำและเกลือแร่เป็นส่วนประกอบหลัก ดังนั้นห้ามจับปลั๊กไฟขณะมือเปียกเด็ดขาด!',
    audioText: 'วงจรไฟฟ้าอย่างง่าย ไฟฟ้าจะไหลและหลอดไฟจะติดเมื่อเป็นวงจรปิด สวิตช์ทำหน้าที่ตัดหรือเชื่อมกระแสไฟฟ้านั่นเอง',
  },

  // ==========================================
  // MATHEMATICS (คณิตศาสตร์) - 3 การ์ด
  // ==========================================
  {
    id: 'codex-m1',
    category: 'M',
    categoryLabel: 'คณิตศาสตร์ (Mathematics)',
    categoryColor: 'bg-purple-600 text-white',
    badgeColor: 'border-purple-500 text-purple-800 bg-purple-50',
    title: 'การคำนวณร้อยละ กำไร & เงินทอน',
    subtitle: 'คณิตศาสตร์ฉลาดใช้ในชีวิตประจำวัน',
    icon: '🪙',
    companionId: 'mia',
    companionName: 'มีอา (Mia)',
    stageUnlock: 4,
    summary: 'ร้อยละคือการเปรียบเทียบจาก 100 ส่วน เงินทอนคือเงินที่จ่ายลบด้วยราคาสินค้า',
    keyConcepts: [
      {
        title: 'ร้อยละ / เปอร์เซ็นต์ (%)',
        description: 'หมายถึง จำนวนต่อ 100 เช่น ลดราคา 20% หมายถึงของ 100 บาท ลดให้ 20 บาท จ่ายจริง 80 บาท',
      },
      {
        title: 'การคำนวณเงินทอน',
        description: 'เงินทอน = เงินที่จ่ายไป - ราคาสินค้า เช่น จ่ายแบงก์ 100 ซื้อขนม 65 บาท ได้เงินทอน 35 บาท',
      },
    ],
    realWorldExample: 'ป้ายลดราคาในห้างสรรพสินค้า การคำนวณเงินออม และการคิดภาษีมูลค่าเพิ่ม',
    funFact: 'สัญลักษณ์ % มาจากคำภาษาอิตาลี "per cento" ซึ่งแปลว่า "ต่อหนึ่งร้อย" นั่นเอง!',
    audioText: 'การคำนวณร้อยละและเงินทอน ร้อยละคือการเทียบกับหนึ่งร้อย ช่วยให้เราคิดราคาส่วนลดและคำนวณเงินทอนได้อย่างแม่นยำ',
  },
  {
    id: 'codex-m2',
    category: 'M',
    categoryLabel: 'คณิตศาสตร์ (Mathematics)',
    categoryColor: 'bg-purple-600 text-white',
    badgeColor: 'border-purple-500 text-purple-800 bg-purple-50',
    title: 'แกนสมมาตร & รูปทรงเรขาคณิต',
    subtitle: 'ความงามที่ลงตัวในธรรมชาติและคณิตศาสตร์',
    icon: '🦋',
    companionId: 'mia',
    companionName: 'มีอา (Mia)',
    stageUnlock: 4,
    summary: 'รูปที่มีแกนสมมาตร เมื่อพับตามรอยแกนแล้ว ทั้งสองข้างจะทับกันสนิทพอดี',
    keyConcepts: [
      {
        title: 'แกนสมมาตร (Line of Symmetry)',
        description: 'เส้นที่แบ่งรูปออกเป็นสองส่วนเท่ากันเหมือนส่องกระจกเงา',
      },
      {
        title: 'ตัวอย่างในธรรมชาติ',
        description: 'ปีกผีเสื้อ ใบไม้ ดอกทานตะวัน และใบหน้าของมนุษย์มีความสมมาตรตามธรรมชาติ',
      },
    ],
    realWorldExample: 'สถาปัตยกรรมวัดวาอาราม โลโก้แบรนด์สินค้า และลวดลายผ้ามัดหมี่',
    funFact: 'เกล็ดหิมะทุกเกล็ดบนโลก มีแกนสมมาตร 6 แฉกที่สวยงามไม่ซ้ำกันเลยแม้แต่เกล็ดเดียว!',
    audioText: 'แกนสมมาตรคือเส้นที่พับครึ่งแล้วรูปทั้งสองข้างประกบกันได้สนิท เช่น ปีกผีเสื้อและใบไม้ที่งดงามในธรรมชาติ',
  },
  {
    id: 'codex-m3',
    category: 'M',
    categoryLabel: 'คณิตศาสตร์ (Mathematics)',
    categoryColor: 'bg-purple-600 text-white',
    badgeColor: 'border-purple-500 text-purple-800 bg-purple-50',
    title: 'เศษส่วน & การแบ่งปันอย่างเท่าเทียม',
    subtitle: 'แบ่งขนมให้อร่อยและยุติธรรมด้วยเศษส่วน',
    icon: '🍕',
    companionId: 'mia',
    companionName: 'มีอา (Mia)',
    stageUnlock: 4,
    summary: 'เศษส่วนแสดงส่วนหนึ่งของของทั้งหมด เช่น พิซซ่า 1 ถาดแบ่งเป็น 8 ชิ้น กิน 3 ชิ้น คือ 3 ใน 8 ส่วน (3/8)',
    keyConcepts: [
      {
        title: 'ตัวเศษและตัวส่วน',
        description: 'ตัวเศษ (ด้านบน) คือส่วนที่สนใจ, ตัวส่วน (ด้านล่าง) คือจำนวนชิ้นทั้งหมดที่แบ่งเท่าๆ กัน',
      },
      {
        title: 'เศษส่วนที่เท่ากัน',
        description: '1/2 ถาด มีค่าเท่ากับ 2/4 ถาด หรือ 4/8 ถาด พอดีเป๊ะ',
      },
    ],
    realWorldExample: 'การแบ่งพิซซ่า การตวงส่วนผสมทำขนมเค้ก (แป้ง 1/2 ถ้วยตวง) และการดูเกจน้ำมันรถยนต์',
    funFact: 'ชาวอียิปต์โบราณเมื่อ 4,000 ปีก่อน ใช้เศษส่วนในการคำนวณภาษีที่ดินและการสร้างพีระมิด!',
    audioText: 'เศษส่วนแสดงการแบ่งสิ่งของออกเป็นส่วนๆ ที่เท่ากัน ช่วยให้เราแบ่งปันอาหารและตวงส่วนผสมได้อย่างพอดี',
  },

  // ==========================================
  // INTEGRATED STEM (สะเต็มศึกษาบูรณาการ) - 2 การ์ด
  // ==========================================
  {
    id: 'codex-boss1',
    category: 'INTEGRATED',
    categoryLabel: 'สะเต็มบูรณาการ (STEM Integration)',
    categoryColor: 'bg-gradient-to-r from-red-600 to-amber-600 text-white',
    badgeColor: 'border-red-500 text-red-800 bg-red-50',
    title: 'กระบวนการออกแบบเชิงวิศวกรรม 5 ขั้นตอน',
    subtitle: 'คู่มือแก้ปัญหาฉบับนักสะเต็มตัวจริง',
    icon: '🚀',
    companionId: 'bloopie',
    companionName: 'บลูปี้ & เพื่อนๆ',
    stageUnlock: 5,
    summary: 'ระบุปัญหา ➔ รวบรวมข้อมูล ➔ ออกแบบวิธีแก้ ➔ วางแผนและสร้าง ➔ ทดสอบและปรับปรุง',
    keyConcepts: [
      {
        title: '1. ระบุปัญหา (Ask)',
        description: 'เข้าใจว่าปัญหาที่แท้จริงคืออะไร และมีข้อจำกัดอะไรบ้าง',
      },
      {
        title: '2. รวบรวมข้อมูล (Imagine)',
        description: 'หาความรู้และระดมไอเดียจากหลายๆ มุมมองร่วมกัน',
      },
      {
        title: '3. ออกแบบและสร้าง (Plan & Create)',
        description: 'วาดผังโครงร่างและลงมือสร้างชิ้นงานต้นแบบ (Prototype)',
      },
      {
        title: '4. ทดสอบและปรับปรุง (Improve)',
        description: 'ทดลองใช้งานจริง หากมีข้อบกพร่องให้นำมาปรับปรุงแก้ไขให้ดียิ่งขึ้น',
      },
    ],
    realWorldExample: 'การออกแบบจรวดไปดวงจันทร์ การสร้างหน้ากากอนามัย และการสร้างเครื่องกรองน้ำในโรงเรียน',
    funFact: 'โทมัส เอดิสัน ทดลองไส้หลอดไฟล้มเหลวมากกว่า 1,000 ครั้ง ก่อนจะค้นพบไส้หลอดที่สว่างทนทาน!',
    audioText: 'กระบวนการออกแบบเชิงวิศวกรรม ระบุปัญหา รวบรวมข้อมูล ออกแบบ ลงมือสร้าง และทดสอบปรับปรุง เป็นหัวใจสำคัญของนักสะเต็ม',
  },
  {
    id: 'codex-boss2',
    category: 'INTEGRATED',
    categoryLabel: 'สะเต็มบูรณาการ (STEM Integration)',
    categoryColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
    badgeColor: 'border-purple-500 text-purple-800 bg-purple-50',
    title: 'หัวใจของนักสะเต็ม (4C Skills แห่งศตวรรษที่ 21)',
    subtitle: 'ทักษะชีวิตที่จะพาเธอเปลี่ยนโลกให้ดียิ่งขึ้น',
    icon: '🌟',
    companionId: 'bloopie',
    companionName: 'บลูปี้ & เพื่อนๆ',
    stageUnlock: 5,
    summary: 'คิดวิเคราะห์ (Critical Thinking), คิดสร้างสรรค์ (Creativity), สื่อสารชัดเจน (Communication), ร่วมมือกัน (Collaboration)',
    keyConcepts: [
      {
        title: 'Critical Thinking',
        description: 'ช่างสังเกต ตั้งคำถาม และหาหลักฐานข้อเท็จจริงก่อนเชื่อ',
      },
      {
        title: 'Creativity',
        description: 'คิดนอกกรอบ กล้าทดลองวิธีใหม่ๆ ที่ไม่เหมือนใคร',
      },
      {
        title: 'Collaboration & Communication',
        description: 'รับฟังความคิดเห็นของเพื่อนๆ ร่วมมือกันทำงานเป็นทีม และสื่อสารให้ทุกคนเข้าใจ',
      },
    ],
    realWorldExample: 'ทีมนักบินอวกาศ NASA และทีมแพทย์พยาบาลที่ร่วมกันดูแลรักษาผู้ป่วย',
    funFact: 'งานวิจัยระบุว่าเด็กที่เรียนรู้แบบสะเต็มศึกษาจะมีความมั่นใจในการแก้ปัญหาในชีวิตจริงสูงกว่าถึง 70%!',
    audioText: 'หัวใจของนักสะเต็ม คือการช่างสังเกต กล้าคิด กล้าถาม ร่วมมือกับเพื่อนๆ และนำความรู้ไปช่วยเหลือผู้อื่นในสังคม',
  },
];
