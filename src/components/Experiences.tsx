import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Check,
  Download,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Stamp,
} from "lucide-react";
import { tours, type Tour, type Lang } from "../data";
import credits from "../credits.json";
import { experienceLore } from "../experienceLore";
import "./experiences.css";

type Props = { tour: Tour; lang: Lang; onSelect?: (id: string) => void };
const passportKey = "joryq-passport";
const stories: Record<string, [string, string][]> = {
  kolsai: [
    ["Су бетіндегі аспан", "Небо на воде"],
    [
      "Көл бетіне қарасаң, аспан аяқ астына көшкендей. Бір сәтке асығыстықты жағада қалдыр.",
      "Посмотри на озеро: кажется, небо переместилось под ноги. На мгновение оставь спешку на берегу.",
    ],
    ["Орманның сыбыры", "Шёпот леса"],
    [
      "Соқпақ бұрылған сайын жаңа көрініс ашылады. Бұл хикаядағы ең әдемі сөйлем — үнсіздік.",
      "За каждым поворотом тропы открывается новый вид. Самое красивое предложение этой истории — тишина.",
    ],
    ["Өзіңмен кездесу", "Встреча с собой"],
    [
      "Жолдың соңында тағы бір фото ғана емес, тыныстауға уақыт тапқан өзіңді кездестір.",
      "В конце пути найди не только ещё один кадр, но и себя — человека, который нашёл время выдохнуть.",
    ],
  ],
  charyn: [
    ["Тастың хаты", "Письмо камня"],
    [
      "Жартастың әр сызығы — айтылмаған сөйлем секілді. Оқуға асықпа: мұнда уақыттың өз қарқыны бар.",
      "Каждая линия скалы похожа на невысказанное предложение. Не спеши читать: у времени здесь свой ритм.",
    ],
    ["Жарық пен көлеңке", "Свет и тень"],
    [
      "Күн қозғалған сайын шатқал басқа бояуға енеді. Бір көріністен бірнеше әлем іздеп көр.",
      "С движением солнца каньон меняет краски. Попробуй найти несколько миров в одном пейзаже.",
    ],
    ["Өзенге қарай", "Навстречу реке"],
    [
      "Қызыл жартастар арасындағы жол су үніне жетелейді. Аялдап, сапардың осы сәтін есте сақта.",
      "Путь между красными скалами ведёт к шуму воды. Остановись и запомни этот момент путешествия.",
    ],
  ],
  altyn: [
    ["Құмдағы із", "След на песке"],
    [
      "Жел ізіңді өшірсе де, әсеріңді өшіре алмайды. Жаныңда осы кеңістіктің бір бөлшегі қалсын.",
      "Ветер может стереть следы, но не впечатления. Пусть частица этого простора останется с тобой.",
    ],
    ["Табиғат палитрасы", "Палитра природы"],
    [
      "Ақтау көрінісінде бояулар сөзсіз сөйлейді. Өзіңе ұнайтын реңкті тауып, оған бір естелік сыйла.",
      "В пейзаже Актау краски говорят без слов. Найди любимый оттенок и подари ему воспоминание.",
    ],
    ["Көкжиек", "Горизонт"],
    [
      "Алысқа қараған сайын күнделікті ойлар кішірейеді. Кеңістікке орын бер.",
      "Чем дальше смотришь, тем меньше кажутся повседневные мысли. Дай место простору.",
    ],
  ],
  turgen: [
    ["Жасыл есік", "Зелёная дверь"],
    [
      "Орманға кіргенде қаланың дауысы алыстайды. Жапырақтар арасындағы жарық жолыңды жалғастырады.",
      "Войдя в лес, оставляешь городской шум позади. Свет между листьями продолжает твой путь.",
    ],
    ["Су үні", "Голос воды"],
    [
      "Сарқырама көрінбей тұрып-ақ өз хикаясын бастайды. Бүгінгі жолды құлақпен де тыңда.",
      "Водопад начинает свою историю ещё до того, как его увидишь. Сегодня слушай путь и ушами.",
    ],
    ["Бір терең тыныс", "Один глубокий вдох"],
    [
      "Кейде үлкен демалыс үшін бір күн мен бір терең тыныс жеткілікті.",
      "Иногда для большого отдыха достаточно одного дня и одного глубокого вдоха.",
    ],
  ],
  burabay: [
    ["Баяу таң", "Медленное утро"],
    [
      "Көл жағасында таңды асықтырма. Бүгін сағатқа емес, өз қарқыныңа сен.",
      "Не торопи утро на берегу озера. Сегодня доверься своему ритму, а не часам.",
    ],
    ["Қарағай арасымен", "Между соснами"],
    [
      "Орман соқпағындағы әр қадам — ойыңдағы артық шудан бір қадам алыстау.",
      "Каждый шаг по лесной тропе — шаг прочь от лишнего шума в мыслях.",
    ],
    ["Жағалаудағы естелік", "Память о береге"],
    [
      "Ең жақсы естеліктің мекенжайы кейде жай ғана көл жағасындағы орындық болады.",
      "Адресом лучшего воспоминания иногда становится просто скамейка у озера.",
    ],
  ],
  mangystau: [
    ["Ақ жартастар", "Белые скалы"],
    [
      "Бозжыраға қарағанда таныс дүниенің шеті алыстағандай. Көрініске ат іздемей, оны сезініп көр.",
      "Глядя на Бозжыру, будто видишь край привычного мира. Попробуй почувствовать пейзаж, не подбирая ему название.",
    ],
    ["Күннің соңғы бояуы", "Последняя краска дня"],
    [
      "Көкжиекке сіңген жарық бүгінгі жолға соңғы нүктесін қояды. Ертең хикая қайта жалғасады.",
      "Свет, уходящий за горизонт, ставит последнюю точку сегодняшнего пути. Завтра история продолжится.",
    ],
    ["Аспан астындағы түн", "Ночь под небом"],
    [
      "Қараңғыда кеңістік жоғалмайды — ол аспанға көшеді. Бір тілегіңді өзіңмен бірге алып қайт.",
      "В темноте простор не исчезает — он перемещается в небо. Забери с собой одно желание.",
    ],
  ],
};

