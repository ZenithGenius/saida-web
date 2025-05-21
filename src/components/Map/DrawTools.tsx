import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { Feature } from 'geojson';

interface DrawnShape {
  type: string;
  geoJSON: Feature;
}

interface DrawToolsProps {
  onShapeCreated?: (shape: DrawnShape) => void;
}

const DrawTools: React.FC<DrawToolsProps> = ({ onShapeCreated }) => {
  const map = useMap();

  useEffect(() => {
    // Initialiser les options des outils de dessin
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polyline: {
          shapeOptions: {
            color: '#3388ff',
            weight: 4
          }
        },
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Le polygone ne peut pas s\'intersecter lui-même!</strong>'
          },
          shapeOptions: {
            color: '#3388ff'
          }
        },
        circle: {
          shapeOptions: {
            color: '#3388ff'
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#3388ff'
          }
        },
        marker: {},
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });

    map.addControl(drawControl);

    // Événement de création de forme
    map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
      // Cast to access Draw specific properties
      const event = e as unknown as { 
        layer: L.Layer & { toGeoJSON: () => Feature }; 
        layerType: string;
      };
      
      const layer = event.layer;
      drawnItems.addLayer(layer);

      if (onShapeCreated) {
        const type = event.layerType;
        const geoJSON = layer.toGeoJSON();
        onShapeCreated({ type, geoJSON });
      }
    });

    // Nettoyage au démontage du composant
    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      map.off(L.Draw.Event.CREATED);
    };
  }, [map, onShapeCreated]);

  return null; // Ce composant n'affiche rien directement
};

export default DrawTools; 