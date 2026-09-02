import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update the table to hide on mobile
# Find the start of the table container:
# <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">
table_container_regex = r'(<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">\s*<table)'
table_container_replace = r'<div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">\n                  <table'
content = re.sub(table_container_regex, table_container_replace, content)

# 2. Add the mobile view right before the table container
mobile_view = """
                {/* Mobile View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredUsers.map((u) => (
                    <div key={u._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white flex items-center flex-wrap gap-1 text-sm mb-1">
                            {u.farmName || t('ยังไม่ตั้งชื่อซุ้มฟาร์ม', 'No Farm Name')}
                            {u.isVerified && <BadgeCheck className="w-4.5 h-4.5 text-blue-500 shrink-0" />}
                            {u.isPartnerVip && <Crown className="w-4.5 h-4.5 text-yellow-500 shrink-0" title="Partner VIP 👑" />}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@{u.username}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{u.name} {u.email ? `| ${u.email}` : ''}</p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded-md shrink-0 ${
                          u.role === 'admin' 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/30' 
                            : 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-md ${
                          u.isVerified 
                            ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' 
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                        }`}>
                          {u.isVerified ? t('รับรองฟาร์มแล้ว 🔵✔', 'Verified 🔵✔') : t('ยังไม่รับรอง', 'Unverified')}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 pt-2">
                        {u.username === 'adminkaichon' ? (
                          <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-450 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-slate-200 dark:border-slate-700 w-full text-center">{t('ผู้ดูแลระบบสูงสุด 👑', 'Super Admin 👑')}</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleVerify(u._id, !!u.isVerified)}
                              className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                u.isVerified
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                  : 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-md shadow-indigo-600/10'
                              }`}
                            >
                              {u.isVerified ? t('ยกเลิกรับรอง', 'Revoke') : t('อนุมัติ 🔵', 'Approve')}
                            </button>
                            <button
                              onClick={() => handleTogglePartnerVip(u._id, !!u.isPartnerVip)}
                              className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                u.isPartnerVip
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 border border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              {u.isPartnerVip ? t('ยกเลิก Partner', 'Revoke') : t('ให้ Partner 👑', 'Partner')}
                            </button>
                            
                            <div className="flex gap-2 w-full mt-1">
                              <button
                                onClick={() => setSelectedUserToManage(u)}
                                className="flex-1 p-2 flex justify-center items-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                              >
                                <Settings className="w-4 h-4 mr-1" /> จัดการ
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="flex-1 p-2 flex justify-center items-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/30"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> ลบ
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
"""

content = content.replace('<div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">', mobile_view + '\n                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">')

# 3. Add modals to the bottom
modals_str = """
      {/* Delete User Confirm Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirmUser(null)}>
          <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-[2rem] p-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ยืนยันการลบผู้ใช้งาน</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">
                คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ <span className="font-bold text-red-500">"{deleteConfirmUser.username}"</span> ?<br/>การกระทำนี้จะไม่สามารถย้อนกลับได้
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessModal 
        isOpen={successModal.isOpen} 
        onClose={() => setSuccessModal({ isOpen: false, message: '' })} 
        message={successModal.message} 
      />
"""
content = content.replace('    </div>\n  );\n}', modals_str + '\n    </div>\n  );\n}')

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

print("Updated AdminDashboard.tsx successfully.")