const stopNotes: Record<string, [string, string][]> = {
  kolsai: [
    [
      "Саты — көлдерге қарай сапардағы аялдама. Мұнда демалып, келесі жолға дайындаламыз.",
      "Саты — остановка на пути к озёрам. Здесь отдыхаем и готовимся к следующей части пути.",
    ],
    [
      "Көлсай жағасымен серуен. Шыршалы тау мен су бетіндегі шағылысқа уақыт бөл.",
      "Прогулка вдоль Кольсая. Оставь время для хвойных склонов и отражений на воде.",
    ],
    [
      "Қайыңдыға жол талғамайтын көлікпен барамыз. Көлге жаяу түсіп, судағы ағаштарды тамашалаймыз.",
      "Едем к Каинды на внедорожнике. Спускаемся пешком к озеру и рассматриваем деревья в воде.",
    ],
  ],
  charyn: [
    [
      "Көкпек арқылы шатқалға қарай жолды жалғастырамыз. Алда — қызыл жартастар.",
      "Продолжаем путь к каньону через Кокпек. Впереди — красные скалы.",
    ],
    [
      "Қамалдар аңғарына түсіп, Шарын өзеніне қарай серуендейміз. Демалыстан кейін кері жолға шығамыз.",
      "Спускаемся в Долину замков и гуляем к реке Чарын. После отдыха отправляемся обратно.",
    ],
  ],
  altyn: [
    [
      "Басшиге келіп, ұлттық паркке сапардың келесі бөлігін бастаймыз.",
      "Приезжаем в Басши и начинаем следующую часть путешествия по национальному парку.",
    ],
    [
      "Әншіқұмның құм жотасына көтерілеміз. Кең көкжиекті асықпай тамашала.",
      "Поднимаемся на гребень Поющего бархана. Не спеша любуемся широким горизонтом.",
    ],
    [
      "Ақтау таулары арасында серуендеп, көрініс нүктелеріне аялдаймыз.",
      "Гуляем среди гор Актау и останавливаемся на обзорных точках.",
    ],
  ],
  turgen: [
    [
      "Түрген шатқалына келеміз. Орман соқпағы жаяу сапардың басына жетелейді.",
      "Приезжаем в Тургенское ущелье. Лесная тропа ведёт к началу пешей части пути.",
    ],
    [
      "Аюлы сарқырамасына қарай көтерілеміз. Су үніне құлақ асып, кері жол алдында демаламыз.",
      "Поднимаемся к Медвежьему водопаду. Слушаем воду и отдыхаем перед обратной дорогой.",
    ],
  ],
  burabay: [
    [
      "Бурабай көліне келіп, жағалаумен баяу серуендейміз. Түнді қонақ үйде өткіземіз.",
      "Приезжаем к озеру Бурабай и неспешно гуляем по берегу. Ночуем в отеле.",
    ],
    [
      "Орман соқпағымен жүріп, Оқжетпес көрінісін тамашалаймыз. Түстен кейін Астанаға қайтамыз.",
      "Идём по лесной тропе и любуемся видом Окжетпеса. После обеда возвращаемся в Астану.",
    ],
  ],
  mangystau: [
    [
      "Шерқала маңындағы пейзаждарға аялдаймыз. Күн соңында лагерь құрамыз.",
      "Останавливаемся у пейзажей Шеркалы. В конце дня устанавливаем лагерь.",
    ],
    [
      "Бозжыраның көрініс нүктелеріне серуендеп, күннің батуын тамашалаймыз.",
      "Гуляем к обзорным точкам Бозжыры и встречаем закат.",
    ],
  ],
};

