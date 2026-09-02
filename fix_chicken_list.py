import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()

    # 1. Add page state
    for i, line in enumerate(lines):
        if "const [loading, setLoading] = useState(true);" in line:
            lines[i] = "  const [loading, setLoading] = useState(true);\n  const [page, setPage] = useState(1);\n  const [hasMore, setHasMore] = useState(false);\n  const [isLoadingMore, setIsLoadingMore] = useState(false);\n"
            break

    # 2. Reset page on search or filter change
    for i, line in enumerate(lines):
        if "sessionStorage.setItem('chickenList_genderFilter', genderFilter);" in line:
            lines[i] = "    sessionStorage.setItem('chickenList_genderFilter', genderFilter);\n    setPage(1);\n"
            # fetchChickens() is on the next line
            if "fetchChickens();" in lines[i+1]:
                lines[i+1] = "    fetchChickens(1);\n"
            break

    content = "".join(lines)
    
    # 3. Rewrite fetchChickens to accept page and handle pagination natively
    # Use explicit string replace
    
    start_str = "  const fetchChickens = async () => {"
    end_str = "    } finally {\n      setLoading(false);\n    }\n  };"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find fetchChickens block properly. start:", start_idx, "end:", end_idx)
        return

    new_fetch_logic = """  const fetchChickens = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setIsLoadingMore(true);

      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      let url = `${import.meta.env.VITE_API_URL}/api/chickens?search=${encodeURIComponent(search)}&includeChicks=true&page=${pageNum}&limit=20`;
      if (genderFilter !== 'all') {
        url += `&gender=${genderFilter}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();

      let newChickens = [];
      let _hasMore = false;

      if (data.success && data.pagination) {
        newChickens = data.data || [];
        _hasMore = data.pagination.hasMore;
      } else {
        newChickens = data.data || data.chickens || (Array.isArray(data) ? data : []);
      }

      setHasMore(_hasMore);
      
      if (pageNum === 1) {
        setChickens(newChickens);
      } else {
        setChickens(prev => [...prev, ...newChickens]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };"""

    content = content[:start_idx] + new_fetch_logic + content[end_idx + len(end_str):]

    # 4. Add "Load More" button at the bottom of the list
    load_more_jsx = """
        {hasMore && (
          <div className="flex justify-center pt-8 pb-12">
            <button
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchChickens(nextPage);
              }}
              disabled={isLoadingMore}
              className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-600 text-slate-600 dark:text-slate-300 font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  กำลังโหลดเพิ่มเติม...
                </>
              ) : (
                'โหลดเพิ่มเติม (Load More)'
              )}
            </button>
          </div>
        )}"""

    content = content.replace(
        "      </main>",
        load_more_jsx + "\n      </main>"
    )

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('frontend/src/components/chickens/ChickenList.tsx')
