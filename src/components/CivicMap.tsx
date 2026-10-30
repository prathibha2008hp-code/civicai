import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, HotspotInsight } from '../types/civic';

interface CivicMapProps {
  complaints?: Complaint[];
  hotspots?: HotspotInsight[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  // Pin picker mode for complaint submission
  pickerMode?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onLocationPick?: (coords: { lat: number; lng: number }) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints = [],
  hotspots = [],
  selectedComplaintId,
  onSelectComplaint,
  pickerMode = false,
  pickedLocation,
  onLocationPick,
  height = '480px',
  center = [12.9716, 77.5946], // Bangalore default
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | CivicAI GIS Engine',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map click for picker
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (pickerMode && onLocationPick) {
          onLocationPick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center/bounds if selected complaint changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedComplaintId) {
      const target = complaints.find((c) => c.id === selectedComplaintId || c.ticketNumber === selectedComplaintId);
      if (target && target.location?.lat && target.location?.lng) {
        mapInstanceRef.current.flyTo([target.location.lat, target.location.lng], 16, {
          duration: 1.2,
        });
      }
    }
  }, [selectedComplaintId, complaints]);

  // Handle picked location in picker mode
  useEffect(() => {
    if (!mapInstanceRef.current || !pickerMode) return;

    if (pickedLocation) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickedLocation.lat, pickedLocation.lng]);
      } else {
        const pickerIcon = L.divIcon({
          className: 'custom-picker-pin',
          html: `<div style="background-color: #059669; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        pickerMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
          icon: pickerIcon,
          draggable: true,
        }).addTo(mapInstanceRef.current);

        pickerMarkerRef.current.on('dragend', (e: any) => {
          const latlng = e.target.getLatLng();
          if (onLocationPick) {
            onLocationPick({ lat: latlng.lat, lng: latlng.lng });
          }
        });
      }
      mapInstanceRef.current.panTo([pickedLocation.lat, pickedLocation.lng]);
    }
  }, [pickedLocation, pickerMode, onLocationPick]);

  // Render markers and hotspots
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Hotspot zones (circles)
    hotspots.forEach((hs) => {
      const circle = L.circle([hs.lat, hs.lng], {
        radius: hs.radiusMeters,
        color: '#DC2626',
        fillColor: '#EF4444',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
      });

      circle.bindTooltip(
        `<strong>${hs.wardName}</strong><br/>Density: ${hs.complaintDensity} active incidents<br/>Trend: ${hs.riskTrend}`,
        { sticky: true }
      );
      markersLayerRef.current?.addLayer(circle);
    });

    // Complaint markers
    complaints.forEach((c) => {
      if (!c.location?.lat || !c.location?.lng) return;

      const isSelected = c.id === selectedComplaintId || c.ticketNumber === selectedComplaintId;

      // Color based on status / severity
      let markerColor = '#0F172A'; // navy
      if (c.status === 'Resolved') {
        markerColor = '#059669'; // emerald
      } else if (c.severity === 'Emergency') {
        markerColor = '#DC2626'; // crimson
      } else if (c.severity === 'High') {
        markerColor = '#EA580C'; // orange
      } else if (c.severity === 'Medium') {
        markerColor = '#D97706'; // amber
      }

      const pulseStyle = c.severity === 'Emergency' ? 'animation: pulse 1.5s infinite;' : '';

      const customIcon = L.divIcon({
        className: 'custom-civic-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 9999px;
            border: ${isSelected ? '3px solid #10B981' : '2px solid #FFFFFF'};
            box-shadow: 0 4px 12px rgba(15,23,42,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            font-family: Inter, sans-serif;
            ${pulseStyle}
          ">
            ${c.priorityScore || 50}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([c.location.lat, c.location.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748B;">${c.ticketNumber}</span>
            <span style="
              font-size: 10px;
              font-weight: 600;
              padding: 2px 8px;
              border-radius: 9999px;
              background: ${c.status === 'Resolved' ? '#ECFDF5' : '#FEF2F2'};
              color: ${c.status === 'Resolved' ? '#047857' : '#B91C1C'};
            ">${c.status}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 600; color: #0F172A; margin: 0 0 4px 0; line-height: 1.3;">${c.title}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">${c.location.address}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding-top: 6px; border-top: 1px solid #E2E8F0;">
            <span style="color: #64748B;">Priority Score: <strong style="color: #0F172A;">${c.priorityScore}/100</strong></span>
            <span style="color: #059669; font-weight: 600;">${c.supportersCount} Supporters</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectComplaint) {
          onSelectComplaint(c);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [complaints, hotspots, selectedComplaintId, onSelectComplaint]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[#E2E8F0] shadow-sm bg-slate-50">
      <div ref={mapContainerRef} style={{ height, width: '100%', zIndex: 1 }} />

      {/* Map Overlay Controls / HUD */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {pickerMode && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#CBD5E1] shadow-md text-xs font-medium text-[#0F172A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
            Click on map to drop or drag complaint pin
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#CBD5E1] shadow-md text-[11px] font-medium text-[#334155] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#DC2626]"></span>
          <span>Emergency (90+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#EA580C]"></span>
          <span>High (75-89)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#D97706]"></span>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#059669]"></span>
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
};