function loadPassport(): string[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(passportKey) || "[]",
    );
    return Array.isArray(saved)
      ? tours.filter((t) => saved.includes(t.id)).map((t) => t.id)
      : [];
  } catch {
    return [];
  }
}

function useAmbience(id: string) {
  const engine = useRef<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const stop = () => {
    const ctx = engine.current;
    engine.current = null;
    if (ctx) void ctx.close().catch(() => {});
    setPlaying(false);
  };
  useEffect(() => {
    stop();
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      stop();
    };
  }, [id]);
  const toggle = async () => {
    if (engine.current) {
      stop();
      return;
    }
    setError(false);
    try {
      const ctx = new AudioContext();
      engine.current = ctx;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
      const samples = buffer.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < samples.length; i++) {
        brown = (brown + (Math.random() * 2 - 1) * 0.02) / 1.02;
        samples[i] = brown * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = ["turgen", "kolsai", "burabay"].includes(id)
        ? 1100
        : 450;
      const volume = ctx.createGain();
      volume.gain.setValueAtTime(0, ctx.currentTime);
      volume.gain.linearRampToValueAtTime(0.23, ctx.currentTime + 1.4);
      const breeze = ctx.createOscillator();
      breeze.frequency.value = 0.12;
      const depth = ctx.createGain();
      depth.gain.value = 0.06;
      breeze.connect(depth).connect(volume.gain);
      source.connect(filter).connect(volume).connect(ctx.destination);
      source.start();
      breeze.start();
      await ctx.resume();
      if (engine.current === ctx) setPlaying(true);
    } catch {
      stop();
      setError(true);
    }
  };
  return { playing, error, toggle };
}

