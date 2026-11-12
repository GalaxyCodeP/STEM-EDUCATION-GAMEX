/**
 * 📚 แบบทดสอบก่อนเรียน (STEM Pre-test 7 ข้อ)
 * สำหรับประเมินความรู้พื้นฐานวิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์ และคณิตศาสตร์ (STEM)
 */

export interface PretestQuestion {
  id: number;
  category: 'Science' | 'Technology' | 'Engineering' | 'Mathematics' | 'STEM';
  categoryLabel: string;
  categoryIcon: string;
  badgeColor: string;
  question: string;
  choices: string[];
  answer: number; // 0, 1, 2, 3
  explanation: string;
}

export const PRETEST_QUESTIONS: PretestQuestion[] = [
  {
    id: 1,
    category: 'Science',
    categoryLabel: 'วิทยาศาสตร์ (Science)',
    categoryIcon: '☀️',
    badgeColor: 'bg-emerald-500',
    question: 'ดวงอาทิตย์ให้พลังงานแสงและความร้อนแก่โลก อุปกรณ์ใดเปลี่ยนพลังงานแสงอาทิตย์ให้เป็นพลังงานไฟฟ้า?',
    choices: [
      'ก. กังหันลม',
      'ข. แผงโซลาร์เซลล์ (Solar Cell)',
      'ค. เครื่องกำเนิดไฟฟ้าดีเซล',
      'ง. แบตเตอรี่แห้ง'
    ],
    answer: 1,
    explanation: 'แผงโซลาร์เซลล์ทำจากสารกึ่งตัวนำ ทำหน้าที่แปลงพลังงานแสงอาทิตย์ให้เป็นพลังงานไฟฟ้าสะอาดโดยตรง'
  },
  {
    id: 2,
    category: 'Science',
    categoryLabel: 'วิทยาศาสตร์ (Science)',
    categoryIcon: '🌧️',
    badgeColor: 'bg-teal-500',
    question: 'ในวัฏจักรของน้ำ เมื่อน้ำในแหล่งน้ำได้รับความร้อนจากแสงแดด จะเกิดปรากฏการณ์ใดขึ้น?',
    choices: [
      'ก. น้ำระเหยกลายเป็นไอน้ำลอยขึ้นสู่ชั้นบรรยากาศ',
      'ข. น้ำแข็งตัวกลายเป็นผลึกน้ำแข็งทันที',
      'ค. น้ำจมลงสู่ใต้ดินทั้งหมด',
      'ง. น้ำเปลี่ยนสภาพเป็นก๊าซออกซิเจนบริสุทธิ์'
    ],
    answer: 0,
    explanation: 'ความร้อนจากดวงอาทิตย์ทำให้อนุภาคน้ำมีพลังงานจลน์สูงขึ้นและระเหยกลายเป็นไอน้ำ ลอยขึ้นไปรวมตัวเป็นเมฆ'
  },
  {
    id: 3,
    category: 'Technology',
    categoryLabel: 'เทคโนโลยี (Technology)',
    categoryIcon: '💻',
    badgeColor: 'bg-sky-500',
    question: 'ระบบคอมพิวเตอร์และดิจิทัลประมวลผลข้อมูลด้วยรหัสตัวเลขพื้นฐานใด?',
    choices: [
      'ก. เลขโรมัน I, V, X',
      'ข. เลขฐานสิบ 0 ถึง 9',
      'ค. เลขฐานสอง ประกอบด้วยเลข 0 และ 1 (Binary Code)',
      'ง. ตัวอักษร A ถึง Z เท่านั้น'
    ],
    answer: 2,
    explanation: 'ระบบดิจิทัลใช้วงจรสวิตช์อิเล็กทรอนิกส์ที่มี 2 สถานะ คือ ปิด (0) และ เปิด (1) จึงใช้เลขฐานสองเป็นรหัสพื้นฐาน'
  },
  {
    id: 4,
    category: 'Technology',
    categoryLabel: 'เทคโนโลยี (Technology)',
    categoryIcon: '🤖',
    badgeColor: 'bg-blue-500',
    question: 'อุปกรณ์ใดทำหน้าที่เปรียบเสมือน "อวัยวะรับความรู้สึก" เพื่อตรวจจับแสง ความชื้น หรืออุณหภูมิในหุ่นยนต์?',
    choices: [
      'ก. เซนเซอร์ (Sensors)',
      'ข. ล้อและสายพาน',
      'ค. แผงระบายความร้อน',
      'ง. สายไฟต่อพ่วง'
    ],
    answer: 0,
    explanation: 'เซนเซอร์ทำหน้าที่ตรวจจับการเปลี่ยนแปลงทางกายภาพรอบตัว แล้วแปลงเป็นสัญญาณไฟฟ้าส่งให้สมองกลประมวลผล'
  },
  {
    id: 5,
    category: 'Engineering',
    categoryLabel: 'วิศวกรรมศาสตร์ (Engineering)',
    categoryIcon: '🌉',
    badgeColor: 'bg-amber-500',
    question: 'รูปทรงเรขาคณิตใดมีคุณสมบัติกระจายแรงกดและแรงดึงได้ดีเยี่ยม นิยมใช้ในโครงสร้างสะพานและเสาเครน?',
    choices: [
      'ก. รูปวงกลม',
      'ข. รูปสามเหลี่ยม (Truss Structure)',
      'ค. รูปห้าเหลี่ยม',
      'ง. รูปสี่เหลี่ยมขนมเปียกปูน'
    ],
    answer: 1,
    explanation: 'โครงสร้างรูปสามเหลี่ยมไม่เสียรูปทรงง่ายเมื่อรับแรง จึงเป็นพื้นฐานสำคัญของโครงถัก (Truss) ในงานวิศวกรรม'
  },
  {
    id: 6,
    category: 'Mathematics',
    categoryLabel: 'คณิตศาสตร์ (Mathematics)',
    categoryIcon: '📐',
    badgeColor: 'bg-rose-500',
    question: 'ห้องทดลองสะเต็มทรงสี่เหลี่ยมผืนผ้า กว้าง 6 เมตร ยาว 8 เมตร จะมีพื้นที่ทั้งหมดกี่ตารางเมตร?',
    choices: [
      'ก. 14 ตารางเมตร',
      'ข. 28 ตารางเมตร',
      'ค. 48 ตารางเมตร',
      'ง. 54 ตารางเมตร'
    ],
    answer: 2,
    explanation: 'สูตรพื้นที่สี่เหลี่ยมผืนผ้า = กว้าง × ยาว = 6 × 8 = 48 ตารางเมตร'
  },
  {
    id: 7,
    category: 'STEM',
    categoryLabel: 'STEM บูรณาการ (Integrated)',
    categoryIcon: '🚀',
    badgeColor: 'bg-purple-500',
    question: 'ขั้นตอนแรกที่สำคัญที่สุดในกระบวนการออกแบบเชิงวิศวกรรม (Engineering Design Process) คือข้อใด?',
    choices: [
      'ก. ลงมือสร้างแบบจำลองทันที',
      'ข. ระบุปัญหาหรือความต้องการ (Identify the Problem)',
      'ค. ประเมินราคาขายผลิตภัณฑ์',
      'ง. จัดงานนำเสนอผลงาน'
    ],
    answer: 1,
    explanation: 'ก่อนที่จะเริ่มคิดค้นทางออกหรือสร้างสิ่งประดิษฐ์ วิศวกรต้องเข้าใจและระบุปัญหาหรือความต้องการให้ชัดเจนเป็นลำดับแรก'
  }
];
