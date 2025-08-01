import { Marker, Popup, Tooltip } from "react-leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { PropertyFeature } from "@/types";
import { useRef, useEffect } from "react";

export default function MapView({ 
    features, 
    shouldAutoOpenPopup 
}: { 
    features: PropertyFeature[];
    shouldAutoOpenPopup: boolean;
}) {
    const markerRefs = useRef<{ [key: string]: any }>({});

    useEffect(() => {
        if (shouldAutoOpenPopup && features.length === 1) {
            // Wait a bit for the marker to render, then open the popup
            const timer = setTimeout(() => {
                const markerKey = `marker-0`;
                const markerRef = markerRefs.current[markerKey];
                if (markerRef) {
                    markerRef.openPopup();
                }
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [shouldAutoOpenPopup, features]);

    return (
        <div className="w-full h-full z-0">
            <MapContainer
                center={[33.749, -84.388]}
                zoom={13}
                className="w-full h-full rounded-2xl"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerClusterGroup>
                    {features.map((feature, i) => {
                        const [lon, lat] = feature.geometry.coordinates;
                        const markerKey = `marker-${i}`;
                        return (
                            <Marker 
                                key={markerKey} 
                                position={[lat, lon]}
                                ref={(ref) => {
                                    if (ref) {
                                        markerRefs.current[markerKey] = ref;
                                    }
                                }}
                            >
                                <Tooltip>{feature.properties.tooltip}</Tooltip>
                                <Popup>
                                    <div dangerouslySetInnerHTML={{ __html: feature.properties.popup }} />
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
