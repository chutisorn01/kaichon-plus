import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove state variables
    content = re.sub(r"const \[downloadSuccessJpg, setDownloadSuccessJpg\] = useState\(false\);\n", "", content)
    content = re.sub(r"const \[downloadSuccessPdf, setDownloadSuccessPdf\] = useState\(false\);\n", "", content)

    # Remove from handleDownload
    content = content.replace("|| downloadSuccessJpg", "")
    content = content.replace("setDownloadSuccessJpg(false);", "")
    content = content.replace("setDownloadSuccessJpg(true);\n setTimeout(() => setDownloadSuccessJpg(false), 3000);", "")

    # Remove from handleDownloadPdf
    content = content.replace("|| downloadSuccessPdf", "")
    content = content.replace("setDownloadSuccessPdf(false);", "")
    content = content.replace("setDownloadSuccessPdf(true);\n setTimeout(() => setDownloadSuccessPdf(false), 3000);", "")

    # Simplify JPG button className and content
    old_jpg_btn = """className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  downloadSuccessJpg 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-white text-slate-800 hover:bg-slate-100 shadow-white/20'
                }`}
              >
                {downloadSuccessJpg ? (
                  <CheckCircle className="w-5 h-5 text-emerald-50" />
                ) : downloadingJpg ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isReady && downloadSuccessJpg ? 'สำเร็จ!' : 'บันทึก JPG'}
              </button>"""
              
    new_jpg_btn = """className="flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-800 hover:bg-slate-100 shadow-white/20"
              >
                {downloadingJpg ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                บันทึก JPG
              </button>"""
    
    content = content.replace(old_jpg_btn, new_jpg_btn)

    # Simplify PDF button className and content
    old_pdf_btn = """className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  downloadSuccessPdf 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-slate-800 text-white hover:bg-slate-700 shadow-slate-800/20'
                }`}
              >
                {downloadSuccessPdf ? (
                  <CheckCircle className="w-5 h-5 text-emerald-50" />
                ) : downloadingPdf ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
                {isReady && downloadSuccessPdf ? 'สำเร็จ!' : 'บันทึก PDF'}
              </button>"""
              
    new_pdf_btn = """className="flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800 text-white hover:bg-slate-700 shadow-slate-800/20"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
                บันทึก PDF
              </button>"""

    content = content.replace(old_pdf_btn, new_pdf_btn)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
