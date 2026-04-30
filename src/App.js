import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Users,
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Cake,
  CheckCircle,
  X,
  BellRing,
  Receipt,
  Coffee,
  Edit,
  UserPlus,
  Ticket,
  History,
  FileJson,
  Phone,
  FileText,
  Settings,
  Loader2,
  RefreshCw,
  Grid as Sheet,
  Trash2,
  Camera as Image,
  ZoomIn,
} from "lucide-react";

// --- 0. 系統核心工具 ---
const generateId = () =>
  "id_" + Math.random().toString(36).substr(2, 9) + "_" + new Date().getTime();
const getToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const formatCurrency = (num) =>
  "$" +
  Math.round(Number(num) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// --- 1. 完整價目表 ---
const createItems = (prefix, items) =>
  items.map((i, idx) => ({
    id: `${prefix}_${idx}`,
    name: i[0],
    price: i[1],
  }));
const SERVICE_MENU = [
  {
    category: "Eyelash - 單根系列",
    items: createItems("e1", [
      ["單根 100根", 1250],
      ["單根 120根", 1450],
      ["單根 140根", 1650],
      ["單根 160根", 1850],
    ]),
  },
  {
    category: "Eyelash - 多根系列",
    items: createItems("e2", [
      ["自然 200-300根", 1480],
      ["淡妝 300-400根", 1580],
      ["微妝 400-600根", 1680],
      ["濃密 600-800根", 1880],
    ]),
  },
  {
    category: "Eyelash - 造型/補/卸",
    items: createItems("e3", [
      ["造型設計款", 0],
      ["下睫毛 - 自然款", 200],
      ["下睫毛 - 設計款", 300],
      ["補睫", 0],
      ["卸睫 - 本店(續接)", 0],
      ["卸睫 - 本店(不續)", 100],
      ["卸睫 - 他店(續接)", 200],
      ["卸睫 - 他店(不續)", 300],
    ]),
  },
  {
    category: "睫毛管理 (拉提)",
    items: createItems("l1", [
      ["睫毛拉提雕塑 - 上", 1450],
      ["睫毛拉提雕塑 - 下", 350],
    ]),
  },
  {
    category: "睫毛加購",
    items: createItems("l2", [
      ["&Healthy嫁接塑型", 900],
      ["光固技術", 300],
      ["手工開花", 200],
    ]),
  },
  {
    category: "臉部保養",
    items: createItems("s", [
      ["奈米慕斯基礎管理", 1000],
      ["韓國小氣泡基礎管理", 1350],
      ["韓國小氣泡進階管理", 1850],
      ["Dr.CPU 玻尿酸", 2250],
      ["HEALLEN 維他命C", 2250],
      ["POINT GREEN 葉綠素", 2450],
      ["CIVASANG 水光炸彈", 2650],
      ["精油拉提撥筋", 450],
      ["緊提逆齡膠原課程", 3980],
    ]),
  },
  {
    category: "紋繡 - 眉/唇",
    items: createItems("p", [
      ["微針柔霧眉", 8000],
      ["仿生毛流飄眉", 8000],
      ["眉補色 (一年內)", 3000],
      ["眉補色 (兩年內)", 4500],
      ["眉補色 (超過兩年)", 0],
      ["奈米嘟嘟唇", 12000],
      ["唇補色 (一年內)", 4500],
      ["唇補色 (兩年內)", 6500],
      ["唇補色 (超過兩年)", 0],
    ]),
  },
  {
    category: "Body Sculpting (體雕)",
    items: createItems("b", [["肌力體雕", 1980]]),
  },
  {
    category: "Hair Removal (除毛)",
    items: createItems("h", [
      ["除毛 - 全腿(含膝/踝)", 1999],
      ["除毛 - 小腿/大腿", 999],
      ["除毛 - 私密處 VIO 全", 1999],
      ["除毛 - 全手", 1399],
      ["除毛 - 全背", 999],
      ["除毛 - 全臉", 799],
      ["除毛 - 腋下", 499],
    ]),
  },
  {
    category: "Scalp Care (頭皮)",
    items: createItems("sc", [
      ["SMP 仿真毛囊紋髮", 0],
      ["專業頭皮胜髮養護", 1980],
    ]),
  },
  {
    category: "Products (產品)",
    items: createItems("pd", [
      ["INNOBLANC 防曬霜", 1000],
      ["HEALLEN 防曬霜", 1000],
      ["MRR B5 睫毛修護液", 680],
      ["BEU睫毛固定劑", 380],
    ]),
  },
];

// --- 3. 輔助函式 ---
const calculateDaysSince = (date) =>
  date ? Math.floor((new Date() - new Date(date)) / (1000 * 3600 * 24)) : null;
const formatDaysAgo = (days) =>
  days === null ? "無紀錄" : days === 0 ? "今天" : `${days} 天前`;
const getDayOfWeek = (dateStr) =>
  ["日", "一", "二", "三", "四", "五", "六"][new Date(dateStr).getDay()];
const getMonthData = (date) => {
  const y = date.getFullYear(),
    m = date.getMonth();
  return {
    firstDay: new Date(y, m, 1).getDay(),
    daysInMonth: new Date(y, m + 1, 0).getDate(),
  };
};

// ★ 新增：計算年齡
const calculateAge = (birthday) => {
  if (!birthday) return null;
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const getStatsCategory = (itemName) => {
  if (!itemName) return "其他";
  if (itemName.includes("睫毛拉提")) return "睫毛管理";
  if (
    itemName.includes("&Healthy") ||
    itemName.includes("光固") ||
    itemName.includes("手工開花")
  )
    return "睫毛加購";
  if (
    itemName.includes("單根") ||
    itemName.includes("多根") ||
    itemName.includes("自然") ||
    itemName.includes("淡妝") ||
    itemName.includes("微妝") ||
    itemName.includes("濃密") ||
    itemName.includes("造型") ||
    itemName.includes("補睫") ||
    itemName.includes("卸睫") ||
    itemName.includes("下睫毛")
  )
    return "美睫";
  if (
    itemName.includes("防曬") ||
    itemName.includes("修護液") ||
    itemName.includes("固定劑")
  )
    return "產品";
  if (itemName.includes("體雕")) return "肌力雕塑";
  if (itemName.includes("除毛")) return "除毛";
  if (itemName.includes("SMP") || itemName.includes("頭皮")) return "頭皮護理";
  if (itemName.includes("唇") || itemName.includes("嘟嘟")) return "唇";
  if (itemName.includes("眉") || itemName.includes("飄眉")) return "眉毛";
  if (
    itemName.includes("臉") ||
    itemName.includes("氣泡") ||
    itemName.includes("導入") ||
    itemName.includes("撥筋") ||
    itemName.includes("逆齡") ||
    itemName.includes("Dr.CPU") ||
    itemName.includes("HEALLEN") ||
    itemName.includes("POINT GREEN") ||
    itemName.includes("CIVASANG") ||
    itemName.includes("奈米慕斯")
  )
    return "臉部保養";
  return "其他";
};

const isBirthdayMonth = (dob) =>
  dob ? new Date().getMonth() === new Date(dob).getMonth() : false;

// ★ 圖片持久化：IndexedDB 工具（base64 圖片太大不適合 localStorage）
const IDB_NAME = "beu_images_db";
const IDB_STORE = "images";

const openIDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE, { keyPath: "id" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });

const idbSaveImages = async (images) => {
  if (!images || images.length === 0) return;
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    images.forEach((img) => store.put(img));
  } catch (e) {
    console.error("IDB save error:", e);
  }
};

const idbGetImages = async (ids) => {
  if (!ids || ids.length === 0) return [];
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const results = await Promise.all(
      ids.map(
        (id) =>
          new Promise((res) => {
            const req = store.get(id);
            req.onsuccess = () => res(req.result || null);
            req.onerror = () => res(null);
          })
      )
    );
    return results.filter(Boolean);
  } catch (e) {
    console.error("IDB get error:", e);
    return [];
  }
};

const idbDeleteImages = async (ids) => {
  if (!ids || ids.length === 0) return;
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    ids.forEach((id) => store.delete(id));
  } catch (e) {
    console.error("IDB delete error:", e);
  }
};

