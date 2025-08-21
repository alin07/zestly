import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  listings?: any[];
  onMarkerClick?: (listing: any) => void;
  hoveredListing?: any;
}

// Component to handle map view updates
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !map._container || !map._leaflet_id) return;
    
    try {
      // Check if map is still valid
      if (map._container && !map._container.offsetParent && map._container.offsetParent !== null) {
        return; // Map container is not visible/mounted
      }
      
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      
      // Only update if center or zoom actually changed significantly
      const centerChanged = Math.abs(currentCenter.lat - center[0]) > 0.0001 || 
                           Math.abs(currentCenter.lng - center[1]) > 0.0001;
      const zoomChanged = Math.abs(currentZoom - zoom) > 0.1;
      
      if (centerChanged || zoomChanged) {
        map.setView(center, zoom);
      }
    } catch (error) {
      console.warn('Map setView error:', error);
    }
  }, [map, center, zoom]);
  
  return null;
};

const Map: React.FC<MapProps> = ({
  center = [37.7749, -122.4194], // San Francisco default
  zoom = 12,
  className = "h-96 w-full",
  listings = [],
  onMarkerClick,
  hoveredListing
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Validate center coordinates
  const validCenter: [number, number] = Array.isArray(center) && 
    typeof center[0] === 'number' && 
    typeof center[1] === 'number' && 
    !isNaN(center[0]) && 
    !isNaN(center[1]) 
    ? center 
    : [37.7749, -122.4194];

  const validZoom = typeof zoom === 'number' && !isNaN(zoom) ? zoom : 12;
  
  // Create a unique key to force remount when center changes significantly
  const mapKey = `map-${Math.round(validCenter[0] * 1000)}-${Math.round(validCenter[1] * 1000)}-${validZoom}`;
  
  useEffect(() => {
    setIsMapReady(false);
    setMapError(null);
    
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
      }
    };
  }, [mapKey]);
  
  if (mapError) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600">Map failed to load</p>
            <button 
              onClick={() => {
                setMapError(null);
                setIsMapReady(false);
                setTimeout(() => setIsMapReady(true), 100);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isMapReady) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <MapContainer
        key={mapKey}
        center={validCenter}
        zoom={validZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          try {
            mapInstance.invalidateSize();
          } catch (error) {
            console.warn('Error invalidating map size:', error);
            setMapError('Failed to initialize map');
          }
        }}
      >
        <MapViewController center={validCenter} zoom={validZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {listings.filter(listing => {
          const lat = listing.property?.address?.latitude;
          const lng = listing.property?.address?.longitude;
          return lat && lng && typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
        }).map((listing) => {
          const lat = listing.property.address.latitude;
          const lng = listing.property.address.longitude;
          const isHovered = hoveredListing?.id === listing.id;
          
          // Create custom icon for hovered listing
          let customIcon = undefined;
          if (isHovered) {
            try {
              customIcon = L.divIcon({
                html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;"></div>`,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              });
            } catch (error) {
              console.warn('Error creating custom icon:', error);
              customIcon = undefined;
            }
          }
          
          try {
            return (
              <Marker
                key={`marker-${listing.id}`}
                position={[lat, lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => {
                    try {
                      onMarkerClick?.(listing);
                    } catch (error) {
                      console.warn('Error in marker click handler:', error);
                    }
                  }
                }}
              >
                <Popup>
                  <div className="min-w-48">
                    <h3 className="font-semibold text-lg">
                      ${listing.price?.toLocaleString() || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {listing.property?.address?.street || 'Address not available'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {listing.property?.address?.city || ''}, {listing.property?.address?.state || ''}
                    </p>
                    <div className="flex gap-2 mt-2 text-sm">
                      {listing.property?.bedrooms && (
                        <span>{listing.property.bedrooms} bd</span>
                      )}
                      {listing.property?.bathrooms && (
                        <span>{listing.property.bathrooms} ba</span>
                      )}
                      {listing.property?.sqft && (
                        <span>{listing.property.sqft.toLocaleString()} sqft</span>
                      )}
                    </div>
                    {isHovered && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        Highlighted from list
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          } catch (error) {
            console.warn('Error rendering marker for listing:', listing.id, error);
            return null;
          }
        })}
      </MapContainer>
    </div>
  );
};

export default Map;