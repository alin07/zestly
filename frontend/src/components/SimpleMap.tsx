import React, { useEffect, useRef } from 'react';
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

interface SimpleMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  listings?: any[];
  onMarkerClick?: (listing: any) => void;
  hoveredListing?: any;
}

// Component to handle map center updates
const MapCenterController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && center) {
      map.setView(center, zoom, { animate: true, duration: 1 });
    }
  }, [map, center, zoom]);
  
  return null;
};

const SimpleMap: React.FC<SimpleMapProps> = ({
  center = [40.7128, -74.0060], // NYC default
  zoom = 12,
  className = "h-96 w-full",
  listings = [],
  onMarkerClick,
  hoveredListing
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate center from listings if not provided
  const calculateCenterFromListings = () => {
    const validListings = listings.filter(listing => {
      const lat = listing.property?.address?.latitude;
      const lng = listing.property?.address?.longitude;
      return lat && lng && typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    });

    if (validListings.length === 0) {
      return [40.7128, -74.0060]; // NYC default
    }

    // Calculate average coordinates
    const avgLat = validListings.reduce((sum, listing) => sum + listing.property.address.latitude, 0) / validListings.length;
    const avgLng = validListings.reduce((sum, listing) => sum + listing.property.address.longitude, 0) / validListings.length;
    
    return [avgLat, avgLng];
  };

  // Validate center coordinates
  const validCenter: [number, number] = Array.isArray(center) && 
    typeof center[0] === 'number' && 
    typeof center[1] === 'number' && 
    !isNaN(center[0]) && 
    !isNaN(center[1]) 
    ? center 
    : calculateCenterFromListings();

  const validZoom = typeof zoom === 'number' && !isNaN(zoom) ? zoom : 12;

  return (
    <div className={className}>
      <MapContainer
        center={validCenter}
        zoom={validZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
      >
        <MapCenterController center={validCenter} zoom={validZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {listings
          .filter(listing => {
            const lat = listing.property?.address?.latitude;
            const lng = listing.property?.address?.longitude;
            return lat && lng && typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
          })
          .map((listing) => {
            const lat = listing.property.address.latitude;
            const lng = listing.property.address.longitude;
            const isHovered = hoveredListing?.id === listing.id;
            
            return (
              <Marker
                key={`simple-marker-${listing.id}`}
                position={[lat, lng]}
                eventHandlers={{
                  click: () => onMarkerClick?.(listing)
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
          })}
      </MapContainer>
    </div>
  );
};

export default SimpleMap;