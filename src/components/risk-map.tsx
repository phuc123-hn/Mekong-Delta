'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Region, RegionReading } from '@/data/mekong-regions';
import { LEVEL_META, metricByKey } from '@/lib/risk';
import { levelFor, MapMode } from '@/lib/map-modes';

/**
 * Bản đồ dùng Leaflet trực tiếp (không qua react-leaflet).
 * Lý do: Next.js 16 chạy React 19 ở chế độ Strict Mode, gọi hàm tạo bản đồ của react-leaflet 4 hai lần trên cùng
 * một thẻ div nên báo "Map container is already initialized". Ở đây bản đồ được tạo trong useEffect và luôn
 * được hủy (map.remove) trong hàm dọn dẹp, nên chạy đúng dù effect bị gọi lặp lại.
 */
const NO_DATA = '#64748b';

// Nền bản đồ: ưu tiên MapTiler (khóa trong .env.local), tự chuyển sang OpenStreetMap nếu MapTiler lỗi.
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const MAPTILER_STYLE = process.env.NEXT_PUBLIC_MAPTILER_STYLE || 'streets-v2-dark';
type TileSource = 'maptiler' | 'osm';

const TILES: Record<TileSource, { url: string; options: L.TileLayerOptions }> = {
  maptiler: {
    url: `https://api.maptiler.com/maps/${MAPTILER_STYLE}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    options: {
      // Ảnh MapTiler là 512px: Leaflet cần tileSize 512 và zoomOffset -1 để hiển thị đúng
      tileSize: 512,
      zoomOffset: -1,
      crossOrigin: true,
      attribution:
        '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">&copy; OpenStreetMap contributors</a>',
    },
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 },
  },
};

interface Props {
  regions: Region[];
  byCode: Map<string, RegionReading>;
  mode: MapMode;
  selected: string | null;
  onSelect: (code: string) => void;
}

export default function RiskMap({ regions, byCode, mode, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [source, setSource] = useState<TileSource>(MAPTILER_KEY ? 'maptiler' : 'osm');
  const [tilesFailed, setTilesFailed] = useState(false);

  // Giữ giá trị mới nhất cho các hàm xử lý sự kiện của Leaflet mà không phải đăng ký lại
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const tileErrors = useRef(0);

  // 1) Tạo bản đồ khi gắn vào trang, hủy hoàn toàn khi rời trang (an toàn với Strict Mode)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const m = L.map(el, { center: [10.0, 105.7], zoom: 8, minZoom: 7, maxZoom: 13, zoomControl: false, scrollWheelZoom: true });
    L.control.zoom({ position: 'topright' }).addTo(m);
    setMap(m);

    // Leaflet cần tính lại kích thước khi khung chứa đổi (mở menu, xoay màn hình, đổi bố cục)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => m.invalidateSize()) : null;
    ro?.observe(el);

    return () => {
      ro?.disconnect();
      m.stop(); // dừng hiệu ứng bay/trượt đang chạy trước khi hủy
      m.remove();
      setMap(null);
    };
  }, []);

  // 2) Ảnh nền
  useEffect(() => {
    if (!map) return;
    tileErrors.current = 0;
    const cfg = TILES[source];
    const layer = L.tileLayer(cfg.url, cfg.options);
    const onError = () => {
      tileErrors.current += 1;
      if (tileErrors.current < 4) return;
      tileErrors.current = 0;
      // Quá 4 ô nền lỗi: MapTiler -> OpenStreetMap; OpenStreetMap -> hiện hướng dẫn
      if (sourceRef.current === 'maptiler') {
        console.warn('[Bản đồ] Không tải được ảnh nền MapTiler, chuyển sang OpenStreetMap. Kiểm tra NEXT_PUBLIC_MAPTILER_KEY.');
        setSource('osm');
      } else {
        setTilesFailed(true);
      }
    };
    const onLoad = () => {
      tileErrors.current = 0;
      setTilesFailed(false);
    };
    layer.on('tileerror', onError);
    layer.on('tileload', onLoad);
    layer.addTo(map);
    return () => {
      // Chỉ gỡ đúng listener của mình. KHÔNG gọi layer.off() vì sẽ xóa luôn listener nội bộ của Leaflet
      // và để lớp nền cũ "treo" lại trên bản đồ, gây lỗi khi zoom.
      layer.off('tileerror', onError);
      layer.off('tileload', onLoad);
      layer.remove();
    };
  }, [map, source]);

  // 3) Các điểm tỉnh: dựng lại khi dữ liệu, chế độ hoặc tỉnh đang chọn thay đổi (chỉ 13 điểm nên rất nhẹ)
  useEffect(() => {
    if (!map) return;
    const group = L.layerGroup().addTo(map);

    regions.forEach((r) => {
      const reading = byCode.get(r.code);
      const level = levelFor(reading, mode);
      const isSel = selected === r.code;
      const color = level ? LEVEL_META[level].color : NO_DATA;

      let text = r.name;
      if (reading && mode !== 'overall') {
        const spec = metricByKey(mode);
        const v = String(Math.round(reading[spec.key] * 10) / 10).replace('.', ',');
        text += `: ${v}${spec.unit ? (spec.unit === '‰' || spec.unit === '°C' ? '' : ' ') + spec.unit : ''}`;
      } else if (level) {
        text += `: ${LEVEL_META[level].label}`;
      } else {
        text += ': chưa có số liệu';
      }
      const tip = document.createElement('span'); // dùng textContent để không chèn HTML
      tip.className = 'text-xs font-semibold';
      tip.textContent = text;

      L.circleMarker([r.lat, r.lng], {
        radius: isSel ? 20 : 15,
        color: isSel ? '#e0f2fe' : '#0f172a',
        weight: isSel ? 4 : 2,
        fillColor: color,
        fillOpacity: reading ? 0.85 : 0.5,
      })
        .bindTooltip(tip, { direction: 'top', offset: [0, -12], permanent: isSel })
        .on('click', () => onSelectRef.current(r.code))
        .addTo(group);
    });

    return () => {
      group.remove();
    };
  }, [map, regions, byCode, mode, selected]);

  // 4) Bay tới tỉnh vừa chọn
  useEffect(() => {
    if (!map || !selected) return;
    const r = regions.find((x) => x.code === selected);
    if (r) map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 9), { duration: 0.6 });
    // chỉ bay khi đổi tỉnh, không bay lại mỗi lần số liệu được làm mới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selected]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {tilesFailed && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] mx-auto max-w-xl rounded-lg border border-yellow-500/40 bg-slate-900/95 px-4 py-3 text-sm text-yellow-100 shadow-xl">
          Không tải được ảnh nền bản đồ nên chỉ thấy các điểm rủi ro (số liệu vẫn đúng). Hãy kiểm tra kết nối mạng và khóa NEXT_PUBLIC_MAPTILER_KEY trong file .env.local, sau đó khởi động lại web.
        </div>
      )}
    </div>
  );
}
