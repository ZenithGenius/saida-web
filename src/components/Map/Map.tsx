import React, { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  ScaleControl,
  useMap,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box, CircularProgress, IconButton } from "@mui/material";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import GeoJsonLayers from "./GeoJsonLayers";
import Legend from "./Legend";
import MapSearch from "../Search/MapSearch";
import SearchMarker from "./SearchMarker";
import type { GeoJsonLayer } from "../../utils/geoJsonLoader";
import { loadGeoJson } from "../../utils/geoJsonLoader";
import type { Feature, FeatureCollection } from "geojson";
import Sidebar from "../Sidebar/Sidebar";
import { availableLayers, type LayerConfig } from "../../utils/layerConfigs";
import { calculateRoute } from "../../utils/routingService";
import RoutingControl from "../Routing/RoutingControl";
import DrawTools from "./DrawTools";
import { MenuOpen } from "@mui/icons-material";
import { useResponsive } from "../../utils/ResponsiveContext";

// Correction pour les icônes Leaflet en React
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LoadingState {
  [key: string]: boolean;
}

interface SearchResult {
  name: string;
  category: string;
  feature: Feature;
  coordinates: [number, number];
}

interface DrawnShape {
  type: string;
  geoJSON: Feature;
  title?: string;
  description?: string;
}

// Composant pour afficher les formes dessinées
const DrawnShapesLayer: React.FC<{ shapes: DrawnShape[] }> = ({ shapes }) => {
  if (!shapes.length) return null;
  
  return (
    <>
      {shapes.map((shape, index) => (
        <GeoJSON 
          key={`drawn-shape-${index}`}
          data={shape.geoJSON}
          style={() => ({
            color: '#3388ff',
            weight: 3,
            opacity: 0.7,
            fillOpacity: 0.3,
            fillColor: '#3388ff'
          })}
        >
        </GeoJSON>
      ))}
    </>
  );
};

// Composant pour mettre à jour la vue de la carte
const MapUpdater: React.FC<{ center?: [number, number] }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);

  return null;
};

