import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { PropertyFeature } from '@/types';
import { createPopupContent } from '@/lib/map-utils';
interface GoogleMapViewProps {
  features: PropertyFeature[];
  shouldAutoOpenPopup: boolean;
}

export default function GoogleMapView({ features, shouldAutoOpenPopup }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Google Maps
  useEffect(() => {
    let isInitialized = false;
    let timeoutId: NodeJS.Timeout;
    let observer: MutationObserver | null = null;

    const initMap = async () => {
      if (isInitialized) return;
      
      console.log('Starting map initialization...');
      
      // Wait for the DOM element to be available
      if (!mapRef.current) {
        console.log('mapRef.current not available yet, waiting...');
        return;
      }

      isInitialized = true;
      
      // Clean up observer and timeout
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        console.log('Loading Google Maps API...');
        const google = await loader.load();
        console.log('Google Maps API loaded successfully');
        
        if (mapRef.current) {
          console.log('Creating map instance...');
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 33.769, lng: -84.388 }, // Atlanta
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          console.log('Map instance created successfully');
          mapInstanceRef.current = map;
          infoWindowRef.current = new google.maps.InfoWindow();
          console.log('Setting isLoading to false');
          setIsLoading(false);
        } else {
          console.error('mapRef.current is null after API load');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
      }
    };

    // Try to initialize immediately
    initMap();

    // If not ready, set up a MutationObserver to watch for DOM changes
    if (!mapRef.current) {
      console.log('Setting up MutationObserver to watch for DOM changes...');
      
      observer = new MutationObserver((mutations) => {
        if (mapRef.current && !isInitialized) {
          console.log('DOM element found via MutationObserver');
          initMap();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Fallback timeout after 5 seconds
      timeoutId = setTimeout(() => {
        if (!isInitialized) {
          console.error('Map initialization timeout - mapRef.current still not available after 5 seconds');
          setIsLoading(false);
        }
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Keep empty dependency array

  // Handle markers when features change
  useEffect(() => {
    if (!mapInstanceRef.current || !infoWindowRef.current) return;

    // Clear existing markers and clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    const markers: google.maps.Marker[] = [];
    
    features.forEach((feature, index) => {
      const [lng, lat] = feature.geometry.coordinates;
      
      const marker = new google.maps.Marker({
        position: { lat, lng },
        title: feature.properties.address,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 10)
        }
      });

      // Create info window content
      const infoContent = createPopupContent(feature);

      // Add click listener
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markers.push(marker);
    });

    markersRef.current = markers;

    // Create clusterer if we have markers
    if (markers.length > 0) {
      clustererRef.current = new MarkerClusterer({
        map: mapInstanceRef.current,
        markers: markers,
        algorithm: new SuperClusterAlgorithm({
          minPoints: 10,
          radius: 150,
          maxZoom: 20
        })
      });
    }

    // Auto-open popup for single result
    if (shouldAutoOpenPopup && markers.length === 1) {
      setTimeout(() => {
        if (infoWindowRef.current && markers[0]) {
          const feature = features[0];
          const infoContent = createPopupContent(feature);
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstanceRef.current, markers[0]);
        }
      }, 100);
    }

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      mapInstanceRef.current.fitBounds(bounds);
    }

  }, [features, shouldAutoOpenPopup]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full z-0">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
} 