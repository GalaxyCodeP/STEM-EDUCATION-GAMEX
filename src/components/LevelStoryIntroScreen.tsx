import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LevelConfig } from '../types/game';
import { CHARACTER_AVATARS } from './Characters';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { useFullscreen } from '../utils/fullscreen';

export interface LevelCutsceneScene {
  id: number;
  chapter: string;
  speaker: string;
  speakerTitle: string;
  speakerBadgeBg: string;
  avatarSrc?: string;
  bgImage: string;
  bgAlt: string;
  text: string;
  keyClue?: string;
}

interface LevelStoryIntroScreenProps {
  level: LevelConfig;
  playerName: string;
  onStartQuestions: () => void;
  onBackToMap: () => void;
}

export const LevelStoryIntroScreen: React.FC<LevelStoryIntroScreenProps> = ({
  level,
  playerName,
  onStartQuestions,
  onBackToMap,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stem_level_autospeak') !== 'false';
    }
    return true;
  });
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Create level-specific rich storylines with educational STEM knowledge for each of the 5 levels
  const getScenesForLevel = (lvlId: number): LevelCutsceneScene[] => {
    switch (lvlId) {
      case 1: // Science - หมู่บ้านเริ่มต้น
        return [
          {
            id: 1,
            chapter: 'บทที่ 1: แสงสว่างและพลังงานแห่งหมู่บ้านพฤกษา',
            speaker: 'ลีฟ (Leaf)',
            speakerTitle: 'เอลฟ์พิทักษ์พฤกษาและธรรมชาติวิทยา',
            speakerBadgeBg: 'from-emerald-600 to-teal-500',
            avatarSrc: CHARACTER_AVATARS.leaf,
            bgImage: '/assets/images/game_background_1792396712320.jpg',
            bgAlt: 'Green lush forest village with solar panels and river',
            text: `ยินดีต้อนรับสู่หมู่บ้านเริ่มต้นจ้ะคุณ ${playerName || 'ผู้กล้า'}! ตอนนี้เครื่องกำเนิดไฟฟ้าดับสนิท แต่โชคดีที่เรามี "แผงโซลาร์เซลล์" ที่พร้อมรับแสงแดดจากดวงอาทิตย์แล้วเปลี่ยนเป็น "พลังงานไฟฟ้า" สะอาด เปิดไฟและสูบน้ำได้โดยไม่ปล่อยควันพิษเลย!`,
            keyClue: '☀️ แผงโซลาร์เซลล์เปลี่ยนแสงแดดเป็นพลังงานไฟฟ้า',
          },
          {
            id: 2,
            chapter: 'บทที่ 1: แสงสว่างและพลังงานแห่งหมู่บ้านพฤกษา',
            speaker: 'ลีฟ (Leaf)',
            speakerTitle: 'เอลฟ์พิทักษ์พฤกษาและธรรมชาติวิทยา',
            speakerBadgeBg: 'from-emerald-600 to-teal-500',
            avatarSrc: CHARACTER_AVATARS.leaf,
            bgImage: '/assets/images/game_bg_with_characters_1792396758711.jpg',
            bgAlt: 'Lab workbench with magnets and green crops in sunlight',
            text: `ในห้องทดลอง ลีฟค้นพบว่า "แม่เหล็กมหัศจรรย์" มีแรงดึงดูดเฉพาะสิ่งของที่เป็น "เหล็ก" เช่น คลิปหนีบกระดาษ ตะปู หรือเข็มหมุด แต่ดูดยาง ไม้ หรือพลาสติกไม่ได้นะ! ส่วนในแปลงผัก ต้นไม้ตัวน้อยกำลังต้องการ "แสงแดด น้ำ และก๊าซคาร์บอนไดออกไซด์" เพื่อปรุงอาหารและคายออกซิเจนบริสุทธิ์ออกมา!`,
            keyClue: '🧲 แม่เหล็กดูดเฉพาะเหล็ก | 🌱 พืชต้องการแสงแดด+น้ำ+ก๊าซคาร์บอนไดออกไซด์',
          },
          {
            id: 3,
            chapter: 'บทที่ 1: แสงสว่างและพลังงานแห่งหมู่บ้านพฤกษา',
            speaker: 'ลีฟ (Leaf)',
            speakerTitle: 'เอลฟ์พิทักษ์พฤกษาและธรรมชาติวิทยา',
            speakerBadgeBg: 'from-emerald-600 to-teal-500',
            avatarSrc: CHARACTER_AVATARS.leaf,
            bgImage: '/assets/images/game_background_1792396712320.jpg',
            bgAlt: 'Rain clouds forming over green hills with gentle breeze',
            text: `และมองขึ้นไปบนฟ้าสิ! แสงแดดอุ่นๆ กำลังทำให้น้ำระเหยกลายเป็นไอ ลอยขึ้นไปรวมตัวเป็นก้อนเมฆและตกลงมาเป็นฝนตาม "วัฏจักรของน้ำ" พลังงานแสงอาทิตย์และลมคือพลังงานสะอาดไม่มีวันหมด! ลีฟฝากความหวังไว้ที่เธอนะ ไปตอบคำถามกอบกู้หมู่บ้านกันเลย!`,
            keyClue: '🌧️ น้ำระเหยเป็นไอรวมเป็นเมฆฝน | 🍃 พลังงานแสงแดดและลมใช้ไม่มีวันหมด',
          },
        ];

      case 2: // Technology - ป่าดอกไม้สีทอง & หอคอยไซเบอร์
        return [
          {
            id: 1,
            chapter: 'บทที่ 2: ถอดรหัสหอคอยไซเบอร์และหุ่นยนต์กล',
            speaker: 'มีอา (Mia)',
            speakerTitle: 'อัศวินนักเทคโนโลยีและผู้พิทักษ์ไซเบอร์',
            speakerBadgeBg: 'from-rose-600 to-pink-500',
            avatarSrc: CHARACTER_AVATARS.mia,
            bgImage: '/assets/images/story_scene_crisis_1792397846672.jpg',
            bgAlt: 'High-tech tower with lightning and glowing monitors',
            text: `หยุดก่อนคู่หู! หอคอยไซเบอร์ถูกล็อกระบบความปลอดภัย! ในห้องควบคุมมี "ซีพียู (CPU - Central Processing Unit)" ซึ่งเปรียบเสมือนมันสมองของคอมพิวเตอร์ ทำหน้าที่คิดคำนวณและประมวลผลคำสั่งทุกอย่างในพริบตา!`,
            keyClue: '🧠 ซีพียู (CPU) คือมันสมองคอยคิดคำนวณของคอมพิวเตอร์',
          },
          {
            id: 2,
            chapter: 'บทที่ 2: ถอดรหัสหอคอยไซเบอร์และหุ่นยนต์กล',
            speaker: 'มีอา (Mia)',
            speakerTitle: 'อัศวินนักเทคโนโลยีและผู้พิทักษ์ไซเบอร์',
            speakerBadgeBg: 'from-rose-600 to-pink-500',
            avatarSrc: CHARACTER_AVATARS.mia,
            bgImage: '/assets/images/runner_bg_forest_1792399147943.jpg',
            bgAlt: 'Robot following algorithm pathway',
            text: `เราต้องส่งหุ่นยนต์กู้ภัยไปเก็บกล่องรหัสลับข้างหน้า 3 ก้าว โดยเขียนอัลกอริทึมสั่งเป็นขั้นตอน: "เดินหน้า 1 ก้าว ➔ เดินหน้า 1 ก้าว ➔ เดินหน้า 1 ก้าว" และใช้คำสั่ง "วนซ้ำ (Loop)" เพื่อสั่งให้ทำงานซ้ำๆ ได้โดยไม่ต้องเขียนโค้ดยาวหลายบรรทัด!`,
            keyClue: '🤖 อัลกอริทึมคือสั่งเป็นขั้นตอน | 🔄 Loop สั่งทำงานเดิมซ้ำได้สะดวก',
          },
          {
            id: 3,
            chapter: 'บทที่ 2: ถอดรหัสหอคอยไซเบอร์และหุ่นยนต์กล',
            speaker: 'มีอา (Mia)',
            speakerTitle: 'อัศวินนักเทคโนโลยีและผู้พิทักษ์ไซเบอร์',
            speakerBadgeBg: 'from-rose-600 to-pink-500',
            avatarSrc: CHARACTER_AVATARS.mia,
            bgImage: '/assets/images/story_scene_crisis_1792397846672.jpg',
            bgAlt: 'Cybersecurity lock and music note waveforms',
            text: `มีอาขอเตือนกฎเหล็กความปลอดภัยบนโลกออนไลน์: "ที่อยู่บ้าน รหัสผ่าน และเบอร์โทรศัพท์ส่วนตัว" เป็นความลับเด็ดขาด ห้ามบอกคนแปลกหน้าบนอินเทอร์เน็ต! และจำไว้ว่าไฟล์เพลงจะมีนามสกุล "MP3" ส่วน JPG และ PNG คือไฟล์รูปภาพนะ! พร้อมแล้วลุยเลย!`,
            keyClue: '🔒 ที่อยู่/รหัสผ่าน/เบอร์โทร ห้ามบอกคนแปลกหน้า | 🎵 MP3 คือไฟล์เพลง',
          },
        ];

      case 3: // Engineering - ทะเลสาบแห่งความฝัน
        return [
          {
            id: 1,
            chapter: 'บทที่ 3: ปาฏิหาริย์แห่งกลไกและสะพานข้ามทะเลสาบ',
            speaker: 'โนอา (Noa)',
            speakerTitle: 'ปราชญ์วิศวกรผู้สร้างสรรค์นวัตกรรม',
            speakerBadgeBg: 'from-amber-600 to-orange-500',
            avatarSrc: CHARACTER_AVATARS.noa,
            bgImage: '/assets/images/adventure_map_bg_1792398404782.jpg',
            bgAlt: 'Truss bridge crossing a crystal lake with giant cranes',
            text: `โอ้โฮ! สะพานข้ามทะเลสาบแห่งความฝันพังทลายลงมา! วิศวกรอย่างเราต้องใช้ "โครงสร้างรูปสามเหลี่ยม" ในการสร้างสะพานเหล็กและเครน เพราะรูปสามเหลี่ยมแข็งแรงที่สุด กระจายน้ำหนักได้สมดุล ไม่บิดเบี้ยวเหมือนรูปสี่เหลี่ยม!`,
            keyClue: '📐 โครงสร้างสามเหลี่ยมแข็งแรง กระจายน้ำหนักดีที่สุด',
          },
          {
            id: 2,
            chapter: 'บทที่ 3: ปาฏิหาริย์แห่งกลไกและสะพานข้ามทะเลสาบ',
            speaker: 'โนอา (Noa)',
            speakerTitle: 'ปราชญ์วิศวกรผู้สร้างสรรค์นวัตกรรม',
            speakerBadgeBg: 'from-amber-600 to-orange-500',
            avatarSrc: CHARACTER_AVATARS.noa,
            bgImage: '/assets/images/game_bg_with_characters_1792396758711.jpg',
            bgAlt: 'Mechanical gears meshing together and pulley crane',
            text: `มาดูกลไกฟันเฟืองสองตัวที่ขบกันสิ! ถ้าฟันเฟืองตัวหนึ่งหมุนตามเข็มนาฬิกา เฟืองคู่ที่สบกันจะ "หมุนทวนเข็มนาฬิกา (ทิศทางตรงกันข้าม)" เสมอ! ส่วนการยกหินหนักขึ้นจากบ่อน้ำ "รอก" จะช่วยเปลี่ยนทิศทางแรง ให้ดึงเชือกลงแต่ของลอยขึ้นได้ง่ายขึ้น!`,
            keyClue: '⚙️ เฟืองที่ขบกันหมุนทิศตรงข้าม | 🪢 รอกช่วยเปลี่ยนทิศทางการดึง',
          },
          {
            id: 3,
            chapter: 'บทที่ 3: ปาฏิหาริย์แห่งกลไกและสะพานข้ามทะเลสาบ',
            speaker: 'โนอา (Noa)',
            speakerTitle: 'ปราชญ์วิศวกรผู้สร้างสรรค์นวัตกรรม',
            speakerBadgeBg: 'from-amber-600 to-orange-500',
            avatarSrc: CHARACTER_AVATARS.noa,
            bgImage: '/assets/images/adventure_map_bg_1792398404782.jpg',
            bgAlt: 'Seesaw lever playground and paper airplane gliding',
            text: `หลักการของคานบนกระดานหก เด็กตัวเล็กต้องนั่งที่ปลายกระดานให้ "ไกลจากจุดหมุน" จึงจะมีแรงงัดยกเพื่อนตัวโตได้! และถ้าพับเครื่องบินกระดาษแล้วตก หัวใจวิศวกรคือต้องสังเกตจุดบกพร่อง แล้วปรับแต่งปีกเพื่อทดสอบใหม่! พร้อมสร้างสะพานแล้วหรือยัง?`,
            keyClue: '⚖️ คาน: นั่งไกลจุดหมุนเพิ่มแรงงัด | ✈️ วิศวกรต้องสังเกตและปรับปรุงแก้ไข',
          },
        ];

      case 4: // Mathematics - ถ้ำแห่งสมบัติ
        return [
          {
            id: 1,
            chapter: 'บทที่ 4: ปริศนาตัวเลขและรูปทรงในถ้ำแห่งสมบัติ',
            speaker: 'บลูปี้ (Bloopie)',
            speakerTitle: 'ภูติสไลม์อัจฉริยะแห่งคณิตศาสตร์',
            speakerBadgeBg: 'from-purple-600 to-indigo-500',
            avatarSrc: CHARACTER_AVATARS.bloopie,
            bgImage: '/assets/images/story_scene_heroes_assemble_1792397847408.jpg',
            bgAlt: 'Sparkling cave with pizza slices and treasure chests',
            text: `ดุ๊กดิ๊ก! ยินดีต้อนรับสู่ถ้ำแห่งสมบัติระยิบระยับ! มาดูพิซซ่าฉลองชัยถาดนี้สิ ถูกตัดแบ่งเป็น 8 ชิ้นเท่าๆ กัน ถ้าเพื่อนๆ กินไป 2 ชิ้น จะเหลือพิซซ่าในถาด 6 ชิ้น หรือเขียนเป็นเศษส่วนได้ว่า "เศษ 6 ส่วน 8 ของถาด" นั่นเอง!`,
            keyClue: '🍕 พิซซ่า 8 ชิ้น กินไป 2 เหลือ 6 ชิ้น (คิดเป็นเศษ 6 ส่วน 8)',
          },
          {
            id: 2,
            chapter: 'บทที่ 4: ปริศนาตัวเลขและรูปทรงในถ้ำแห่งสมบัติ',
            speaker: 'บลูปี้ (Bloopie)',
            speakerTitle: 'ภูติสไลม์อัจฉริยะแห่งคณิตศาสตร์',
            speakerBadgeBg: 'from-purple-600 to-indigo-500',
            avatarSrc: CHARACTER_AVATARS.bloopie,
            bgImage: '/assets/images/game_bg_with_characters_1792396758711.jpg',
            bgAlt: 'Gold coins, clock on stone wall, and geometric triangles',
            text: `การคิดเงินทอนก็ง่ายนิดเดียว! มีเหรียญเงิน 50 บาท ไปซื้อสมุดวาดภาพราคา 35 บาท จะได้เงินทอน 15 บาท (50 - 35 = 15) ส่วนรูปเรขาคณิตที่มี "ด้าน 3 ด้าน และมุม 3 มุม" เสมอก็คือ "รูปสามเหลี่ยม (Triangle)" จ้ะ!`,
            keyClue: '🪙 50 - 35 = เงินทอน 15 บาท | 🔺 รูปสามเหลี่ยมมี 3 ด้าน 3 มุมเสมอ',
          },
          {
            id: 3,
            chapter: 'บทที่ 4: ปริศนาตัวเลขและรูปทรงในถ้ำแห่งสมบัติ',
            speaker: 'บลูปี้ (Bloopie)',
            speakerTitle: 'ภูติสไลม์อัจฉริยะแห่งคณิตศาสตร์',
            speakerBadgeBg: 'from-purple-600 to-indigo-500',
            avatarSrc: CHARACTER_AVATARS.bloopie,
            bgImage: '/assets/images/story_scene_heroes_assemble_1792397847408.jpg',
            bgAlt: 'Clock pointing at 8:00 AM and glowing blue symmetrical butterfly',
            text: `มองดูนาฬิกาตอนเช้าสิ! เมื่อเข็มสั้นชี้เลข 8 และเข็มยาวชี้เลข 12 คือเวลา "8 นาฬิกาตรง (08:00 น.)" ได้เวลาเคารพธงชาติ! และในถ้ำนี้มีผีเสื้อวิเศษที่ปีกซ้ายและขวามี "ความสมมาตร" พับประกบกันได้สนิทพอดีด้วยนะ! ไปเปิดหีบสมบัติกันเถอะ!`,
            keyClue: '⏰ 8:00 น. เข็มสั้นชี้ 8 เข็มยาวชี้ 12 | 🦋 ปีกผีเสื้อซ้ายขวาสมมาตรกัน',
          },
        ];

      case 5: // STEM Core Boss - มหาปราสาทแห่งความสุข
      default:
        return [
          {
            id: 1,
            chapter: 'บทส่งท้าย: รวมพลัง 4 ผู้พิทักษ์กอบกู้มหาคริสตัลสะเต็ม',
            speaker: 'เหล่าผู้พิทักษ์สะเต็มทั้ง 4',
            speakerTitle: 'ภาคีผู้พิทักษ์แห่งเกาะสะเต็ม',
            speakerBadgeBg: 'from-red-600 via-amber-600 to-rose-600',
            avatarSrc: CHARACTER_AVATARS.banner,
            bgImage: '/assets/images/story_scene_crystal_1792397845197.jpg',
            bgAlt: 'Ancient STEM Crystal Core radiating 4 bright beams',
            text: `ในที่สุดพวกเราก็ก้าวขึ้นสู่ยอดมหาปราสาทแห่งความสุข! คำว่า "STEM (สะเต็ม)" คือการบูรณาการ 4 ศาสตร์สำคัญเข้าด้วยกัน ได้แก่: วิทยาศาสตร์ (S) + เทคโนโลยี (T) + วิศวกรรม (E) + คณิตศาสตร์ (M) เพื่อฟื้นฟูเกาะของเรา!`,
            keyClue: '💎 STEM = วิทยาศาสตร์(S) + เทคโนโลยี(T) + วิศวกรรม(E) + คณิตศาสตร์(M)',
          },
          {
            id: 2,
            chapter: 'บทส่งท้าย: รวมพลัง 4 ผู้พิทักษ์กอบกู้มหาคริสตัลสะเต็ม',
            speaker: 'มีอา & โนอา',
            speakerTitle: 'ตัวแทนเทคโนโลยีและวิศวกรรม',
            speakerBadgeBg: 'from-blue-600 to-amber-600',
            avatarSrc: CHARACTER_AVATARS.mia,
            bgImage: '/assets/images/story_scene_crisis_1792397846672.jpg',
            bgAlt: 'Rescue drone with rotating propellers near giant wind turbines',
            text: `การออกแบบโดรนบินกู้ภัย ทั้งปีก มอเตอร์ และใบพัด จัดเป็นศาสตร์ด้าน "วิศวกรรม (Engineering - E)" และกังหันลมยักษ์บนยอดเขาจะผลิตกระแสไฟฟ้าได้มากที่สุดเมื่อ "มีลมธรรมชาติพัดผ่านใบพัดอย่างสม่ำเสมอและต่อเนื่อง"!`,
            keyClue: '🛸 ออกแบบปีกและมอเตอร์โดรน = วิศวกรรม (E) | 💨 กังหันลมหมุนต่อเนื่องผลิตไฟ',
          },
          {
            id: 3,
            chapter: 'บทส่งท้าย: รวมพลัง 4 ผู้พิทักษ์กอบกู้มหาคริสตัลสะเต็ม',
            speaker: 'เหล่าผู้พิทักษ์สะเต็ม',
            speakerTitle: 'ส่งพลังใจครั้งสุดท้ายให้ผู้กล้า',
            speakerBadgeBg: 'from-purple-600 to-rose-600',
            avatarSrc: CHARACTER_AVATARS.noa,
            bgImage: '/assets/images/story_scene_crystal_1792397845197.jpg',
            bgAlt: 'Guardians standing proudly together in glowing light',
            text: `แบตเตอรี่สำรองของเกาะเต็ม 100% ส่งไฟไป 40% จะเหลือพลังงาน 60%! และหัวใจที่ยิ่งใหญ่ที่สุดของนักเรียนสะเต็ม คือการเป็นคน "ช่างสังเกต ขี้สงสัย กล้าคิด กล้าถาม และร่วมมือกับเพื่อนๆ แก้ปัญหา"! ปลุกมหาคริสตัลกันเลย!`,
            keyClue: '🔋 100% - 40% = เหลือ 60% | 🌟 นักสะเต็ม: ช่างสังเกต ขี้สงสัย ร่วมมือกับเพื่อน',
          },
        ];
    }
  };

  const scenes = useMemo(() => {
    return getScenesForLevel(level.id);
  }, [level.id, playerName]);

  const currentScene = scenes[currentSceneIdx] || scenes[0];

  const speakScene = useCallback((scene: LevelCutsceneScene) => {
    speech.stop();
    setIsSpeaking(true);
    const textToRead = `${scene.speaker} กล่าวว่า... ${scene.text}${
      scene.keyClue ? `... ข้อควรรู้สำคัญ... ${scene.keyClue}` : ''
    }`;
    speech.speak(textToRead, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, []);

  const handleToggleSpeak = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }
    speakScene(currentScene);
  };

  const handleToggleAutoSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !autoSpeak;
    setAutoSpeak(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stem_level_autospeak', String(nextVal));
    }
    if (!nextVal) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      speakScene(currentScene);
    }
  };

  // Stop TTS speech on unmount
  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  // Typewriter text effect for current scene & Auto-Speak
  useEffect(() => {
    speech.stop();
    setIsSpeaking(false);
    setIsTyping(true);
    setDisplayedText('');

    if (!currentScene) {
      setIsTyping(false);
      return;
    }

    let charIndex = 0;
    const fullText = currentScene.text || '';

    const timer = window.setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 22);

    let speakTimer: ReturnType<typeof setTimeout> | null = null;
    if (autoSpeak) {
      speakTimer = setTimeout(() => {
        speakScene(currentScene);
      }, 350);
    }

    return () => {
      clearInterval(timer);
      if (speakTimer) clearTimeout(speakTimer);
    };
  }, [currentSceneIdx, level.id, autoSpeak, speakScene, currentScene]);

  // Click to advance or skip typing
  const handleProceed = () => {
    sound.playClick();
    if (isTyping) {
      setDisplayedText(currentScene.text);
      setIsTyping(false);
    } else {
      speech.stop();
      setIsSpeaking(false);
      if (currentSceneIdx + 1 < scenes.length) {
        setCurrentSceneIdx((prev) => prev + 1);
      } else {
        handleStartQuestions();
      }
    }
  };

  // Start question gameplay with smooth cinematic transition
  const handleStartQuestions = () => {
    speech.stop();
    setIsSpeaking(false);
    sound.playStar(1);
    setIsTransitioning(true);
    setTimeout(() => {
      onStartQuestions();
    }, 500);
  };

  return (
    <div
      onClick={handleProceed}
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-black select-none cursor-pointer transition-all duration-700 ${
        isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Cinematic Scene with Ken-Burns slow zoom animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={currentScene.id}
          src={currentScene.bgImage}
          alt={currentScene.bgAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-90 animate-kenburns transition-all duration-1000"
        />
        {/* Cinematic dark gradient vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/75 pointer-events-none" />
      </div>

      {/* Top Header Bar matching user's reference image */}
      <header className="relative z-20 w-full p-3 sm:p-5 md:p-6 flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto">
        
        {/* Left: Chapter capsule with glowing amber dot */}
        <div className="flex items-center gap-2.5 bg-black/65 backdrop-blur-md px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-500/50 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
          <span className="text-xs sm:text-sm font-extrabold text-amber-200 tracking-wide">
            {currentScene.chapter}
          </span>
        </div>

        {/* Right Controls: Dots, TTS Audio, Fullscreen, Skip / Start button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Scene Indicator Dots */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
            {scenes.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSceneIdx
                    ? 'w-4 h-1.5 bg-yellow-400 shadow-[0_0_6px_#FACC15]'
                    : 'w-1.5 h-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* 🔊 Auto-Speak Narration Toggle */}
          <button
            onClick={handleToggleAutoSpeak}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              autoSpeak
                ? 'bg-amber-400 text-amber-950 border-amber-300 font-black shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'bg-black/60 text-stone-300 border-white/20 hover:text-white'
            }`}
            title={autoSpeak ? 'กำลังเปิดเสียงอ่านอัตโนมัติ (คลิกเพื่อปิด)' : 'คลิกเพื่อเปิดเสียงอ่านอัตโนมัติ'}
          >
            <span>{autoSpeak ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">{autoSpeak ? 'อ่านอัตโนมัติ: เปิด' : 'อ่านอัตโนมัติ: ปิด'}</span>
          </button>

          {/* 🔊 Audio TTS Speech Button for children */}
          <button
            onClick={handleToggleSpeak}
            title={isSpeaking ? 'กดเพื่อหยุดเสียงอ่าน' : 'กดเพื่อให้ระบบอ่านออกเสียงเนื้อเรื่องให้ฟัง'}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              isSpeaking
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-black/60 hover:bg-black/80 text-amber-200 border-amber-500/40 hover:text-white'
            }`}
          >
            <span>{isSpeaking ? '⏹️' : '🔊'}</span>
            <span className="hidden sm:inline">{isSpeaking ? 'หยุดอ่าน' : 'อ่านให้ฟัง'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white/90 hover:text-white text-xs font-bold rounded-full border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">เต็มจอ</span>
          </button>

          {/* Skip / Start Questions Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              handleStartQuestions();
            }}
            className="px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-black rounded-full border border-amber-400/60 transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
          >
            <span>ข้ามเนื้อเรื่อง</span>
            <span>⏩</span>
          </button>
        </div>
      </header>

      {/* Center Spacer */}
      <div className="flex-1" />

      {/* Bottom Cinematic Dialog Box matching user's image exactly */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto p-3 sm:p-5 md:p-6 mb-2 sm:mb-4 pointer-events-auto">
        <div
          className="relative bg-black/85 backdrop-blur-md rounded-2xl border-2 border-amber-500/80 p-4 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.8)] text-white"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,215,0,0.3)',
          }}
        >
          {/* Four Corner Diamond Accents (❖) like the screenshot */}
          <span className="absolute top-2 left-2.5 text-amber-400 text-xs select-none">❖</span>
          <span className="absolute top-2 right-2.5 text-amber-400 text-xs select-none">❖</span>
          <span className="absolute bottom-2 left-2.5 text-amber-400 text-xs select-none">❖</span>
          <span className="absolute bottom-2 right-2.5 text-amber-400 text-xs select-none">❖</span>

          {/* Top Line of Dialog Box: Avatar, Speaker Name & Role, and Right Hint */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-3">
              {/* Speaker Avatar Thumbnail */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-md bg-amber-950 shrink-0">
                <img
                  src={currentScene.avatarSrc || CHARACTER_AVATARS.mia}
                  alt={currentScene.speaker}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Speaker Name Pill Badge, Title & Inline Voice Button */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r ${currentScene.speakerBadgeBg} text-white shadow-sm border border-white/20`}
                  >
                    {currentScene.speaker}
                  </span>

                  {/* Inline Voice Replay Button with animated sound waves */}
                  <button
                    onClick={handleToggleSpeak}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                      isSpeaking
                        ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                        : 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border-amber-400/50'
                    }`}
                    title="คลิกเพื่อฟังเสียงตัวละครพูด"
                  >
                    <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                    <span>{isSpeaking ? 'กำลังพูด...' : 'ฟังเสียง'}</span>
                    {isSpeaking && (
                      <span className="flex items-center gap-0.5 ml-0.5">
                        <span className="w-0.5 h-2 bg-amber-300 animate-pulse rounded-full" />
                        <span className="w-0.5 h-3.5 bg-yellow-200 animate-bounce rounded-full" />
                        <span className="w-0.5 h-1.5 bg-amber-300 animate-pulse rounded-full" />
                      </span>
                    )}
                  </button>
                </div>
                <span className="text-[11px] sm:text-xs text-amber-200/90 font-medium mt-0.5">
                  {currentScene.speakerTitle}
                </span>
              </div>
            </div>

            {/* Tap to continue indicator on right */}
            <div className="hidden sm:flex items-center gap-1 text-amber-300 text-xs font-bold animate-pulse">
              <span>แตะเพื่อไปต่อ</span>
              <span>▶</span>
            </div>
          </div>

          {/* Thin Horizontal Golden Divider */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent my-3" />

          {/* Main Story Dialogue Text with Typewriter Animation */}
          <div className="min-h-[70px] sm:min-h-[85px] mb-3">
            <p className="text-sm sm:text-base md:text-lg text-white font-sans font-medium leading-relaxed tracking-wide">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
              )}
            </p>
          </div>

          {/* Key STEM Clue Highlight Pill */}
          {currentScene.keyClue && (
            <div className="mb-3 px-3.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/50 flex items-center gap-2 text-xs sm:text-sm text-amber-200 font-bold shadow-inner">
              <span className="text-amber-400 animate-bounce">💡</span>
              <span className="text-amber-300">เบาะแสความรู้:</span>
              <span className="text-white font-medium">{currentScene.keyClue}</span>
            </div>
          )}

          {/* Bottom Action Row: Back to Map (small) & Proceed / Start Button (prominent) */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                speech.stop();
                sound.playClick();
                onBackToMap();
              }}
              className="text-white/60 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              ⬅ กลับหน้าแผนที่
            </button>

            {/* Next Chapter or Start Questions Button */}
            {currentSceneIdx + 1 < scenes.length ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProceed();
                }}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-amber-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>ตอนถัดไป</span>
                <span>▶</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartQuestions();
                }}
                className="px-6 sm:px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black text-sm sm:text-base border border-emerald-400/60 shadow-[0_4px_15px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <span>เริ่มตอบคำถาม</span>
                <span>⚔️</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