const Map: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useResponsive();
  const [layers, setLayers] = useState<GeoJsonLayer[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const [loadedData, setLoadedData] = useState<
    Record<string, FeatureCollection>
  >({});
  const [searchCenter, setSearchCenter] = useState<[number, number]>();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [routeData, setRouteData] = useState<Feature | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [startWaypoint, setStartWaypoint] = useState<[number, number] | null>(
    null
  );
  const [endWaypoint, setEndWaypoint] = useState<[number, number] | null>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);

  // Centre initial sur Ebolowa
  const center: [number, number] = [2.9, 11.15];
  const zoom = 13;

  // Effet pour stocker les dessins dans le localStorage
  useEffect(() => {
    // Charger les dessins depuis le localStorage au démarrage
    const savedShapes = localStorage.getItem('drawnShapes');
    if (savedShapes) {
      try {
        setDrawnShapes(JSON.parse(savedShapes));
      } catch (e) {
        console.error('Erreur lors du chargement des dessins:', e);
      }
    }
  }, []);

  const loadLayerData = useCallback(async (layerConfig: LayerConfig) => {
    try {
      console.log("Starting to load data for:", layerConfig.filename);
      setLoadingStates((prev) => ({ ...prev, [layerConfig.id]: true }));

      const data = await loadGeoJson(`${layerConfig.filename}`);
      console.log("Loaded data:", data);
      setLoadedData((prev) => ({ ...prev, [layerConfig.id]: data }));

      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerConfig.id ? { ...layer, data } : layer
        )
      );

      return true;
    } catch (error) {
      console.error(
        `Erreur lors du chargement de la couche ${layerConfig.name}:`,
        error
      );
      return false;
    } finally {
      setLoadingStates((prev) => ({ ...prev, [layerConfig.id]: false }));
    }
  }, []);

  const handleLayerClick = (feature: Feature) => {
    console.log("Feature clicked:", feature.properties);
  };

  const handleLayerToggle = async (layerId: string, visible: boolean) => {
    console.log("handleLayerToggle called:", { layerId, visible });

    const layerConfig = availableLayers.find((l) => l.id === layerId);
    if (!layerConfig) return;

    if (visible) {
      // Si on active la couche et qu'elle n'est pas déjà chargée
      if (!loadedData[layerId]) {
        const success = await loadLayerData(layerConfig);
        if (!success) {
          // Si le chargement échoue, ne pas activer la couche
          return;
        }
      }
    }

    // Mettre à jour la visibilité de la couche
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );
  };

  // Initialiser la liste des couches au démarrage (sans données)
  useEffect(() => {
    const initialLayers = availableLayers.map((config) => ({
      id: config.id,
      name: config.name,
      category: config.category,
      visible: false,
      data: { type: "FeatureCollection" as const, features: [] },
    }));
    setLayers(initialLayers);
  }, []);

  // Filtrer les couches visibles qui ont des données
  const visibleLayers = layers
    .filter((layer) => layer.visible && loadedData[layer.id])
    .map((layer) => ({
      ...layer,
      data: loadedData[layer.id],
    }));

  const handleRouteRequest = async (
    start: [number, number],
    end: [number, number]
  ) => {
    try {
      setIsCalculatingRoute(true);
      setRouteError(null);
      setRouteData(null);
      // Store the waypoints for later use
      setStartWaypoint(start);
      setEndWaypoint(end);
      console.log("Requesting route from", start, "to", end);
      const result = await calculateRoute(start, end);
      setRouteData(result.route);
    } catch (error) {
      console.error("Error calculating route:", error);
      setRouteError(
        error instanceof Error ? error.message : "Failed to calculate route"
      );
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleToggleDrawing = (enabled: boolean) => {
    setDrawingEnabled(enabled);
  };

  const handleShapeCreated = (shape: DrawnShape) => {
    console.log("Shape created:", shape);
    setDrawnShapes((prev) => {
      const newShapes = [...prev, shape];
      localStorage.setItem('drawnShapes', JSON.stringify(newShapes));
      return newShapes;
    });
  };

  const handleShapeUpdate = (updatedShapes: DrawnShape[]) => {
    setDrawnShapes(updatedShapes);
    localStorage.setItem('drawnShapes', JSON.stringify(updatedShapes));
  };

  const handleShapeDelete = (index: number) => {
    setDrawnShapes((prev) => {
      const newShapes = prev.filter((_, i) => i !== index);
      if (newShapes.length === 0) {
        localStorage.removeItem('drawnShapes');
      } else {
        localStorage.setItem('drawnShapes', JSON.stringify(newShapes));
      }
      return newShapes;
    });
  };

  const handleClearAllShapes = () => {
    setDrawnShapes([]);
    localStorage.removeItem('drawnShapes');
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
      {isSidebarOpen && (
        <Sidebar
          layers={layers.map((layer) => ({
            ...layer,
            loading: loadingStates[layer.id] || false,
          }))}
          onLayerToggle={handleLayerToggle}
          onRouteRequest={handleRouteRequest}
          onToggleDrawing={handleToggleDrawing}
          drawnShapes={drawnShapes}
          onShapeUpdate={handleShapeUpdate}
          onShapeDelete={handleShapeDelete}
          onClearAllShapes={handleClearAllShapes}
        />
      )}
      <Box sx={{ flexGrow: 1, height: "100%", position: "relative" }}>
        {!isSidebarOpen && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              left: 10,
              top: 80,
              zIndex: 1000,
              backgroundColor: "white",
              boxShadow: 1,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #ddd",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            size="small"
            aria-label="Ouvrir le panneau latéral"
          >
            <MenuOpen fontSize="small" />
          </IconButton>
        )}
        
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            zIndex: 1000,
            backgroundColor: "white",
            borderRadius: 1,
            boxShadow: 3,
            p: 1,
          }}
        >
          <MapSearch
            onLocationSelect={(lat, lon) => {
              // Créer un point artificiel pour la recherche
              const dummyFeature: Feature = {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [lon, lat], // [longitude, latitude]
                },
                properties: {},
              };

              setSearchResult({
                name: "Point recherché",
                category: "Recherche",
                feature: dummyFeature,
                coordinates: [lat, lon], // [latitude, longitude]
              });

              setSearchCenter([lat, lon]);
            }}
          />
        </Box>

        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <MapUpdater center={searchCenter} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <GeoJsonLayers
            layers={visibleLayers}
            onLayerClick={handleLayerClick}
          />
          <ScaleControl position="bottomleft" />

          {/* Afficher les formes dessinées de façon permanente */}
          <DrawnShapesLayer shapes={drawnShapes} />

          {searchResult && (
            <SearchMarker
              searchResult={{
                display_name: searchResult.name,
                lat: searchResult.coordinates[0].toString(),
                lon: searchResult.coordinates[1].toString(),
                type: searchResult.category,
                geojson: searchResult.feature,
              }}
              layers={visibleLayers}
            />
          )}

          {routeData && startWaypoint && endWaypoint && (
            <RoutingControl waypoints={[startWaypoint, endWaypoint]} />
          )}

          {drawingEnabled && <DrawTools onShapeCreated={handleShapeCreated} />}
        </MapContainer>
        <Legend />
        {(Object.values(loadingStates).some((state) => state) ||
          isCalculatingRoute) && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              p: 2,
              borderRadius: 2,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {routeError && (
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "error.main",
              color: "white",
              p: 2,
              borderRadius: 2,
              zIndex: 1000,
            }}
          >
            {routeError}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Map;
