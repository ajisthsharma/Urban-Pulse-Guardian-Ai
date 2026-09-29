import React, { useState, useEffect, useRef } from "react";
import L from "../utils/initLeaflet";
import { createOsmTileLayer, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../utils/mapConfig";
import { Report } from "../types";
import { MapPin, AlertCircle, Clock, Shield, Filter, Eye, ChevronRight } from "lucide-react";

interface CitizenRoadRiskMapProps {
  reports: Report[];
  onSelectReport?: (report: Report) => void;
  onNavigateToReportIssue?: () => void;
}

export default function CitizenRoadRiskMap({
  reports,
  onSelectReport,
  onNavigateToReportIssue
}: CitizenRoadRiskMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedIncident, setSelectedIncident] = useState<Report | null>(null);
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  // Filter road reports
  const activeReports = reports.filter((r) => r.status !== "Resolved");

  const filteredReports = activeReports.filter((r) => {
    const sev = Number(r.severity ?? 50);
    if (riskFilter === "HIGH") return sev >= 75 || r.riskLevel === "High";
    if (riskFilter === "MEDIUM") return (sev >= 45 && sev < 75) || r.riskLevel === "Medium";
    if (riskFilter === "LOW") return sev < 45 || r.riskLevel === "Low";
    return true;
  });

  // Calculate relative time
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  // Initialize Leaflet Map (Carto OpenStreetMap tiles - NO API KEY REQUIRED)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Delhi NCR by default or first report
    const initialLat = reports[0]?.latitude || DEFAULT_MAP_CENTER[0];
    const initialLng = reports[0]?.longitude || DEFAULT_MAP_CENTER[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: DEFAULT_MAP_ZOOM,
      zoomControl: true,
      attributionControl: true
    });

    const osmLayer = createOsmTileLayer();
    osmLayer.addTo(map);

    // Invalidate map size so OSM tiles render cleanly
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers with Filtered Reports
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: [number, number][] = [];

    filteredReports.forEach((rep) => {
      const lat = Number(rep.latitude);
      const lng = Number(rep.longitude);
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      bounds.push([lat, lng]);

      const sev = Number(rep.severity ?? 50);
      const isHigh = sev >= 75 || rep.riskLevel === "High";
      const isMedium = !isHigh && (sev >= 45 || rep.riskLevel === "Medium");

      const pinColor = isHigh ? "#DC2626" : isMedium ? "#D97706" : "#16A34A";
      const borderColor = isHigh ? "#991B1B" : isMedium ? "#B45309" : "#15803D";

      const customIcon = L.divIcon({
        className: "custom-road-marker",
        html: `
          <div style="
            width: 22px; 
            height: 22px; 
            background: ${pinColor}; 
            border: 2.5px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on("click", () => {
        setSelectedIncident(rep);
        map.flyTo([lat, lng], 15, { duration: 0.5 });
      });

      marker.addTo(layerGroup);
    });

    if (bounds.length > 0 && !selectedIncident) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [filteredReports, selectedIncident]);

  return (
    <div className="w-full flex flex-col gap-5 text-left">
      
      {/* Header and Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
              ROAD HAZARD OVERLAY
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
              ROAD RISK MAP
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Live spatial overview of reported road hazards, potholes, and infrastructure risks across your area.
            </p>
          </div>

          {onNavigateToReportIssue && (
            <button
              onClick={onNavigateToReportIssue}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Report Road Issue</span>
            </button>
          )}
        </div>

        {/* Risk Legend & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-[#64748B] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#64748B]" /> Filter Risk:
            </span>

            <button
              onClick={() => setRiskFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                riskFilter === "ALL"
                  ? "bg-[#172033] text-white"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              All ({activeReports.length})
            </button>

            <button
              onClick={() => setRiskFilter("HIGH")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                riskFilter === "HIGH"
                  ? "bg-[#DC2626] text-white"
                  : "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
              }`}
            >
              <span>🔴 High Risk</span>
            </button>

            <button
              onClick={() => setRiskFilter("MEDIUM")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                riskFilter === "MEDIUM"
                  ? "bg-[#D97706] text-white"
                  : "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]"
              }`}
            >
              <span>🟠 Medium Risk</span>
            </button>

            <button
              onClick={() => setRiskFilter("LOW")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                riskFilter === "LOW"
                  ? "bg-[#16A34A] text-white"
                  : "bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7]"
              }`}
            >
              <span>🟢 Low Risk</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#64748B]">
            Showing {filteredReports.length} Active Incidents
          </span>
        </div>
      </div>

      {/* Main Map & Incident Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Map Container (Span 8) */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold text-[#172033] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Interactive Incident Pins</span>
            </span>
            <span className="text-[10px] text-[#94A3B8]">Click any pin or incident to inspect details</span>
          </div>

          <div className="relative w-full h-[440px] sm:h-[500px] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-inner bg-[#F8FAFC]">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
        </div>

        {/* Incident Inspector & List (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Selected Incident Card */}
          {selectedIncident ? (
            <div className="bg-white border-2 border-[#2563EB] shadow-xs rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  {selectedIncident.id}
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {getRelativeTime(selectedIncident.createdAt)}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Issue
                </span>
                <h3 className="text-sm font-extrabold text-[#172033] mt-0.5">
                  {selectedIncident.title}
                </h3>
                <span className="text-[11px] font-semibold text-[#2563EB]">
                  Category: {selectedIncident.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase block">Risk Score</span>
                  <span className="font-black text-sm text-[#172033] block mt-0.5">
                    {selectedIncident.severity} / 100
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase block">Status</span>
                  <span className="font-bold text-xs text-[#2563EB] block mt-0.5">
                    {selectedIncident.status}
                  </span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] text-xs">
                <span className="text-[9px] font-bold text-[#64748B] uppercase block mb-0.5">Location</span>
                <div className="flex items-center gap-1 text-[#172033]">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span className="text-[11px] font-medium">{selectedIncident.location}</span>
                </div>
              </div>

              {selectedIncident.image && (
                <div className="aspect-video max-h-36 rounded-lg overflow-hidden border border-[#E2E8F0] bg-slate-100">
                  <img
                    src={selectedIncident.image}
                    alt="Evidence Thumbnail"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {onSelectReport && (
                <button
                  onClick={() => onSelectReport(selectedIncident)}
                  className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Incident Record</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl p-6 text-center text-[#64748B]">
              <MapPin className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <h4 className="text-xs font-bold text-[#172033] mb-1">Select an Incident</h4>
              <p className="text-[11px] text-[#64748B]">
                Click any marker on the map to review the issue, risk score, and resolution status.
              </p>
            </div>
          )}

          {/* Quick List of Nearby Incidents */}
          <div className="bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <span className="text-xs font-bold text-[#172033]">
                Incident Stream ({filteredReports.length})
              </span>
              <span className="text-[10px] text-[#64748B]">Recent first</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredReports.length === 0 ? (
                <p className="text-xs text-[#94A3B8] text-center py-6">
                  No active incidents matching selected risk filter.
                </p>
              ) : (
                filteredReports.slice(0, 8).map((rep) => {
                  const sev = Number(rep.severity ?? 50);
                  const isHigh = sev >= 75 || rep.riskLevel === "High";
                  const isMed = !isHigh && (sev >= 45 || rep.riskLevel === "Medium");

                  return (
                    <div
                      key={rep.id}
                      onClick={() => {
                        setSelectedIncident(rep);
                        const lat = Number(rep.latitude);
                        const lng = Number(rep.longitude);
                        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.5 });
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedIncident?.id === rep.id
                          ? "bg-[#EFF6FF] border-[#2563EB]"
                          : "bg-[#F8FAFC] hover:bg-white border-[#E2E8F0]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            isHigh ? "bg-[#DC2626]" : isMed ? "bg-[#D97706]" : "bg-[#16A34A]"
                          }`} />
                          <span className="font-mono text-[9px] font-bold text-[#64748B]">{rep.id}</span>
                          <span className="text-[10px] font-semibold text-[#172033] truncate">{rep.category}</span>
                        </div>
                        <p className="text-[11px] font-bold text-[#172033] truncate mt-0.5">{rep.title}</p>
                        <p className="text-[9.5px] text-[#64748B] truncate">{rep.location}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-[#172033] block">
                          {rep.severity}/100
                        </span>
                        <span className="text-[9px] text-[#64748B]">
                          {getRelativeTime(rep.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
