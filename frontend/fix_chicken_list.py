import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Add page state
    content = content.replace(
        "const [loading, setLoading] = useState(true);",
        "const [loading, setLoading] = useState(true);\n  const [page, setPage] = useState(1);\n  const [hasMore, setHasMore] = useState(false);\n  const [isLoadingMore, setIsLoadingMore] = useState(false);"
    )

    # 2. Reset page on search or filter change
    content = content.replace(
        """  useEffect(() => {
    sessionStorage.setItem('chickenList_searchQuery', search);
    sessionStorage.setItem('chickenList_genderFilter', genderFilter);
    fetchChickens();
  }, [search, genderFilter]);""",
        """  useEffect(() => {
    sessionStorage.setItem('chickenList_searchQuery', search);
    sessionStorage.setItem('chickenList_genderFilter', genderFilter);
    setPage(1);
    fetchChickens(1);
  }, [search, genderFilter]);"""
    )

    # 3. Rewrite fetchChickens to accept page and handle pagination natively
    old_fetch_start = "const fetchChickens = async () => {"
    old_fetch_end = "setChickens(mergedArray);"
    
    start_idx = content.find(old_fetch_start)
    end_idx = content.find(old_fetch_end) + len(old_fetch_end)

    if start_idx == -1 or end_idx == -1:
        print("Could not find fetchChickens block")
        return

    new_fetch_logic = """const fetchChickens = async (pageNum = 1) => {
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
        // Fallback for older backend API shape
        newChickens = data.data || data.chickens || (Array.isArray(data) ? data : []);
      }

      setHasMore(_hasMore);
      
      if (pageNum === 1) {
        setChickens(newChickens);
      } else {
        setChickens(prev => [...prev, ...newChickens]);
      }"""

    content = content[:start_idx] + new_fetch_logic + content[end_idx:]

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
        "        {/* List Content */}",
        "        {/* List Content */}"
    )
    
    # insert before the closing main div (before Logout Confirmation Modal or just before the final return closing tag)
    content = content.replace(
        "      </main>",
        load_more_jsx + "\n      </main>"
    )

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/chickens/ChickenList.tsx')
