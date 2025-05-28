import React, { useEffect, useState } from "react";
import { GeoJSON, CircleMarker, useMap } from "react-leaflet";
import type { GeoJsonLayer } from "../../utils/geoJsonLoader";
import { getLayerStyle, layerCategories } from "../../utils/geoJsonLoader";
import type { Feature, Geometry, Position } from "geojson";
import { Map as LeafletMap, Popup as LeafletPopup } from "leaflet";
import * as turf from "@turf/turf";

interface GeoJsonLayersProps {
  layers: GeoJsonLayer[];
  onLayerClick?: (feature: Feature) => void;
}

const GeoJsonLayers: React.FC<GeoJsonLayersProps> = ({
  layers,
  onLayerClick,
}) => {
  const [processedLayers, setProcessedLayers] = useState<GeoJsonLayer[]>([]);
  const map = useMap();

  // Process and optimize layers
  useEffect(() => {
    // Just copy layers without trying to simplify geometries
    setProcessedLayers([...layers]);
  }, [layers]);

  // Get coordinates from feature (either point or non-point)
  const getFeatureCoordinates = (feature: Feature): Position | null => {
    try {
      if (!feature.geometry) return null;

      // For point features, return coordinates directly
      if (feature.geometry.type === "Point" && "coordinates" in feature.geometry) {
        return feature.geometry.coordinates as Position;
      }

      // For non-point features, calculate centroid
      try {
        const center = turf.centroid(feature);
        return center.geometry.coordinates as Position;
      } catch (error) {
        console.error("Error calculating centroid:", error);
        return null;
      }
    } catch (error) {
      console.error("Error getting feature coordinates:", error);
      return null;
    }
  };

  // Find nearby services based on feature
  const findNearbyServices = (feature: Feature, allLayers: GeoJsonLayer[]) => {
    const nearbyServices: {
      name: string;
      distance: number;
      category: string;
    }[] = [];

    const currentCoords = getFeatureCoordinates(feature);
    if (!currentCoords) return nearbyServices;

    allLayers.forEach((layer) => {
      if (layer.data && layer.data.features) {
        layer.data.features.forEach((otherFeature: Feature) => {
          if (otherFeature.properties?.name === feature.properties?.name) {
            return; // Skip same feature
          }

          const otherCoords = getFeatureCoordinates(otherFeature);
          if (!otherCoords) return;

          try {
            // Use string literal directly for units
          const distance = turf.distance(
              turf.point(currentCoords),
              turf.point(otherCoords),
              "kilometers"
          );

          if (distance <= 1) {
            nearbyServices.push({
              name: otherFeature.properties?.name || "Non nommé",
              distance: Math.round(distance * 1000),
              category: layer.category,
            });
            }
          } catch (error) {
            console.error("Error calculating distance:", error);
          }
        });
      }
    });

    return nearbyServices.sort((a, b) => a.distance - b.distance);
  };

  // Create popup content for feature
  const createPopupContent = (
    feature: Feature,
    coordinates: Position,
    category: string,
    nearbyServices: Array<{ name: string; distance: number; category: string }>
  ) => {
    const container = document.createElement("div");
    container.style.padding = "12px";
    container.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">${
          feature.properties?.name || "Non nommé"
        }</h3>
        <p style="margin: 4px 0; color: #666; font-size: 14px;">Catégorie: ${category}</p>
        <p style="margin: 4px 0; font-size: 14px;">Coordonnées: ${coordinates[1].toFixed(
          6
        )}°N, ${coordinates[0].toFixed(6)}°E</p>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;" />
        <h4 style="margin: 8px 0; font-size: 14px;">Services à proximité (${
          nearbyServices.length
        }):</h4>
        <div style="max-height: 150px; overflow-y: auto;">
          ${nearbyServices
            .map(
              (service) => `
            <div style="margin: 4px 0; padding: 4px 0; border-bottom: 1px solid #f5f5f5;">
              <div style="font-size: 14px;">${service.name}</div>
              <div style="font-size: 12px; color: #666;">${service.category} • ${service.distance}m</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
    return container;
  };

  // Get style for a given category
  const getCategoryStyle = (category: string) => {
    // Default style
    const defaultStyle = {
      color: "#888888",
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.6
    };
    
    try {
      // Find matching category in layerCategories
      for (const key in layerCategories) {
        if (layerCategories[key as keyof typeof layerCategories] === category) {
          return getLayerStyle(layerCategories[key as keyof typeof layerCategories]);
        }
      }
      
      // If no match found, return default style
      return defaultStyle;
    } catch (error) {
      console.error("Error getting style for category:", category, error);
      return defaultStyle;
    }
  };

  // Render a single feature
  const renderFeature = (feature: Feature<Geometry>, layer: GeoJsonLayer) => {
    if (!feature.geometry) return null;

    const style = getCategoryStyle(layer.category);
    const isPoint = feature.geometry.type === "Point";

    if (isPoint && "coordinates" in feature.geometry) {
      const coordinates = feature.geometry.coordinates as Position;
      return (
        <CircleMarker
          key={`${feature.properties?.name || "unnamed"}-${coordinates.join(",")}`}
          center={[coordinates[1], coordinates[0]]}
          radius={8}
          pathOptions={{
            fillColor: style.color,
            color: style.color,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6,
          }}
          eventHandlers={{
            click: () => {
              const nearbyServices = findNearbyServices(feature, layers);
              const popup = new LeafletPopup()
                .setLatLng([coordinates[1], coordinates[0]])
                .setContent(() =>
                  createPopupContent(
                    feature,
                    coordinates,
                    layer.category,
                    nearbyServices
                  )
                );

              if (onLayerClick) {
                onLayerClick(feature);
              }

              if (map) {
                popup.openOn(map);
              }
            },
          }}
        />
      );
    }

    // For non-point geometries
    const coordinates = getFeatureCoordinates(feature) || [0, 0];

    return (
      <GeoJSON
        key={`${feature.properties?.name || "unnamed"}-${JSON.stringify(feature.geometry).substring(0, 50)}`}
        data={feature}
        style={() => ({
          color: style.color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6,
        })}
        eventHandlers={{
          click: (e) => {
            const nearbyServices = findNearbyServices(feature, layers);
            const popup = new LeafletPopup()
              .setLatLng([coordinates[1], coordinates[0]])
              .setContent(() =>
                createPopupContent(
                  feature,
                  coordinates,
                  layer.category,
                  nearbyServices
                )
              );

            if (onLayerClick) {
              onLayerClick(feature);
            }

            const map = e.target._map;
            if (map instanceof LeafletMap) {
              popup.openOn(map);
            }
          },
        }}
      />
    );
  };

  return (
    <>
      {processedLayers.map((layer) => (
        <React.Fragment key={layer.id}>
          {layer.visible &&
            layer.data.features.map((feature) => renderFeature(feature, layer))}
        </React.Fragment>
      ))}
    </>
  );
};

export default GeoJsonLayers;