function Immersion({ tour, lang }: Props) {
  const kk = lang === "kk";
  const [night, setNight] = useState(false);
  const [story, setStory] = useState<number | null>(null);
  const { playing, error, toggle } = useAmbience(tour.id);
  useEffect(() => {
    setStory(null);
  }, [tour.id]);
  const narrative = stories[tour.id];
  const lore = experienceLore[tour.id];
  return (
    <section className="immersion" aria-labelledby="feel-title">
      <div className="experience-heading">
        <div>
          <span className="eyebrow">01 / FEEL THE JOURNEY</span>
          <h2 id="feel-title">
            {kk ? "Сапарды сезін." : "Почувствуй путешествие."}
          </h2>
        </div>
        <p>
          {kk
            ? "Бір сәт тоқта. Көрініске еніп, өз хикаяңды баста."
            : "Остановись на мгновение. Войди в пейзаж и начни свою историю."}
        </p>
      </div>
      <div className={`immersive-scene ${night ? "is-night" : ""}`}>
        <img
          key={tour.id}
          className="scene-photo"
          src={`/images/${tour.image}.webp`}
          alt={tour.name[lang]}
        />
        <div className="scene-shade" />
        <div className="scene-stars" aria-hidden="true">
          {Array.from({ length: 34 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 37 + 3) % 100}%`,
                top: `${(i * 19 + 7) % 52}%`,
                animationDelay: `${i % 5}s`,
              }}
            />
          ))}
        </div>
        <div className="scene-toolbar">
          <span className="scene-location">{tour.name[lang]}</span>
          <div className="scene-controls">
            <button
              onClick={() => setNight(!night)}
              aria-pressed={night}
              className="scene-control"
            >
              {night ? <Moon size={17} /> : <Sun size={17} />}
              {night ? (kk ? "Түн" : "Ночь") : kk ? "Күндіз" : "День"}
            </button>
            <button
              onClick={() => void toggle()}
              aria-pressed={playing}
              className="scene-control"
            >
              {playing ? <Volume2 size={17} /> : <VolumeX size={17} />}
              {playing
                ? kk
                  ? "Дыбысты өшіру"
                  : "Выключить звук"
                : kk
                  ? "Дыбысты қосу"
                  : "Включить звук"}
            </button>
          </div>
        </div>
        <div className="scene-caption">
          <span>{kk ? "СЕН ОСЫНДА БОЛА АЛАСЫҢ" : "ТЫ МОЖЕШЬ БЫТЬ ЗДЕСЬ"}</span>
          <h3>{tour.subtitle[lang]}</h3>
          <p>
            {kk
              ? "Нүктелерді басып, шағын хикаяларды аш."
              : "Нажми на точки, чтобы открыть маленькие истории."}
          </p>
        </div>
        <div className="story-points">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`story-point story-point-${i} ${story === i ? "active" : ""}`}
              onClick={() => setStory(story === i ? null : i)}
              aria-expanded={story === i}
              aria-controls="scene-story"
              aria-label={narrative[i * 2][kk ? 0 : 1]}
            >
              <span>0{i + 1}</span>
              <small>{narrative[i * 2][kk ? 0 : 1]}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="scene-footnote">
        <span>
          {kk
            ? "Түн — көркем өңдеу. Дыбыс — жасанды табиғат атмосферасы."
            : "Ночь — художественная обработка. Звук — синтезированная атмосфера природы."}
        </span>
        <span role="status">
          {error
            ? kk
              ? "Дыбыс ашылмады. Қайта қосып көр."
              : "Звук недоступен. Попробуй ещё раз."
            : playing
              ? kk
                ? "Дыбыс қосулы"
                : "Звук включён"
              : ""}
        </span>
      </div>
      <div
        id="scene-story"
        className={`scene-story ${story !== null ? "open" : ""}`}
        aria-live="polite"
      >
        {story !== null && (
          <>
            <span className="eyebrow">
              0{story + 1} /{" "}
              {kk ? "АВТОРЛЫҚ ШАҒЫН ХИКАЯ" : "АВТОРСКАЯ МИНИАТЮРА"}
            </span>
            <h3>{narrative[story * 2][kk ? 0 : 1]}</h3>
            <p>{narrative[story * 2 + 1][kk ? 0 : 1]}</p>
            <div className="place-lore">
              <span className="eyebrow">
                {lore.legend
                  ? kk
                    ? "ХАЛЫҚ АҢЫЗЫ"
                    : "НАРОДНАЯ ЛЕГЕНДА"
                  : kk
                    ? "ОСЫ ЖЕР ТУРАЛЫ"
                    : "ОБ ЭТОМ МЕСТЕ"}
              </span>
              <h4>{lore.title[lang]}</h4>
              <p>{lore.text[lang]}</p>
              <a href={lore.source} target="_blank" rel="noopener noreferrer">
                {kk ? "Дереккөз" : "Источник"}: {lore.publisher}{" "}
                <ArrowUpRight size={13} />
              </a>
            </div>
            <button className="text-button" onClick={() => setStory(null)}>
              {kk ? "Жабу" : "Закрыть"} ×
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function Journey({ tour, lang }: Props) {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const kk = lang === "kk";
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!root.current) return;
      const items = Array.from(
        root.current.querySelectorAll<HTMLElement>(".journey-stop"),
      );
      let current = 0;
      items.forEach((item, i) => {
        if (item.getBoundingClientRect().top < innerHeight * 0.68) current = i;
      });
      setStep(current);
      setProgress(media.matches ? 1 : current / Math.max(1, items.length - 1));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, [tour.id]);
  const positions = tour.points.map((_, i) => ({
    x: [65, 205, 85, 215][i],
    y: 45 + i * (270 / (tour.points.length - 1)),
  }));
  const path = positions
    .map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`)
    .join(" ");
  return (
    <section className="journey" ref={root} aria-labelledby="journey-title">
      <div className="experience-heading">
        <div>
          <span className="eyebrow">02 / FOLLOW THE LINE</span>
          <h2 id="journey-title">
            {kk ? "Әр аялдама — жаңа әсер." : "Каждая остановка — впечатление."}
          </h2>
        </div>
        <p>
          {kk
            ? "Төмен айналдыр — жол біртіндеп ашылады."
            : "Прокручивай вниз — путь откроется постепенно."}
        </p>
      </div>
      <div className="journey-layout">
        <aside className="journey-atlas">
          <span className="eyebrow">{tour.name[lang]}</span>
          <svg
            viewBox="0 0 280 360"
            role="img"
            aria-label={
              kk ? "Маршруттың шартты сызбасы" : "Условная схема маршрута"
            }
          >
            <defs>
              <pattern
                id={`grid-${tour.id}`}
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M28 0H0V28"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".08"
                />
              </pattern>
            </defs>
            <rect width="280" height="360" fill={`url(#grid-${tour.id})`} />
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeOpacity=".17"
              strokeWidth="3"
              strokeDasharray="5 6"
            />
            <path
              className="journey-trace"
              d={path}
              fill="none"
              stroke="var(--route-color)"
              strokeWidth="3"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
            />
            {positions.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={i === step ? 18 : 13}
                  fill={i <= step ? "var(--green)" : "var(--paper)"}
                  stroke="var(--green)"
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill={i <= step ? "white" : "var(--green)"}
                >
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
          <strong>{tour.points[step]?.name[lang]}</strong>
          <small>
            {kk
              ? "Шартты сызба · навигацияға арналмаған"
              : "Условная схема · не для навигации"}
          </small>
        </aside>
        <div className="journey-stops">
          {tour.points.map((point, i) => (
            <article
              key={point.name.kk}
              className={`journey-stop ${i <= step ? "reached" : ""}`}
            >
              <span className="stop-number">0{i + 1}</span>
              <div>
                <span className="eyebrow">
                  {i === 0
                    ? kk
                      ? "БАСТАУ"
                      : "СТАРТ"
                    : kk
                      ? "АЯЛДАМА"
                      : "ОСТАНОВКА"}
                </span>
                <h3>{point.name[lang]}</h3>
                <p>
                  {i === 0
                    ? kk
                      ? `${tour.city.kk} қаласынан жолға шығамыз. Алда — ${tour.days} күндік жаңа әсер.`
                      : `Отправляемся из города ${tour.city.ru}. Впереди ${tour.days} дн. новых впечатлений.`
                    : stopNotes[tour.id][i - 1][kk ? 0 : 1]}
                </p>
                <span className="stop-coordinates">
                  {point.pos[0].toFixed(3)}° N / {point.pos[1].toFixed(3)}° E
                </span>
              </div>
              <img
                loading="lazy"
                src={`/images/${tour.id === "kolsai" && i === tour.points.length - 1 ? "kaindy" : tour.image}.webp`}
                alt={kk ? "Бағыттың көрінісі" : "Пейзаж маршрута"}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

async function postcardBlob(tour: Tour, lang: Lang, message: string) {
  await document.fonts.ready;
  const photo = new Image();
  photo.src = `/images/${tour.image}.webp`;
  await photo.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#f4f1e9";
  ctx.fillRect(0, 0, 1600, 1200);
  const scale = Math.max(1480 / photo.width, 800 / photo.height);
  ctx.save();
  ctx.beginPath();
  ctx.rect(60, 60, 1480, 800);
  ctx.clip();
  ctx.drawImage(
    photo,
    60 + (1480 - photo.width * scale) / 2,
    60 + (800 - photo.height * scale) / 2,
    photo.width * scale,
    photo.height * scale,
  );
  ctx.restore();
  ctx.fillStyle = "#173d32";
  ctx.font = "600 26px Manrope, Arial";
  ctx.fillText("JORYQ / MADE OF KAZAKHSTAN", 65, 915);
  ctx.font = "600 51px Manrope, Arial";
  ctx.fillText(message, 65, 990, 1460);
  ctx.font = "26px Manrope, Arial";
  ctx.fillText(tour.name[lang], 65, 1040);
  const credit = credits[tour.image as keyof typeof credits];
  ctx.fillStyle = "#555d54";
  ctx.font = "18px Arial";
  ctx.fillText(
    `Photo: ${credit.author} · ${credit.license} · ${lang === "kk" ? "Қиылған, мәтін қосылған" : "Кадрировано, добавлен текст"}`,
    65,
    1100,
    1460,
  );
  ctx.font = "14px Arial";
  ctx.fillText(credit.source, 65, 1135, 1460);
  if (credit.licenseUrl) ctx.fillText(credit.licenseUrl, 65, 1160, 1460);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
}

function Keepsakes({ tour, lang }: Props) {
  const kk = lang === "kk";
  const [saved, setSaved] = useState(loadPassport);
  const [storageError, setStorageError] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const busy = useRef(false);
  const fallback = kk
    ? `Менің келесі сапарым — ${tour.name.kk}`
    : `Моё следующее путешествие — ${tour.name.ru}`;
  useEffect(() => {
    const sync = () => setSaved(loadPassport());
    addEventListener("storage", sync);
    return () => removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    setMessage("");
    setStatus("idle");
  }, [tour.id, lang]);
  const toggle = () => {
    const next = saved.includes(tour.id)
      ? saved.filter((id) => id !== tour.id)
      : [...saved, tour.id];
    setSaved(next);
    try {
      localStorage.setItem(passportKey, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };
  const download = async () => {
    if (busy.current) return;
    busy.current = true;
    setStatus("loading");
    try {
      const blob = await postcardBlob(tour, lang, message.trim() || fallback);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JORYQ-${tour.id}-${lang}.png`;
      document.body.append(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      busy.current = false;
    }
  };
  return (
    <section className="keepsakes" aria-labelledby="keepsakes-title">
      <div className="experience-heading">
        <div>
          <span className="eyebrow">03 / TAKE A MEMORY</span>
          <h2 id="keepsakes-title">
            {kk ? "Әсерді өзіңмен алып кет." : "Забери впечатление с собой."}
          </h2>
        </div>
        <p>
          {kk
            ? "Бағытыңды сақта. Өз ашықхатыңды жаса."
            : "Сохрани маршрут. Создай свою открытку."}
        </p>
      </div>
      <div className="keepsake-grid">
        <div className="travel-passport">
          <div className="passport-heading">
            <Stamp size={32} />
            <span>
              JORYQ
              <br />
              <small>{kk ? "САЯХАТ ПАСПОРТЫ" : "ПАСПОРТ ПУТЕШЕСТВИЙ"}</small>
            </span>
            <strong>{saved.length} / 06</strong>
          </div>
          <p>
            {kk
              ? "Барғың келетін жерлерге мөр жина. Бұл — сенің таңдаулы бағыттарың."
              : "Собирай штампы мест, куда хочешь поехать. Это твои избранные маршруты."}
          </p>
          <div className="passport-stamps">
            {tours.map((item, i) => (
              <Link
                key={item.id}
                to={`/tours/${item.id}`}
                className={`passport-stamp ${saved.includes(item.id) ? "collected" : ""}`}
                aria-label={`${item.name[lang]} — ${saved.includes(item.id) ? (kk ? "сақталған" : "сохранено") : kk ? "сақталмаған" : "не сохранено"}`}
                style={
                  { "--stamp-angle": `${i % 2 ? 5 : -5}deg` } as CSSProperties
                }
              >
                <span>JORYQ · 0{i + 1}</span>
                <strong>{item.name[lang]}</strong>
                {saved.includes(item.id) ? (
                  <Check size={17} />
                ) : (
                  <ArrowUpRight size={17} />
                )}
              </Link>
            ))}
          </div>
          <button
            className="button passport-save"
            onClick={toggle}
            aria-pressed={saved.includes(tour.id)}
          >
            {saved.includes(tour.id) ? (
              <Check size={18} />
            ) : (
              <Bookmark size={18} />
            )}
            {saved.includes(tour.id)
              ? kk
                ? "Мөрді алып тастау"
                : "Убрать штамп"
              : kk
                ? "Осы бағытқа мөр қосу"
                : "Добавить штамп маршрута"}
          </button>
          <small className="keepsake-note" role="status">
            {storageError
              ? kk
                ? "Осы бетте сақталды. Браузер тұрақты сақтауға рұқсат бермеді."
                : "Сохранено на этой странице. Браузер не разрешил постоянное хранение."
              : kk
                ? "Мөрлер осы браузерде сақталады. Сапарға барғаныңды білдірмейді."
                : "Штампы хранятся в этом браузере и не означают посещение."}
          </small>
        </div>
        <div className="postcard-maker">
          <div className="postcard-preview">
            <img
              loading="lazy"
              src={`/images/${tour.image}.webp`}
              alt={tour.name[lang]}
            />
            <div>
              <span>JORYQ / POSTCARD</span>
              <strong>{message.trim() || fallback}</strong>
              <small>{tour.name[lang]}</small>
            </div>
          </div>
          <label className="postcard-label" htmlFor="postcard-message">
            {kk ? "Ашықхаттағы жазуың" : "Твоя надпись на открытке"}
          </label>
          <input
            id="postcard-message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setStatus("idle");
            }}
            maxLength={90}
            placeholder={fallback}
          />
          <div className="postcard-actions">
            <span>{message.length} / 90 · PNG</span>
            <button
              className="button"
              onClick={() => void download()}
              disabled={status === "loading"}
            >
              <Download size={18} />
              {status === "loading"
                ? kk
                  ? "Дайындалуда…"
                  : "Подготовка…"
                : kk
                  ? "Ашықхатты жүктеу"
                  : "Скачать открытку"}
            </button>
          </div>
          <small className="keepsake-note" role="status">
            {status === "error"
              ? kk
                ? "Жүктеу орындалмады. Қайта байқап көр."
                : "Не удалось скачать. Попробуй ещё раз."
              : status === "done"
                ? kk
                  ? "Ашықхат дайын — жүктеу басталды."
                  : "Открытка готова — загрузка началась."
                : kk
                  ? "Фото авторы мен лицензиясы ашықхатқа қосылады."
                  : "Автор фото и лицензия включены в открытку."}
          </small>
        </div>
      </div>
    </section>
  );
}

export function Experiences({ tour, lang, onSelect }: Props) {
  return (
    <div className="experiences" id="experiences">
      {onSelect && (
        <div
          className="experience-destinations"
          aria-label={
            lang === "kk" ? "Әсерге арналған бағыт" : "Маршрут для впечатлений"
          }
        >
          {tours.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-pressed={item.id === tour.id}
            >
              {item.name[lang]}
            </button>
          ))}
        </div>
      )}
      <Immersion tour={tour} lang={lang} />
      <Journey tour={tour} lang={lang} />
      <Keepsakes tour={tour} lang={lang} />
    </div>
  );
}
