import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { ChibiCharacter } from './Characters';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideSection =
  | 'workflow'
  | 'grades'
  | 'accounts'
  | 'gameplay'
  | 'tests'
  | 'report_card'
  | 'codex'
  | 'admin';

interface SectionInfo {
  id: GuideSection;
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
}

const SECTIONS: SectionInfo[] = [
  {
    id: 'workflow',
    icon: '🚀',
    title: '1. ขั้นตอนการใช้งานภาพรวม',
    subtitle: 'ผังการเรียนรู้ตั้งแต่ต้นจนจบ (Step-by-Step Workflow)',
    badge: 'เริ่มต้นใช้งาน',
  },
  {
    id: 'grades',
    icon: '🎒',
    title: '2. ระบบเลือกสายชั้นเรียน',
    subtitle: 'ระดับชั้น ป.4, ป.5 และ ป.6 คัดกรองตามหลักสูตร',
    badge: 'หลักสูตร สพฐ.',
  },
  {
    id: 'accounts',
    icon: '👤',
    title: '3. ระบบสมาชิก & บัญชีผู้เรียน',
    subtitle: 'การลงทะเบียน, รหัสผ่าน 4 หลัก และการสลับบัญชี',
    badge: 'ความปลอดภัย',
  },
  {
    id: 'gameplay',
    icon: '🎮',
    title: '4. กฎกติกา 5 ด่านผจญภัย',
    subtitle: 'ด่านสะเต็มทั้ง 5, พลังชีวิต, เวลานับถอยหลัง & ตัวช่วย',
    badge: 'ระบบเกม',
  },
  {
    id: 'tests',
    icon: '📝',
    title: '5. แบบทดสอบ Pre/Post-test',
    subtitle: 'เงื่อนไขปลดล็อก 5 ด่าน และการคำนวณคะแนนพัฒนาการ',
    badge: 'การประเมินผล',
  },
  {
    id: 'report_card',
    icon: '📄',
    title: '6. ใบรายงานผล & เกียรติบัตร',
    subtitle: 'ใบรายงานพัฒนาการรายบุคคล (Relative Gain) & เกียรติบัตร',
    badge: 'เอกสารประเมิน',
  },
  {
    id: 'codex',
    icon: '📚',
    title: '7. สารานุกรม & ตราเกียรติยศ',
    subtitle: 'คลังการ์ดความรู้ 15 ใบ และตราประจำเกาะทั้ง 5',
    badge: 'สื่อการเรียนรู้',
  },
  {
    id: 'admin',
    icon: '👑',
    title: '8. ระบบคุณครู & แอดมิน',
    subtitle: 'การจัดการฐานข้อมูล, ปรับเหรียญ, รีเซ็ตรหัส (PIN 121212)',
    badge: 'สำหรับครูผู้สอน',
  },
];