export default function App() {
  const COLORS = {
    bg: "bg-[#FDFBF7]",
    cardBg: "bg-white",
    primary: "bg-[#C5A289]",
    primaryHover: "hover:bg-[#B08D74]",
    secondary: "bg-[#E6DCD3]",
    accent: "text-[#8B5E3C]",
    text: "text-[#5C4B41]",
    textLight: "text-[#9C9288]",
    border: "border-[#EBE5DF]",
    discount: "bg-[#FDF2F2] text-[#E57373] border-[#FCDCDC]",
  };

  // ★ 修正空白頁面：確保 Tailwind 在所有環境正常載入
  const tailwindLoaded = useRef(false);

  useEffect(() => {
    // 僅在尚未載入時才插入（相容 CodeSandbox / claude.ai / 獨立部署）
    if (!tailwindLoaded.current) {
      const existing = document.querySelector('script[src*="tailwindcss"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://cdn.tailwindcss.com";
        script.async = true;
        script.onload = () => {
          tailwindLoaded.current = true;
        };
        document.head.appendChild(script);
      } else {
        tailwindLoaded.current = true;
      }
    }

    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

    const removeWatermark = () => {
      const links = document.querySelectorAll("a");
      links.forEach((a) => {
        if (
          a.textContent.includes("Open Sandbox") ||
          a.href.includes("codesandbox")
        ) {
          a.style.display = "none";
          a.style.visibility = "hidden";
          a.style.pointerEvents = "none";
        }
      });
      const watermarks = document.querySelectorAll(
        "#csb-status, .csb-status, #csb-navigation"
      );
      watermarks.forEach((w) => (w.style.display = "none"));
    };
    removeWatermark();
    const timer = setTimeout(removeWatermark, 2000);
    return () => clearTimeout(timer);
  }, []);

  // --- ★ 優化1：初始化時優先讀取 LocalStorage，setState 使用 lazy initializer ---
  const [customers, setCustomers] = useState(() => {
    try {
      const cached = localStorage.getItem("beu_customers_cache");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [appointments, setAppointments] = useState(() => {
    try {
      const cached = localStorage.getItem("beu_appointments_cache");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // ★ 新增：圖片 Lightbox 狀態
  const [previewImage, setPreviewImage] = useState(null);

  // Google Sheet Configuration
  const [sheetConfig, setSheetConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("beu_sheet_config");
      return saved
        ? JSON.parse(saved)
        : {
            scriptUrl:
              "https://script.google.com/macros/s/AKfycbxg5ipy068bcqgngWl8_Tky9pMutYNkYM2wvqy5ooQzLAypevpihmrGxyA6e3RypX51/exec",
          };
    } catch {
      return { scriptUrl: "" };
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState(sheetConfig);

  // Navigation
  const [view, setView] = useState("customers");
  const [activeTab, setActiveTab] = useState("customers");

  // States
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarSearchTerm, setCalendarSearchTerm] = useState("");

  // Sales & Stats
  const [salesLedgerDate, setSalesLedgerDate] = useState(getToday());
  const [salesCalendarDate, setSalesCalendarDate] = useState(new Date());
  const [statsMode, setStatsMode] = useState("month");
  const [statsTargetMonth, setStatsTargetMonth] = useState(
    getToday().slice(0, 7)
  );
  const [selectedStatsCategory, setSelectedStatsCategory] = useState(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recallServiceId, setRecallServiceId] = useState("");

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isApptOpen, setIsApptOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [isTicketHistoryOpen, setIsTicketHistoryOpen] = useState(false);
  const [isRecommendListOpen, setIsRecommendListOpen] = useState(false);
  const [isCustomerEditOpen, setIsCustomerEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  // ★ 新增：刪除確認 Modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Forms
  const [checkoutData, setCheckoutData] = useState({
    date: "",
    customerId: "",
    items: [],
    discount: "",
    discountReason: "",
    prepaidDed: "",
    packageDed: "",
    notes: "",
    useReferral: false,
    useBirthday: false,
    imageIds: [], // ★ 只存圖片 ID，實際圖片存 IndexedDB
  });
  const [newAppt, setNewAppt] = useState({
    date: "",
    startTime: "10:00",
    endTime: "12:00",
    customerId: "",
    customerName: "",
    items: [],
  });
  const [topUpData, setTopUpData] = useState({
    amount: "",
    note: "",
    type: "prepaid",
  });
  const [customerForm, setCustomerForm] = useState({});
  const [importJson, setImportJson] = useState("");

  // Search & Helpers
  const [apptSearchTerm, setApptSearchTerm] = useState("");
  const [showApptSearchList, setShowApptSearchList] = useState(false);
  const [recommenderSearch, setRecommenderSearch] = useState("");
  const [showRecommenderList, setShowRecommenderList] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [linkedAppointmentId, setLinkedAppointmentId] = useState(null);
  const [apptCategoryExpanded, setApptCategoryExpanded] = useState({});
  const [checkoutCategoryExpanded, setCheckoutCategoryExpanded] = useState({});
  const [recallCategoryExpanded, setRecallCategoryExpanded] = useState({});
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  // ★ 新增：圖片上傳 ref
  const imageInputRef = useRef(null);

  // ★ 圖片快取：key = imageId, value = {id, data, name}（從 IndexedDB 載入後存入）
  const [imageCache, setImageCache] = useState({});

  // ★ 從 IndexedDB 載入某些 ID 的圖片（若 cache 已有則跳過）
  const ensureImagesLoaded = useCallback(
    async (ids) => {
      if (!ids || ids.length === 0) return;
      const missing = ids.filter((id) => !imageCache[id]);
      if (missing.length === 0) return;
      const imgs = await idbGetImages(missing);
      if (imgs.length > 0) {
        setImageCache((prev) => {
          const next = { ...prev };
          imgs.forEach((img) => {
            next[img.id] = img;
          });
          return next;
        });
      }
    },
    [imageCache]
  );

  // --- Google Sheet Data Fetching (Optimized with Caching) ---
  const fetchSheetData = useCallback(async () => {
    if (!sheetConfig.scriptUrl) return;
    setIsSyncing(true);

    try {
      let url = sheetConfig.scriptUrl.trim();
      const delimiter = url.includes("?") ? "&" : "?";

      const custRes = await fetch(
        `${url}${delimiter}sheet=Customers&action=get`,
        {
          method: "GET",
          mode: "cors",
          credentials: "omit",
        }
      );

      if (custRes.ok) {
        const custJson = await custRes.json();
        if (custJson.status === "error") throw new Error(custJson.message);
        if (Array.isArray(custJson)) {
          setCustomers(custJson);
          localStorage.setItem("beu_customers_cache", JSON.stringify(custJson));
        }
      }

      const apptRes = await fetch(
        `${url}${delimiter}sheet=Appointments&action=get`,
        {
          method: "GET",
          mode: "cors",
          credentials: "omit",
        }
      );
      if (apptRes.ok) {
        const apptJson = await apptRes.json();
        if (Array.isArray(apptJson)) {
          setAppointments(apptJson);
          localStorage.setItem(
            "beu_appointments_cache",
            JSON.stringify(apptJson)
          );
        }
      }
    } catch (error) {
      console.error("Sheet Fetch Error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetConfig]);

  useEffect(() => {
    fetchSheetData();
  }, [sheetConfig]);

  // --- Google Sheet Write Helper ---
  const sendToSheet = useCallback(
    async (sheetName, data, action = "save") => {
      if (!sheetConfig.scriptUrl) return;
      setIsSyncing(true);
      try {
        let url = sheetConfig.scriptUrl.trim();
        const delimiter = url.includes("?") ? "&" : "?";
        const targetUrl = `${url}${delimiter}sheet=${sheetName}&action=${action}`;

        const res = await fetch(targetUrl, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        setIsSyncing(false);
        if (result.status === "error") throw new Error(result.message);
        return result;
      } catch (e) {
        console.error(e);
        setIsSyncing(false);
        return null;
      }
    },
    [sheetConfig]
  );

  // --- Computed ---
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || {},
    [customers, selectedCustomerId]
  );

  // ★ 當選定顧客改變時，預載所有 visit 的圖片（必須在 selectedCustomer 宣告後）
  useEffect(() => {
    if (!selectedCustomer.id) return;
    const allIds = [];
    (selectedCustomer.visits || []).forEach((v) => {
      (v.imageIds || []).forEach((id) => allIds.push(id));
    });
    if (allIds.length > 0) ensureImagesLoaded(allIds);
  }, [selectedCustomer]);
  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          (c.name || "").includes(searchTerm) ||
          (c.phone || "").includes(searchTerm)
      ),
    [customers, searchTerm]
  );

  const apptCustomerSuggestions = useMemo(() => {
    const term = apptSearchTerm.toLowerCase();
    return customers
      .filter(
        (c) =>
          term === "" ||
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term)
      )
      .slice(0, 10);
  }, [customers, apptSearchTerm]);

  const recommenderList = useMemo(
    () =>
      recommenderSearch
        ? customers.filter((c) => c.name.includes(recommenderSearch))
        : [],
    [customers, recommenderSearch]
  );

  const recommendedByCustomer = useMemo(() => {
    if (!selectedCustomer.id) return [];
    return customers.filter((c) => c.recommenderId === selectedCustomer.id);
  }, [customers, selectedCustomer]);

  const dailyAppts = useMemo(
    () =>
      appointments
        .filter((a) => a.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, selectedDate]
  );

  const filteredCalendarAppts = useMemo(() => {
    if (!calendarSearchTerm) return dailyAppts;
    const term = calendarSearchTerm.toLowerCase();
    return appointments
      .filter(
        (a) =>
          a.customerName.toLowerCase().includes(term) ||
          a.date.includes(term) ||
          a.startTime.includes(term) ||
          a.items.some((i) => i.name.toLowerCase().includes(term))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, calendarSearchTerm, dailyAppts]);

  const salesRecords = useMemo(() => {
    const records = [];
    customers.forEach((c) => {
      (c.visits || []).forEach((v) => {
        records.push({ ...v, customerName: c.name, customerId: c.id });
      });
    });
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [customers]);

  const dailySales = useMemo(
    () => salesRecords.filter((r) => r.date === salesLedgerDate),
    [salesRecords, salesLedgerDate]
  );
  const dailyRevenue = useMemo(
    () => dailySales.reduce((sum, r) => sum + r.finalAmount, 0),
    [dailySales]
  );

  const salesCalendarDots = useMemo(() => {
    const dots = {};
    const prefix = `${salesCalendarDate.getFullYear()}-${String(
      salesCalendarDate.getMonth() + 1
    ).padStart(2, "0")}`;
    salesRecords.forEach((r) => {
      if (r.date.startsWith(prefix)) dots[r.date] = true;
    });
    return dots;
  }, [salesRecords, salesCalendarDate]);

  const reportData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const yearlyData = {};
    let yearlyTotal = 0;
    let lastYearTotal = 0;

    for (let i = 1; i <= 12; i++) {
      const m = `${currentYear}-${String(i).padStart(2, "0")}`;
      yearlyData[m] = { revenue: 0, visits: 0, name: `${i}月` };
    }

    const targetMonthData = {
      totalRevenue: 0,
      totalVisits: 0,
      categoryBreakdown: {},
      details: [],
    };

    salesRecords.forEach((r) => {
      const rMonth = r.date.substring(0, 7);
      const rYear = r.date.substring(0, 4);

      if (rYear === String(currentYear)) {
        if (yearlyData[rMonth]) {
          yearlyData[rMonth].revenue += r.finalAmount;
          yearlyData[rMonth].visits += 1;
          yearlyTotal += r.finalAmount;
        }
      }
      if (rYear === String(lastYear)) lastYearTotal += r.finalAmount;

      if (rMonth === statsTargetMonth) {
        targetMonthData.totalRevenue += r.finalAmount;
        targetMonthData.totalVisits += 1;
        const subtotal = r.items.reduce(
          (sum, i) => sum + (i.finalPrice || i.price),
          0
        );
        r.items.forEach((item) => {
          const cat = getStatsCategory(item.name);
          const weight =
            subtotal > 0 ? (item.finalPrice || item.price) / subtotal : 0;
          const amt = Math.round(r.finalAmount * weight);

          if (!targetMonthData.categoryBreakdown[cat])
            targetMonthData.categoryBreakdown[cat] = {
              name: cat,
              revenue: 0,
              count: 0,
              items: [],
            };
          targetMonthData.categoryBreakdown[cat].revenue += amt;
          targetMonthData.categoryBreakdown[cat].count += 1;
          targetMonthData.categoryBreakdown[cat].items.push({
            date: r.date,
            customer: r.customerName,
            item: item.name,
            amount: amt,
          });
        });
      }
    });

    let yearGrowth = 0;
    if (lastYearTotal > 0)
      yearGrowth = (
        ((yearlyTotal - lastYearTotal) / lastYearTotal) *
        100
      ).toFixed(1);
    else yearGrowth = lastYearTotal === 0 && yearlyTotal > 0 ? 100 : 0;

    return { yearlyData, yearlyTotal, yearGrowth, targetMonthData };
  }, [salesRecords, statsTargetMonth]);

  const recallList = useMemo(() => {
    if (!recallServiceId) return [];
    let targetName = "";
    SERVICE_MENU.forEach((cat) =>
      cat.items.forEach((i) => {
        if (i.id === recallServiceId) targetName = i.name;
      })
    );

    return customers
      .map((c) => {
        const visits = c.visits || [];
        const match = visits
          .filter((v) => v.items.some((i) => i.name === targetName))
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (!match) return null;
        const itemInfo = match.items.find((i) => i.name === targetName);
        return {
          ...c,
          lastVisit: match,
          itemInfo,
          daysAgo: calculateDaysSince(match.date),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.daysAgo - a.daysAgo);
  }, [customers, recallServiceId]);

  // ★ 壽星名單：當月與下個月
  const birthdayList = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth(); // 0-11
    const nextMonth = (thisMonth + 1) % 12;
    const thisMonthBirthdays = [];
    const nextMonthBirthdays = [];
    customers.forEach((c) => {
      if (!c.birthday) return;
      const birthMonth = new Date(c.birthday).getMonth();
      if (birthMonth === thisMonth) thisMonthBirthdays.push(c);
      else if (birthMonth === nextMonth) nextMonthBirthdays.push(c);
    });
    // 依生日日期排序（月內日期順序）
    const sortByDay = (a, b) =>
      new Date(a.birthday).getDate() - new Date(b.birthday).getDate();
    return {
      thisMonth: thisMonthBirthdays.sort(sortByDay),
      nextMonth: nextMonthBirthdays.sort(sortByDay),
      thisMonthLabel: `${thisMonth + 1}月`,
      nextMonthLabel: `${nextMonth + 1}月`,
    };
  }, [customers]);

  const balanceHistory = useMemo(() => {
    if (!selectedCustomer.id) return [];
    const history = [];
    (selectedCustomer.transactions || []).forEach((t) => {
      if (t.category === topUpData.type) history.push({ ...t, isTopUp: true });
    });
    (selectedCustomer.visits || []).forEach((v) => {
      if (topUpData.type === "prepaid" && v.prepaidDeduction > 0)
        history.push({
          date: v.date,
          amount: v.prepaidDeduction,
          type: "deduct",
          note: `消費扣除 (單號:${v.id.substr(-4)})`,
        });
      if (topUpData.type === "package" && v.packageDeducted > 0)
        history.push({
          date: v.date,
          amount: v.packageDeducted,
          type: "deduct",
          note: `消費扣除 (單號:${v.id.substr(-4)})`,
        });
    });
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCustomer, topUpData.type]);

  const ticketHistory = useMemo(() => {
    if (!selectedCustomer.id || !selectedCustomer.ticketHistory) return [];
    return [...selectedCustomer.ticketHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [selectedCustomer]);

  // --- Handlers ---

  const saveSettings = () => {
    let cleanUrl = tempConfig.scriptUrl.trim();
    if (cleanUrl.includes("?")) {
      cleanUrl = cleanUrl.split("?")[0];
    }
    const newConfig = { ...tempConfig, scriptUrl: cleanUrl };
    localStorage.setItem("beu_sheet_config", JSON.stringify(newConfig));
    setSheetConfig(newConfig);
    setIsSettingsOpen(false);
  };

  const handleImport = async () => {
    if (!sheetConfig.scriptUrl) return alert("請先設定 Google Sheet URL");
    try {
      const data = JSON.parse(importJson);
      if (Array.isArray(data)) {
        let count = 0;
        for (const c of data) {
          const id = c.id || generateId();
          const newCust = {
            ...c,
            id,
            visits: c.visits || [],
            transactions: c.transactions || [],
            ticketHistory: c.ticketHistory || [],
            packageBalance: Number(c.packageBalance) || 0,
            prepaidBalance: Number(c.prepaidBalance) || 0,
            referralTickets: Number(c.referralTickets) || 0,
          };
          await sendToSheet("Customers", newCust);
          count++;
        }
        alert(`成功匯入 ${count} 筆顧客資料到 Google Sheet！`);
        setIsImportOpen(false);
        setImportJson("");
        fetchSheetData();
      } else {
        alert("格式錯誤：必須是陣列 (Array)");
      }
    } catch (e) {
      console.error(e);
      alert("匯入失敗，請檢查 JSON 格式");
    }
  };

  const handleSaveCustomer = async () => {
    const isNew = !customerForm.id;
    const id = customerForm.id || generateId();
    const newCust = {
      ...customerForm,
      id,
      visits: customerForm.visits || [],
      transactions: customerForm.transactions || [],
      ticketHistory: customerForm.ticketHistory || [],
    };

    let newCustomersList = [];
    if (isNew) {
      newCustomersList = [newCust, ...customers];
    } else {
      newCustomersList = customers.map((c) => (c.id === id ? newCust : c));
    }
    setCustomers(newCustomersList);
    localStorage.setItem(
      "beu_customers_cache",
      JSON.stringify(newCustomersList)
    );

    await sendToSheet("Customers", newCust);

    if (isNew && newCust.recommenderId) {
      const recommender = customers.find((c) => c.id === newCust.recommenderId);
      if (recommender) {
        const newTicket = {
          id: generateId(),
          date: getToday(),
          type: "add",
          amount: 1,
          note: `推薦 ${newCust.name}`,
        };
        const updatedRecommender = {
          ...recommender,
          referralTickets: (Number(recommender.referralTickets) || 0) + 1,
          ticketHistory: [...(recommender.ticketHistory || []), newTicket],
        };

        const updatedList = newCustomersList.map((c) =>
          c.id === recommender.id ? updatedRecommender : c
        );
        setCustomers(updatedList);
        localStorage.setItem(
          "beu_customers_cache",
          JSON.stringify(updatedList)
        );
        await sendToSheet("Customers", updatedRecommender);
      }
    }
    setIsCustomerEditOpen(false);
    if (isNew) setView("list");
  };

  // ★ 新增：刪除顧客
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    const updatedList = customers.filter((c) => c.id !== customerToDelete.id);
    setCustomers(updatedList);
    localStorage.setItem("beu_customers_cache", JSON.stringify(updatedList));
    // 傳送刪除指令到 Google Sheet
    await sendToSheet("Customers", { id: customerToDelete.id }, "delete");
    setIsDeleteConfirmOpen(false);
    setCustomerToDelete(null);
    setIsCustomerEditOpen(false);
    setView("customers");
  };

  const handleTopUpSave = async () => {
    if (!topUpData.amount || !selectedCustomerId) return;
    const amt = Number(topUpData.amount);
    const newTrans = {
      id: generateId(),
      date: getToday(),
      type: "add",
      category: topUpData.type,
      amount: amt,
      note: topUpData.note || "儲值",
    };

    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (cust) {
      const field =
        topUpData.type === "prepaid" ? "prepaidBalance" : "packageBalance";
      const updatedCust = {
        ...cust,
        [field]: (Number(cust[field]) || 0) + amt,
        transactions: [newTrans, ...(cust.transactions || [])],
      };

      const updatedList = customers.map((c) =>
        c.id === cust.id ? updatedCust : c
      );
      setCustomers(updatedList);
      localStorage.setItem("beu_customers_cache", JSON.stringify(updatedList));
      await sendToSheet("Customers", updatedCust);
    }
    setTopUpData({ ...topUpData, amount: "", note: "" });
  };

  const handleTicketUpdate = async (delta, note) => {
    if (!selectedCustomerId) return;
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (cust) {
      const newTicket = {
        id: generateId(),
        date: getToday(),
        type: delta > 0 ? "add" : "deduct",
        amount: Math.abs(delta),
        note: note || "手動調整",
      };
      const newCount = Math.max(0, (Number(cust.referralTickets) || 0) + delta);
      const updatedCust = {
        ...cust,
        referralTickets: newCount,
        ticketHistory: [newTicket, ...(cust.ticketHistory || [])],
      };

      const updatedList = customers.map((c) =>
        c.id === cust.id ? updatedCust : c
      );
      setCustomers(updatedList);
      localStorage.setItem("beu_customers_cache", JSON.stringify(updatedList));
      await sendToSheet("Customers", updatedCust);
    }
  };

  // ★ 圖片上傳：存 IndexedDB，checkoutData.imageIds 只存 ID 陣列
  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newImgs = [];
    await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const img = {
                id: generateId(),
                data: ev.target.result,
                name: file.name,
              };
              newImgs.push(img);
              resolve();
            };
            reader.readAsDataURL(file);
          })
      )
    );

    // 存入 IndexedDB
    await idbSaveImages(newImgs);

    // 更新圖片快取（UI 顯示用）
    setImageCache((prev) => {
      const next = { ...prev };
      newImgs.forEach((img) => {
        next[img.id] = img;
      });
      return next;
    });

    // checkoutData 只存 ID
    setCheckoutData((prev) => ({
      ...prev,
      imageIds: [...(prev.imageIds || []), ...newImgs.map((img) => img.id)],
    }));
    e.target.value = "";
  }, []);

  const removeCheckoutImage = useCallback((imgId) => {
    setCheckoutData((prev) => ({
      ...prev,
      imageIds: (prev.imageIds || []).filter((id) => id !== imgId),
    }));
  }, []);

  // --- Fixed Checkout & Edit Logic (With Ticket Sync) ---
  const handleCheckoutSave = async () => {
    if (checkoutData.items.length === 0) return alert("請選擇項目");
    const final = calculateCartTotal();
    const subtotal = checkoutData.items.reduce(
      (sum, i) => sum + i.finalPrice,
      0
    );
    const prepaid = Number(checkoutData.prepaidDed) || 0;
    const packageDed = Number(checkoutData.packageDed) || 0;

    let reasons = [];
    if (checkoutData.discountReason)
      reasons.push(`${checkoutData.discountReason}`);
    if (checkoutData.discount > 0)
      reasons.push(`額外折$${checkoutData.discount}`);
    if (checkoutData.useBirthday) reasons.push("生日禮-$200");
    if (checkoutData.useReferral) reasons.push("介紹禮-$200");
    if (prepaid > 0) reasons.push(`儲值扣$${prepaid}`);

    const fullDiscountAmount =
      (Number(checkoutData.discount) || 0) +
      (checkoutData.useBirthday ? 200 : 0) +
      (checkoutData.useReferral ? 200 : 0);
    const discountDetailStr = reasons.join(", ");

    const newVisit = {
      id: editingVisitId || generateId(),
      date: checkoutData.date,
      items: checkoutData.items,
      totalPrice: subtotal,
      discount: fullDiscountAmount,
      discountReason: discountDetailStr,
      discountDetail: discountDetailStr,
      prepaidDeduction: prepaid,
      packageDeducted: packageDed,
      finalAmount: final,
      useReferral: checkoutData.useReferral,
      notes: checkoutData.notes,
      imageIds: checkoutData.imageIds || [], // ★ 只存 ID，圖片在 IndexedDB
    };

    const cust = customers.find((c) => c.id === checkoutData.customerId);
    if (cust) {
      let newPrepaid = Number(cust.prepaidBalance) || 0;
      let newPackage = Number(cust.packageBalance) || 0;
      let newTickets = Number(cust.referralTickets) || 0;
      let newTicketHistory = [...(cust.ticketHistory || [])];
      let newVisits = [...(cust.visits || [])];

      if (editingVisitId) {
        const oldVisit = newVisits.find((v) => v.id === editingVisitId);
        if (oldVisit) {
          newPrepaid += Number(oldVisit.prepaidDeduction) || 0;
          newPackage += Number(oldVisit.packageDeducted) || 0;
          if (oldVisit.useReferral) {
            newTickets += 1;
            newTicketHistory.unshift({
              id: generateId(),
              date: getToday(),
              type: "add",
              amount: 1,
              note: "修改訂單返還",
            });
          }
        }
        newVisits = newVisits.filter((v) => v.id !== editingVisitId);
      }

      if (newVisit.prepaidDeduction > 0)
        newPrepaid = Math.max(0, newPrepaid - newVisit.prepaidDeduction);
      if (newVisit.packageDeducted > 0)
        newPackage = Math.max(0, newPackage - newVisit.packageDeducted);

      if (newVisit.useReferral) {
        newTickets = Math.max(0, newTickets - 1);
        newTicketHistory.unshift({
          id: generateId(),
          date: getToday(),
          type: "deduct",
          amount: 1,
          note: "消費折抵",
        });
      }

      newVisits.unshift(newVisit);
      newVisits.sort((a, b) => new Date(b.date) - new Date(a.date));

      const updatedCust = {
        ...cust,
        visits: newVisits,
        prepaidBalance: newPrepaid,
        packageBalance: newPackage,
        referralTickets: newTickets,
        ticketHistory: newTicketHistory,
      };

      const updatedList = customers.map((c) =>
        c.id === cust.id ? updatedCust : c
      );
      setCustomers(updatedList);
      localStorage.setItem("beu_customers_cache", JSON.stringify(updatedList));
      await sendToSheet("Customers", updatedCust);
    }

    if (linkedAppointmentId) {
      const appt = appointments.find((a) => a.id === linkedAppointmentId);
      if (appt) {
        const updatedAppt = { ...appt, status: "completed" };
        const updatedApptList = appointments.map((a) =>
          a.id === appt.id ? updatedAppt : a
        );
        setAppointments(updatedApptList);
        localStorage.setItem(
          "beu_appointments_cache",
          JSON.stringify(updatedApptList)
        );
        await sendToSheet("Appointments", updatedAppt);
      }
    }
    setIsCheckoutOpen(false);
  };

  // --- Delete Visit Handler ---
  const handleDeleteVisit = async (visitId, custId) => {
    if (
      !window.confirm(
        "確定要刪除此筆消費紀錄嗎？\n相關扣除的儲值、課程、介紹券將會自動歸還。"
      )
    )
      return;

    const cust = customers.find((c) => c.id === custId);
    if (!cust) return;

    let newPrepaid = Number(cust.prepaidBalance) || 0;
    let newPackage = Number(cust.packageBalance) || 0;
    let newTickets = Number(cust.referralTickets) || 0;
    let newTicketHistory = [...(cust.ticketHistory || [])];
    let newVisits = [...(cust.visits || [])];

    const visitToDelete = newVisits.find((v) => v.id === visitId);
    if (visitToDelete) {
      newPrepaid += Number(visitToDelete.prepaidDeduction) || 0;
      newPackage += Number(visitToDelete.packageDeducted) || 0;
      if (visitToDelete.useReferral) {
        newTickets += 1;
        newTicketHistory.unshift({
          id: generateId(),
          date: getToday(),
          type: "add",
          amount: 1,
          note: "取消消費返還",
        });
      }
      newVisits = newVisits.filter((v) => v.id !== visitId);
    }

    const updatedCust = {
      ...cust,
      visits: newVisits,
      prepaidBalance: newPrepaid,
      packageBalance: newPackage,
      referralTickets: newTickets,
      ticketHistory: newTicketHistory,
    };

    const updatedList = customers.map((c) =>
      c.id === cust.id ? updatedCust : c
    );
    setCustomers(updatedList);
    localStorage.setItem("beu_customers_cache", JSON.stringify(updatedList));
    await sendToSheet("Customers", updatedCust);
    setIsCheckoutOpen(false);
  };

  const handleApptSave = async () => {
    if (!newAppt.customerId) return alert("請選擇顧客");
    const id = generateId();
    const apptData = { ...newAppt, id, status: "pending" };

    const newApptList = [...appointments, apptData];
    setAppointments(newApptList);
    localStorage.setItem("beu_appointments_cache", JSON.stringify(newApptList));
    await sendToSheet("Appointments", apptData);
    setIsApptOpen(false);
  };

  const calculateCartTotal = () => {
    const subtotal = checkoutData.items.reduce(
      (sum, i) => sum + i.finalPrice,
      0
    );
    let totalDiscount = Number(checkoutData.discount) || 0;
    if (checkoutData.useReferral) totalDiscount += 200;
    if (checkoutData.useBirthday) totalDiscount += 200;
    const afterDiscount = Math.max(0, subtotal - totalDiscount);
    const prepaid = Number(checkoutData.prepaidDed) || 0;
    return Math.round(Math.max(0, afterDiscount - prepaid));
  };

  const toggleApptItem = (item) => {
    setNewAppt((prev) => {
      const exists = prev.items.find((i) => i.name === item.name);
      if (exists)
        return {
          ...prev,
          items: prev.items.filter((i) => i.name !== item.name),
        };
      return {
        ...prev,
        items: [...prev.items, { name: item.name, price: item.price }],
      };
    });
  };

  const changeMonth = (delta) => {
    const d = new Date(calendarMonth);
    d.setMonth(d.getMonth() + delta);
    setCalendarMonth(d);
  };
  const changeSalesMonth = (delta) => {
    const d = new Date(salesCalendarDate);
    d.setMonth(d.getMonth() + delta);
    setSalesCalendarDate(d);
  };

  const addItemToCart = (item) => {
    setCheckoutData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...item,
          uniqueId: generateId(),
          finalPrice: item.price,
          discountRate: 1,
          note: "",
        },
      ],
    }));
  };

  const addCustomItemToCart = () => {
    if (!customItemName || !customItemPrice) return;
    addItemToCart({
      name: customItemName,
      price: Number(customItemPrice),
      id: "custom",
    });
    setCustomItemName("");
    setCustomItemPrice("");
  };

  const updateItemDiscount = (uniqueId, rate) => {
    setCheckoutData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.uniqueId === uniqueId)
          return {
            ...item,
            discountRate: rate,
            finalPrice: Math.round(item.price * rate),
          };
        return item;
      }),
    }));
  };

  const updateItemNote = (uniqueId, note) => {
    setCheckoutData((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.uniqueId === uniqueId ? { ...i, note } : i
      ),
    }));
  };

  const updateItemCustomPrice = (uniqueId, newPrice) => {
    setCheckoutData((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.uniqueId === uniqueId ? { ...i, finalPrice: Number(newPrice) } : i
      ),
    }));
  };

  const removeItemFromCart = (uid) =>
    setCheckoutData((p) => ({
      ...p,
      items: p.items.filter((i) => i.uniqueId !== uid),
    }));

  const startCheckout = (appt) => {
    let custId = appt.customerId;
    if (!custId) {
      const found = customers.find((c) => c.name === appt.customerName);
      if (found) custId = found.id;
    }
    if (!custId) return alert("請先建立顧客資料");
    const prefill = appt.items.map((i) => {
      let price = i.price || 0;
      if (price === 0)
        SERVICE_MENU.forEach((c) =>
          c.items.forEach((mi) => {
            if (mi.name === i.name) price = mi.price;
          })
        );
      return {
        ...i,
        uniqueId: generateId(),
        price: price,
        finalPrice: price,
        discountRate: 1,
        note: "",
      };
    });
    setCheckoutData({
      date: appt.date,
      customerId: custId,
      items: prefill,
      discount: "",
      discountReason: "",
      prepaidDed: "",
      packageDed: "",
      notes: "",
      useReferral: false,
      useBirthday: false,
      imageIds: [],
    });
    setLinkedAppointmentId(appt.id);
    setEditingVisitId(null);
    setIsCheckoutOpen(true);
  };

  const openEmptyCheckout = () => {
    setLinkedAppointmentId(null);
    setEditingVisitId(null);
    setCheckoutData({
      date: getToday(),
      customerId: selectedCustomerId,
      items: [],
      discount: "",
      discountReason: "",
      prepaidDed: "",
      packageDed: "",
      notes: "",
      useReferral: false,
      useBirthday: false,
      imageIds: [],
    });
    setIsCheckoutOpen(true);
  };

  const handleEditVisit = (visit) => {
    setEditingVisitId(visit.id);
    setLinkedAppointmentId(null);
    const customer = customers.find((c) =>
      c.visits.some((v) => v.id === visit.id)
    );
    const existingIds = visit.imageIds || [];
    if (existingIds.length > 0) ensureImagesLoaded(existingIds);
    setCheckoutData({
      date: visit.date,
      customerId: customer?.id || selectedCustomerId,
      items: (visit.items || []).map((i) => ({ ...i, uniqueId: generateId() })),
      discount: "",
      discountReason: "",
      prepaidDed: visit.prepaidDeduction,
      packageDed: visit.packageDeducted,
      notes: visit.notes,
      useReferral: visit.useReferral || false,
      useBirthday: visit.useBirthday || false,
      imageIds: existingIds, // ★ 帶入既有圖片 ID
    });
    setIsCheckoutOpen(true);
  };

  // --- UI Render ---
  return (
    <div
      className={`min-h-screen ${COLORS.bg} text-[#4A4036] pb-44`}
      style={{ fontFamily: "'Nunito', 'GenSenRounded', sans-serif" }}
    >
      {/* ★ Lightbox：點擊圖片全螢幕預覽 */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 z-10"
            onClick={() => setPreviewImage(null)}
          >
            <X size={28} />
          </button>
          <img
            src={previewImage}
            alt="預覽"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            style={{ maxHeight: "90vh", maxWidth: "95vw" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ★ 刪除顧客確認 Modal */}
      {isDeleteConfirmOpen && customerToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">刪除顧客</h3>
                <p className="text-xs text-stone-400">此操作無法復原</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
              <p className="text-sm text-red-700 font-bold">
                {customerToDelete.name}
              </p>
              <p className="text-xs text-red-500 mt-1">
                包含所有消費紀錄、儲值、課程資料都將永久刪除。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setCustomerToDelete(null);
                }}
                className="flex-1 py-3 bg-stone-100 rounded-xl font-bold text-stone-600"
              >
                取消
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto min-h-screen shadow-2xl relative bg-[#FAF7F5]">
        {/* Header */}
        <div className="p-4 pt-8 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-[#FAF7F5]/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 ${COLORS.primary} rounded-lg flex items-center justify-center font-bold text-lg text-white`}
            >
              B
            </div>
            <h1 className="text-lg font-bold tracking-wide">BEU O.BEAUTY</h1>
          </div>
          <div className="flex items-center gap-2">
            {isSyncing && (
              <Loader2 className="animate-spin text-stone-400" size={16} />
            )}
            <button
              onClick={fetchSheetData}
              className="p-2 rounded-full bg-white shadow-sm text-stone-400 hover:text-[#C5A289]"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-full shadow-sm ${
                sheetConfig.scriptUrl
                  ? "bg-white text-stone-400"
                  : "bg-red-100 text-red-500 animate-pulse"
              }`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* --- Setup Modal (Google Sheet) --- */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sheet size={20} className="text-green-600" /> Google Sheet 設定
              </h3>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">
                    Web App URL (Script URL)
                  </label>
                  <input
                    type="text"
                    value={tempConfig.scriptUrl}
                    onChange={(e) =>
                      setTempConfig({
                        ...tempConfig,
                        scriptUrl: e.target.value,
                      })
                    }
                    placeholder="https://script.google.com/..."
                    className="w-full p-2 bg-stone-100 rounded-lg text-sm"
                  />
                </div>
                <div className="text-[10px] text-stone-400 bg-stone-50 p-2 rounded leading-relaxed">
                  請在 Google Sheet 建立 <b>Customers</b> 與 <b>Appointments</b>{" "}
                  兩個工作表 (A1:id, B1:data)。
                  <br />
                  並將 Apps Script 部署為 Web App (權限: <b>Anyone</b>)。
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-2 bg-stone-100 rounded-lg text-stone-600 font-bold"
                >
                  取消
                </button>
                <button
                  onClick={saveSettings}
                  className="flex-1 py-2 bg-[#C5A289] text-white rounded-lg font-bold"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* 1. 行事曆預約 */}
          {false && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex gap-2 items-center">
                  <Coffee /> 預約行事曆
                </h2>
                <button
                  onClick={() => {
                    setNewAppt({
                      date: selectedDate,
                      startTime: "10:00",
                      endTime: "12:00",
                      customerId: "",
                      customerName: "",
                      items: [],
                    });
                    setApptSearchTerm("");
                    setIsApptOpen(true);
                  }}
                  className={`${COLORS.primary} text-white px-3 py-2 rounded-xl text-sm font-bold flex gap-1 shadow`}
                >
                  <Plus size={16} /> 預約
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input
                    placeholder="搜尋預約 (姓名、日期、項目)..."
                    value={calendarSearchTerm}
                    onChange={(e) => setCalendarSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 bg-white rounded-xl border border-stone-100 shadow-sm text-sm"
                  />
                  <Search
                    className="absolute left-3 top-3 text-stone-400"
                    size={18}
                  />
                  {calendarSearchTerm && (
                    <button
                      onClick={() => setCalendarSearchTerm("")}
                      className="absolute right-3 top-3 text-stone-400"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              {calendarSearchTerm ? (
                <div className="space-y-3">
                  {filteredCalendarAppts.length === 0 ? (
                    <div className="text-center py-10 text-stone-300">
                      找不到符合的預約
                    </div>
                  ) : (
                    filteredCalendarAppts.map((appt) => (
                      <div key={appt.id} className="flex gap-4 group">
                        <div className="w-16 pt-2 text-center text-sm font-bold text-[#8B5E3C]">
                          <div className="text-xs text-stone-400">
                            {appt.date.slice(5)}
                          </div>
                          {appt.startTime}
                        </div>
                        <div
                          className={`flex-1 bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#C5A289] ${
                            appt.status === "completed" ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">
                                {appt.customerName}
                              </h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {appt.items.map((i, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600"
                                  >
                                    {i.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {appt.status !== "completed" && (
                              <button
                                onClick={() => startCheckout(appt)}
                                className="bg-[#C5A289] text-white px-3 py-1 rounded text-xs font-bold shadow"
                              >
                                結帳
                              </button>
                            )}
                            {appt.status === "completed" && (
                              <CheckCircle
                                size={16}
                                className="text-[#C5A289]"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <div
                    className={`${COLORS.cardBg} p-4 rounded-2xl shadow-sm border border-stone-200 mb-4`}
                  >
                    <div className="flex justify-between mb-4">
                      <button onClick={() => changeMonth(-1)}>
                        <ChevronLeft />
                      </button>
                      <span className="font-bold">
                        {calendarMonth.getFullYear()} /{" "}
                        {calendarMonth.getMonth() + 1}
                      </span>
                      <button onClick={() => changeMonth(1)}>
                        <ChevronRight />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 text-center gap-1">
                      {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
                        <div key={d} className="text-xs text-stone-400">
                          {d}
                        </div>
                      ))}
                      {Array(getMonthData(calendarMonth).daysInMonth)
                        .fill(0)
                        .map((_, i) => {
                          const d = i + 1;
                          const dStr = `${calendarMonth.getFullYear()}-${String(
                            calendarMonth.getMonth() + 1
                          ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                          const hasAppt = appointments.some(
                            (a) => a.date === dStr
                          );
                          return (
                            <div
                              key={d}
                              onClick={() => setSelectedDate(dStr)}
                              className={`h-9 flex flex-col items-center justify-center rounded-lg cursor-pointer ${
                                selectedDate === dStr
                                  ? `${COLORS.primary} text-white`
                                  : "hover:bg-stone-100"
                              }`}
                            >
                              <span className="text-xs font-bold">{d}</span>
                              <div className="h-1">
                                {hasAppt && selectedDate !== dStr && (
                                  <div className="w-1 h-1 bg-[#C5A289] rounded-full" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {dailyAppts.length === 0 ? (
                      <div className="text-center py-10 text-stone-400">
                        尚無預約
                      </div>
                    ) : (
                      dailyAppts.map((appt) => (
                        <div key={appt.id} className="flex gap-4 group">
                          <div className="w-16 pt-2 text-center text-sm font-bold text-[#8B5E3C]">
                            {appt.startTime}
                            <br />
                            <span className="text-xs text-stone-400 font-normal">
                              |
                            </span>
                            <br />
                            {appt.endTime}
                          </div>
                          <div
                            className={`flex-1 bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#C5A289] ${
                              appt.status === "completed" ? "opacity-60" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">
                                  {appt.customerName}
                                </h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {appt.items.map((i, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600"
                                    >
                                      {i.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {appt.status !== "completed" && (
                                <button
                                  onClick={() => startCheckout(appt)}
                                  className="bg-[#C5A289] text-white px-3 py-1 rounded text-xs font-bold shadow"
                                >
                                  結帳
                                </button>
                              )}
                              {appt.status === "completed" && (
                                <CheckCircle
                                  size={16}
                                  className="text-[#C5A289]"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 2. 營收帳本 */}
          {(view === "sales_daily" ||
            view === "sales_stats" ||
            view === "sales_month_detail") && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex gap-2">
                  <Receipt /> 營收帳本
                </h2>
              </div>
              <div className="flex bg-stone-100 p-1 rounded-xl mb-4">
                <button
                  onClick={() => {
                    setView("sales_daily");
                    setSelectedStatsCategory(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                    view === "sales_daily"
                      ? "bg-white shadow text-[#8B5E3C]"
                      : "text-stone-400"
                  }`}
                >
                  日營收
                </button>
                <button
                  onClick={() => {
                    setView("sales_stats");
                    setStatsMode("month");
                    setStatsTargetMonth(getToday().slice(0, 7));
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                    view === "sales_stats" && statsMode === "month"
                      ? "bg-white shadow text-[#8B5E3C]"
                      : "text-stone-400"
                  }`}
                >
                  當月
                </button>
                <button
                  onClick={() => {
                    setView("sales_stats");
                    setStatsMode("year");
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                    view === "sales_stats" && statsMode === "year"
                      ? "bg-white shadow text-[#8B5E3C]"
                      : "text-stone-400"
                  }`}
                >
                  年度
                </button>
              </div>

              {view === "sales_daily" && (
                <>
                  <div
                    className={`${COLORS.cardBg} p-4 rounded-2xl shadow-sm border border-stone-200 mb-4`}
                  >
                    <div className="flex justify-between mb-4">
                      <button onClick={() => changeSalesMonth(-1)}>
                        <ChevronLeft />
                      </button>
                      <span className="font-bold">
                        {salesCalendarDate.getFullYear()} /{" "}
                        {salesCalendarDate.getMonth() + 1}
                      </span>
                      <button onClick={() => changeSalesMonth(1)}>
                        <ChevronRight />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 text-center gap-1">
                      {Array(getMonthData(salesCalendarDate).daysInMonth)
                        .fill(0)
                        .map((_, i) => {
                          const d = i + 1;
                          const dStr = `${salesCalendarDate.getFullYear()}-${String(
                            salesCalendarDate.getMonth() + 1
                          ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                          const hasSale = salesCalendarDots[dStr];
                          return (
                            <div
                              key={d}
                              onClick={() => setSalesLedgerDate(dStr)}
                              className={`h-8 flex items-center justify-center rounded-full text-xs cursor-pointer ${
                                salesLedgerDate === dStr
                                  ? "bg-[#C5A289] text-white"
                                  : "text-stone-600"
                              }`}
                            >
                              {d}
                              {hasSale && salesLedgerDate !== dStr && (
                                <div className="w-1 h-1 bg-yellow-500 rounded-full absolute mt-4" />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mb-2 px-2">
                    <span className="text-stone-500 font-bold">
                      {salesLedgerDate}
                    </span>
                    <span className="text-2xl font-bold text-[#8B5E3C]">
                      {formatCurrency(dailyRevenue)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dailySales.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-stone-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            onClick={() => {
                              setSelectedCustomerId(r.customerId);
                              setView("detail");
                            }}
                            className="font-bold text-lg underline decoration-[#C5A289]"
                          >
                            {r.customerName}
                          </span>
                          <div className="flex gap-2 items-center">
                            <span className="font-bold text-[#8B5E3C]">
                              {formatCurrency(r.finalAmount)}
                            </span>
                            <button onClick={() => handleEditVisit(r)}>
                              <Edit size={14} className="text-stone-300" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-[#FAF7F5] p-2 rounded text-sm text-stone-600 space-y-1">
                          {r.items.map((i, idx) => (
                            <div
                              key={idx}
                              className="pb-1 border-b border-stone-200 last:border-0"
                            >
                              <div className="flex justify-between">
                                <span>
                                  {i.name}{" "}
                                  {i.discountRate < 1 && (
                                    <span className="text-xs text-rose-500">
                                      ({i.discountRate * 10}折)
                                    </span>
                                  )}
                                </span>
                                <span>{formatCurrency(i.finalPrice)}</span>
                              </div>
                              {i.note && (
                                <div className="text-xs text-stone-500 mt-1">
                                  備註：{i.note}
                                </div>
                              )}
                            </div>
                          ))}
                          {r.discountDetail && (
                            <div className="text-xs text-rose-500 pt-1 border-t border-rose-100 mt-1">
                              折扣: {r.discountDetail}
                            </div>
                          )}
                          {r.prepaidDeduction > 0 && (
                            <div className="flex justify-between text-teal-600">
                              <span>儲值扣</span>
                              <span>-{r.prepaidDeduction}</span>
                            </div>
                          )}
                        </div>
                        {/* ★ 顯示消費紀錄圖片縮圖（從 IndexedDB cache 讀取） */}
                        {r.imageIds && r.imageIds.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {r.imageIds.map((imgId) => {
                              const img = imageCache[imgId];
                              if (!img) return null;
                              return (
                                <img
                                  key={imgId}
                                  src={img.data}
                                  alt="紀錄圖片"
                                  onClick={() => setPreviewImage(img.data)}
                                  className="w-14 h-14 object-cover rounded-lg cursor-pointer border-2 border-[#E6DCD3] hover:border-[#C5A289] transition-all"
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === "sales_stats" && (
                <div className="space-y-4">
                  {statsMode === "month" ? (
                    <>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                        <button
                          onClick={() => {
                            const d = new Date(statsTargetMonth);
                            d.setMonth(d.getMonth() - 1);
                            setStatsTargetMonth(
                              `${d.getFullYear()}-${String(
                                d.getMonth() + 1
                              ).padStart(2, "0")}`
                            );
                            setSelectedStatsCategory(null);
                          }}
                        >
                          <ChevronLeft />
                        </button>
                        <h3 className="font-bold text-lg">
                          {statsTargetMonth} 營收排行
                        </h3>
                        <button
                          onClick={() => {
                            const d = new Date(statsTargetMonth);
                            d.setMonth(d.getMonth() + 1);
                            setStatsTargetMonth(
                              `${d.getFullYear()}-${String(
                                d.getMonth() + 1
                              ).padStart(2, "0")}`
                            );
                            setSelectedStatsCategory(null);
                          }}
                        >
                          <ChevronRight />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                          <div className="text-xs text-stone-400">總營收</div>
                          <div className="font-bold text-[#8B5E3C]">
                            {formatCurrency(
                              reportData.targetMonthData.totalRevenue
                            )}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                          <div className="text-xs text-stone-400">來客數</div>
                          <div className="font-bold">
                            {reportData.targetMonthData.totalVisits}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                          <div className="text-xs text-stone-400">平均客單</div>
                          <div className="font-bold">
                            {formatCurrency(
                              reportData.targetMonthData.totalVisits
                                ? reportData.targetMonthData.totalRevenue /
                                    reportData.targetMonthData.totalVisits
                                : 0
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedStatsCategory ? (
                        <div className="animate-fade-in">
                          <button
                            onClick={() => setSelectedStatsCategory(null)}
                            className="mb-3 text-xs flex items-center gap-1 text-stone-500 font-bold bg-white px-3 py-2 rounded-lg shadow-sm border border-stone-100"
                          >
                            <ArrowLeft size={12} /> 返回排行
                          </button>
                          <h4 className="font-bold mb-3">
                            {selectedStatsCategory} 明細
                          </h4>
                          <div className="space-y-2">
                            {reportData.targetMonthData.categoryBreakdown[
                              selectedStatsCategory
                            ]?.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm"
                              >
                                <div>
                                  <div className="font-bold text-sm">
                                    {item.customer}
                                  </div>
                                  <div className="text-xs text-stone-500">
                                    {item.item}
                                  </div>
                                  <div className="text-[10px] text-stone-400">
                                    {item.date}
                                  </div>
                                </div>
                                <div className="font-bold text-[#8B5E3C]">
                                  {formatCurrency(item.amount)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-bold text-stone-400 mt-2 mb-2">
                            營收項目排行 (點擊查看明細)
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.values(
                              reportData.targetMonthData.categoryBreakdown
                            )
                              .sort((a, b) => b.revenue - a.revenue)
                              .map((cat, idx) => (
                                <div
                                  key={cat.name}
                                  onClick={() =>
                                    setSelectedStatsCategory(cat.name)
                                  }
                                  className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 cursor-pointer hover:border-[#C5A289] transition-all relative overflow-hidden group"
                                >
                                  <div className="absolute top-0 right-0 bg-[#E6DCD3] text-[#8B5E3C] text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                    #{idx + 1}
                                  </div>
                                  <div className="text-sm font-bold text-stone-600 mb-1">
                                    {cat.name}
                                  </div>
                                  <div className="font-bold text-lg text-[#8B5E3C]">
                                    {formatCurrency(cat.revenue)}
                                  </div>
                                  <div className="flex justify-between items-end mt-1">
                                    <div className="text-[10px] text-stone-400">
                                      {cat.count} 筆
                                    </div>
                                    <div className="text-[10px] text-stone-300 group-hover:text-[#C5A289]">
                                      <ChevronRight size={14} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {Object.keys(
                              reportData.targetMonthData.categoryBreakdown
                            ).length === 0 && (
                              <div className="col-span-2 text-center text-stone-400 py-4 text-sm">
                                本月尚無營收資料
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      <div className="mt-8 pt-4 border-t border-stone-200">
                        <h4 className="text-xs font-bold text-stone-400 uppercase mb-3 flex items-center gap-1">
                          <History size={12} /> 歷史月份紀錄
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {Object.keys(reportData.yearlyData)
                            .filter((k) => reportData.yearlyData[k].revenue > 0)
                            .sort((a, b) => b.localeCompare(a))
                            .map((key) => {
                              const m = reportData.yearlyData[key];
                              return (
                                <div
                                  key={key}
                                  className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50"
                                  onClick={() => setStatsTargetMonth(key)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-600">
                                      {key}
                                    </span>
                                    {key === statsTargetMonth && (
                                      <span className="text-[10px] bg-[#C5A289] text-white px-1.5 py-0.5 rounded">
                                        當前
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-[#8B5E3C]">
                                      {formatCurrency(m.revenue)}
                                    </span>
                                    <ChevronRight
                                      size={14}
                                      className="text-stone-300"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          {Object.keys(reportData.yearlyData).filter(
                            (k) => reportData.yearlyData[k].revenue > 0
                          ).length === 0 && (
                            <div className="text-center text-xs text-stone-300">
                              尚無歷史紀錄
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center mb-6 py-6 bg-white rounded-2xl shadow-sm border border-stone-100">
                        <div className="text-sm text-stone-400 font-bold mb-1">
                          年度總營收
                        </div>
                        <span className="text-4xl font-bold text-[#8B5E3C]">
                          {formatCurrency(reportData.yearlyTotal)}
                        </span>
                        <div
                          className={`text-xs font-bold mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                            reportData.yearGrowth >= 0
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {reportData.yearGrowth >= 0 ? (
                            <TrendingUp size={12} />
                          ) : (
                            <TrendingDown size={12} />
                          )}
                          {reportData.yearGrowth}% (YoY)
                        </div>
                        <div className="text-[10px] text-stone-300 mt-1">
                          相較去年成長
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                        <h4 className="text-xs font-bold text-stone-400 mb-4">
                          月營收走勢
                        </h4>
                        <div className="h-40 flex items-end justify-between gap-2 border-b border-stone-200 pb-2 relative">
                          {Object.values(reportData.yearlyData).map((m, i) => {
                            const allRevs = Object.values(
                              reportData.yearlyData
                            ).map((x) => x.revenue);
                            const maxRev = Math.max(...allRevs, 10000);
                            const heightPercent = Math.min(
                              100,
                              Math.max(4, (m.revenue / maxRev) * 100)
                            );
                            return (
                              <div
                                key={i}
                                className="flex flex-col items-center gap-1 w-full group relative h-full justify-end"
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                  {formatCurrency(m.revenue)}
                                </div>
                                <div
                                  className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                                    m.revenue > 0
                                      ? "bg-[#C5A289]"
                                      : "bg-stone-100"
                                  }`}
                                  style={{ height: `${heightPercent}%` }}
                                ></div>
                                <span className="text-[10px] text-stone-400 mt-1">
                                  {i + 1}月
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.values(reportData.yearlyData).map((m, i) => (
                          <div
                            key={i}
                            className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center border border-stone-50"
                          >
                            <div>
                              <div className="font-bold text-[#8B5E3C]">
                                {m.name}
                              </div>
                              <div className="text-xs text-stone-400">
                                {m.visits} 人次
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                {formatCurrency(m.revenue)}
                              </div>
                              <div className="text-xs text-stone-400">
                                均單{" "}
                                {m.visits > 0
                                  ? formatCurrency(m.revenue / m.visits)
                                  : 0}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. 顧客列表 */}
          {view === "customers" && (
            <div className="animate-fade-in">
              <div className="flex gap-2 mb-4">
                <input
                  placeholder="搜尋..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-stone-200"
                />
                <button
                  onClick={() => {
                    setCustomerForm({});
                    setIsCustomerEditOpen(true);
                  }}
                  className="bg-[#C5A289] text-white p-3 rounded-xl"
                >
                  <Plus />
                </button>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="bg-stone-200 text-stone-600 p-3 rounded-xl"
                >
                  <FileJson />
                </button>
              </div>
              {isSyncing && customers.length === 0 ? (
                <div className="text-center py-10 text-stone-400 animate-pulse">
                  Google Sheet 同步中...
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCustomers.length === 0 && !isSyncing && (
                    <div className="text-center py-10 text-stone-300">
                      {sheetConfig.scriptUrl
                        ? "尚未建立顧客資料"
                        : "請點擊右上角設定 Google Sheet"}
                    </div>
                  )}
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setView("detail");
                      }}
                      className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-lg">{c.name}</div>
                        <div className="text-stone-400 text-sm">{c.phone}</div>
                      </div>
                      <ChevronRight className="text-stone-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. 顧客詳情 */}
          {view === "detail" && selectedCustomer.id && (
            <div className="animate-fade-in">
              <div className="flex justify-between mb-4">
                <div className="flex gap-3">
                  <button onClick={() => setView("customers")}>
                    <ArrowLeft />
                  </button>
                  <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                </div>
                <button
                  onClick={() => {
                    setCustomerForm(selectedCustomer);
                    setIsCustomerEditOpen(true);
                  }}
                  className="bg-stone-100 p-2 rounded-full"
                >
                  <Edit size={16} />
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 mb-4 space-y-3">
                <div className="flex items-center gap-3 text-stone-600">
                  <Phone size={16} className="text-[#C5A289]" />
                  <span className="font-medium">{selectedCustomer.phone}</span>
                </div>
                {/* ★ 生日後方顯示年齡 */}
                <div className="flex items-center gap-3 text-stone-600">
                  <Cake size={16} className="text-[#C5A289]" />
                  <span className="font-medium">
                    {selectedCustomer.birthday}
                  </span>
                  {selectedCustomer.birthday && (
                    <span className="text-xs bg-[#E6DCD3] text-[#8B5E3C] px-2 py-0.5 rounded-full font-bold">
                      {calculateAge(selectedCustomer.birthday)} 歲
                    </span>
                  )}
                  {isBirthdayMonth(selectedCustomer.birthday) && (
                    <span className="text-xs bg-rose-100 text-rose-500 px-2 rounded-full">
                      本月壽星 🎂
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-3 text-stone-500 bg-[#FAF7F5] p-3 rounded-xl">
                  <FileText size={16} className="mt-0.5" />
                  <span className="text-sm">
                    {selectedCustomer.notes || "尚無備註"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <div
                  onClick={() => setIsTicketHistoryOpen(true)}
                  className="flex-1 bg-amber-50 p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-amber-100 border border-amber-100"
                >
                  <span className="text-xs text-amber-700 font-bold">
                    介紹券
                  </span>
                  <div className="flex items-center gap-1 text-amber-800 font-bold text-lg">
                    <Ticket size={16} /> {selectedCustomer.referralTickets || 0}
                  </div>
                </div>
                <div
                  onClick={() => setIsRecommendListOpen(true)}
                  className="flex-1 bg-blue-50 p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-100 border border-blue-100"
                >
                  <span className="text-xs text-blue-700 font-bold">
                    已推薦
                  </span>
                  <div className="flex items-center gap-1 text-blue-800 font-bold text-lg">
                    <UserPlus size={16} /> {recommendedByCustomer.length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div
                  onClick={() => {
                    setTopUpData({ type: "package", amount: "", note: "" });
                    setIsBalanceOpen(true);
                  }}
                  className="bg-indigo-50 p-3 rounded-xl text-indigo-800 cursor-pointer border border-indigo-100 relative overflow-hidden"
                >
                  <div className="text-xs opacity-70 font-bold mb-1">
                    剩餘課程
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedCustomer.packageBalance || 0}
                  </div>
                  <Plus
                    className="absolute bottom-2 right-2 opacity-20"
                    size={32}
                  />
                </div>
                <div
                  onClick={() => {
                    setTopUpData({ type: "prepaid", amount: "", note: "" });
                    setIsBalanceOpen(true);
                  }}
                  className="bg-teal-50 p-3 rounded-xl text-teal-800 cursor-pointer border border-teal-100 relative overflow-hidden"
                >
                  <div className="text-xs opacity-70 font-bold mb-1">
                    儲值金
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedCustomer.prepaidBalance || 0)}
                  </div>
                  <Plus
                    className="absolute bottom-2 right-2 opacity-20"
                    size={32}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">消費紀錄</h3>
                <button
                  onClick={openEmptyCheckout}
                  className="text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#C5A289] hover:text-white transition-colors"
                >
                  <Plus size={14} /> 新增紀錄
                </button>
              </div>
              <div className="space-y-3">
                {(selectedCustomer.visits || []).map((v) => (
                  <div
                    key={v.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 relative group"
                  >
                    <button
                      onClick={() => handleEditVisit(v)}
                      className="absolute top-2 right-2 p-1 text-stone-300 hover:text-[#C5A289] z-10"
                    >
                      <Edit size={14} />
                    </button>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-white bg-[#C5A289] px-2 py-0.5 rounded">
                        {v.date}
                      </span>
                      <span className="font-bold text-[#8B5E3C] mr-6">
                        {formatCurrency(v.finalAmount)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {v.items.map((i, idx) => (
                        <div
                          key={idx}
                          className="pb-1 border-b border-stone-50 last:border-0"
                        >
                          <div className="text-sm font-medium flex justify-between">
                            <span>
                              {i.name}{" "}
                              {i.discountRate < 1 && (
                                <span className="text-xs text-rose-500">
                                  ({i.discountRate * 10}折)
                                </span>
                              )}
                            </span>
                            <span className="text-stone-400">
                              {formatCurrency(i.finalPrice)}
                            </span>
                          </div>
                          {i.note && (
                            <div className="text-xs text-stone-500 mt-1">
                              備註：{i.note}
                            </div>
                          )}
                        </div>
                      ))}
                      {(v.discountDetail || v.discountReason) && (
                        <div className="text-xs text-rose-500 text-right">
                          折扣: {v.discountDetail || v.discountReason}
                        </div>
                      )}
                    </div>
                    {/* ★ 顯示消費紀錄圖片縮圖（從 IndexedDB cache 讀取，可點擊放大） */}
                    {v.imageIds && v.imageIds.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {v.imageIds.map((imgId) => {
                          const img = imageCache[imgId];
                          if (!img) return null;
                          return (
                            <div key={imgId} className="relative group/img">
                              <img
                                src={img.data}
                                alt="紀錄圖片"
                                onClick={() => setPreviewImage(img.data)}
                                className="w-16 h-16 object-cover rounded-xl cursor-pointer border-2 border-[#E6DCD3] hover:border-[#C5A289] transition-all shadow-sm"
                              />
                              <div
                                onClick={() => setPreviewImage(img.data)}
                                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/img:opacity-100 rounded-xl cursor-pointer transition-opacity"
                              >
                                <ZoomIn size={18} className="text-white" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. 喚醒提醒 */}
          {view === "recall" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BellRing /> 年度回流提醒
                </h2>
              </div>

              {/* ★ 壽星名單：當月 + 下個月 */}
              <div className="bg-white rounded-2xl border border-rose-100 shadow-sm mb-5 overflow-hidden">
                <div className="bg-rose-50 px-4 py-2.5 flex items-center gap-2 border-b border-rose-100">
                  <Cake size={16} className="text-rose-400" />
                  <span className="text-sm font-bold text-rose-600">
                    壽星名單
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  {/* 當月壽星 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-white bg-rose-400 px-2 py-0.5 rounded-full">
                        🎂 {birthdayList.thisMonthLabel} 壽星
                      </span>
                    </div>
                    {birthdayList.thisMonth.length === 0 ? (
                      <div className="text-xs text-stone-300 pl-1">
                        本月無壽星
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {birthdayList.thisMonth.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setView("detail");
                            }}
                            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors"
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] text-rose-400 font-normal">
                              {new Date(c.birthday).getDate()}日
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 下個月壽星 */}
                  <div className="pt-2 border-t border-stone-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-white bg-amber-400 px-2 py-0.5 rounded-full">
                        🎁 {birthdayList.nextMonthLabel} 壽星
                      </span>
                    </div>
                    {birthdayList.nextMonth.length === 0 ? (
                      <div className="text-xs text-stone-300 pl-1">
                        下月無壽星
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {birthdayList.nextMonth.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setView("detail");
                            }}
                            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors"
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] text-amber-400 font-normal">
                              {new Date(c.birthday).getDate()}日
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-6 border border-stone-100 rounded-xl p-3 bg-white max-h-60 overflow-y-auto">
                <label className="text-xs font-bold text-stone-400 mb-2 block">
                  點擊項目查詢
                </label>
                {SERVICE_MENU.map((cat) => (
                  <div
                    key={cat.category}
                    className="border-b border-stone-50 last:border-0"
                  >
                    <div
                      className="p-2 bg-stone-50 flex justify-between items-center cursor-pointer font-bold text-xs text-stone-600 rounded-lg hover:bg-stone-100"
                      onClick={() =>
                        setRecallCategoryExpanded((p) => ({
                          ...p,
                          [cat.category]: !p[cat.category],
                        }))
                      }
                    >
                      {cat.category}{" "}
                      {recallCategoryExpanded[cat.category] ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </div>
                    {recallCategoryExpanded[cat.category] && (
                      <div className="p-2 grid grid-cols-2 gap-2">
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setRecallServiceId(item.id)}
                            className={`p-2 text-xs border rounded-lg transition-colors text-left ${
                              recallServiceId === item.id
                                ? "bg-[#E6DCD3] border-[#C5A289] text-[#8B5E3C]"
                                : "hover:bg-stone-50"
                            }`}
                          >
                            <div>{item.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {recallList.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setView("detail");
                    }}
                    className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-bold text-lg">{c.name}</span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 rounded-full">
                          {formatDaysAgo(c.daysAgo)}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                        <div className="flex justify-between">
                          <span>{c.itemInfo?.name}</span>
                          <span>{formatCurrency(c.itemInfo?.finalPrice)}</span>
                        </div>
                        <div className="text-stone-400 mt-1">
                          {c.lastVisit.date}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-stone-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Modals --- */}

        {/* 券務中心 */}
        {isTicketHistoryOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Ticket className="text-amber-500" /> 介紹券管理
                </h3>
                <button onClick={() => setIsTicketHistoryOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl text-center mb-4 border border-amber-100">
                <div className="text-xs text-amber-700 font-bold mb-1">
                  目前持有
                </div>
                <div className="text-3xl font-bold text-amber-800">
                  {selectedCustomer.referralTickets || 0} 張
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleTicketUpdate(1, "手動新增")}
                  className="flex-1 bg-stone-100 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-200"
                >
                  + 手動補發
                </button>
                <button
                  onClick={() => handleTicketUpdate(-1, "手動扣除")}
                  className="flex-1 bg-stone-100 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-200"
                >
                  - 手動扣除
                </button>
              </div>
              <div className="text-xs font-bold text-stone-400 mb-2">
                異動紀錄
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {ticketHistory.map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b border-stone-50 pb-2"
                  >
                    <div>
                      <div className="text-stone-800">{t.note}</div>
                      <div className="text-xs text-stone-400">{t.date}</div>
                    </div>
                    <div
                      className={`font-bold ${
                        t.type === "add" ? "text-teal-600" : "text-red-500"
                      }`}
                    >
                      {t.type === "add" ? "+" : "-"}
                      {t.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 推薦名單 */}
        {isRecommendListOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <UserPlus className="text-blue-500" /> 推薦名單
                </h3>
                <button onClick={() => setIsRecommendListOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {recommendedByCustomer.length === 0 ? (
                  <div className="text-center py-4 text-stone-400 text-sm">
                    尚無推薦紀錄
                  </div>
                ) : (
                  recommendedByCustomer.map((c) => (
                    <div
                      key={c.id}
                      className="bg-stone-50 p-3 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-stone-400">{c.phone}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 新增預約 */}
        {isApptOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-2xl animate-slide-up space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg">新增預約</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-400">
                    日期
                  </label>
                  <input
                    type="date"
                    value={newAppt.date}
                    onChange={(e) =>
                      setNewAppt({ ...newAppt, date: e.target.value })
                    }
                    className="w-full p-2 bg-stone-100 rounded-lg"
                  />
                </div>
                <div className="flex gap-1">
                  <div>
                    <label className="text-xs font-bold text-stone-400">
                      開始
                    </label>
                    <input
                      type="time"
                      value={newAppt.startTime}
                      onChange={(e) =>
                        setNewAppt({ ...newAppt, startTime: e.target.value })
                      }
                      className="w-full p-2 bg-stone-100 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-400">
                      結束
                    </label>
                    <input
                      type="time"
                      value={newAppt.endTime}
                      onChange={(e) =>
                        setNewAppt({ ...newAppt, endTime: e.target.value })
                      }
                      className="w-full p-2 bg-stone-100 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-stone-400">
                  顧客 (輸入搜尋或下拉)
                </label>
                {newAppt.customerId ? (
                  <div className="flex justify-between p-2 bg-[#E6DCD3] rounded-lg font-bold text-[#8B5E3C]">
                    <span>{newAppt.customerName}</span>
                    <button
                      onClick={() =>
                        setNewAppt({
                          ...newAppt,
                          customerId: "",
                          customerName: "",
                        })
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        placeholder="輸入姓名或電話搜尋..."
                        value={apptSearchTerm}
                        onChange={(e) => {
                          setApptSearchTerm(e.target.value);
                          setShowApptSearchList(true);
                        }}
                        className="w-full p-2 bg-stone-100 rounded-lg"
                      />
                      {showApptSearchList && apptSearchTerm && (
                        <div className="absolute bg-white border w-full mt-1 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                          {apptCustomerSuggestions.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setNewAppt({
                                  ...newAppt,
                                  customerId: c.id,
                                  customerName: c.name,
                                });
                                setApptSearchTerm("");
                                setShowApptSearchList(false);
                              }}
                              className="p-3 hover:bg-stone-50 border-b border-stone-50"
                            >
                              {c.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <select
                      onChange={(e) => {
                        const c = customers.find(
                          (x) => x.id === e.target.value
                        );
                        if (c)
                          setNewAppt({
                            ...newAppt,
                            customerId: c.id,
                            customerName: c.name,
                          });
                      }}
                      className="w-full p-2 bg-stone-100 rounded-lg text-sm"
                    >
                      <option value="">或從列表選擇...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400 mb-1 block">
                  項目 (多選)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newAppt.items.map((i, idx) => (
                    <span
                      key={idx}
                      className="bg-[#C5A289] text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      {i.name}{" "}
                      <X
                        size={12}
                        onClick={() =>
                          setNewAppt((p) => ({
                            ...p,
                            items: p.items.filter((x) => x.name !== i.name),
                          }))
                        }
                      />
                    </span>
                  ))}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-stone-100 rounded-lg p-2">
                  {SERVICE_MENU.map((cat) => (
                    <div
                      key={cat.category}
                      className="border-b border-stone-50 last:border-0"
                    >
                      <div
                        className="p-2 bg-stone-50 flex justify-between items-center cursor-pointer font-bold text-xs text-stone-600"
                        onClick={() =>
                          setApptCategoryExpanded((p) => ({
                            ...p,
                            [cat.category]: !p[cat.category],
                          }))
                        }
                      >
                        {cat.category}{" "}
                        {apptCategoryExpanded[cat.category] ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </div>
                      {apptCategoryExpanded[cat.category] && (
                        <div className="p-2 grid grid-cols-2 gap-2">
                          {cat.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => toggleApptItem(item)}
                              className={`p-1.5 text-xs border rounded hover:bg-[#E6DCD3] transition-colors text-left ${
                                newAppt.items.some((i) => i.name === item.name)
                                  ? "bg-[#E6DCD3] border-[#C5A289] text-[#8B5E3C]"
                                  : ""
                              }`}
                            >
                              <div>{item.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsApptOpen(false)}
                  className="flex-1 py-3 bg-stone-100 rounded-xl font-bold"
                >
                  取消
                </button>
                <button
                  onClick={handleApptSave}
                  className="flex-1 py-3 bg-[#C5A289] text-white rounded-xl font-bold"
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 結帳單 */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4">
            <div className="bg-white w-full max-w-md h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-slide-up">
              <div className="p-4 bg-[#FAF7F5] flex justify-between items-center border-b border-stone-200">
                <h3 className="font-bold text-lg">結帳單</h3>
                <button onClick={() => setIsCheckoutOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={checkoutData.date}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, date: e.target.value })
                    }
                    className="bg-stone-100 p-2 rounded-lg text-sm font-bold"
                  />
                  <div
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setSelectedCustomerId(checkoutData.customerId);
                      setView("detail");
                    }}
                    className="flex-1 bg-stone-100 p-2 rounded-lg font-bold text-center text-[#8B5E3C] cursor-pointer hover:bg-[#E6DCD3]"
                  >
                    {
                      customers.find((c) => c.id === checkoutData.customerId)
                        ?.name
                    }{" "}
                    (點擊查看)
                  </div>
                </div>

                {/* 購買項目列表 */}
                <div className="space-y-2">
                  {checkoutData.items.map((item, idx) => (
                    <div
                      key={item.uniqueId}
                      className="border border-stone-200 rounded-xl p-3 relative bg-white shadow-sm"
                    >
                      <button
                        onClick={() => removeItemFromCart(item.uniqueId)}
                        className="absolute top-2 right-2 text-stone-300"
                      >
                        <X size={16} />
                      </button>
                      <div className="flex justify-between font-bold mb-2 items-center">
                        <span className="text-[#5C4B41]">{item.name}</span>
                        <div className="text-right">
                          {item.discountRate < 1 && (
                            <span className="line-through text-stone-300 text-xs mr-1">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                          <span className="text-[#C5A289] text-lg">
                            {formatCurrency(item.finalPrice)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="number"
                          placeholder="自訂"
                          value={item.finalPrice}
                          onChange={(e) =>
                            updateItemCustomPrice(item.uniqueId, e.target.value)
                          }
                          className="w-16 p-1 text-xs border rounded text-center"
                        />
                        <div className="flex gap-1 flex-1 justify-end">
                          {[0.95, 0.9, 0.85].map((r) => (
                            <button
                              key={r}
                              onClick={() =>
                                updateItemDiscount(item.uniqueId, r)
                              }
                              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                                item.discountRate === r
                                  ? "bg-[#FDF2F2] text-[#E57373] border-[#FCDCDC] font-bold"
                                  : "text-stone-400 border-stone-100"
                              }`}
                            >
                              {r * 100}折
                            </button>
                          ))}
                          <button
                            onClick={() => updateItemDiscount(item.uniqueId, 1)}
                            className={`text-[10px] px-2 py-1 rounded border ${
                              item.discountRate === 1
                                ? "bg-stone-100 text-stone-600 font-bold"
                                : "text-stone-300"
                            }`}
                          >
                            原價
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          placeholder="操作備註"
                          value={item.note || ""}
                          onChange={(e) =>
                            updateItemNote(item.uniqueId, e.target.value)
                          }
                          className="flex-1 bg-stone-50 p-1.5 rounded text-xs border-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ★ 圖片上傳區 */}
                <div className="border border-dashed border-stone-200 rounded-xl p-3 bg-stone-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-400 flex items-center gap-1">
                      <Image size={13} /> 施作圖片紀錄
                    </label>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="text-xs bg-[#C5A289] text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1"
                    >
                      <Plus size={12} /> 上傳
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {(checkoutData.imageIds || []).length > 0 ? (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {(checkoutData.imageIds || []).map((imgId) => {
                        const img = imageCache[imgId];
                        if (!img)
                          return (
                            <div
                              key={imgId}
                              className="w-20 h-20 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 text-xs"
                            >
                              載入中
                            </div>
                          );
                        return (
                          <div key={imgId} className="relative group/img">
                            <img
                              src={img.data}
                              alt="施作圖"
                              onClick={() => setPreviewImage(img.data)}
                              className="w-20 h-20 object-cover rounded-xl cursor-pointer border-2 border-[#E6DCD3] hover:border-[#C5A289] transition-all"
                            />
                            <button
                              onClick={() => removeCheckoutImage(imgId)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow"
                            >
                              <X size={10} />
                            </button>
                            <div
                              onClick={() => setPreviewImage(img.data)}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/img:opacity-100 rounded-xl cursor-pointer transition-opacity"
                            >
                              <ZoomIn size={16} className="text-white" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="text-center py-3 text-stone-300 text-xs cursor-pointer hover:text-stone-400 transition-colors"
                    >
                      點擊或拖曳上傳圖片
                    </div>
                  )}
                </div>

                {/* V3 摺疊選單 */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="text-xs font-bold text-stone-400">
                    新增服務項目
                  </label>
                  {SERVICE_MENU.map((cat) => (
                    <div
                      key={cat.category}
                      className="border border-stone-100 rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-3 bg-stone-50 flex justify-between items-center cursor-pointer font-bold text-sm text-[#8B5E3C]"
                        onClick={() =>
                          setCheckoutCategoryExpanded((p) => ({
                            ...p,
                            [cat.category]: !p[cat.category],
                          }))
                        }
                      >
                        {cat.category}{" "}
                        {checkoutCategoryExpanded[cat.category] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                      {checkoutCategoryExpanded[cat.category] && (
                        <div className="p-2 grid grid-cols-2 gap-2 bg-white">
                          {cat.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => addItemToCart(item)}
                              className="p-2 text-xs border rounded hover:bg-[#C5A289] hover:text-white transition-colors text-left flex justify-between group"
                            >
                              <span>{item.name}</span>
                              <span className="opacity-50 group-hover:opacity-100">
                                {formatCurrency(item.price)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border border-stone-100 rounded-lg p-3 bg-stone-50">
                    <div className="text-xs font-bold text-stone-400 mb-2">
                      + 自訂項目
                    </div>
                    <div className="flex gap-2">
                      <input
                        placeholder="名稱"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        className="flex-1 p-2 rounded border text-xs"
                      />
                      <input
                        placeholder="$"
                        type="number"
                        value={customItemPrice}
                        onChange={(e) => setCustomItemPrice(e.target.value)}
                        className="w-16 p-2 rounded border text-xs"
                      />
                      <button
                        onClick={addCustomItemToCart}
                        className="bg-[#C5A289] text-white p-2 rounded"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 結算區 */}
                <div className="bg-stone-50 p-4 rounded-xl space-y-3 border border-stone-100">
                  <div className="flex justify-between text-stone-500 text-sm border-b border-stone-200 pb-2">
                    <span>小計</span>
                    <span>
                      {formatCurrency(
                        checkoutData.items.reduce((s, i) => s + i.finalPrice, 0)
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {isBirthdayMonth(
                      customers.find((c) => c.id === checkoutData.customerId)
                        ?.birthday
                    ) ? (
                      <div
                        onClick={() =>
                          setCheckoutData((p) => ({
                            ...p,
                            useBirthday: !p.useBirthday,
                          }))
                        }
                        className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                          checkoutData.useBirthday
                            ? "bg-rose-50 border-rose-300 text-rose-600"
                            : "bg-white border-stone-200 text-stone-400"
                        }`}
                      >
                        <Cake size={16} />{" "}
                        <span className="text-xs font-bold">生日禮 (-200)</span>{" "}
                        {checkoutData.useBirthday && <CheckCircle size={14} />}
                      </div>
                    ) : (
                      <div className="p-2 rounded border bg-stone-100 text-stone-300 text-xs flex items-center justify-center">
                        非壽星
                      </div>
                    )}
                    {customers.find((c) => c.id === checkoutData.customerId)
                      ?.referralTickets > 0 ? (
                      <div
                        onClick={() =>
                          setCheckoutData((p) => ({
                            ...p,
                            useReferral: !p.useReferral,
                          }))
                        }
                        className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                          checkoutData.useReferral
                            ? "bg-amber-50 border-amber-300 text-amber-600"
                            : "bg-white border-stone-200 text-stone-400"
                        }`}
                      >
                        <Ticket size={16} />{" "}
                        <span className="text-xs font-bold">
                          介紹券 (剩
                          {
                            customers.find(
                              (c) => c.id === checkoutData.customerId
                            )?.referralTickets
                          }
                          )
                        </span>{" "}
                        {checkoutData.useReferral && <CheckCircle size={14} />}
                      </div>
                    ) : (
                      <div className="p-2 rounded border bg-stone-100 text-stone-300 text-xs flex items-center justify-center">
                        無介紹券
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs font-bold text-stone-400 whitespace-nowrap">
                        額外折
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={checkoutData.discount}
                        onChange={(e) =>
                          setCheckoutData({
                            ...checkoutData,
                            discount: e.target.value,
                          })
                        }
                        className="w-full p-1.5 rounded text-right text-sm border border-stone-200"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs font-bold text-stone-400 whitespace-nowrap">
                        原因
                      </span>
                      <input
                        type="text"
                        placeholder="例: 活動"
                        value={checkoutData.discountReason}
                        onChange={(e) =>
                          setCheckoutData({
                            ...checkoutData,
                            discountReason: e.target.value,
                          })
                        }
                        className="w-full p-1.5 rounded text-right text-sm border border-stone-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500">
                        扣儲值金{" "}
                        <span className="text-[10px] text-stone-400 font-normal">
                          (餘:{" "}
                          {formatCurrency(
                            customers.find(
                              (c) => c.id === checkoutData.customerId
                            )?.prepaidBalance
                          )}
                          )
                        </span>
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={checkoutData.prepaidDed}
                        onChange={(e) =>
                          setCheckoutData({
                            ...checkoutData,
                            prepaidDed: e.target.value,
                          })
                        }
                        className="w-24 p-1 rounded text-right text-sm border border-stone-200 text-teal-600 font-bold"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500">
                        扣課程{" "}
                        <span className="text-[10px] text-stone-400 font-normal">
                          (餘:{" "}
                          {
                            customers.find(
                              (c) => c.id === checkoutData.customerId
                            )?.packageBalance
                          }
                          )
                        </span>
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={checkoutData.packageDed}
                        onChange={(e) =>
                          setCheckoutData({
                            ...checkoutData,
                            packageDed: e.target.value,
                          })
                        }
                        className="w-24 p-1 rounded text-right text-sm border border-stone-200 text-indigo-600 font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-2 border-t border-stone-300 mt-2">
                    <span>實收</span>
                    <span className="text-[#C5A289]">
                      {formatCurrency(calculateCartTotal())}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-stone-200 bg-white flex gap-2">
                {editingVisitId && (
                  <button
                    onClick={() =>
                      handleDeleteVisit(editingVisitId, checkoutData.customerId)
                    }
                    className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-bold shadow-sm border border-red-100"
                  >
                    刪除此紀錄
                  </button>
                )}
                <button
                  onClick={handleCheckoutSave}
                  className="flex-1 bg-[#C5A289] text-white py-3 rounded-xl font-bold shadow-lg text-lg"
                >
                  確認/儲存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 儲值紀錄 */}
        {isBalanceOpen && (
          <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-slide-up">
              <div className="bg-[#C5A289] p-4 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <History size={18} /> 紀錄
                </h3>
                <button onClick={() => setIsBalanceOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-stone-100 bg-[#FAF7F5]">
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="數量"
                    value={topUpData.amount}
                    onChange={(e) =>
                      setTopUpData({ ...topUpData, amount: e.target.value })
                    }
                    className="flex-1 p-2 rounded border border-stone-200"
                  />
                  <button
                    onClick={handleTopUpSave}
                    className="bg-[#C5A289] text-white px-4 rounded font-bold"
                  >
                    新增
                  </button>
                </div>
                <input
                  placeholder="備註..."
                  value={topUpData.note}
                  onChange={(e) =>
                    setTopUpData({ ...topUpData, note: e.target.value })
                  }
                  className="w-full p-2 rounded border border-stone-200 text-sm"
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {balanceHistory.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-3 border-b border-stone-50 text-sm"
                  >
                    <div>
                      <div className="text-xs text-stone-400">{h.date}</div>
                      <div>{h.note}</div>
                    </div>
                    <div
                      className={`font-bold ${
                        h.type === "add" ? "text-teal-600" : "text-red-500"
                      }`}
                    >
                      {h.type === "add" ? "+" : "-"}
                      {h.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 顧客編輯 ★ 加入刪除按鈕 */}
        {isCustomerEditOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">顧客資料</h3>
                {/* ★ 刪除顧客按鈕（僅編輯現有顧客時顯示） */}
                {customerForm.id && (
                  <button
                    onClick={() => {
                      setCustomerToDelete(customerForm);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors border border-red-100"
                  >
                    <Trash2 size={13} /> 刪除顧客
                  </button>
                )}
              </div>
              <input
                placeholder="姓名"
                value={customerForm.name || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, name: e.target.value })
                }
                className="w-full p-3 bg-stone-100 rounded-xl"
              />
              <input
                placeholder="電話"
                value={customerForm.phone || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, phone: e.target.value })
                }
                className="w-full p-3 bg-stone-100 rounded-xl"
              />
              <input
                type="date"
                value={customerForm.birthday || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, birthday: e.target.value })
                }
                className="w-full p-3 bg-stone-100 rounded-xl"
              />
              <div className="relative">
                <label className="text-xs font-bold text-stone-400">
                  推薦人
                </label>
                {customerForm.recommenderId ? (
                  <div className="flex justify-between p-3 bg-[#E6DCD3] rounded-xl font-bold">
                    <span>
                      {
                        customers.find(
                          (c) => c.id === customerForm.recommenderId
                        )?.name
                      }
                    </span>
                    <button
                      onClick={() =>
                        setCustomerForm({ ...customerForm, recommenderId: "" })
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      placeholder="搜尋..."
                      value={recommenderSearch}
                      onChange={(e) => {
                        setRecommenderSearch(e.target.value);
                        setShowRecommenderList(true);
                      }}
                      className="w-full p-3 bg-stone-100 rounded-xl"
                    />
                    {showRecommenderList && recommenderSearch && (
                      <div className="absolute bg-white border w-full mt-1 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                        {recommenderList.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCustomerForm({
                                ...customerForm,
                                recommenderId: c.id,
                              });
                              setRecommenderSearch("");
                              setShowRecommenderList(false);
                            }}
                            className="p-3 hover:bg-stone-50"
                          >
                            {c.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs font-bold text-stone-400">
                  介紹券
                </label>
                <button
                  onClick={() =>
                    setCustomerForm({
                      ...customerForm,
                      referralTickets: Math.max(
                        0,
                        (customerForm.referralTickets || 0) - 1
                      ),
                    })
                  }
                  className="p-1 bg-stone-200 rounded"
                >
                  -
                </button>
                <span>{customerForm.referralTickets || 0}</span>
                <button
                  onClick={() =>
                    setCustomerForm({
                      ...customerForm,
                      referralTickets: (customerForm.referralTickets || 0) + 1,
                    })
                  }
                  className="p-1 bg-stone-200 rounded"
                >
                  +
                </button>
              </div>
              <textarea
                placeholder="備註"
                value={customerForm.notes || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, notes: e.target.value })
                }
                className="w-full p-3 bg-stone-100 rounded-xl h-20"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCustomerEditOpen(false)}
                  className="flex-1 py-3 bg-stone-100 font-bold rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCustomer}
                  className="flex-1 py-3 bg-[#C5A289] text-white font-bold rounded-xl"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 匯入 */}
        {isImportOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-lg mb-2">
                匯入 JSON (上傳至 Google Sheet)
              </h3>
              <p className="text-xs text-stone-400 mb-2">
                將 JSON 貼於此處，系統將自動寫入 Google Sheet 資料庫。
              </p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full h-40 p-3 bg-stone-50 border rounded-xl mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="flex-1 py-3 bg-stone-100 rounded-xl font-bold"
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 bg-[#C5A289] text-white rounded-xl font-bold"
                >
                  開始上傳
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="fixed bottom-16 left-4 right-4 bg-stone-100/40 backdrop-blur shadow-lg rounded-2xl border border-white/40 p-2 flex justify-around z-50">
          <button
            onClick={() => {
              setView("customers");
              setActiveTab("customers");
            }}
            className={`flex flex-col items-center transition ${
              activeTab === "customers" ? "text-[#C5A289]" : "text-stone-400"
            }`}
          >
            <div
              className={`p-2 rounded-xl ${
                activeTab === "customers" ? "bg-[#F3ECE6]" : ""
              }`}
            >
              <Users size={24} />
            </div>
            <span className="text-[11px] font-bold mt-1">顧客</span>
          </button>
          <button
            onClick={() => {
              setView("sales_daily");
              setActiveTab("sales");
            }}
            className={`flex flex-col items-center transition ${
              activeTab === "sales" ? "text-[#C5A289]" : "text-stone-400"
            }`}
          >
            <div
              className={`p-2 rounded-xl ${
                activeTab === "sales" ? "bg-[#F3ECE6]" : ""
              }`}
            >
              <Receipt size={24} />
            </div>
            <span className="text-[11px] font-bold mt-1">帳本</span>
          </button>
          <button
            onClick={() => {
              setView("recall");
              setActiveTab("recall");
            }}
            className={`flex flex-col items-center transition ${
              activeTab === "recall" ? "text-[#C5A289]" : "text-stone-400"
            }`}
          >
            <div
              className={`p-2 rounded-xl ${
                activeTab === "recall" ? "bg-[#F3ECE6]" : ""
              }`}
            >
              <BellRing size={24} />
            </div>
            <span className="text-[11px] font-bold mt-1">提醒</span>
          </button>
        </div>
      </div>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap'); 
@import url('https://cdn.jsdelivr.net/gh/max32002/gensen-rounded-web/style.css');
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } 
.animate-fade-in { animation: fade-in 0.2s ease-out; } 
.animate-slide-up { animation: slide-up 0.3s ease-out; } 
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
a[href*="codesandbox.io"] { display: none !important; }
#csb-status { display: none !important; }
`}</style>
    </div>
  );
}
