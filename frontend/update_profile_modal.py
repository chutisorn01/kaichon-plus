import re

with open('src/components/Profile.tsx', 'r') as f:
    content = f.read()

modal_code = """
      {/* Verified Package Modal */}
      {showVerifiedPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowVerifiedPackageModal(false)}>
          <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <BadgeCheck className="w-8 h-8" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-black text-slate-900">👑</span>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
              แพ็คเกจฟาร์มรับรอง<br/>
              <span className="text-blue-600 dark:text-blue-400 text-base">Verified Farm Premium</span>
            </h3>
            
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              ยกระดับความน่าเชื่อถือให้กับฟาร์มของคุณ<br/>
              ด้วยเครื่องหมายรับรอง <span className="inline-flex items-center gap-0.5 text-blue-600">🔵✔</span> สีฟ้า<br/>
              ที่ทุกคนจะเห็นทุกครั้งที่ค้นหาไก่ของคุณ!
            </p>

            <div className="bg-slate-50 dark:bg-slate-850/50 rounded-2xl p-4 mb-6 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">ได้รับความน่าเชื่อถือสูงสุดจากผู้ซื้อ</div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">โดดเด่นกว่าใครในผลการค้นหาหน้าแรก</div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">อัปเกรดสถานะบัญชีเป็น Verified Member</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl text-xs font-black text-blue-700 dark:text-blue-400 animate-pulse">
                🚀 Coming Soon! ระบบกำลังพัฒนา...
              </div>
              
              <button 
                onClick={() => setShowVerifiedPackageModal(false)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black rounded-xl transition-all text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""

content = content.replace('    </div>\n  );\n}\n', modal_code)

with open('src/components/Profile.tsx', 'w') as f:
    f.write(content)
print("Updated Profile.tsx")
