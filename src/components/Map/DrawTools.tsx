import React, { useEffect, useRef } from 'react';
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
  onShapeEdited?: (shapes: DrawnShape[]) => void;
  onShapeDeleted?: (shapes: DrawnShape[]) => void;
  onSyncShapes?: (shapes: DrawnShape[]) => void;
  shapes?: DrawnShape[];
}

const DrawTools: React.FC<DrawToolsProps> = ({ 
  onShapeCreated, 
  onShapeEdited, 
  onShapeDeleted, 
  onSyncShapes,
  shapes = [] 
}) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  // Fonction pour synchroniser les formes du FeatureGroup avec React state
  const syncShapesToReact = () => {
    if (!drawnItemsRef.current || !onSyncShapes) return;

    const currentShapes: DrawnShape[] = [];
    drawnItemsRef.current.eachLayer((layer: L.Layer & { toGeoJSON?: () => Feature }) => {
      if (layer.toGeoJSON) {
        const geoJSON = layer.toGeoJSON();
        let type = 'unknown';
        if ((layer as any).feature?.properties?.type) {
          type = (layer as any).feature.properties.type;
        } else if ((layer as L.Marker).getLatLng) {
          type = 'marker';
        } else if ((layer as L.Polyline).getLatLngs) {
          const latLngs = (layer as L.Polyline).getLatLngs();
          type = Array.isArray(latLngs[0]) ? 'polygon' : 'polyline';
        } else if ((layer as L.Circle).getRadius) {
          type = 'circle';
        }
        
        currentShapes.push({ type, geoJSON });
      }
    });
    
    onSyncShapes(currentShapes);
  };

  useEffect(() => {
    // Initialiser les options des outils de dessin
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
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

    drawControlRef.current = drawControl;
    map.addControl(drawControl);

    // Événement de création de forme
    const onCreated = (e: L.LeafletEvent) => {
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
    };

    // Événement d'édition de forme
    const onEdited = (_e: L.LeafletEvent) => {
      if (onShapeEdited) {
        const editedShapes: DrawnShape[] = [];
        const event = _e as unknown as { layers: L.LayerGroup };
        
        event.layers.eachLayer((layer: L.Layer & { toGeoJSON?: () => Feature }) => {
          if (layer.toGeoJSON) {
            const geoJSON = layer.toGeoJSON();
            // Essayer de déterminer le type depuis les propriétés de la couche
            let type = 'unknown';
            if ((layer as any).feature?.properties?.type) {
              type = (layer as any).feature.properties.type;
            } else if ((layer as L.Marker).getLatLng) {
              type = 'marker';
            } else if ((layer as L.Polyline).getLatLngs) {
              const latLngs = (layer as L.Polyline).getLatLngs();
              type = Array.isArray(latLngs[0]) ? 'polygon' : 'polyline';
            } else if ((layer as L.Circle).getRadius) {
              type = 'circle';
            }
            
            editedShapes.push({ type, geoJSON });
          }
        });
        
        // Récupérer toutes les formes du FeatureGroup
        const allShapes: DrawnShape[] = [];
        drawnItems.eachLayer((layer: L.Layer & { toGeoJSON?: () => Feature }) => {
          if (layer.toGeoJSON) {
            const geoJSON = layer.toGeoJSON();
            let type = 'unknown';
            if ((layer as any).feature?.properties?.type) {
              type = (layer as any).feature.properties.type;
            } else if ((layer as L.Marker).getLatLng) {
              type = 'marker';
            } else if ((layer as L.Polyline).getLatLngs) {
              const latLngs = (layer as L.Polyline).getLatLngs();
              type = Array.isArray(latLngs[0]) ? 'polygon' : 'polyline';
            } else if ((layer as L.Circle).getRadius) {
              type = 'circle';
            }
            
            allShapes.push({ type, geoJSON });
          }
        });
        
        onShapeEdited(allShapes);
      }
    };

    // Événement de suppression de forme
    const onDeleted = (_e: L.LeafletEvent) => {
      if (onShapeDeleted) {
        // Récupérer toutes les formes restantes du FeatureGroup
        const remainingShapes: DrawnShape[] = [];
        drawnItems.eachLayer((layer: L.Layer & { toGeoJSON?: () => Feature }) => {
          if (layer.toGeoJSON) {
            const geoJSON = layer.toGeoJSON();
            let type = 'unknown';
            if ((layer as any).feature?.properties?.type) {
              type = (layer as any).feature.properties.type;
            } else if ((layer as L.Marker).getLatLng) {
              type = 'marker';
            } else if ((layer as L.Polyline).getLatLngs) {
              const latLngs = (layer as L.Polyline).getLatLngs();
              type = Array.isArray(latLngs[0]) ? 'polygon' : 'polyline';
            } else if ((layer as L.Circle).getRadius) {
              type = 'circle';
            }
            
            remainingShapes.push({ type, geoJSON });
          }
        });
        
        onShapeDeleted(remainingShapes);
      }
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    // Nettoyage au démontage du composant
    return () => {
      // Synchroniser une dernière fois avant de fermer
      syncShapesToReact();
      
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
      }
    };
  }, [map, onShapeCreated, onShapeEdited, onShapeDeleted, onSyncShapes, syncShapesToReact]);

  // Synchroniser les formes du state React avec le FeatureGroup de Leaflet Draw
  useEffect(() => {
    if (!drawnItemsRef.current) return;

    // Vider le FeatureGroup actuel
    drawnItemsRef.current.clearLayers();

    // Ajouter toutes les formes du state
    shapes.forEach((shape) => {
      try {
        const layer = L.geoJSON(shape.geoJSON, {
          style: () => ({
            color: '#3388ff',
            weight: 3,
            opacity: 0.7,
            fillOpacity: 0.3,
            fillColor: '#3388ff'
          })
        });
        
        // Ajouter chaque couche individuelle au FeatureGroup
        layer.eachLayer((l) => {
          // Stocker le type dans les propriétés de la couche pour l'édition
          const featureProps: any = {
            ...((l as any).feature?.properties || {}),
            type: shape.type,
          };
          if ('title' in shape && typeof shape.title !== 'undefined') {
            featureProps.title = shape.title;
          }
          if ('description' in shape && typeof shape.description !== 'undefined') {
            featureProps.description = shape.description;
          }
          (l as any).feature = {
            ...((l as any).feature || {}),
            properties: featureProps
          };
          drawnItemsRef.current!.addLayer(l);
        });
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la forme:', error);
      }
    });
  }, [shapes]);

  return null; // Ce composant n'affiche rien directement
};

export default DrawTools; 