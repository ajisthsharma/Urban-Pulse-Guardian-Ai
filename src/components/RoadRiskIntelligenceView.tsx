import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "../utils/initLeaflet";
import { 
  ShieldAlert, AlertTriangle, Activity, Camera, Users, 
  Clock, MapPin, CheckCircle2, ChevronRight, Filter, 
  Layers, Sparkles, AlertOctagon, ArrowUpRight, ShieldCheck,
  Search, Info, Eye, ExternalLink, RefreshCw
} from "lucide-react";
import { Report, RoadRiskSegment, CorridorRiskLevel, CorroborationState } from "../types";
import { buildRoadRiskIntelligence } from "../services/roadRiskIntelligence";
import { createOsmTileLayer } from "../utils/mapConfig";

interface RoadRiskIntelligenceViewProps {
  reports: Report[];
  onSelectReport?: (report: Report) => void;
  onNavigateToDispatch?: () => void;
  userRole?: string;
}

function getRelativeTime(isoString: string): string {
  try {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return "Recently";
  }
}

export default function RoadRiskIntelligenceView({
  reports,
  onSelectReport,
  onNavigateToDispatch,
  userRole = "citizen"
}: RoadRiskIntelligenceViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const corridorLayersRef = useRef<{ [key: string]: L.LayerGroup }>({});

  // Compute road segments deterministically from real Firestore reports
  const allSegments = useMemo(() => buildRoadRiskIntelligence(reports), [reports]);

  // Filters state
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [corroborationFilter, setCorroborationFilter] = useState<string>("ALL");
  const [onlyActive, setOnlyActive] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected corridor segment state
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    allSegments.length > 0 ? allSegments[0].id : null
  );

  // Filtered segments
  const filteredSegments = useMemo(() => {
    return allSegments.filter(seg => {
      if (riskFilter !== "ALL" && seg.riskLevel !== riskFilter) return false;
      if (corroborationFilter !== "ALL" && seg.corroborationState !== corroborationFilter) return false;
      if (onlyActive && seg.activeReportsCount === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = seg.corridorName.toLowerCase().includes(q);
        const matchCat = seg.dominantCategory.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      return true;
    });
  }, [allSegments, riskFilter, corroborationFilter, onlyActive, searchQuery]);

  // Active selected segment object
  const activeSegment = useMemo(() => {
    if (!selectedSegmentId) return filteredSegments[0] || null;
    return allSegments.find(s => s.id === selectedSegmentId) || filteredSegments[0] || null;
  }, [allSegments, filteredSegments, selectedSegmentId]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalCorridors = allSegments.length;
    const criticalZones = allSegments.filter(s => s.riskLevel === "CRITICAL" && s.activeReportsCount > 0).length;
    const corroboratedZones = allSegments.filter(s => (s.corroborationState === "MULTI-SOURCE CORROBORATED" || s.corroborationState === "PERSISTENT OBSERVATION") && s.activeReportsCount > 0).length;
    const totalActiveHazards = allSegments.reduce((sum, s) => sum + s.activeReportsCount, 0);

    return {
      totalCorridors,
      criticalZones,
      corroboratedZones,
      totalActiveHazards
    };
  }, [allSegments]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on first segment or Delhi default
    const initialLat = allSegments[0]?.centerLat || 28.6139;
    const initialLng = allSegments[0]?.centerLng || 77.2090;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: false
    });

    createOsmTileLayer().addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Synchronize Leaflet Corridor Layers with filtered segments
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers
    Object.values(corridorLayersRef.current).forEach((layerGroup: L.LayerGroup) => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
    });
    corridorLayersRef.current = {};

    filteredSegments.forEach(seg => {
      const layerGroup = L.layerGroup();

      const isSelected = activeSegment?.id === seg.id;

      // Color selection based on risk
      let strokeColor = "#16A34A";
      let fillColor = "#22C55E";
      if (seg.riskLevel === "CRITICAL") {
        strokeColor = "#DC2626";
        fillColor = "#EF4444";
      } else if (seg.riskLevel === "HIGH") {
        strokeColor = "#EA580C";
        fillColor = "#F97316";
      } else if (seg.riskLevel === "MODERATE") {
        strokeColor = "#D97706";
        fillColor = "#FBBF24";
      }

      // Outer risk corridor perimeter circle
      const circle = L.circle([seg.centerLat, seg.centerLng], {
        radius: seg.radiusMeters,
        color: strokeColor,
        weight: isSelected ? 3 : 1.5,
        opacity: isSelected ? 0.95 : 0.6,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.22 : 0.10,
        dashArray: (seg.corroborationState === "MULTI-SOURCE CORROBORATED" || seg.corroborationState === "PERSISTENT OBSERVATION") ? undefined : "4, 4"
      });

      circle.on("click", () => {
        setSelectedSegmentId(seg.id);
      });

      circle.addTo(layerGroup);

      // Centroid marker with custom HTML badge
      const iconHtml = `
        <div style="
          background: ${strokeColor};
          color: white;
          padding: 3px 7px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
          cursor: pointer;
          transform: translate(-50%, -50%);
          white-space: nowrap;
        ">
          <span>${seg.riskScore}</span>
          <span style="font-size: 9px; opacity: 0.9;">${seg.riskLevel}</span>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: iconHtml,
        className: "road-risk-corridor-icon",
        iconSize: [40, 24],
        iconAnchor: [20, 12]
      });

      const marker = L.marker([seg.centerLat, seg.centerLng], { icon: markerIcon });
      marker.on("click", () => {
        setSelectedSegmentId(seg.id);
      });
      marker.addTo(layerGroup);

      // Plot individual member incident points inside the corridor
      seg.reports.forEach(r => {
        const isRoadScanner = r.source === "ROAD_SCANNER";
        const isResolved = r.status === "Resolved";
        const dotColor = isResolved ? "#94A3B8" : isRoadScanner ? "#7C3AED" : "#2563EB";

        const dotMarker = L.circleMarker([Number(r.latitude), Number(r.longitude)], {
          radius: isSelected ? 5.5 : 4,
          color: "#ffffff",
          weight: 1.5,
          fillColor: dotColor,
          fillOpacity: 0.9
        });

        dotMarker.bindTooltip(`
          <div style="font-size: 11px; font-weight: bold; color: #1e293b;">
            ${r.title}
          </div>
          <div style="font-size: 9.5px; color: #64748b;">
            ${isRoadScanner ? "AI Road Scanner" : "Citizen Report"} • ${r.severity}% Sev • ${r.status}
          </div>
        `, { direction: "top", offset: [0, -4] });

        dotMarker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedSegmentId(seg.id);
          if (onSelectReport) {
            onSelectReport(r);
          }
        });

        dotMarker.addTo(layerGroup);
      });

      layerGroup.addTo(map);
      corridorLayersRef.current[seg.id] = layerGroup;
    });
  }, [filteredSegments, activeSegment?.id, onSelectReport]);

  // Fly to active segment when selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeSegment) return;

    map.flyTo([activeSegment.centerLat, activeSegment.centerLng], 14, {
      duration: 0.8
    });
  }, [activeSegment?.id]);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      
      {/* 1. HEADER & EXECUTIVE METRICS BAR */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFF6FF] text-[#2563EB] rounded-full text-xs font-bold font-mono border border-[#DBEAFE] mb-2.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            ROAD RISK INTELLIGENCE LAYER • SEGUE 3.0
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Corridor Risk Intelligence Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
            Fusing autonomous AI road scanner telemetry with citizen ground reports to detect, assess, and prioritize municipal interventions before incidents escalate.
          </p>
        </div>

        {/* 4 Core Quantitative Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:w-auto w-full">
          
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Monitored Zones</span>
            <span className="text-2xl font-black text-[#172033] mt-1">{summaryMetrics.totalCorridors}</span>
            <span className="text-[9.5px] text-[#64748B] mt-0.5">Active spatial clusters</span>
          </div>

          <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl flex flex-col">
            <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider">Critical Risk</span>
            <span className="text-2xl font-black text-[#DC2626] mt-1">{summaryMetrics.criticalZones}</span>
            <span className="text-[9.5px] text-[#991B1B] mt-0.5">Score ≥ 80 / 100</span>
          </div>

          <div className="p-3.5 bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl flex flex-col">
            <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">Corroborated</span>
            <span className="text-2xl font-black text-[#7C3AED] mt-1">{summaryMetrics.corroboratedZones}</span>
            <span className="text-[9.5px] text-[#6D28D9] mt-0.5">AI + Citizen verified</span>
          </div>

          <div className="p-3.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl flex flex-col">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Active Hazards</span>
            <span className="text-2xl font-black text-[#2563EB] mt-1">{summaryMetrics.totalActiveHazards}</span>
            <span className="text-[9.5px] text-[#1D4ED8] mt-0.5">Unresolved tickets</span>
          </div>

        </div>
      </div>

      {/* 2. FILTER & CONTROLS TOOLBAR */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Corridor */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search corridor or hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] w-full"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-[#E2E8F0] rounded-xl">
            <span className="text-[10px] font-bold text-[#64748B] px-2 uppercase">Risk:</span>
            {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-colors cursor-pointer ${
                  riskFilter === level
                    ? "bg-white text-[#2563EB] shadow-2xs border border-[#E2E8F0]"
                    : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Corroboration Filter */}
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-[#E2E8F0] rounded-xl hidden md:flex">
            <span className="text-[10px] font-bold text-[#64748B] px-2 uppercase">Evidence:</span>
            {[
              { id: "ALL", label: "All" },
              { id: "MULTI-SOURCE CORROBORATED", label: "Corroborated" },
              { id: "PERSISTENT OBSERVATION", label: "Persistent" },
              { id: "AI OBSERVED", label: "AI Only" },
              { id: "CITIZEN REPORTED", label: "Citizen" },
              { id: "EMERGING / LOW EVIDENCE", label: "Emerging" }
            ].map((ev) => (
              <button
                key={ev.id}
                onClick={() => setCorroborationFilter(ev.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-colors cursor-pointer ${
                  corroborationFilter === ev.id
                    ? "bg-white text-[#7C3AED] shadow-2xs border border-[#DDD6FE]"
                    : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                {ev.label}
              </button>
            ))}
          </div>

        </div>

        {/* Toggle Active vs All */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#334155]">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#2563EB] focus:ring-0 cursor-pointer"
            />
            <span>Active Issues Only</span>
          </label>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID: MAP + INTELLIGENCE DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: LEAFLET CORRIDOR MAP (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl p-4 shadow-xs flex flex-col gap-4">
          
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-bold text-sm text-[#172033]">
                Metropolitan Corridor Risk Map
              </h3>
              <span className="text-[10.5px] px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] font-bold rounded-full border border-[#DBEAFE]">
                {filteredSegments.length} Visible Segments
              </span>
            </div>

            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[10px] font-bold text-[#64748B]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Critical (≥80)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" /> High (65-79)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Moderate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" /> Low
              </span>
            </div>
          </div>

          {/* Leaflet DOM container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[520px] rounded-2xl overflow-hidden border border-[#E2E8F0] relative z-0"
          />

          {/* Corridor Selection Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 px-1">
            {filteredSegments.map(seg => {
              const isSelected = activeSegment?.id === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setSelectedSegmentId(seg.id)}
                  className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all cursor-pointer flex flex-col gap-1 min-w-[170px] ${
                    isSelected
                      ? "bg-[#EFF6FF] border-[#2563EB] shadow-2xs"
                      : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#172033] truncate max-w-[110px]">
                      {seg.corridorName}
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      seg.riskLevel === "CRITICAL" ? "bg-[#FEF2F2] text-[#DC2626]" :
                      seg.riskLevel === "HIGH" ? "bg-[#FFF7ED] text-[#EA580C]" :
                      seg.riskLevel === "MODERATE" ? "bg-[#FFFBEB] text-[#D97706]" :
                      "bg-[#F0FDF4] text-[#16A34A]"
                    }`}>
                      {seg.riskScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
                    <span>{seg.activeReportsCount} Active</span>
                    <span>•</span>
                    <span className="truncate">{seg.dominantCategory}</span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* RIGHT: CORRIDOR INTELLIGENCE DOSSIER (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {activeSegment ? (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col gap-5">
              
              {/* Dossier Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                      activeSegment.riskLevel === "CRITICAL" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" :
                      activeSegment.riskLevel === "HIGH" ? "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]" :
                      activeSegment.riskLevel === "MODERATE" ? "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]" :
                      "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]"
                    }`}>
                      {activeSegment.riskLevel} RISK ZONE
                    </span>
                    <span className="text-[10.5px] font-mono text-[#64748B]">
                      {activeSegment.centerLat.toFixed(4)}, {activeSegment.centerLng.toFixed(4)}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#172033] leading-snug">
                    {activeSegment.corridorName}
                  </h3>
                </div>

                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl shrink-0 min-w-[70px]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Score</span>
                  <span className={`text-3xl font-black ${
                    activeSegment.riskLevel === "CRITICAL" ? "text-[#DC2626]" :
                    activeSegment.riskLevel === "HIGH" ? "text-[#EA580C]" :
                    activeSegment.riskLevel === "MODERATE" ? "text-[#D97706]" :
                    "text-[#16A34A]"
                  }`}>
                    {activeSegment.riskScore}
                  </span>
                  <span className="text-[9px] text-[#94A3B8]">/ 100</span>
                </div>
              </div>

              {/* WHY THIS AREA IS FLAGGED (Explainability) */}
              <div>
                <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  Why This Area Is Flagged
                </h4>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col gap-2">
                  {activeSegment.reasonsList.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#334155] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTRIBUTING FACTORS (Bar Visualizers) */}
              <div>
                <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Deterministic Risk Factors
                </h4>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  
                  {/* Severity Factor */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-[#475569]">Hazard Severity Weight</span>
                      <span className="font-bold text-[#172033]">{activeSegment.factors.severityScore} / 30 pts</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${(activeSegment.factors.severityScore / 30) * 100}%` }} />
                    </div>
                  </div>

                  {/* Active Density */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-[#475569]">Active / Unresolved Backlog</span>
                      <span className="font-bold text-[#172033]">{activeSegment.factors.activeIncidentsScore} / 25 pts</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#DC2626] h-2 rounded-full" style={{ width: `${(activeSegment.factors.activeIncidentsScore / 25) * 100}%` }} />
                    </div>
                  </div>

                  {/* Recency */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-[#475569]">Telemetry Recency Factor</span>
                      <span className="font-bold text-[#172033]">{activeSegment.factors.recencyScore} / 15 pts</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#EA580C] h-2 rounded-full" style={{ width: `${(activeSegment.factors.recencyScore / 15) * 100}%` }} />
                    </div>
                  </div>

                  {/* Corroboration */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-[#475569]">Multi-Source Corroboration</span>
                      <span className="font-bold text-[#172033]">{activeSegment.factors.corroborationScore} / 15 pts</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#7C3AED] h-2 rounded-full" style={{ width: `${(activeSegment.factors.corroborationScore / 15) * 100}%` }} />
                    </div>
                  </div>

                  {/* Persistence */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-[#475569]">Observation Persistence Factor</span>
                      <span className="font-bold text-[#172033]">{activeSegment.factors.persistenceScore} / 15 pts</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#16A34A] h-2 rounded-full" style={{ width: `${(activeSegment.factors.persistenceScore / 15) * 100}%` }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* EVIDENCE FUSION & CORROBORATION */}
              <div className="grid grid-cols-2 gap-3">
                
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] mb-2">
                    <Camera className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>AI Road Scanner</span>
                  </div>
                  <span className="text-xl font-black text-[#172033]">{activeSegment.roadScannerCount}</span>
                  <span className="text-[10px] text-[#64748B] mt-0.5">Automated dashcam hits</span>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] mb-2">
                    <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Citizen Reports</span>
                  </div>
                  <span className="text-xl font-black text-[#172033]">{activeSegment.citizenReportCount}</span>
                  <span className="text-[10px] text-[#64748B] mt-0.5">Manual ground reports</span>
                </div>

              </div>

              {/* EVIDENCE STATE PILLS */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border ${
                  activeSegment.corroborationState === "MULTI-SOURCE CORROBORATED"
                    ? "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]"
                    : activeSegment.corroborationState === "PERSISTENT OBSERVATION"
                    ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                    : activeSegment.corroborationState === "AI OBSERVED"
                    ? "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]"
                    : activeSegment.corroborationState === "CITIZEN REPORTED"
                    ? "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]"
                    : activeSegment.corroborationState === "STALE HAZARD RECORD"
                    ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                    : activeSegment.corroborationState === "REMEDIATED ZONE"
                    ? "bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]"
                    : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]"
                }`}>
                  {activeSegment.corroborationState}
                </span>

                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]">
                  {activeSegment.persistenceState}
                </span>

                <span className="text-[10.5px] font-mono text-[#64748B] ml-auto">
                  Last seen: {getRelativeTime(activeSegment.lastSeenTimestamp)}
                </span>
              </div>

              {/* RECOMMENDED OPERATIONAL ACTION */}
              <div className={`p-4 rounded-2xl border ${
                activeSegment.riskLevel === "CRITICAL" ? "bg-[#FEF2F2] border-[#FECACA]" :
                activeSegment.riskLevel === "HIGH" ? "bg-[#FFF7ED] border-[#FFEDD5]" :
                "bg-[#EFF6FF] border-[#DBEAFE]"
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10.5px] font-black uppercase tracking-wider ${
                    activeSegment.riskLevel === "CRITICAL" ? "text-[#DC2626]" :
                    activeSegment.riskLevel === "HIGH" ? "text-[#EA580C]" :
                    "text-[#2563EB]"
                  }`}>
                    Action Priority: {activeSegment.recommendedAction.priority} (Suggested Target: {activeSegment.recommendedAction.suggestedTargetHours || activeSegment.recommendedAction.slaHours}h)
                  </span>
                  <span className="text-[10px] font-bold text-[#64748B]">
                    {activeSegment.recommendedAction.targetAuthority}
                  </span>
                </div>
                <h5 className="font-extrabold text-sm text-[#172033] mb-1">
                  {activeSegment.recommendedAction.actionTitle}
                </h5>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {activeSegment.recommendedAction.actionDescription}
                </p>
                <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#64748B]">
                  <span className="italic">
                    {activeSegment.recommendedAction.policyDisclaimer || "Prototype response policy — operational target rule, not statutory municipal SLA."}
                  </span>
                  <span className="font-mono bg-white/70 px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                    PROTOTYPE RULE
                  </span>
                </div>
                
                {/* Municipal Dispatch Connection */}
                {userRole !== "citizen" && onNavigateToDispatch && (
                  <button
                    onClick={onNavigateToDispatch}
                    className="mt-3 px-3.5 py-1.5 bg-[#172033] hover:bg-[#0F172A] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Dispatch Field Squad in Dispatch Management</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* AUDIT TRACEABILITY: UNDERLYING REPORTS LIST */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#2563EB]" />
                    Evidence Audit Trail ({activeSegment.auditRecords?.length || activeSegment.reports.length})
                  </h4>
                  <span className="text-[9.5px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                    Auditable Firestore IDs
                  </span>
                </div>
                <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-1">
                  {(activeSegment.auditRecords || activeSegment.reports.map(r => ({
                    id: r.id,
                    title: r.title,
                    source: r.source || "MANUAL_REPORT",
                    severity: Number(r.severity) || 50,
                    status: r.status,
                    createdAt: r.createdAt,
                    location: r.location || "Delhi NCR",
                    latitude: Number(r.latitude),
                    longitude: Number(r.longitude)
                  }))).map((audit) => (
                    <div
                      key={audit.id}
                      onClick={() => {
                        const originalReport = activeSegment.reports.find(r => r.id === audit.id);
                        if (originalReport && onSelectReport) onSelectReport(originalReport);
                      }}
                      className="p-2.5 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-xl flex flex-col gap-1 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            audit.status === "Resolved" ? "bg-[#94A3B8]" :
                            audit.severity >= 75 ? "bg-[#DC2626]" : "bg-[#2563EB]"
                          }`} />
                          <span className="font-bold text-[#172033] truncate">{audit.title}</span>
                        </div>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          audit.status === "Resolved" ? "bg-[#E2E8F0] text-[#475569]" : "bg-[#DBEAFE] text-[#1D4ED8]"
                        }`}>
                          {audit.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-[#64748B] font-mono">
                        <span className="font-semibold text-[#1E293B]">
                          ID: {audit.id.length > 14 ? `${audit.id.substring(0, 14)}...` : audit.id}
                        </span>
                        <span>•</span>
                        <span className={audit.source === "ROAD_SCANNER" ? "text-[#7C3AED] font-bold" : "text-[#2563EB] font-bold"}>
                          {audit.source === "ROAD_SCANNER" ? "AI Dashcam" : "Citizen"}
                        </span>
                        <span>•</span>
                        <span>{audit.severity}% Sev</span>
                        <span>•</span>
                        <span>{audit.latitude.toFixed(4)}, {audit.longitude.toFixed(4)}</span>
                        <span>•</span>
                        <span>{getRelativeTime(audit.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center text-sm text-[#64748B]">
              No corridor selected or no reports match the active filters.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
