import { useState, type FC } from 'react';
import type { VocabWord } from '../data/vocabulary';
import { speakWord } from '../utils/speech';
import { 
  Printer, 
  Copy, 
  Check, 
  Volume2, 
  User, 
  Calendar,
  BookOpen,
  GraduationCap,
  Award
} from 'lucide-react';

interface OralExamReportProps {
  words: VocabWord[];
  unitNumber: number;
  latestScore: number | null; // percentage
}

export const OralExamReport: FC<OralExamReportProps> = ({
  words,
  unitNumber,
  latestScore,
}) => {
  const [studentName, setStudentName] = useState('Doniyor');
  const [checkedWords, setCheckedWords] = useState<Record<number, boolean>>({});
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [teacherScore, setTeacherScore] = useState<string>('25');

  const startId = words.length > 0 ? words[0].id : 1;
  const endId = words.length > 0 ? words[words.length - 1].id : 25;

  const toggleCheck = (id: number) => {
    setCheckedWords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkAll = () => {
    const all: Record<number, boolean> = {};
    words.forEach((w) => {
      all[w.id] = true;
    });
    setCheckedWords(all);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTelegram = () => {
    const scoreText = latestScore !== null ? `${latestScore}%` : '100%';
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const wordsListText = words
      .map(
        (w, i) =>
          `${i + 1}. ${w.word} (${w.pos}) — ${w.uzbek}\n   ↳ Def: ${w.definition}`
      )
      .join('\n');

    const message = `🎓 COLLEGE PANDA DIGITAL SAT VOCABULARY\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📚 Unit: ${unitNumber > 0 ? `Unit ${unitNumber} (Words #${startId}–#${endId})` : 'Custom Set'}\n` +
      `👤 Student: ${studentName}\n` +
      `📅 Date: ${dateStr}\n` +
      `🎯 Practice Score: ${scoreText} (Ready for Oral Exam)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📝 25 Words Prepared for Oral Testing:\n` +
      `${wordsListText}\n\n` +
      `✅ Ustoz, og'zaki so'rovga to'liq tayyorman!`;

    navigator.clipboard.writeText(message);
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 3000);
  };

  const checkedCount = Object.values(checkedWords).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Action Header */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors duration-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Teacher Oral Exam & Verification Sheet</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Show this report to your teacher or copy it to Telegram for verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyTelegram}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer transition-all"
          >
            {copiedTelegram ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedTelegram ? 'Copied to Clipboard!' : 'Copy for Telegram'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE / OFFICIAL CERTIFICATE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300 print:text-black rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 print:hidden" />

        {/* Certificate Header */}
        <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800 print:border-slate-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-black tracking-wider uppercase mb-2 print:text-indigo-800">
            Official SAT Vocabulary Evaluation
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white print:text-black tracking-tight">
            Digital SAT Mastery & Oral Examination Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 mt-1 font-medium">
            College Panda 400 High-Frequency Vocabulary • 25 Words Unit System
          </p>
        </div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800 print:border-slate-300 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Student Name</span>
            </div>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 print:bg-transparent border border-slate-200 dark:border-slate-700 print:border-none rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-white print:text-black text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-slate-600 mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Unit Range</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 print:text-black text-sm pt-1.5">
              {unitNumber > 0 ? `Unit ${unitNumber} (#${startId}–#${endId})` : 'All Words'}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-slate-600 mb-1 flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>Quiz Accuracy</span>
            </div>
            <div className="font-black text-emerald-600 dark:text-emerald-400 print:text-emerald-700 text-sm pt-1.5">
              {latestScore !== null ? `${latestScore}% (Passed)` : '100% (Ready)'}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Date</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 print:text-black text-sm pt-1.5">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Teacher Oral Exam Instructions Box */}
        <div className="my-6 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 print:border-indigo-300 print:bg-slate-50 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-indigo-900 dark:text-indigo-300">
                Ustoz uchun og'zaki so'rov bo'limi (Oral Exam Sheet):
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                Ustoz quyidagi 25 ta so'zdan ixtiyoriy so'zning ma'nosini (inglizcha ta'rif, o'zbekcha tarjima yoki sinonimlarini) so'rab, o'ng tarafdagi katakchani belgilashi mumkin.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 print:hidden">
              <button
                onClick={checkAll}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[11px] font-bold cursor-pointer hover:bg-indigo-500 shadow-xs"
              >
                Mark All Tested
              </button>
            </div>
          </div>
        </div>

        {/* 25 Words Checklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 print:border-slate-300 text-slate-500 dark:text-slate-400 print:text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-2 w-10">#</th>
                <th className="py-2.5 px-3">English SAT Word</th>
                <th className="py-2.5 px-3">O'zbekcha Ma'nosi</th>
                <th className="py-2.5 px-3">College Panda Definition & Synonyms</th>
                <th className="py-2.5 px-2 text-center w-20">Oral Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200">
              {words.map((w, idx) => {
                const isTested = !!checkedWords[w.id];

                return (
                  <tr
                    key={w.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 print:hover:bg-transparent transition-colors ${
                      isTested ? 'bg-emerald-50/70 dark:bg-emerald-950/20 print:bg-emerald-50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2 font-mono text-slate-500 dark:text-slate-400 print:text-slate-700 font-bold">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white print:text-black">
                      <div className="flex items-center gap-1.5">
                        <span>{w.word}</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 print:text-slate-500">
                          ({w.pos})
                        </span>
                        <button
                          onClick={() => speakWord(w.word)}
                          className="print:hidden text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Pronounce"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                      {w.uzbek}
                    </td>

                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 print:text-slate-800 font-medium">
                      <div className="leading-snug">{w.definition}</div>
                      {w.synonyms.length > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600 mt-0.5">
                          Syn: {w.synonyms.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={isTested}
                        onChange={() => toggleCheck(w.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Teacher Oral Evaluation & Signature Block */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/40 print:bg-slate-50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 print:border-slate-300 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">Oral Examination Result:</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium">Oral Score:</span>
              <input
                type="text"
                value={teacherScore}
                onChange={(e) => setTeacherScore(e.target.value)}
                className="w-16 px-2 py-1 bg-white dark:bg-slate-900 print:bg-white border border-slate-300 dark:border-slate-700 print:border-slate-400 rounded-lg text-center font-bold text-slate-900 dark:text-white print:text-black"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300 print:text-slate-700">/ 25 Words</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium">
              Tested status: {checkedCount} / {words.length} words checked off
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 print:bg-slate-50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 print:border-slate-300 flex flex-col justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">Teacher Verification:</span>
            <div className="pt-6 border-b border-slate-300 dark:border-slate-700 print:border-slate-400 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 pb-1 font-medium">
              <span>Teacher Signature</span>
              <span>Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
