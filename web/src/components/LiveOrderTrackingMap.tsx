import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Clock, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { deliveryRepository } from '../repositories/deliveryRepository';
import { DeliveryLocation } from '../models';

interface LiveOrderTrackingMapProps {
  orderId: string;
  orderNumber?: string;
  deliveryStatus: string;
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  customerAddress?: string;
}

export const LiveOrderTrackingMap: React.FC<LiveOrderTrackingMapProps> = ({
  orderId,
  orderNumber,
  deliveryStatus,
  assignedRiderName,
  assignedRiderPhone,
  customerAddress
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);

  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [isStale, setIsStale] = useState(false);

  // Default Store Location (Uttara, Dhaka Hub)
  const STORE_COORDS: [number, number] = [23.8759, 90.3795];
  // Approximate Destination in Dhaka
  const DEST_COORDS: [number, number] = [23.7925, 90.4078];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: STORE_COORDS,
      zoom: 13,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    // Add OpenStreetMap tile layer (Free-to-start with standard OSM attribution)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Store Marker Icon
    const storeIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background: #156b3c; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(21, 107, 60, 0.4); border: 2px solid white; font-size: 18px;">
          🥭
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    // Custom Destination Marker Icon
    const destIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background: #e11d48; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4); border: 2px solid white; font-size: 18px;">
          🏠
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    // Add Store & Destination markers
    storeMarkerRef.current = L.marker(STORE_COORDS, { icon: storeIcon })
      .addTo(map)
      .bindPopup('<strong>ফল মিষ্টি হাব</strong><br>উত্তরা, ঢাকা');

    destMarkerRef.current = L.marker(DEST_COORDS, { icon: destIcon })
      .addTo(map)
      .bindPopup(`<strong>গ্রাহকের ঠিকানা</strong><br>${customerAddress || 'ডেলিভারি গন্তব্য'}`);

    // Fit bounds to store and destination initially
    const bounds = L.latLngBounds([STORE_COORDS, DEST_COORDS]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Subscribe to live GPS updates for this order
    const unsubscribe = deliveryRepository.subscribeToLocation(orderId, (loc) => {
      if (loc && loc.latitude && loc.longitude) {
        setLocation(loc);

        // Check if stale (> 5 minutes old)
        if (loc.timestamp) {
          const diffMs = Date.now() - new Date(loc.timestamp).getTime();
          setIsStale(diffMs > 5 * 60 * 1000);
        }

        const riderLatLng: [number, number] = [loc.latitude, loc.longitude];

        // Custom Rider Icon with pulse
        const riderIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div style="position: relative;">
              <div style="position: absolute; top: -6px; left: -6px; width: 48px; height: 48px; border-radius: 50%; background: rgba(22, 163, 74, 0.25); animation: pulse 2s infinite;"></div>
              <div style="background: #f59e0b; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5); border: 2px solid white; font-size: 18px; position: relative;">
                🏍️
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng(riderLatLng);
        } else if (mapInstanceRef.current) {
          riderMarkerRef.current = L.marker(riderLatLng, { icon: riderIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`<strong>ডেলিভারি রাইডার: ${assignedRiderName || 'অন দ্য ওয়ে'}</strong><br>আপনার পণ্য নিয়ে অগ্রসর হচ্ছেন`);
        }

        // Adjust map bounds to include rider and destination
        if (mapInstanceRef.current) {
          const liveBounds = L.latLngBounds([riderLatLng, DEST_COORDS]);
          mapInstanceRef.current.fitBounds(liveBounds, { padding: [50, 50], maxZoom: 16 });
        }
      }
    });

    return () => {
      unsubscribe();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [orderId, customerAddress, assignedRiderName]);

  const hasLiveCoords = location && location.latitude && location.longitude && location.status !== 'ended';

  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
      {/* Map Header */}
      <div style={{ padding: '1rem 1.25rem', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>
            লাইভ অর্ডার ট্র্যাকিং ম্যাপ
          </span>
        </div>

        {hasLiveCoords ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: isStale ? '#b45309' : '#16a34a', background: isStale ? '#fef3c7' : 'rgba(22, 163, 74, 0.1)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isStale ? '#eab308' : '#16a34a',
                display: 'inline-block'
              }}
            />
            <span>{isStale ? 'সিগন্যাল বিলম্বিত (GPS Delay)' : 'লাইভ জিপিএস সংযোগ সক্রিয়'}</span>
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {deliveryStatus === 'out_for_delivery' ? 'জিপিএস সংযোগ স্থাপিত হচ্ছে...' : 'রাইডার রওনা হলে লাইভ জিপিএস দৃশ্যমান হবে'}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '380px',
          background: '#e5e7eb',
          position: 'relative'
        }}
      />

      {/* Map Footer & Legend */}
      <div style={{ padding: '0.85rem 1.25rem', background: 'var(--color-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🥭</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>ফল মিষ্টি হাব (উৎস)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🏍️</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>ডেলিভারি রাইডার</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🏠</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>আপনার ঠিকানা</span>
          </div>
        </div>

        {location?.timestamp && (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} />
            <span>সর্বশেষ আপডেট: {new Date(location.timestamp).toLocaleTimeString('bn-BD')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
