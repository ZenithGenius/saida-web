import type { FeatureCollection } from "geojson";

export interface GeoJsonLayer {
  id: string;
  name: string;
  category: string;
  data: FeatureCollection;
  color?: string;
  visible?: boolean;
}

export interface ExtendedFeatureProperties {
  name: string;
  category: string;
  [key: string]: string | number | boolean | null | undefined;
}

export const layerCategories = {
  ACADEMIQUE: "Infrastructures académiques",
  ADMINISTRATIF: "Infrastructures administratives",
  SANITAIRE: "Infrastructures sanitaires",
  COMMERCIAL: "Infrastructures commerciales",
  SECURITE: "Infrastructures de sécurité",
  TRANSPORT: "Infrastructures de transport",
  LOGEMENT: "Infrastructures de logement",
  RELIGIEUX: "Infrastructures religieuses",
  LOISIRS: "Infrastructures de loisirs",
} as const;

type LayerCategory = (typeof layerCategories)[keyof typeof layerCategories];

interface LayerStyle {
  color: string;
  weight: number;
  fillColor: string;
  fillOpacity: number;
  opacity: number;
}

const styles: Record<LayerCategory, LayerStyle> = {
  [layerCategories.ACADEMIQUE]: {
    color: "#8800ff",
    weight: 2,
    fillColor: "#8800ff",
    fillOpacity: 0.5,
    opacity: 1,
  },
  [layerCategories.ADMINISTRATIF]: {
    color: "#8B4513",
    weight: 2,
    fillColor: "#8B4513", 
    fillOpacity: 0.5,
    opacity: 1,
  },
  [layerCategories.SANITAIRE]: {
    color: "#ff0000",
    weight: 2,
    fillColor: "#ff0000",
    fillOpacity: 0.5,
    opacity: 1,
  },
  [layerCategories.COMMERCIAL]: {
    color: "#e6b3ff",
    weight: 2,
    fillColor: "#e6b3ff",
    fillOpacity: 0.5,
    opacity: 1,
  },
  [layerCategories.SECURITE]: {
    color: "#808080",
    weight: 2,
    fillColor: "#808080", 
    fillOpacity: 0.5,
    opacity: 1,
  },
  [layerCategories.TRANSPORT]: {
    color: "#FFA500",
    weight: 3,
    fillColor: "#FFA500",
    fillOpacity: 0.3,
    opacity: 1,
  },
  [layerCategories.LOGEMENT]: {
    color: "#FFC0CB",
    weight: 2,
    fillColor: "#FFC0CB",
    fillOpacity: 0.5,
    opacity: 1,
  },
  [layerCategories.RELIGIEUX]: {
    color: "#00ff00",
    weight: 2,
    fillColor: "#00ff00",
    fillOpacity: 0.5,
    opacity: 1,
  },
  [layerCategories.LOISIRS]: {
    color: "#ffff00",
    weight: 2,
    fillColor: "#ffff00",
    fillOpacity: 0.5,
    opacity: 1,
  }
};

export const getLayerStyle = (
  category: LayerCategory,
  geometryType?: string
): LayerStyle => {
  const baseStyle = styles[category] || styles[layerCategories.ACADEMIQUE];

  // Ajuster le style en fonction du type de géométrie
  switch (geometryType) {
    case "LineString":
    case "MultiLineString":
      return {
        ...baseStyle,
        fillOpacity: 0,
        weight: 3,
        opacity: 1,
      };
    case "Point":
    case "MultiPoint":
      return {
        ...baseStyle,
        fillOpacity: 0.8,
        weight: 1,
        opacity: 1,
      };
    case "Polygon":
    case "MultiPolygon":
    default:
      return baseStyle;
  }
};

export const loadGeoJson = async (path: string): Promise<FeatureCollection> => {
  try {
    console.log("Loading GeoJSON from path:", path);
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (
      !data.type ||
      data.type !== "FeatureCollection" ||
      !Array.isArray(data.features)
    ) {
      console.error("Invalid GeoJSON data:", data);
      throw new Error("Invalid GeoJSON format");
    }

    return data as FeatureCollection;
  } catch (error) {
    console.error(
      `Erreur lors du chargement du fichier GeoJSON: ${path}`,
      error
    );
    throw error;
  }
};

export const createLayerConfig = (
  id: string,
  name: string,
  category: string,
  data: FeatureCollection
): GeoJsonLayer => ({
  id,
  name,
  category,
  data,
  visible: false,
});
