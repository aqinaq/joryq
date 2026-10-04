import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Mountain,
  Compass,
  MapPin,
  Clock,
  Footprints,
  SlidersHorizontal,
  Check,
  Plus,
  X,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Backpack,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Minus,
  Layers,
} from "lucide-react";
import {
  tours,
  tourThemes,
  formatLabel,
  money,
  type Tour,
  type Lang,
  type Local,
} from "./data";
import { copy, steps, faqs } from "./i18n";
import TerrainMap from "./components/Map";
import { Modal } from "./components/Modal";
import credits from "./credits.json";
import { RouteMotion } from "./components/Motion";
import { Experiences } from "./components/Experiences";

type Filters = {
  direction: string;
  city: string;
  duration: string;
  format: string;
  budget: string;
};
const initialFilters: Filters = {
  direction: "",
  city: "",
  duration: "",
  format: "",
  budget: "",
};
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
const Context = createContext<ReturnType<typeof useAppState> | null>(null);
function useAppState() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem("joryq-language") === "ru" ? "ru" : "kk";
    } catch {
      return "kk";
    }
  });
  const [filters, setFilters] = useState<Filters>(() => ({
    ...initialFilters,
    ...read("joryq-filters", initialFilters),
  }));
  const [selected, setSelected] = useState<string[]>(() =>
    read<string[]>("joryq-compare", [])
      .filter((id) => tours.some((t) => t.id === id))
      .slice(0, 2),
  );
  const [active, setActive] = useState(() => read("joryq-active", "kolsai"));
  const [compareOpen, setCompareOpen] = useState(false),
    [booking, setBooking] = useState<string | null>(null),
    [helper, setHelper] = useState(false),
    [creditOpen, setCreditOpen] = useState(false),
    [notice, setNotice] = useState("");
  const [params, setParams] = useState<
    Record<string, { date: string; people: number }>
  >({});
  useEffect(() => {
    try {
      localStorage.setItem("joryq-language", lang);
    } catch {}
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    try {
      sessionStorage.setItem("joryq-filters", JSON.stringify(filters));
      sessionStorage.setItem("joryq-compare", JSON.stringify(selected));
      sessionStorage.setItem("joryq-active", JSON.stringify(active));
    } catch {}
  }, [filters, selected, active]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const tr = (v: Local) => v[lang];
  const t = (key: keyof typeof copy) => copy[key][lang];
  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length === 2) {
        setNotice(t("limit"));
        return prev;
      }
      return [...prev, id];
    });
  };
  return {
    lang,
    setLang,
    filters,
    setFilters,
    selected,
    setSelected,
    active,
    setActive,
    compareOpen,
    setCompareOpen,
    booking,
    setBooking,
    helper,
    setHelper,
    creditOpen,
    setCreditOpen,
    notice,
    params,
    setParams,
    tr,
    t,
    toggle,
  };
}
const useApp = () => useContext(Context)!;
function ThemeSync() {
  const { active } = useApp();
  const { pathname } = useLocation();
  const detailId = pathname.match(/^\/tours\/([^/]+)$/)?.[1];
  const theme = tourThemes[detailId || active] || tourThemes.kolsai;
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--paper", theme.paper);
    root.style.setProperty("--ink", theme.ink);
    root.style.setProperty("--green", theme.primary);
    root.style.setProperty("--lime", theme.accent);
    root.style.setProperty("--line", theme.line);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--hero-subtitle", theme.subtitle);
    root.style.setProperty("--route-color", theme.route);
    root.dataset.tourTheme = detailId || active;
  }, [active, detailId, theme]);
  return null;
}
function Language() {
  const { lang, setLang } = useApp();
  return (
    <div className="language" aria-label="Тіл / Язык">
      <button aria-pressed={lang === "kk"} onClick={() => setLang("kk")}>
        ҚАЗ
      </button>
      <span>/</span>
      <button aria-pressed={lang === "ru"} onClick={() => setLang("ru")}>
        РУС
      </button>
    </div>
  );
}
function Logo() {
  return (
    <Link className="logo" to="/" aria-label="JORYQ — басты бет">
      <Mountain strokeWidth={2.3} />
      <span>
        JORYQ<span className="logo-dot">®</span>
        <small>TRAVEL BEYOND THE EVERYDAY</small>
      </span>
    </Link>
  );
}
function Header() {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc]);
  return (
    <header className="header">
      <Logo />
      <nav className={open ? "nav open" : "nav"} aria-label="Main">
        <Link to="/#tours">{t("tours")}</Link>
        <Link to="/#experiences">
          {lang === "kk" ? "Сапарды сезін" : "Впечатления"}
        </Link>
        <Link to="/#how">{t("how")}</Link>
        <Link to="/#faq">{t("faq")}</Link>
      </nav>
      <div className="header-actions">
        <Language />
        <Link className="button small" to="/#tours">
          {t("choose")}
          <ArrowUpRight size={17} />
        </Link>
        <button
          className="menu-button icon-button"
          aria-label={open ? t("close") : t("tours")}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
function ScrollManager() {
  const { lang } = useApp();
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === "/")
      document.title =
        lang === "kk"
          ? "JORYQ — Демалысыңа жаңа бағыт"
          : "JORYQ — Твоему отдыху новый маршрут";
  }, [pathname, lang]);
  return null;
}
export default function App() {
  const state = useAppState();
  return (
    <Context.Provider value={state}>
      <ThemeSync />
      <Header />
      <RouteMotion
        home={<Home />}
        detail={<TourPage />}
        fallback={<NotFound />}
      >
        <ScrollManager />
      </RouteMotion>
      <Footer />
      {state.selected.length > 0 && <CompareBar />}
      {state.compareOpen && <CompareModal />}
      {state.booking && (
        <BookingModal tour={tours.find((t) => t.id === state.booking)!} />
      )}
      {state.helper && <Helper />}
      {state.creditOpen && <Credits />}
      {state.notice && (
        <div className="toast" role="status">
          {state.notice}
        </div>
      )}
    </Context.Provider>
  );
}
function Home() {
  const { active, lang, setActive } = useApp();
  const tour = tours.find((item) => item.id === active) || tours[0];
  return (
    <main>
      <Hero />
      <Catalog />
      <Experiences tour={tour} lang={lang} onSelect={setActive} />
      <Process />
      <Story />
      <FAQ />
    </main>
  );
}
function Hero() {
  const { t, tr, active, setActive, setHelper, lang } = useApp();
  const tour = tours.find((x) => x.id === active) || tours[0];
  return (
    <>
      <section className="hero">
        <TerrainMap tour={tour} lang={lang} hero />
        <div className="hero-wash" />
        <div className="map-topline">
          <span>
            <span className="live-dot" />
            {t("eyebrow")}
          </span>
          <span>
            {t("topo")}{" "}
            <span className="map-sheet">/ 0{tours.indexOf(tour) + 1} — 06</span>
          </span>
        </div>
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="little-line" />
            {lang === "kk"
              ? "ҮЛКЕН ӘСЕР. ЖАҚЫН БАҒЫТ."
              : "БОЛЬШИЕ ВПЕЧАТЛЕНИЯ. БЛИЗКИЕ МАРШРУТЫ."}
          </span>
          <h1>
            {t("hero1")}
            <br />
            <span>{t("hero2")}</span>
          </h1>
          <p>{t("intro")}</p>
          <a className="button hero-cta" href="#tours">
            {t("see")}
            <ArrowUpRight size={22} />
          </a>
          <button
            className="text-button help-link"
            onClick={() => setHelper(true)}
          >
            {t("help")}
            <ArrowRight size={15} />
          </button>
          <div className="hero-coordinates">
            <Compass size={17} />
            <span>43°14′ N &nbsp; 76°56′ E</span>
            <span className="coordinate-divider" />
            {lang === "kk"
              ? "ЖОЛ ОСЫ ЖЕРДЕН БАСТАЛАДЫ"
              : "ПУТЬ НАЧИНАЕТСЯ ЗДЕСЬ"}
          </div>
        </div>
        <div className="north-mark">
          <span>N</span>
          <Compass size={40} strokeWidth={1} />
        </div>
        <aside className="route-picker">
          <div className="route-picker-heading">
            <span>{t("routes")}</span>
            <span>01—06</span>
          </div>
          {tours.slice(0, 4).map((item, i) => (
            <button
              key={item.id}
              className={`route-option ${item.id === tour.id ? "active" : ""}`}
              onClick={() => setActive(item.id)}
              aria-pressed={item.id === tour.id}
            >
              <span className="route-number">0{i + 1}</span>
              <span>{tr(item.name)}</span>
              {item.id === tour.id ? (
                <ArrowUpRight size={17} />
              ) : (
                <span className="route-dot" />
              )}
            </button>
          ))}
          <div className="route-summary">
            <span>
              <Clock size={12} />
              {tour.days} {t("day")}
            </span>
            <span>
              <Footprints size={12} />
              {tour.distance} {lang === "kk" ? "км" : "км"}
            </span>
            <span>{money(tour.price)}</span>
          </div>
          <Link to={"/tours/" + tour.id} className="button route-button">
            {t("route")}
            <ArrowUpRight size={17} />
          </Link>
          <span className="route-demo">{t("demoNote")}</span>
        </aside>
        <div className="hero-bottom-note">
          <span>↗</span>{" "}
          {lang === "kk"
            ? "Карта шынайы. Маршрут сызығы — шартты."
            : "Карта настоящая. Линия маршрута — условная."}
        </div>
      </section>
      <QuickSearch />
      <div className="explore-strip">
        <span>
          <Mountain size={17} />
          {lang === "kk" ? "Тау. Көл. Дала. Сен." : "Горы. Озёра. Степь. Ты."}
        </span>
        <span>
          {t("allRoutes")}
          <span className="strip-dot" />
          {lang === "kk" ? "Өз қарқыныңмен" : "В своём ритме"}
          <span className="strip-dot" />
          MADE OF KAZAKHSTAN
        </span>
        <a href="#tours" aria-label={t("see")}>
          <ArrowDown size={18} />
        </a>
      </div>
    </>
  );
}
function SelectField({
  label,
  value,
  onChange,
  children,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <label className="select-field">
      <span>
        {icon}
        {label}
      </span>
      <div>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  );
}
function QuickSearch() {
  const { t, tr, filters, setFilters, lang } = useApp();
  const [draft, setDraft] = useState(filters);
  useEffect(() => setDraft(filters), [filters]);
  return (
    <form
      className="quick-search"
      onSubmit={(e) => {
        e.preventDefault();
        setFilters(draft);
        document
          .getElementById("tours")
          ?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <SelectField
        label={t("direction")}
        value={draft.direction}
        onChange={(v) => setDraft({ ...draft, direction: v })}
        icon={<MapPin size={15} />}
      >
        <option value="">
          {lang === "kk" ? "Қайда барғың келеді?" : "Куда хочешь поехать?"}
        </option>
        {tours.map((x) => (
          <option value={x.id} key={x.id}>
            {tr(x.name)}
          </option>
        ))}
      </SelectField>
      <SelectField
        label={t("duration")}
        value={draft.duration}
        onChange={(v) => setDraft({ ...draft, duration: v })}
        icon={<Clock size={15} />}
      >
        <option value="">{t("any")}</option>
        {[1, 2, 3].map((x) => (
          <option key={x} value={x}>
            {x} {t("day")}
          </option>
        ))}
      </SelectField>
      <SelectField
        label={t("format")}
        value={draft.format}
        onChange={(v) => setDraft({ ...draft, format: v })}
        icon={<Footprints size={15} />}
      >
        <option value="">{t("all")}</option>
        {Object.entries(formatLabel).map(([k, v]) => (
          <option key={k} value={k}>
            {tr(v)}
          </option>
        ))}
      </SelectField>
      <button className="button dark" type="submit">
        {t("search")}
        <ArrowUpRight size={19} />
      </button>
    </form>
  );
}
function FilterFields() {
  const { t, tr, filters, setFilters } = useApp();
  const set = (k: keyof Filters, v: string) =>
    setFilters({ ...filters, [k]: v });
  return (
    <>
      <SelectField
        label={t("direction")}
        value={filters.direction}
        onChange={(v) => set("direction", v)}
      >
        <option value="">{t("all")}</option>
        {tours.map((x) => (
          <option value={x.id} key={x.id}>
            {tr(x.name)}
          </option>
        ))}
      </SelectField>
      <SelectField
        label={t("city")}
        value={filters.city}
        onChange={(v) => set("city", v)}
      >
        <option value="">{t("all")}</option>
        {["Алматы", "Астана", "Ақтау"].map((x) => (
          <option key={x} value={x}>
            {x === "Ақтау" ? tr(tours[5].city) : x}
          </option>
        ))}
      </SelectField>
      <SelectField
        label={t("duration")}
        value={filters.duration}
        onChange={(v) => set("duration", v)}
      >
        <option value="">{t("any")}</option>
        {[1, 2, 3].map((x) => (
          <option key={x} value={x}>
            {x} {t("day")}
          </option>
        ))}
      </SelectField>
      <SelectField
        label={t("format")}
        value={filters.format}
        onChange={(v) => set("format", v)}
      >
        <option value="">{t("all")}</option>
        {Object.entries(formatLabel).map(([k, v]) => (
          <option value={k} key={k}>
            {tr(v)}
          </option>
        ))}
      </SelectField>
      <SelectField
        label={t("budget")}
        value={filters.budget}
        onChange={(v) => set("budget", v)}
      >
        <option value="">{t("any")}</option>
        <option value="30000">≤ 30 000 ₸</option>
        <option value="80000">≤ 80 000 ₸</option>
        <option value="150000">≤ 150 000 ₸</option>
      </SelectField>
    </>
  );
}
function Catalog() {
  const { t, tr, filters, setFilters } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const found = tours.filter(
    (x) =>
      (!filters.direction || x.id === filters.direction) &&
      (!filters.city || x.city.kk === filters.city) &&
      (!filters.duration || x.days === Number(filters.duration)) &&
      (!filters.format || x.format === filters.format) &&
      (!filters.budget || x.price <= Number(filters.budget)),
  );
  const active = Object.entries(filters).filter(([, v]) => v);
  return (
    <section id="tours" className="section catalog">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("catalogLabel")}</span>
          <h2>{t("catalogTitle")}</h2>
        </div>
        <p>{t("catalogIntro")}</p>
      </div>
      <div className="catalog-toolbar">
        <div className="destination-tabs">
          <button
            className={!filters.direction ? "active" : ""}
            onClick={() => setFilters({ ...filters, direction: "" })}
          >
            {t("all")}
            <span>06</span>
          </button>
          {tours.slice(0, 3).map((x) => (
            <button
              key={x.id}
              className={filters.direction === x.id ? "active" : ""}
              onClick={() => setFilters({ ...filters, direction: x.id })}
            >
              {tr(x.name)}
            </button>
          ))}
        </div>
        <button
          className="filter-button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={16} />
          {t("filters")}
          {active.length > 0 && <span>{active.length}</span>}
        </button>
      </div>
      <div className="desktop-filters">
        <FilterFields />
      </div>
      {filtersOpen && (
        <Modal
          title={t("filters")}
          closeLabel={t("close")}
          onClose={() => setFiltersOpen(false)}
        >
          <div className="mobile-filter-fields">
            <FilterFields />
          </div>
          <div className="filter-modal-bottom">
            <button
              className="text-button"
              onClick={() => setFilters(initialFilters)}
            >
              {t("clear")}
            </button>
            <button className="button" onClick={() => setFiltersOpen(false)}>
              {found.length} {t("found")}
              <ArrowRight size={17} />
            </button>
          </div>
        </Modal>
      )}
      <div className="results-row">
        <span>
          {String(found.length).padStart(2, "0")} {t("found")}
        </span>
        <span className="demo-note">{t("demoNote")}</span>
      </div>
      {active.length > 0 && (
        <div className="active-filters">
          {active.map(([k, v]) => (
            <button key={k} onClick={() => setFilters({ ...filters, [k]: "" })}>
              {t(k as keyof typeof copy)}:{" "}
              {k === "direction"
                ? tr(tours.find((x) => x.id === v)?.name || { kk: v, ru: v })
                : k === "format"
                  ? tr(formatLabel[v as keyof typeof formatLabel])
                  : k === "city" && v === "Ақтау"
                    ? tr(tours[5].city)
                    : v}
              <X size={13} />
            </button>
          ))}
          <button
            className="clear-filters"
            onClick={() => setFilters(initialFilters)}
          >
            {t("clear")}
          </button>
        </div>
      )}
      {found.length ? (
        <div className="tour-grid">
          {found.map((tour) => (
            <TourCard tour={tour} key={tour.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={42} />
          <h3>{t("empty")}</h3>
          <p>{t("emptyHint")}</p>
          <button className="button" onClick={() => setFilters(initialFilters)}>
            {t("clear")}
            <ArrowRight size={17} />
          </button>
        </div>
      )}
    </section>
  );
}
function TourCard({ tour }: { tour: Tour }) {
  const { t, tr, selected, toggle } = useApp();
  const checked = selected.includes(tour.id);
  return (
    <article className="tour-card">
      <Link to={"/tours/" + tour.id} className="tour-image">
        <img
          src={"/images/" + tour.image + ".webp"}
          alt={tr(tour.name)}
          loading="lazy"
        />
        <span className="image-tag">{tr(tour.tag)}</span>
        <span className="image-arrow">
          <ArrowUpRight size={24} />
        </span>
      </Link>
      <div className="card-meta">
        <span>
          <MapPin size={13} />
          {tr(tour.city)}
        </span>
        <span>
          {tour.days} {t("day")}
        </span>
        <span>{tr(formatLabel[tour.format])}</span>
      </div>
      <Link className="card-title" to={"/tours/" + tour.id}>
        <h3>{tr(tour.name)}</h3>
      </Link>
      <p className="card-subtitle">{tr(tour.subtitle)}</p>
      <div className="card-load">
        <Footprints size={14} />
        {tr(tour.level)}
      </div>
      <div className="card-bottom">
        <div>
          <small>
            {t("price")} / {t("person")}
          </small>
          <strong>{money(tour.price)}</strong>
        </div>
        <button
          className={`compare-toggle ${checked ? "checked" : ""}`}
          onClick={() => toggle(tour.id)}
          aria-pressed={checked}
          aria-label={`${t("compare")}: ${tr(tour.name)}`}
        >
          {checked ? <Check size={15} /> : <Plus size={15} />}
          <span>{checked ? t("selected") : t("compare")}</span>
        </button>
      </div>
      <Link className="card-link" to={"/tours/" + tour.id}>
        {t("view")}
        <ArrowUpRight size={17} />
      </Link>
    </article>
  );
}
function Process() {
  const { t, tr } = useApp();
  return (
    <section className="process section" id="how">
      <div className="process-intro">
        <span className="eyebrow">{t("processLabel")}</span>
        <h2>{t("processTitle")}</h2>
        <Compass size={100} strokeWidth={0.6} />
        <span className="process-footnote">JORYQ TRAVEL / EST. 2026</span>
      </div>
      <div className="process-steps">
        {steps.map(([title, body], i) => (
          <div className="step" key={i}>
            <span>0{i + 1}</span>
            <div>
              <h3>{tr(title)}</h3>
              <p>{tr(body)}</p>
            </div>
            <ArrowUpRight size={22} />
          </div>
        ))}
      </div>
    </section>
  );
}
function Story() {
  const { t, lang } = useApp();
  return (
    <section className="story section">
      <div className="story-main">
        <img
          src="/images/kaindy.webp"
          alt={
            lang === "kk" ? "Қайыңды көліндегі шыршалар" : "Ели в озере Каинды"
          }
          loading="lazy"
        />
        <span>
          42°59′ N / 78°28′ E{" "}
          <span>{lang === "kk" ? "ҚАЙЫҢДЫ КӨЛІ" : "ОЗЕРО КАИНДЫ"}</span>
        </span>
      </div>
      <div className="story-content">
        <span className="eyebrow">{t("storyLabel")}</span>
        <h2>{t("storyTitle")}</h2>
        <p>{t("storyText")}</p>
        <div className="story-details">
          <img
            src="/images/kolsai.webp"
            alt={
              lang === "kk"
                ? "Көлсайдың орманды жағалауы"
                : "Лесной берег Кольсая"
            }
            loading="lazy"
          />
          <img
            src="/images/charyn.webp"
            alt={lang === "kk" ? "Шарын жартастары" : "Скалы Чарына"}
            loading="lazy"
          />
        </div>
        <Link className="text-button" to="/tours/kolsai">
          {t("route")}
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
function FAQ() {
  const { t, tr } = useApp();
  return (
    <section className="section faq" id="faq">
      <div>
        <span className="eyebrow">{t("faqLabel")}</span>
        <h2>{t("faqTitle")}</h2>
        <span className="faq-decoration">?</span>
      </div>
      <div>
        {faqs.map(([q, a], i) => (
          <details key={i}>
            <summary>
              {tr(q)}
              <Plus size={20} />
            </summary>
            <p>{tr(a)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
function Footer() {
  const { t, setCreditOpen, selected } = useApp();
  return (
    <footer className={`footer ${selected.length ? "has-compare" : ""}`}>
      <div className="footer-top">
        <h2>{t("footer")}</h2>
        <Link className="footer-cta" to="/#tours" aria-label={t("choose")}>
          <ArrowUpRight size={40} />
        </Link>
      </div>
      <div className="footer-middle">
        <Logo />
        <nav>
          <Link to="/#tours">{t("tours")}</Link>
          <Link to="/#how">{t("how")}</Link>
          <Link to="/#faq">{t("faq")}</Link>
        </nav>
        <Language />
      </div>
      <div className="footer-bottom">
        <span>© 2026 JORYQ. {t("portfolio")}.</span>
        <button onClick={() => setCreditOpen(true)}>
          {t("credits")}
          <ArrowUpRight size={12} />
        </button>
        <span>{t("eyebrow")} ↗</span>
      </div>
    </footer>
  );
}
function CompareBar() {
  const { selected, setSelected, tr, t, setCompareOpen } = useApp();
  return (
    <div className="compare-bar">
      <span className="compare-label">
        <Layers size={19} />
        {t("compare")} <strong>{selected.length}/2</strong>
      </span>
      <div className="compare-chips">
        {selected.map((id) => (
          <span key={id}>
            {tr(tours.find((x) => x.id === id)!.name)}
            <button
              aria-label={`${t("remove")}: ${id}`}
              onClick={() => setSelected(selected.filter((x) => x !== id))}
            >
              <X size={15} />
            </button>
          </span>
        ))}
      </div>
      <button
        className="button"
        disabled={selected.length !== 2}
        onClick={() => setCompareOpen(true)}
      >
        {selected.length === 2 ? t("compare") : t("second")}
        <ArrowRight size={17} />
      </button>
    </div>
  );
}
function CompareModal() {
  const { selected, tr, t, setCompareOpen, setBooking } = useApp();
  const items = selected.map((id) => tours.find((x) => x.id === id)!);
  const rows: [keyof typeof copy, (x: Tour) => string][] = [
    ["city", (x) => tr(x.city)],
    ["duration", (x) => x.days + " " + t("day")],
    ["transport", (x) => tr(formatLabel[x.format])],
    ["load", (x) => tr(x.level)],
    ["stay", (x) => tr(x.stay)],
    ["price", (x) => money(x.price) + " / " + t("person")],
    ["features", (x) => tr(x.subtitle)],
  ];
  return (
    <Modal
      wide
      title={t("compare")}
      closeLabel={t("close")}
      onClose={() => setCompareOpen(false)}
    >
      <p className="muted">{t("demoNote")}</p>
      <div className="compare-head">
        {items.map((x) => (
          <div key={x.id}>
            <img src={"/images/" + x.image + ".webp"} alt={tr(x.name)} />
            <h3>{tr(x.name)}</h3>
            <Link
              to={"/tours/" + x.id}
              onClick={() => setCompareOpen(false)}
              className="text-button"
            >
              {t("view")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ))}
      </div>
      <div className="compare-table">
        {rows.map(([label, value]) => (
          <div className="compare-row" key={label}>
            <span>{t(label)}</span>
            <div>
              {items.map((x) => (
                <strong key={x.id}>{value(x)}</strong>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="compare-actions">
        {items.map((x) => (
          <button
            key={x.id}
            className="button"
            onClick={() => {
              setCompareOpen(false);
              setBooking(x.id);
            }}
          >
            {t("request")}
            <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
    </Modal>
  );
}
function Helper() {
  const { t, setHelper, setFilters } = useApp();
  return (
    <Modal
      title={t("helpTitle")}
      closeLabel={t("close")}
      onClose={() => setHelper(false)}
    >
      <p>{t("helpText")}</p>
      <div className="helper-options">
        {(["oneDay", "weekend", "adventure"] as const).map((key, i) => (
          <button
            key={key}
            onClick={() => {
              setFilters({ ...initialFilters, duration: String(i + 1) });
              setHelper(false);
              document
                .getElementById("tours")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>0{i + 1}</span>
            {t(key)}
            <ArrowUpRight />
          </button>
        ))}
      </div>
    </Modal>
  );
}
function Credits() {
  const { t, lang, setCreditOpen } = useApp();
  return (
    <Modal
      title={t("credits")}
      closeLabel={t("close")}
      onClose={() => setCreditOpen(false)}
    >
      <p className="muted">
        {lang === "kk"
          ? "Суреттердің өлшемі өзгертіліп, WebP форматына түрлендірілді. Әр суреттің түпнұсқасы мен лицензиясы төменде."
          : "Фотографии уменьшены и преобразованы в WebP. Оригиналы и лицензии указаны ниже."}
      </p>
      <div className="credits-list">
        {Object.entries(credits).map(([key, c]) => (
          <div key={key}>
            <a href={c.source} target="_blank" rel="noreferrer">
              {c.title}
              <ArrowUpRight size={14} />
            </a>
            <p>
              {c.author} ·{" "}
              <a
                href={c.licenseUrl || c.source}
                target="_blank"
                rel="noreferrer"
              >
                {c.license}
              </a>
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
function NotFound() {
  const { t, lang } = useApp();
  return (
    <main className="not-found">
      <Compass size={60} />
      <h1>404</h1>
      <p>
        {lang === "kk"
          ? "Бұл бағыт әлі ашылмаған."
          : "Этот маршрут ещё не открыт."}
      </p>
      <Link className="button" to="/">
        {t("home")}
        <ArrowRight />
      </Link>
    </main>
  );
}
function TourPage() {
  const { id } = useParams();
  const tour = tours.find((x) => x.id === id);
  const { t, tr, lang, setBooking, selected, toggle } = useApp();
  const [gallery, setGallery] = useState<number | null>(null);
  useEffect(() => {
    if (tour) document.title = tr(tour.name) + " — JORYQ Travel";
    return () => {
      document.title = "JORYQ — Демалысыңа жаңа бағыт";
    };
  }, [id, lang]);
  if (!tour) return <NotFound />;
  return (
    <main className="tour-page">
      <div className="breadcrumb">
        <Link to="/">{t("home")}</Link>
        <ChevronRight size={13} />
        <Link to="/#tours">{t("tours")}</Link>
        <ChevronRight size={13} />
        <span>{tr(tour.name)}</span>
      </div>
      <div className="detail-title">
        <div>
          <span className="eyebrow">
            {tr(tour.tag)} / {t("demo")}
          </span>
          <h1>{tr(tour.name)}</h1>
          <p>{tr(tour.subtitle)}</p>
        </div>
        <button
          className="outline-button"
          onClick={() => toggle(tour.id)}
          aria-pressed={selected.includes(tour.id)}
        >
          {selected.includes(tour.id) ? (
            <Check size={17} />
          ) : (
            <Plus size={17} />
          )}{" "}
          {t("compare")}
        </button>
      </div>
      <button
        className="detail-cover"
        onClick={() => setGallery(0)}
        aria-label={
          lang === "kk" ? "Фотосуретті үлкейту" : "Увеличить фотографию"
        }
      >
        <img src={"/images/" + tour.image + ".webp"} alt={tr(tour.name)} />
        <span>
          <Maximize2 size={17} />
          {lang === "kk" ? "Фотосуреттер" : "Фотографии"} ·{" "}
          {tour.id === "kolsai" ? "02" : "01"}
        </span>
      </button>
      <div className="detail-facts">
        <span>
          <MapPin />
          {tr(tour.city)}
        </span>
        <span>
          <Clock />
          {tour.days} {t("day")}
        </span>
        <span>
          <Footprints />
          {tr(formatLabel[tour.format])}
        </span>
        <span>
          <Backpack />
          {tour.distance} {lang === "kk" ? "км жаяу" : "км пешком"}
        </span>
      </div>
      <div className="detail-layout">
        <div className="detail-body">
          <section>
            <span className="eyebrow">01 / JORYQ</span>
            <h2>{t("about")}</h2>
            <p>{tr(tour.description)}</p>
            <div className="load-note">
              <Footprints size={20} />
              <div>
                <strong>{tr(tour.level)}</strong>
                <p>
                  {lang === "kk"
                    ? "Жүктеме — үлгі сипаттама. Нақты жағдай маусымға және маршрутқа байланысты."
                    : "Нагрузка описана для примера. Реальные условия зависят от сезона и маршрута."}
                </p>
              </div>
            </div>
          </section>
          <section>
            <span className="eyebrow">02 / {t("demo")}</span>
            <h2>{t("program")}</h2>
            <p className="muted">{t("demoNote")}</p>
            {tour.program.map((p, i) => (
              <details key={i} open={i === 0}>
                <summary>
                  <span className="program-number">0{i + 1}</span>
                  {i + 1} {t("day")}
                  <ChevronDown size={20} />
                </summary>
                <p>{tr(p)}</p>
              </details>
            ))}
          </section>
          <section>
            <h2>{t("scheme")}</h2>
            <p className="muted">{t("schemeNote")}</p>
            <div className="detail-map">
              <TerrainMap tour={tour} lang={lang} />
            </div>
            <ol className="route-stops">
              {tour.points.map((p) => (
                <li key={p.name.kk}>{tr(p.name)}</li>
              ))}
            </ol>
          </section>
          <section className="inclusions">
            <div>
              <h3>
                <Check size={20} />
                {t("included")}
              </h3>
              <p>
                {lang === "kk"
                  ? "Қаладан трансфер, гид сүйемелдеуі, бағдарламадағы жергілікті көлік."
                  : "Трансфер из города, сопровождение гида, местный транспорт по программе."}
                {tour.days > 1 && " " + tr(tour.stay) + "."}
              </p>
            </div>
            <div>
              <h3>
                <Plus size={20} />
                {t("excluded")}
              </h3>
              <p>
                {lang === "kk"
                  ? "Шығатын қалаға жол, тамақ, жеке шығындар, сақтандыру және парк алымдары."
                  : "Дорога до города выезда, питание, личные расходы, страховка и парковые сборы."}
              </p>
            </div>
          </section>
          <section>
            <h2>{t("packing")}</h2>
            <div className="packing-list">
              {[
                [
                  Backpack,
                  lang === "kk"
                    ? "Жеңіл рюкзак және су"
                    : "Лёгкий рюкзак и вода",
                ],
                [
                  Footprints,
                  lang === "kk"
                    ? "Ыңғайлы треккинг аяқ киімі"
                    : "Удобная треккинговая обувь",
                ],
                [
                  Sun,
                  lang === "kk"
                    ? "Бас киім және күннен қорғаныш"
                    : "Головной убор и защита от солнца",
                ],
                [
                  ShieldCheck,
                  lang === "kk"
                    ? "Жаңбырлық және жылы қабат"
                    : "Дождевик и тёплый слой",
                ],
              ].map(([Icon, label], i) => {
                const I = Icon as typeof Backpack;
                return (
                  <span key={i}>
                    <I size={19} />
                    {label as string}
                  </span>
                );
              })}
            </div>
          </section>
        </div>
        <aside className="booking-panel">
          <span className="eyebrow">
            {t("price")} / {t("person")}
          </span>
          <div className="booking-price">{money(tour.price)}</div>
          <p>{t("demoNote")}</p>
          <BookingFields tour={tour} />
          <button className="button" onClick={() => setBooking(tour.id)}>
            {t("request")}
            <ArrowUpRight size={19} />
          </button>
          <span className="booking-fineprint">{t("privacy")}</span>
        </aside>
      </div>
      <Experiences key={tour.id} tour={tour} lang={lang} />
      <section className="related">
        <div className="section-heading">
          <h2>{t("related")}</h2>
          <Link to="/#tours" className="text-button">
            {t("back")}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="tour-grid">
          {tours
            .filter((x) => x.id !== tour.id)
            .slice(0, 3)
            .map((x) => (
              <TourCard key={x.id} tour={x} />
            ))}
        </div>
      </section>
      <div
        className={`mobile-booking ${selected.length ? "above-compare" : ""}`}
      >
        <div>
          <small>{t("price")}</small>
          <strong>{money(tour.price)}</strong>
        </div>
        <button className="button" onClick={() => setBooking(tour.id)}>
          {t("request")}
          <ArrowUpRight size={17} />
        </button>
      </div>
      {gallery !== null && (
        <Gallery
          tour={tour}
          index={gallery}
          setIndex={setGallery}
          onClose={() => setGallery(null)}
        />
      )}
    </main>
  );
}
function today() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Almaty",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((type) => parts.find((x) => x.type === type)!.value)
    .join("-");
}
function BookingFields({ tour }: { tour: Tour }) {
  const { t, params, setParams } = useApp();
  const p = params[tour.id] || { date: "", people: 1 };
  const update = (v: Partial<typeof p>) =>
    setParams({ ...params, [tour.id]: { ...p, ...v } });
  return (
    <div className="booking-fields">
      <label>
        {t("date")}
        <input
          type="date"
          value={p.date}
          min={today()}
          onChange={(e) => update({ date: e.target.value })}
        />
        <small>{t("dateHint")}</small>
      </label>
      <label>
        {t("people")}
        <div className="number-input">
          <button
            type="button"
            aria-label={t("remove")}
            disabled={p.people <= 1}
            onClick={() => update({ people: p.people - 1 })}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min="1"
            max="12"
            value={p.people}
            onChange={(e) =>
              update({
                people: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
              })
            }
          />
          <button
            type="button"
            aria-label={t("people") + " +1"}
            disabled={p.people >= 12}
            onClick={() => update({ people: p.people + 1 })}
          >
            <Plus size={16} />
          </button>
        </div>
      </label>
      <div className="booking-total">
        <span>{t("total")}</span>
        <strong>{money(tour.price * p.people)}</strong>
      </div>
    </div>
  );
}
function BookingModal({ tour }: { tour: Tour }) {
  const { t, tr, lang, setBooking, params } = useApp();
  const [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [errors, setErrors] = useState<string[]>([]),
    [done, setDone] = useState(false);
  const p = params[tour.id] || { date: "", people: 1 };
  return (
    <Modal
      title={done ? t("done") : t("request")}
      closeLabel={t("close")}
      onClose={() => setBooking(null)}
    >
      {done ? (
        <div className="success">
          <CheckCircle2 size={54} />
          <p>{t("doneText")}</p>
          <div className="request-summary">
            <strong>{tr(tour.name)}</strong>
            <span>
              {p.date} · {p.people} {lang === "kk" ? "адам" : "чел."}
            </span>
            <strong>{money(p.people * tour.price)}</strong>
            <small>{t("price")}</small>
          </div>
          <button className="button" onClick={() => setBooking(null)}>
            {t("close")}
            <Check size={17} />
          </button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const errs = [];
            if (!p.date || p.date < today()) errs.push("invalidDate");
            if (name.trim().length < 2) errs.push("invalidName");
            const n = phone.replace(/\D/g, "");
            if (n.length < 10 || n.length > 15) errs.push("invalidPhone");
            setErrors(errs);
            if (!errs.length) {
              setName("");
              setPhone("");
              setDone(true);
            }
          }}
        >
          <div className="booking-tour">
            <img src={"/images/" + tour.image + ".webp"} alt="" />
            <div>
              <strong>{tr(tour.name)}</strong>
              <span>
                {money(tour.price)} / {t("person")}
              </span>
            </div>
          </div>
          <BookingFields tour={tour} />
          {errors.includes("invalidDate") && (
            <p className="field-error" role="alert">
              {t("invalidDate")}
            </p>
          )}
          <div className="contact-fields">
            <label>
              {t("name")}
              <input
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "kk" ? "Атыңды енгіз" : "Введи имя"}
                aria-invalid={errors.includes("invalidName")}
                aria-describedby={
                  errors.includes("invalidName") ? "name-error" : undefined
                }
              />
            </label>
            {errors.includes("invalidName") && (
              <p id="name-error" className="field-error" role="alert">
                {t("invalidName")}
              </p>
            )}
            <label>
              {t("phone")}
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___ __ __"
                aria-invalid={errors.includes("invalidPhone")}
                aria-describedby={
                  errors.includes("invalidPhone") ? "phone-error" : undefined
                }
              />
            </label>
            {errors.includes("invalidPhone") && (
              <p id="phone-error" className="field-error" role="alert">
                {t("invalidPhone")}
              </p>
            )}
          </div>
          <p className="muted">{t("privacy")}</p>
          <button type="submit" className="button full-width">
            {t("send")}
            <ArrowRight size={18} />
          </button>
        </form>
      )}
    </Modal>
  );
}
function Gallery({
  tour,
  index,
  setIndex,
  onClose,
}: {
  tour: Tour;
  index: number;
  setIndex: (n: number) => void;
  onClose: () => void;
}) {
  const { tr, t, lang } = useApp();
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState(0);
  const [direction, setDirection] = useState(1);
  const images = tour.id === "kolsai" ? ["kolsai", "kaindy"] : [tour.image];
  const move = (step: number) => {
    setDirection(step);
    setIndex((index + step + images.length) % images.length);
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [index]);
  return (
    <Modal wide title={tr(tour.name)} closeLabel={t("close")} onClose={onClose}>
      <div
        className="gallery-swipe"
        style={
          {
            "--swipe-offset": `${drag}px`,
            "--swipe-direction": direction,
          } as React.CSSProperties
        }
        onPointerDown={(e) => {
          if (
            images.length < 2 ||
            (e.pointerType === "mouse" && e.button !== 0)
          )
            return;
          swipeStart.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!swipeStart.current) return;
          const dx = e.clientX - swipeStart.current.x;
          const dy = e.clientY - swipeStart.current.y;
          if (Math.abs(dx) > Math.abs(dy))
            setDrag(Math.max(-100, Math.min(100, dx * 0.45)));
        }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          setDrag(0);
          if (
            start &&
            Math.abs(e.clientX - start.x) > 48 &&
            Math.abs(e.clientX - start.x) > Math.abs(e.clientY - start.y) * 1.3
          )
            move(e.clientX < start.x ? 1 : -1);
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
          setDrag(0);
        }}
      >
        <img
          key={index}
          draggable={false}
          className="gallery-image"
          src={"/images/" + images[index] + ".webp"}
          alt={
            images[index] === "kaindy"
              ? lang === "kk"
                ? "Қайыңды"
                : "Каинды"
              : tr(tour.name)
          }
        />
      </div>
      {images.length > 1 && (
        <div className="gallery-controls">
          <button
            className="icon-button"
            onClick={() => move(-1)}
            aria-label={lang === "kk" ? "Алдыңғы фото" : "Предыдущее фото"}
          >
            <ChevronLeft />
          </button>
          <span>
            {index + 1} / {images.length}
          </span>
          <button
            className="icon-button"
            onClick={() => move(1)}
            aria-label={lang === "kk" ? "Келесі фото" : "Следующее фото"}
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </Modal>
  );
}