export const AppGuideModal: React.FC<AppGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<GuideSection>('workflow');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    speech.stop();
    setIsSpeaking(false);
    sound.playClick();
    onClose();
  };

  const handleSelectSection = (sec: GuideSection) => {
    speech.stop();
    setIsSpeaking(false);
    sound.playClick();
    setActiveSection(sec);
  };

  const getSectionSpeechText = (sec: GuideSection): string => {
    switch (sec) {
      case 'workflow':
        return `คู่มือการใช้งานภาพรวม... ขั้นตอนที่ 1 เลือกระดับชั้นเรียน ป.4 ป.5 หรือ ป.6... ขั้นตอนที่ 2 กรอกชื่อและลงทะเบียนหรือเข้าสู่ระบบ... ขั้นตอนที่ 3 ทำแบบทดสอบก่อนเรียน 7 ข้อ... ขั้นตอนที่ 4 ผจญภัยผ่าน 5 ด่านสะเต็ม... ขั้นตอนที่ 5 ปลดล็อกและทำแบบทดสอบหลังเรียน... ขั้นตอนที่ 6 พิมพ์ใบรายงานพัฒนาการรายบุคคลและเกียรติบัตร`;
      case 'grades':
        return `ระบบเลือกสายชั้นเรียน... ผู้เล่นสามารถเลือกระดับชั้น ป.4 สำหรับเนื้อหาพื้นฐาน... ป.5 สำหรับระดับพัฒนาทักษะ... และ ป.6 สำหรับโจทย์ประยุกต์บูรณาการเชิงลึก... เพื่อให้คำถามตรงตามตัวชี้วัดของแต่ละชั้นปี`;
      case 'accounts':
        return `ระบบสมาชิกและบัญชีผู้เรียน... ผู้เล่นใหม่เพียงกรอกชื่อ-นามสกุลจริงและชื่อเล่นในเกม... จากนั้นตั้งรหัสผ่านตัวเลข 4 หลักเพื่อความปลอดภัย... หากเป็นเครื่องส่วนกลางในห้องคอมพิวเตอร์ สามารถกดปุ่มสลับบัญชีเพื่อเปลี่ยนผู้เล่นได้ตลอดเวลา... และคุณครูสามารถกู้คืนรหัสผ่านด้วยพิน 121212 ได้`;
      case 'gameplay':
        return `กฎกติกาการผจญภัย 5 ด่าน... ด่าน 1 วิทยาศาสตร์ ด่าน 2 เทคโนโลยี ด่าน 3 วิศวกรรม ด่าน 4 คณิตศาสตร์ และด่าน 5 ปราสาทบอสสะเต็ม... แต่ละด่านมีพลังชีวิต 3 ดวง และเวลานับถอยหลัง 60 วินาที... มีตัวช่วย 50 ต่อ 50 และเพิ่มเวลา 20 วินาที ด่านละ 1 ครั้ง`;
      case 'tests':
        return `แบบทดสอบก่อนเรียนและหลังเรียน... นักเรียนต้องทำแบบทดสอบก่อนเรียน 7 ข้อ เพื่อวัดความรู้พื้นฐาน... และมีกฎเหล็กคือต้องพิชิตผ่านครบทั้ง 5 ด่านสะเต็มก่อน จึงจะปลดล็อกแบบทดสอบหลังเรียนได้... ระบบจะนำคะแนนก่อนเรียนและหลังเรียนไปคำนวณร้อยละพัฒนาการสัมพัทธ์ทันที`;
      case 'report_card':
        return `ใบรายงานผลการเรียนรู้และเกียรติบัตร... นอกเหนือจากเกียรติบัตรสีทอง นักเรียนและคุณครูสามารถพิมพ์ใบรายงานผลสัมฤทธิ์รายบุคคล... ซึ่งมีกราฟแท่งเปรียบเทียบก่อนและหลังเรียน... ค่าร้อยละพัฒนาการ... สรุปความถนัดด้านเอส ที อี เอ็ม... และช่องลงชื่อสำหรับคุณครูและผู้ปกครอง นำไปแนบแฟ้มผลงานได้ทันที`;
      case 'codex':
        return `สารานุกรมและตราเกียรติยศสะเต็ม... เมื่อเล่นผ่านแต่ละด่าน จะปลดล็อกการ์ดความรู้ 15 ใบ และตราสัญลักษณ์ประจำแคว้น... สามารถกดฟังเสียงอ่านเนื้อหาในการ์ดทบทวนก่อนสอบได้ตลอดเวลา`;
      case 'admin':
        return `ระบบคุณครูและแอดมิน... เข้าสู่ระบบด้วยรหัสผ่าน 121212... คุณครูสามารถดูรายชื่อนักเรียน สถิติคะแนน... ปรับเพิ่มลดเหรียญทอง... รีเซ็ตรหัสผ่านให้นักเรียนที่ลืมรหัส... และพิมพ์รายงานภาพรวมทั้งชั้นเรียนได้`;
      default:
        return 'คู่มือการใช้งานแอพพลิเคชันผจญภัยแดนสะเต็ม';
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToRead = getSectionSpeechText(activeSection);
    setIsSpeaking(true);
    speech.speak(textToRead, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn select-none overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#FFFDF5] rounded-3xl border-4 border-amber-500 shadow-2xl overflow-hidden text-amber-950 font-sans">
        
        {/* ================= HEADER ================= */}
        <header className="px-5 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white border-b-4 border-amber-800 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-yellow-300 flex items-center justify-center text-3xl shadow-sm">
              📘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white drop-shadow-sm">
                  คู่มือการใช้งานแอพพลิเคชันทั้งหมด (Full User Manual)
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-yellow-400 text-amber-950 text-xs font-black shadow-xs">
                  เวอร์ชันทางการ
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                เกมการเรียนรู้ผจญภัยแดนสะเต็ม (STEM Adventure Island) • สำหรับนักเรียนและคุณครู
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice Reading Button */}
            <button
              onClick={handleToggleSpeak}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 text-yellow-200 border-yellow-300/60 hover:text-white'
              }`}
              title="ฟังเสียงอ่านคู่มือหน้านี้"
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span>
              <span>{isSpeaking ? 'หยุดอ่าน' : 'อ่านให้ฟัง'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/40 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              title="พิมพ์คู่มือนี้"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">พิมพ์คู่มือ</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-black/30 hover:bg-rose-600 border border-white/50 text-white font-black text-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="ปิดคู่มือ"
            >
              ✕
            </button>
          </div>
        </header>

        {/* ================= MAIN CONTAINER: 2 COLUMNS ================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-amber-50/40">
          
          {/* LEFT SIDEBAR: CHAPTER NAVIGATION */}
          <aside className="w-full md:w-80 bg-[#FFFBF0] border-b-2 md:border-b-0 md:border-r-2 border-amber-300/80 flex flex-col shrink-0 overflow-y-auto max-h-48 md:max-h-full p-2.5 sm:p-3 space-y-1.5 custom-scrollbar">
            <div className="px-2 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>สารบัญหัวข้อคู่มือ (8 บท)</span>
              <span className="text-amber-600">คลิกเพื่ออ่าน</span>
            </div>

            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-700 shadow-md scale-101'
                      : 'bg-white hover:bg-amber-100/70 text-amber-950 border-amber-200'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{sec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-amber-950'}`}>
                        {sec.title}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-1 mt-0.5 ${isActive ? 'text-amber-100' : 'text-stone-600'}`}>
                      {sec.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Quick helper badge */}
            <div className="mt-auto p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl border border-amber-300 text-center">
              <span className="text-2xl">👩‍🏫</span>
              <p className="text-xs font-bold text-amber-950 mt-1">ผู้พัฒนาบทเรียน STEM</p>
              <p className="text-[11px] text-amber-800 font-medium">นางสาวปณิดา แลไธสง</p>
            </div>
          </aside>

          {/* RIGHT CONTENT PANEL */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 custom-scrollbar bg-white">
            
            {/* Section 1: Workflow */}
            {activeSection === 'workflow' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      1. ขั้นตอนการใช้งานภาพรวม (Step-by-Step Workflow)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      เส้นทางการเรียนรู้แบบสมบูรณ์ตามหลักสูตร STEM ประถมปลาย
                    </p>
                  </div>
                </div>

                {/* Workflow Roadmap Steps */}
                <div className="space-y-3">
                  {[
                    {
                      step: 'ขั้นที่ 1',
                      title: 'เลือกระดับชั้นเรียน (ป.4 / ป.5 / ป.6) และกรอกชื่อ',
                      desc: 'เลือกระดับชั้นเรียนที่หน้าแรกเพื่อคัดกรองระดับความยากของคำถาม กรอกชื่อ-นามสกุลจริงและชื่อเล่นในเกม (Username) สามารถกดปุ่ม "✕ ลบชื่อ" เพื่อล้างชื่อได้ทันทีในคลิกเดียว',
                      icon: '🎒',
                      color: 'bg-emerald-50 border-emerald-300 text-emerald-950',
                    },
                    {
                      step: 'ขั้นที่ 2',
                      title: 'ทำแบบทดสอบก่อนเรียน (Pre-test) 7 ข้อ',
                      desc: 'ผู้เล่นทุกคนต้องทำแบบทดสอบวัดความรู้ก่อนเรียน STEM 7 ข้อ มีปุ่มเสียงอ่านโจทย์ให้ฟัง เมื่อทำเสร็จระบบจะบันทึกคะแนนเป็นฐานประเมินพัฒนาการ (Pre-test Score)',
                      icon: '📝',
                      color: 'bg-blue-50 border-blue-300 text-blue-950',
                    },
                    {
                      step: 'ขั้นที่ 3',
                      title: 'รับชมเนื้อเรื่องบทนำ & เลือกด่านผจญภัยสะเต็ม',
                      desc: 'ชมบทนำมหากาพย์เกาะสะเต็มพร้อมเสียงพากย์อัตโนมัติ จากนั้นเข้าสู่หน้าแผนที่เกาะ 16:9 เพื่อเริ่มเล่นด่านที่ 1',
                      icon: '🗺️',
                      color: 'bg-amber-50 border-amber-300 text-amber-950',
                    },
                    {
                      step: 'ขั้นที่ 4',
                      title: 'พิชิตภารกิจ 5 ด่านสะเต็มตามลำดับ',
                      desc: 'เล่นเรียงตามลำดับ ด่าน 1 (S) ➔ ด่าน 2 (T) ➔ ด่าน 3 (E) ➔ ด่าน 4 (M) ➔ ด่าน 5 (Boss) แต่ละด่านมีเนื้อเรื่องคัตซีน เบาะแส ตัวช่วย และเกจเวลานับถอยหลัง 60 วินาที',
                      icon: '⚔️',
                      color: 'bg-purple-50 border-purple-300 text-purple-950',
                    },
                    {
                      step: 'ขั้นที่ 5',
                      title: 'ปลดล็อกและทำแบบทดสอบหลังเรียน (Post-test) 7 ข้อ',
                      desc: '★ เงื่อนไขสำคัญ: ผู้เล่นต้องพิชิตผ่านครบทั้ง 5 ด่านก่อน ระบบจึงจะปลดล็อกให้ทำ Post-test ได้ เพื่อนำคะแนนไปเปรียบเทียบกับ Pre-test อย่างเที่ยงตรง',
                      icon: '🎓',
                      color: 'bg-rose-50 border-rose-300 text-rose-950',
                    },
                    {
                      step: 'ขั้นที่ 6',
                      title: 'พิมพ์ใบรายงานผลสัมฤทธิ์รายบุคคล & รับเกียรติบัตร',
                      desc: 'เข้าสู่พิธีมอบรางวัล รับเกียรติบัตรเกียรติยศ และกดพิมพ์ "ใบรายงานผลสัมฤทธิ์ทางการเรียนรู้รายบุคคล" ที่มีกราฟแท่งเปรียบเทียบ ค่าร้อยละพัฒนาการสัมพัทธ์ (Relative Gain Score) และช่องลงชื่อครู-ผู้ปกครอง',
                      icon: '🏆',
                      color: 'bg-yellow-50 border-yellow-300 text-yellow-950',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 shadow-xs ${item.color}`}
                    >
                      <span className="text-2xl sm:text-3xl shrink-0 mt-0.5">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-black border border-current shadow-xs">
                            {item.step}
                          </span>
                          <h4 className="font-extrabold text-sm sm:text-base">{item.title}</h4>
                        </div>
                        <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Grades */}
            {activeSection === 'grades' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">🎒</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      2. ระบบเลือกระดับสายชั้นเรียน (Grade Level Selection)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      คัดกรองเนื้อหาและระดับความลึกของโจทย์สะเต็มให้ตรงตามมาตรฐานตัวชี้วัด สพฐ.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🌱</span>
                      <h4 className="font-extrabold text-emerald-950 text-base">ระดับชั้น ป.4</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      ระดับพื้นฐาน (Foundational)
                    </span>
                    <ul className="mt-3 space-y-1.5 text-xs text-emerald-950 font-medium">
                      <li>• <strong>S:</strong> พลังงานแสงอาทิตย์, แม่เหล็กดูดสารแม่เหล็ก</li>
                      <li>• <strong>T:</strong> อัลกอริทึมลำดับคำสั่ง, ส่วนประกอบ CPU</li>
                      <li>• <strong>E:</strong> โครงสร้างสามเหลี่ยม, การพับเครื่องบินกระดาษ</li>
                      <li>• <strong>M:</strong> เงินทอนเหรียญ, การบวกลบเศษส่วนง่าย</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🌿</span>
                      <h4 className="font-extrabold text-blue-950 text-base">ระดับชั้น ป.5</h4>
                    </div>
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                      ระดับพัฒนาทักษะ (Intermediate)
                    </span>
                    <ul className="mt-3 space-y-1.5 text-xs text-blue-950 font-medium">
                      <li>• <strong>S:</strong> แรงลอยตัวและความหนาแน่น, วัฏจักรน้ำ</li>
                      <li>• <strong>T:</strong> การตรวจสอบเงื่อนไข ถ้า-แล้ว (If-Else), ลูป</li>
                      <li>• <strong>E:</strong> กลไกฟันเฟืองหมุนทวน, ระบบรอกผ่อนแรง</li>
                      <li>• <strong>M:</strong> เศษส่วนแท้, การคิดร้อยละและเวลา 24 ชม.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🌳</span>
                      <h4 className="font-extrabold text-purple-950 text-base">ระดับชั้น ป.6</h4>
                    </div>
                    <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                      ระดับบูรณาการ (Advanced)
                    </span>
                    <ul className="mt-3 space-y-1.5 text-xs text-purple-950 font-medium">
                      <li>• <strong>S:</strong> การสังเคราะห์ด้วยแสง, พลังงานหมุนเวียน</li>
                      <li>• <strong>T:</strong> ความปลอดภัยไซเบอร์, การดีบักโค้ด</li>
                      <li>• <strong>E:</strong> โครงสร้างสะพาน Truss, การออกแบบโดรน</li>
                      <li>• <strong>M:</strong> การคำนวณกำไร-ขาดทุน, ร้อยละพลังงานคงเหลือ</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-100 rounded-2xl border border-amber-300 text-xs font-semibold text-amber-950 flex items-center gap-2">
                  <span>💡</span>
                  <span>
                    <strong>วิธีเปลี่ยนระดับชั้น:</strong> ผู้เล่นสามารถแตะเลือกปุ่ม "ป.4", "ป.5" หรือ "ป.6" ได้ที่หน้าแรกก่อนเริ่มผจญภัย
                  </span>
                </div>
              </div>
            )}

            {/* Section 3: Accounts */}
            {activeSection === 'accounts' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">👤</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      3. ระบบสมาชิก & บัญชีผู้เรียน (Student Accounts & Login)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      จัดการผู้เรียนได้อย่างเป็นระเบียบ ปลอดภัย และรองรับเครื่องคอมพิวเตอร์ส่วนกลาง
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm text-stone-800 leading-relaxed">
                  <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-xs space-y-2">
                    <h4 className="font-black text-amber-900 text-base flex items-center gap-2">
                      <span>✨</span> ผู้เล่นใหม่ (New Player Registration)
                    </h4>
                    <p>
                      1. กรอกชื่อและนามสกุลจริง (สำหรับพิมพ์ลงเกียรติบัตรและใบรายงานผล)
                    </p>
                    <p>
                      2. กรอกชื่อผู้เล่นในเกม (Username) เช่น <code>nong_tonkla</code> (ห้ามซ้ำกับผู้อื่น)
                    </p>
                    <p>
                      3. แตะปุ่ม <strong>"🚀 เริ่มผจญภัย"</strong> ระบบจะพาไปตั้งรหัสผ่านตัวเลข 4 หลัก
                    </p>
                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs font-bold">
                      💡 <strong>คุณสมบัติใหม่:</strong> เมื่อแตะที่ช่องชื่อ ระบบจะลบชื่อเดิมออกทันทีใน 1 คลิก ไม่ต้องคอยกดลบทีละตัวอักษร!
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-xs space-y-2">
                    <h4 className="font-black text-emerald-900 text-base flex items-center gap-2">
                      <span>🗝️</span> ผู้เล่นเดิมเข้าสู่ระบบ (Returning Player Login)
                    </h4>
                    <p>
                      แตะปุ่ม <strong>"เข้าสู่เกม (ผู้เล่นเดิม)"</strong> ใส่ชื่อผู้เล่นและรหัสผ่าน 4 หลัก เพื่อโหลดคะแนน ดาว และความก้าวหน้าที่เล่นค้างไว้
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-xs space-y-2">
                    <h4 className="font-black text-purple-900 text-base flex items-center gap-2">
                      <span>🔑</span> กรณีนักเรียนลืมรหัสผ่าน (Password Reset by Teacher)
                    </h4>
                    <p>
                      หากนักเรียนลืมรหัสผ่าน ให้กดปุ่ม "ลืมรหัสผ่าน" ในหน้าเข้าสู่ระบบ คุณครูสามารถกรอก <strong>Teacher Master PIN: <code>121212</code></strong> เพื่อทำการรีเซ็ตรหัสผ่านใหม่ให้นักเรียนได้ทันที
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-xs space-y-2">
                    <h4 className="font-black text-blue-900 text-base flex items-center gap-2">
                      <span>🔄</span> การสลับบัญชีในห้องเรียนคอมพิวเตอร์ (Multi-Student Support)
                    </h4>
                    <p>
                      ในกรณีที่คอมพิวเตอร์ 1 เครื่องมีนักเรียนผลัดกันเล่นหลายคน ให้แตะที่ปุ่มโปรไฟล์ผู้เล่นมุมบนซ้าย <strong>"ผู้เล่น: ... (สลับ)"</strong> เพื่อสลับไปยังบัญชีของนักเรียนคนถัดไปได้สะดวกรวดเร็ว
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Gameplay */}
            {activeSection === 'gameplay' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">🎮</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      4. กฎกติกา 5 ด่านผจญภัย & ระบบเกม (Gameplay Mechanics)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      บูรณาการศาสตร์ STEM 4 ด้าน พร้อมระบบช่วยเล่นเพื่อพัฒนาทักษะการคิดวิเคราะห์
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-rose-50 rounded-2xl border-2 border-rose-200">
                    <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                      <span>❤️</span> พลังชีวิต 3 ดวง (Lives)
                    </h4>
                    <p className="text-xs text-rose-950 mt-1">
                      แต่ละด่านมีพลังชีวิต 3 ดวง หากตอบผิดหรือปล่อยให้เวลาหมดจะเสีย 1 ดวง หากหมดทั้ง 3 ดวงจะต้องเริ่มเล่นด่านนั้นใหม่
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-200">
                    <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                      <span>⏱️</span> เกจเวลานับถอยหลัง 60 วิ (Visual Timer)
                    </h4>
                    <p className="text-xs text-amber-950 mt-1">
                      มีแถบเวลานับถอยหลัง 60 วินาทีต่อข้อ สีของแถบจะเปลี่ยนจาก เขียว ➔ ทอง ➔ แดง เพื่อฝึกการบริหารเวลา
                    </p>
                  </div>

                  <div className="p-3.5 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                    <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                      <span>⚡</span> ตัวคูณโบนัสความเร็ว (Speed Multiplier)
                    </h4>
                    <p className="text-xs text-amber-950 mt-1">
                      ตอบถูกใน 45-60 วิ ได้คะแนน x2.0, ใน 30-44 วิ ได้ x1.5, และบวกคอมโบเมื่อตอบถูกติดต่อกันหลายข้อ
                    </p>
                  </div>

                  <div className="p-3.5 bg-blue-50 rounded-2xl border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                      <span>🪄</span> 2 ตัวช่วยพิเศษ (Lifelines)
                    </h4>
                    <p className="text-xs text-blue-950 mt-1">
                      • <strong>50:50</strong> ตัดตัวเลือกที่ผิดออก 2 ข้อ (ใช้ได้ด่านละ 1 ครั้ง)<br />
                      • <strong>+เวลา</strong> เพิ่มเวลาทำข้อสอบอีก 20 วินาที (ใช้ได้ด่านละ 1 ครั้ง)
                    </p>
                  </div>
                </div>

                {/* 5 Stages Detail */}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                  <h4 className="font-black text-amber-950 text-sm">เกาะสะเต็มทั้ง 5 ด่าน:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
                    <div className="p-2 bg-emerald-100 rounded-xl border border-emerald-300 text-emerald-950">
                      1. หมู่บ้านเริ่มต้น<br /><span className="text-[10px] font-medium">Science (S)</span>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-xl border border-blue-300 text-blue-950">
                      2. ป่าดอกไม้สีทอง<br /><span className="text-[10px] font-medium">Technology (T)</span>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-xl border border-amber-300 text-amber-950">
                      3. ทะเลสาบแห่งฝัน<br /><span className="text-[10px] font-medium">Engineering (E)</span>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-xl border border-purple-300 text-purple-950">
                      4. ถ้ำแห่งสมบัติ<br /><span className="text-[10px] font-medium">Mathematics (M)</span>
                    </div>
                    <div className="p-2 bg-red-100 rounded-xl border border-red-300 text-red-950">
                      5. มหาปราสาทสะเต็ม<br /><span className="text-[10px] font-medium">STEM Core Boss</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Tests & Relative Gain */}
            {activeSection === 'tests' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      5. แบบทดสอบ Pre/Post-test & คะแนนพัฒนาการสัมพัทธ์
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      เครื่องมือประเมินผลสัมฤทธิ์ทางการเรียนรู้ตามระเบียบวิธีวิจัยทางการศึกษา
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <h4 className="font-black text-purple-950 text-base">
                      กฎเหล็ก: ต้องเล่นผ่านครบ 5 ด่านก่อน จึงจะทำ Post-test ได้
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-900 leading-relaxed font-medium">
                    เพื่อความเที่ยงตรงในการวัดผลสัมฤทธิ์ทางการเรียนรู้ ระบบจะล็อกแบบทดสอบหลังเรียนไว้ จนกว่านักเรียนจะผ่านการเรียนรู้และพิชิตภารกิจครบทั้ง 5 ด่านสะเต็ม
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-xs space-y-3">
                  <h4 className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-2">
                    <span>📐</span> สูตรการคำนวณร้อยละพัฒนาการสัมพัทธ์ (Relative Gain Score)
                  </h4>
                  <div className="p-3 bg-stone-100 rounded-xl font-mono text-center text-xs sm:text-sm font-bold text-stone-800 border border-stone-300">
                    % พัฒนาการสัมพัทธ์ = [(คะแนนหลังเรียน - คะแนนก่อนเรียน) / (คะแนนเต็ม 7 - คะแนนก่อนเรียน)] × 100
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-center font-bold mt-2">
                    <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950">
                      ⭐⭐⭐ ระดับสูงมาก<br /><span className="text-[11px] font-semibold">คะแนนพัฒนาการ ≥ 70%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-950">
                      ⭐⭐ ระดับปานกลาง<br /><span className="text-[11px] font-semibold">คะแนนพัฒนาการ 30% - 69%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950">
                      ⭐ ระดับเริ่มต้น<br /><span className="text-[11px] font-semibold">คะแนนพัฒนาการ &lt; 30%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 6: Report Card */}
            {activeSection === 'report_card' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">📄</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      6. ใบรายงานผลสัมฤทธิ์รายบุคคล & เกียรติบัตร (Report Card & Certificate)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      เอกสารประเมินผลทางการศึกษาที่พร้อมพิมพ์แนบแฟ้มผลงานนักเรียนและครู
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      <h4 className="font-black text-amber-950 text-base">ใบรายงานพัฒนาการรายบุคคล</h4>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      สามารถเปิดได้ที่หน้าพิธีมอบรางวัล หรือจากหน้าจัดการฐานข้อมูลคุณครู ประกอบด้วย:
                    </p>
                    <ul className="text-xs space-y-1 text-stone-800 font-semibold">
                      <li>• กราฟแท่งเปรียบเทียบ Pre-test vs Post-test</li>
                      <li>• ค่าร้อยละพัฒนาการสัมพัทธ์ (Relative Gain Score)</li>
                      <li>• สรุปความถนัดรายด้าน S - T - E - M</li>
                      <li>• ช่องลงชื่อคุณครูผู้สอนและผู้ปกครอง</li>
                      <li>• รองรับการพิมพ์ขนาดกระดาษ A4 สวยงาม</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      <h4 className="font-black text-amber-950 text-base">เกียรติบัตรเกียรติยศ STEM</h4>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      มอบให้นักเรียนทุกคนที่พิชิตเกาะสะเต็มสำเร็จ:
                    </p>
                    <ul className="text-xs space-y-1 text-stone-800 font-semibold">
                      <li>• แสดงชื่อ-นามสกุลจริงของนักเรียน</li>
                      <li>• ลายเซ็นผู้อำนวยการและคุณครูผู้สอน</li>
                      <li>• ตราประทับเกียรติยศและดาวสะสม</li>
                      <li>• สั่งพิมพ์หรือบันทึกเป็น PDF ได้ทันที</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 7: Codex */}
            {activeSection === 'codex' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">📚</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      7. สารานุกรมเกาะสะเต็ม & ตราเกียรติยศ (STEM Codex & Badges)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      คลังสมุดภาพความรู้ 15 ใบ และ 5 ตราสัญลักษณ์ Badge ประจำแคว้น
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                  <p>
                    นักเรียนสามารถเปิดอ่านทบทวนความรู้ก่อนสอบได้ตลอดเวลา โดยการ์ดความรู้จะปลดล็อกตามด่านที่เล่นผ่าน:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                      <strong>🌱 วิทยาศาสตร์ (3 ใบ):</strong> การสังเคราะห์ด้วยแสง, ความหนาแน่นและแรงลอยตัว, วัฏจักรของน้ำ
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-300">
                      <strong>🤖 เทคโนโลยี (3 ใบ):</strong> อัลกอริทึมคำสั่ง, การตรวจสอบเงื่อนไข If-Else, ความปลอดภัยไซเบอร์
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-300">
                      <strong>⚙️ วิศวกรรม (3 ใบ):</strong> โครงสร้างสะพาน Truss, ฟันเฟืองและรอก, กระบวนการออกแบบ
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-300">
                      <strong>📐 คณิตศาสตร์ (3 ใบ):</strong> เศษส่วนในชีวิต, การคำนวณร้อยละกำไร, แกนสมมาตรเรขาคณิต
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-300">
                    <strong>💎 บูรณาการสะเต็ม (3 ใบ):</strong> โดรนกู้ภัยพลังงานสะอาด, ทักษะ 4C ในศตวรรษที่ 21, การแก้ปัญหาเชิงสะเต็ม
                  </div>
                  <div className="p-3 bg-amber-100 rounded-xl border border-amber-300 text-amber-950 font-bold flex items-center gap-2">
                    <span>🔊</span>
                    <span>การ์ดทุกใบมีปุ่มเสียงพากย์ภาษาไทยให้นักเรียนกดฟังเสียงบรรยายได้ทันที</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 8: Admin */}
            {activeSection === 'admin' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b-2 border-amber-200 pb-3">
                  <span className="text-3xl">👑</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                      8. คู่มือสำหรับคุณครู & ระบบจัดการฐานข้อมูล (Teacher Admin Guide)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      ศูนย์ควบคุมสำหรับคุณครูผู้สอนเพื่อติดตามและประเมินผลผู้เรียนรายบุคคล
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <h4 className="font-extrabold text-amber-950 text-base">
                      รหัสผ่านเข้าใช้งานระบบแอดมิน: <code className="bg-amber-300 px-2 py-0.5 rounded font-black text-amber-950">121212</code>
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    แตะปุ่ม <strong>"🔒 จัดการฐานข้อมูล"</strong> ที่หน้าแรกหรือหน้าแผนที่ แล้วกรอกรหัส PIN 6 หลัก เพื่อเข้าสู่ระบบจัดการของครู
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-stone-800 font-medium">
                  <div className="p-3 bg-white rounded-xl border border-stone-300 shadow-xs">
                    <strong>1. ตรวจสอบรายชื่อนักเรียนและคะแนน:</strong> ดูคะแนนก่อนเรียน หลังเรียน จำนวนดาว เหรียญทอง และสถานะความก้าวหน้าทั้งชั้นเรียน
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-300 shadow-xs">
                    <strong>2. ปรับปรุงเหรียญทอง (Adjust Coins):</strong> เพิ่มเหรียญเป็นรางวัลพิเศษ หรือลดเหรียญเมื่อซื้อไอเทมในชั้นเรียนจริง
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-300 shadow-xs">
                    <strong>3. รีเซ็ตรหัสผ่านนักเรียน (Reset PIN):</strong> แก้ปัญหานักเรียนลืมรหัสผ่านได้อย่างรวดเร็วใน 5 วินาที
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-300 shadow-xs">
                    <strong>4. พิมพ์รายงานภาพรวมทั้งห้อง (Print Class Summary):</strong> พิมพ์รายชื่อและตารางคะแนนนักเรียนทั้งห้องเพื่อบันทึกเกรด
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* ================= FOOTER ================= */}
        <footer className="px-5 py-3 bg-[#FFF9E6] border-t-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
            <span>💡</span>
            <span>สามารถเปิดอ่านคู่มือการใช้งานนี้ได้ตลอดเวลาจากหน้าแรกของเกม</span>
          </div>

          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-sm rounded-xl border-2 border-amber-700 shadow-md active:scale-95 cursor-pointer"
          >
            เข้าใจแล้ว กลับสู่เกม ✨
          </button>
        </footer>

      </div>
    </div>
  );
};
