import React from 'react';
import { UserRecord } from '../types/database';
import { LevelProgress } from '../types/game';
import { sound } from '../utils/audio';

interface LearningReportModalProps {
  user: UserRecord;
  progress: Record<number, LevelProgress>;
  totalScore: number;
  totalStars: number;
  onClose: () => void;
}

export const LearningReportModal: React.FC<LearningReportModalProps> = ({
  user,
  progress,
  totalScore,
  totalStars,
  onClose,
}) => {
  const preScore = user.pretest_completed ? (user.pretest_score ?? 0) : 0;
  const postScore = user.posttest_completed ? (user.posttest_score ?? 0) : 0;
  const totalQuestions = 7;

  const prePercent = Math.round((preScore / totalQuestions) * 100);
  const postPercent = Math.round((postScore / totalQuestions) * 100);
  const rawGain = postScore - preScore;

  // Hake's Relative Gain formula: (Post - Pre) / (Total - Pre) * 100%
  let relativeGain = 0;
  if (totalQuestions - preScore > 0) {
    relativeGain = Math.round(((postScore - preScore) / (totalQuestions - preScore)) * 100);
  } else if (postScore >= totalQuestions) {
    relativeGain = 100;
  }
  const safeGain = Math.max(0, relativeGain);

  let gainLevel = 'ระดับเริ่มต้น (Low Gain)';
  let gainBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  let gainStars = '⭐';
  if (safeGain >= 70) {
    gainLevel = 'ระดับสูงมาก (High Gain)';
    gainBadgeColor = 'bg-emerald-100 text-emerald-950 border-emerald-400';
    gainStars = '⭐⭐⭐';
  } else if (safeGain >= 30) {
    gainLevel = 'ระดับปานกลาง (Medium Gain)';
    gainBadgeColor = 'bg-blue-100 text-blue-950 border-blue-400';
    gainStars = '⭐⭐';
  }

  // Stage Breakdown
  const stageData = [
    {
      code: 'S',
      name: 'วิทยาศาสตร์ (Science)',
      sub: 'พลังงาน ความหนาแน่น และวัฏจักรธรรมชาติ',
      data: progress[1] || { stars: 0, highScore: 0, bestAccuracy: 0, completed: false },
    },
    {
      code: 'T',
      name: 'เทคโนโลยี (Technology)',
      sub: 'อัลกอริทึม ลำดับขั้นตอน และไซเบอร์',
      data: progress[2] || { stars: 0, highScore: 0, bestAccuracy: 0, completed: false },
    },
    {
      code: 'E',
      name: 'วิศวกรรม (Engineering)',
      sub: 'โครงสร้างสะพาน กลไกฟันเฟือง และวงจรไฟฟ้า',
      data: progress[3] || { stars: 0, highScore: 0, bestAccuracy: 0, completed: false },
    },
    {
      code: 'M',
      name: 'คณิตศาสตร์ (Mathematics)',
      sub: 'ร้อยละ เงินทอน เศษส่วน และแกนสมมาตร',
      data: progress[4] || { stars: 0, highScore: 0, bestAccuracy: 0, completed: false },
    },
    {
      code: 'STEM',
      name: 'บูรณาการสะเต็ม (Integrated STEM)',
      sub: 'การแก้ปัญหาเชิงวิศวกรรมและทักษะ 4C',
      data: progress[5] || { stars: 0, highScore: 0, bestAccuracy: 0, completed: false },
    },
  ];

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const today = new Date();
  const currentDateStr = `${today.getDate()} / ${today.getMonth() + 1} / ${today.getFullYear() + 543}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn select-none">
      
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-report-card, #print-report-card * {
            visibility: visible;
          }
          #print-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 1.5cm;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#FFFDF7] rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden text-amber-950 font-sans">
        
        {/* ================= MODAL HEADER (No-Print) ================= */}
        <header className="no-print px-5 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-b-4 border-amber-500 flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">📄</span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-amber-950">
                ใบรายงานผลสัมฤทธิ์และพัฒนาการทางการเรียนรู้ (STEM Report Card)
              </h2>
              <p className="text-xs text-amber-900 font-semibold">
                พร้อมพิมพ์แนบแฟ้มผลงานนักเรียนและประเมินผลการเรียนรู้
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-white flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span>🖨️</span>
              <span>พิมพ์เอกสาร / บันทึก PDF</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-rose-100 text-amber-900 hover:text-rose-600 font-black text-lg flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title="ปิด"
            >
              ✕
            </button>
          </div>
        </header>

        {/* ================= PRINTABLE REPORT CARD BODY ================= */}
        <div
          id="print-report-card"
          className="flex-1 p-6 sm:p-10 overflow-y-auto bg-white text-gray-900"
        >
          {/* Document Header */}
          <div className="border-b-2 border-gray-800 pb-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">🏛️</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-wide">
                  ใบรายงานผลสัมฤทธิ์และพัฒนาการทางการเรียนรู้รายบุคคล
                </h1>
                <p className="text-xs sm:text-sm font-bold text-gray-700">
                  กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี บูรณาการสะเต็มศึกษา (STEM Education)
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              เกมการศึกษา: ผจญภัยแดนสะเต็ม: ภารกิจกอบกู้เกาะ STEM • ระดับชั้นประถมศึกษาปีที่ 4 - 6
            </p>
          </div>

          {/* Student Profile Info Grid */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500 font-semibold block text-[11px]">ชื่อ-นามสกุล ผู้เรียน:</span>
              <span className="font-bold text-gray-900">{user.full_name || user.fullname || user.nickname}</span>
            </div>
            <div>
              <span className="text-gray-500 font-semibold block text-[11px]">ชื่อในเกม / Username:</span>
              <span className="font-bold text-gray-900">{user.nickname} ({user.username})</span>
            </div>
            <div>
              <span className="text-gray-500 font-semibold block text-[11px]">ระดับชั้นเรียน:</span>
              <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                ชั้นประถมศึกษาปีที่ {user.grade_level ? user.grade_level.replace('ป.', '') : '5'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-semibold block text-[11px]">รหัสนักเรียน / วันที่:</span>
              <span className="font-bold text-gray-900">{user.user_id} • {currentDateStr}</span>
            </div>
          </div>

          {/* SECTION 1: Pre-test vs Post-test & Relative Gain */}
          <div className="mb-6">
            <h3 className="font-black text-base text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-300 pb-1">
              <span>📊</span>
              <span>1. การเปรียบเทียบผลการทดสอบก่อนเรียนและหลังเรียน (Learning Gain Analysis)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Pre-test Card */}
              <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/50 text-center">
                <span className="text-xs font-bold text-amber-800 block mb-1">
                  📝 การทดสอบก่อนเรียน (Pre-test)
                </span>
                <div className="text-3xl font-black text-amber-950 my-1">
                  {preScore} <span className="text-lg font-bold text-amber-700">/ 7</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2.5 my-2 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full"
                    style={{ width: `${prePercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-amber-900">
                  คิดเป็นร้อยละ {prePercent}%
                </span>
              </div>

              {/* Post-test Card */}
              <div className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50/50 text-center">
                <span className="text-xs font-bold text-purple-800 block mb-1">
                  🎓 การทดสอบหลังเรียน (Post-test)
                </span>
                <div className="text-3xl font-black text-purple-950 my-1">
                  {postScore} <span className="text-lg font-bold text-purple-700">/ 7</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2.5 my-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${postPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-purple-900">
                  คิดเป็นร้อยละ {postPercent}%
                </span>
              </div>

              {/* Learning Gain Summary Card */}
              <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 block mb-1">
                    📈 พัฒนาการทางการเรียนรู้ (Gain)
                  </span>
                  <div className="text-3xl font-black text-emerald-700 my-1">
                    +{rawGain} <span className="text-sm font-bold text-emerald-800">คะแนน</span>
                  </div>
                  <div className={`mt-1 py-1 px-2.5 rounded-full border text-xs font-black inline-block ${gainBadgeColor}`}>
                    {gainStars} {gainLevel}
                  </div>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium mt-2">
                  ร้อยละพัฒนาการสัมพัทธ์ (Normalized Gain): <strong>{safeGain}%</strong>
                </p>
              </div>

            </div>
          </div>

          {/* SECTION 2: 5 Stages Achievement Breakdown */}
          <div className="mb-6">
            <h3 className="font-black text-base text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-300 pb-1">
              <span>🗺️</span>
              <span>2. ผลสัมฤทธิ์รายสาระการเรียนรู้สะเต็ม 5 ด่าน (STEM Domains Competency)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
                    <th className="py-2.5 px-3">ด่าน / สาระการเรียนรู้</th>
                    <th className="py-2.5 px-3">หัวข้อสาระการเรียนรู้</th>
                    <th className="py-2.5 px-3 text-center">ดาวสะสม</th>
                    <th className="py-2.5 px-3 text-center">คะแนนสูงสุด</th>
                    <th className="py-2.5 px-3 text-center">ความแม่นยำ</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stageData.map((st, idx) => (
                    <tr key={st.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="py-2.5 px-3 font-black text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 flex items-center justify-center font-black text-[11px]">
                          {st.code}
                        </span>
                        <span>{st.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">{st.sub}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-800">
                        {'⭐'.repeat(st.data.stars || 0) || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                        {st.data.highScore.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-emerald-700">
                        {st.data.bestAccuracy || 0}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            st.data.completed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {st.data.completed ? '✓ ผ่านด่าน' : 'กำลังศึกษา'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-gray-100/80 p-3 rounded-xl mt-3 text-xs font-bold text-gray-800">
              <span>คะแนนสะสมรวมทั้งสิ้น: <strong className="text-gray-950 font-black">{totalScore.toLocaleString()} คะแนน</strong></span>
              <span>ดาวเกียรติยศรวม: <strong className="text-amber-700 font-black">{totalStars} / 15 ดาว</strong></span>
              <span>ระดับความสำเร็จ: <strong className="text-purple-900 font-black">{user.achievement_level || 'นักผจญภัยสะเต็ม'}</strong></span>
            </div>
          </div>

          {/* SECTION 3: Teacher's Assessment & Observations */}
          <div className="mb-8 p-4 rounded-2xl border border-gray-300 bg-gray-50/60 text-xs">
            <h4 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
              <span>📝</span>
              <span>ความเห็นและข้อสังเกตของผู้ประเมิน (Evaluator's Remarks):</span>
            </h4>
            <p className="text-gray-700 leading-relaxed">
              ผู้เรียนมีความกระตือรือร้นและตั้งใจในการแก้ปัญหาบูรณาการสะเต็มศึกษา มีพัฒนาการด้านความรู้และความเข้าใจเพิ่มขึ้นอย่างเห็นได้ชัด
              สามารถเชื่อมโยงหลักการวิทยาศาสตร์ เทคโนโลยี วิศวกรรม และคณิตศาสตร์ไปใช้แก้สถานการณ์จำลองได้อย่างมีประสิทธิภาพ
            </p>
          </div>

          {/* SECTION 4: Official Signatures (3 Signature Blocks for Portfolios) */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs text-gray-800 pt-4 border-t-2 border-gray-400">
            <div>
              <div className="h-10" />
              <div className="w-36 border-b border-gray-500 mx-auto mb-1" />
              <p className="font-bold text-gray-900">
                ({user.full_name || user.fullname || user.nickname})
              </p>
              <p className="text-[11px] text-gray-600">ผู้เข้ารับการประเมิน (นักเรียน)</p>
            </div>

            <div>
              <div className="h-10" />
              <div className="w-40 border-b border-gray-500 mx-auto mb-1" />
              <p className="font-black text-gray-950">
                (นางสาวปณิดา แลไธสง)
              </p>
              <p className="text-[11px] text-gray-700 font-semibold">ผู้สร้างและพัฒนาเกม / ครูผู้สอน</p>
            </div>

            <div>
              <div className="h-10" />
              <div className="w-36 border-b border-gray-500 mx-auto mb-1" />
              <p className="font-bold text-gray-800">(...................................................)</p>
              <p className="text-[11px] text-gray-600">ผู้ปกครอง</p>
            </div>
          </div>

          {/* Footer Official Stamp note */}
          <div className="mt-6 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-500">
            เอกสารนี้ออกโดยระบบประเมินผลการเรียนรู้ STEM Island Adventure เพื่อใช้ประกอบการวัดและประเมินผลทางการศึกษา
          </div>

        </div>

      </div>
    </div>
  );
};
