import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PopupProps {
  map: google.maps.Map;
  position: google.maps.LatLng;
  children: React.ReactNode;
  onClose?: () => void;
}

function Popup({ map, position, children, onClose }: PopupProps) {
  const popupRef = useRef<any>(null);
  const [contentDiv, setContentDiv] = useState<HTMLDivElement | null>(null);

  // Create the content div when component mounts
  useEffect(() => {
    const div = document.createElement('div');
    div.style.position = 'relative';
    setContentDiv(div);
  }, []);

  useEffect(() => {
    // Check if Google Maps API is available
    if (typeof window === 'undefined' || !window.google || !window.google.maps) {
      console.warn('Google Maps API not available yet');
      return;
    }

    if (!map || !contentDiv || popupRef.current) {
      console.log('Popup creation skipped:', {
        hasMap: !!map,
        hasContentDiv: !!contentDiv,
        hasPopupRef: !!popupRef.current
      });
      return;
    }

    console.log('Creating popup with position:', position);
    try {
      // Follow Google's official pattern
      class Popup extends window.google.maps.OverlayView {
        position: google.maps.LatLng;
        containerDiv: HTMLDivElement;

        constructor(position: google.maps.LatLng, content: HTMLDivElement) {
          super();
          this.position = position;
          content.classList.add("popup-bubble");

          // This zero-height div is positioned at the bottom of the bubble.
          const bubbleAnchor = document.createElement("div");
          bubbleAnchor.classList.add("popup-bubble-anchor");
          bubbleAnchor.appendChild(content);

          // This zero-height div is positioned at the bottom of the tip.
          this.containerDiv = document.createElement("div");
          this.containerDiv.classList.add("popup-container");
          this.containerDiv.appendChild(bubbleAnchor);

          // Optionally stop clicks, etc., from bubbling up to the map.
          Popup.preventMapHitsAndGesturesFrom(this.containerDiv);
        }

        /** Called when the popup is added to the map. */
        onAdd() {
          console.log('Popup onAdd called');
          this.getPanes()?.floatPane.appendChild(this.containerDiv);
        }

        /** Called when the popup is removed from the map. */
        onRemove() {
          console.log('Popup onRemove called');
          if (this.containerDiv.parentElement) {
            this.containerDiv.parentElement.removeChild(this.containerDiv);
          }
        }

        /** Called each frame when the popup needs to draw itself. */
        draw() {
          const divPosition = this.getProjection()?.fromLatLngToDivPixel(this.position);
          
          if (!divPosition) {
            console.log('No div position available for popup');
            return;
          }

          // Hide the popup when it is far out of view.
          const display =
            Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
              ? "block"
              : "none";

          if (display === "block") {
            this.containerDiv.style.left = divPosition.x + "px";
            this.containerDiv.style.top = divPosition.y + "px";
            console.log('Popup positioned at:', { x: divPosition.x, y: divPosition.y });
          }

          if (this.containerDiv.style.display !== display) {
            this.containerDiv.style.display = display;
            console.log('Popup display set to:', display);
          }
        }
      }

      // Create the popup instance
      popupRef.current = new Popup(position, contentDiv);
      popupRef.current.setMap(map);
      console.log('Popup created and set on map');
    } catch (error) {
      console.error('Error creating popup:', error);
    }

    return () => {
      if (popupRef.current) {
        popupRef.current.setMap(null);
        popupRef.current = null;
        console.log('Popup cleaned up');
      }
    };
  }, [map, position, contentDiv]);

  // Don't render anything if Google Maps API is not available
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    return null;
  }

  if (!contentDiv) {
    return null;
  }

  return createPortal(
    <div className="relative">
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100"
          aria-label="Close popup"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>,
    contentDiv
  );
}

export default Popup;
