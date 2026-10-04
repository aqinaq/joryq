import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Plus, Minus, LocateFixed, RotateCcw, Move } from "lucide-react";
import { tourThemes, type Tour, type Lang } from "../data";
import { copy } from "../i18n";
import "leaflet/dist/leaflet.css";
export default function TerrainMap({
  tour,
  lang,
  hero = false,
}: {
  tour: Tour;
  lang: Lang;
  hero?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    layer = useRef<L.LayerGroup | null>(null),
    tiles = useRef<L.TileLayer | null>(null);
  const [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false);
  const reset = () => {
    if (!map.current) return;
    const focus = hero ? tour.points.slice(1) : tour.points;
    const b = L.latLngBounds(focus.map((p) => p.pos));
    map.current.fitBounds(b, {
      paddingTopLeft:
        hero && window.innerWidth > 900
          ? [window.innerWidth * 0.4, 70]
          : [45, 70],
      paddingBottomRight:
        hero && window.innerWidth > 900 ? [330, 150] : [45, 90],
      maxZoom: 12,
      animate: !matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  };
  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      minZoom: 3,
      maxZoom: 16,
      keyboard: true,
    });
    map.current = m;
    const tile = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 17,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> · SRTM | <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA</a>)',
      },
    ).addTo(m);
    tiles.current = tile;
    let good = 0;
    tile.on("tileload", () => {
      good++;
      setReady(true);
      setFailed(false);
    });
    tile.on("tileerror", () => {
      if (!good) setFailed(true);
    });
    L.control.scale({ position: "bottomleft", imperial: false }).addTo(m);
    const obs = new ResizeObserver(() => {
      m.invalidateSize();
    });
    obs.observe(el.current);
    return () => {
      obs.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    layer.current?.remove();
    const group = L.layerGroup().addTo(m);
    layer.current = group;
    L.polyline(
      tour.points.map((p) => p.pos),
      { color: tourThemes[tour.id]?.paper || "#f1f5dc", weight: 6, opacity: 0.9 },
    ).addTo(group);
    L.polyline(
      tour.points.map((p) => p.pos),
      { color: tourThemes[tour.id]?.route || "#648b3e", weight: 3, dashArray: "8 7", opacity: 1 },
    ).addTo(group);
    tour.points.forEach((p, i) => {
      const marker = L.marker(p.pos, {
        icon: L.divIcon({
          className: "route-marker",
          html: `<span>${String(i + 1).padStart(2, "0")}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
        title: p.name[lang],
        keyboard: true,
      }).addTo(group);
      marker.bindTooltip(p.name[lang], {
        permanent: true,
        direction: i % 2 ? "right" : "top",
        offset: i % 2 ? [16, 0] : [0, -18],
        className: "route-label",
      });
      const content = document.createElement("div");
      content.className = "map-popup";
      const title = document.createElement("strong");
      title.textContent = p.name[lang];
      const coord = document.createElement("p");
      coord.textContent = `${p.pos[0].toFixed(3)}° N · ${p.pos[1].toFixed(3)}° E`;
      content.append(title, coord);
      marker.bindPopup(content);
    });
    reset();
  }, [tour.id, lang]);
  return (
    <div className={`terrain-map ${hero ? "hero-map" : ""}`}>
      <div
        ref={el}
        className="leaflet-host"
        role="region"
        aria-label={copy.topo[lang]}
      />
      {!ready && !failed && (
        <div className="map-loading" aria-live="polite">
          {lang === "kk" ? "Карта жүктелуде…" : "Карта загружается…"}
        </div>
      )}
      {failed && (
        <div className="map-error">
          {copy.mapError[lang]}
          <button
            onClick={() => {
              setFailed(false);
              tiles.current?.redraw();
            }}
          >
            <RotateCcw size={15} />
            {copy.retry[lang]}
          </button>
        </div>
      )}
      <div className="map-controls">
        <button
          aria-label={copy.zoomIn[lang]}
          onClick={() => map.current?.zoomIn()}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label={copy.zoomOut[lang]}
          onClick={() => map.current?.zoomOut()}
        >
          <Minus size={18} />
        </button>
        <button aria-label={copy.resetMap[lang]} onClick={reset}>
          <LocateFixed size={18} />
        </button>
      </div>
      {hero && (
        <div className="map-hint">
          <Move size={13} />
          {copy.mapHint[lang]}
        </div>
      )}
    </div>
  );
}
