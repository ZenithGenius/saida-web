import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DirectionsWalk as DirectionsIcon,
  MyLocation as MyLocationIcon,
} from "@mui/icons-material";
import type { Feature } from "geojson";
import type { GeoJsonLayer } from "../../utils/geoJsonLoader";
import center from "@turf/center";
import { featureCollection } from "@turf/helpers";

interface Location {
  name: string;
  coordinates: [number, number];
  category: string;
  uniqueId: string;
}

interface CurrentLocation extends Location {
  updating: boolean;
}

interface RoutingPanelProps {
  layers: GeoJsonLayer[];
  onRouteRequest: (start: [number, number], end: [number, number]) => void;
}

// Définir l'ordre des catégories
const CATEGORY_ORDER = [
  "Education",
  "Santé",
  "Services Administratifs",
  "Services Commerciaux",
  "Services Sécuritaires",
  "Loisirs",
  "Transport",
  "Carrefour",
  "Infrastructure",
  "Batiments",
  "Routes",
];

// Mapping des catégories pour l'affichage
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  Education: "Education",
  Santé: "Santé",
  "Services Administratifs": "Services Administratifs",
  "Services Commerciaux": "Services Commerciaux",
  "Services Sécuritaires": "Services Sécuritaires",
  Loisirs: "Loisirs",
  Transport: "Transport",
  Carrefour: "Carrefour",
  Infrastructure: "Infrastructure",
  Batiments: "Bâtiments",
  Routes: "Routes",
};

// Couleurs par catégorie
const CATEGORY_COLORS: Record<string, { main: string; light: string }> = {
  Education: { main: "#1976d2", light: "rgba(25, 118, 210, 0.05)" }, // Bleu
  Santé: { main: "#d32f2f", light: "rgba(211, 47, 47, 0.05)" }, // Rouge
  "Services Administratifs": {
    main: "#388e3c",
    light: "rgba(56, 142, 60, 0.05)",
  }, // Vert
  "Services Commerciaux": { main: "#f57c00", light: "rgba(245, 124, 0, 0.05)" }, // Orange
  "Services Sécuritaires": {
    main: "#7b1fa2",
    light: "rgba(123, 31, 162, 0.05)",
  }, // Violet
  Loisirs: { main: "#0097a7", light: "rgba(0, 151, 167, 0.05)" }, // Cyan
  Transport: { main: "#5d4037", light: "rgba(93, 64, 55, 0.05)" }, // Marron
  Carrefour: { main: "#455a64", light: "rgba(69, 90, 100, 0.05)" }, // Bleu-gris
};

const RoutingPanel: React.FC<RoutingPanelProps> = ({
  layers,
  onRouteRequest,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startInputValue, setStartInputValue] = useState("");
  const [endInputValue, setEndInputValue] = useState("");
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    // Extraire tous les points d'intérêt des couches
    const allLocations: Location[] = [];
    layers.forEach((layer) => {
      if (layer.data && layer.data.features) {
        layer.data.features.forEach((feature: Feature, index) => {
          if (feature.geometry && feature.properties) {
            let coordinates: [number, number] | null = null;

            if (
              feature.geometry.type === "Point" &&
              "coordinates" in feature.geometry
            ) {
              coordinates = [
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ];
            } else {
              // Pour les polygones, utiliser le centre
              const centerPoint = center(featureCollection([feature]));
              coordinates = [
                centerPoint.geometry.coordinates[1],
                centerPoint.geometry.coordinates[0],
              ];
            }

            if (coordinates) {
              console.log("Feature properties:", feature.properties);
              const name =
                feature.properties.NOM ||
                feature.properties.Nom ||
                feature.properties.Noms ||
                feature.properties.nom ||
                feature.properties.NAME ||
                feature.properties.Name ||
                feature.properties.name ||
                "Sans nom";
              allLocations.push({
                name,
                coordinates,
                category: layer.category,
                uniqueId: `${layer.id}-${index}`,
              });
            }
          }
        });
      }
    });
    setLocations(allLocations);
  }, [layers]);

  const updateCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoLocationError(
        "La géolocalisation n'est pas supportée par votre navigateur"
      );
      return;
    }

    setCurrentLocation((prev) =>
      prev
        ? { ...prev, updating: true }
        : {
            name: "Ma position actuelle",
            coordinates: [0, 0],
            category: "Position actuelle",
            uniqueId: "current-location",
            updating: true,
          }
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: CurrentLocation = {
          name: "Ma position actuelle",
          coordinates: [position.coords.latitude, position.coords.longitude],
          category: "Position actuelle",
          uniqueId: "current-location",
          updating: false,
        };
        setCurrentLocation(newLocation);
        setGeoLocationError(null);
        if (startLocation?.uniqueId === "current-location") {
          setStartLocation(newLocation);
        }
      },
      (error) => {
        setGeoLocationError(
          error.code === 1
            ? "Veuillez autoriser l'accès à votre position"
            : error.code === 2
            ? "Position non disponible"
            : "Erreur lors de la récupération de la position"
        );
        setCurrentLocation((prev) =>
          prev ? { ...prev, updating: false } : null
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    updateCurrentLocation();
  }, []);

  const handleCalculateRoute = async () => {
    if (startLocation && endLocation) {
      try {
        setIsLoading(true);
        setRouteError(null);
        await onRouteRequest(
          startLocation.coordinates,
          endLocation.coordinates
        );
      } catch (error) {
        console.error("Error calculating route:", error);
        setRouteError(
          error instanceof Error ? error.message : "Failed to calculate route"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filterOptions = (
    options: Location[],
    { inputValue }: { inputValue: string }
  ) => {
    if (!inputValue) return options;

    const normalizedInput = inputValue
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return options.filter((option) => {
      const normalizedName = option.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const normalizedCategory = option.category
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return (
        normalizedName.includes(normalizedInput) ||
        normalizedCategory.includes(normalizedInput)
      );
    });
  };

  const allLocationsWithCurrent = currentLocation
    ? [currentLocation, ...locations]
    : locations;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Calcul d'itinéraire
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Autocomplete
            options={allLocationsWithCurrent}
            value={startLocation}
            onChange={(_, newValue) => {
              setStartLocation(newValue);
              setRouteError(null);
            }}
            inputValue={startInputValue}
            onInputChange={(_, newValue) => setStartInputValue(newValue)}
            filterOptions={filterOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Point de départ"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!geoLocationError}
                helperText={geoLocationError}
                placeholder="Saisissez le nom d'un service..."
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  {option.uniqueId === "current-location" ? (
                    <MyLocationIcon sx={{ mr: 1, color: "primary.main" }} />
                  ) : null}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" noWrap component="div">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {option.name}
                        {option.uniqueId === "current-location" &&
                          "updating" in option &&
                          (option as CurrentLocation).updating && (
                            <CircularProgress size={12} sx={{ ml: 1 }} />
                          )}
                      </Box>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {option.category}
                    </Typography>
                  </Box>
                </Box>
              </li>
            )}
            groupBy={(option) => option.category}
            sx={{ flex: 1 }}
            autoComplete
            openOnFocus
            blurOnSelect={false}
            clearOnBlur={false}
          />
          <Tooltip title="Actualiser ma position">
            <IconButton
              onClick={updateCurrentLocation}
              sx={{ mt: 2 }}
              color={geoLocationError ? "error" : "primary"}
            >
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Autocomplete
          options={locations}
          value={endLocation}
          onChange={(_, newValue) => {
            setEndLocation(newValue);
            setRouteError(null);
          }}
          inputValue={endInputValue}
          onInputChange={(_, newValue) => setEndInputValue(newValue)}
          filterOptions={filterOptions}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Destination"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Saisissez le nom d'un service..."
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" noWrap>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {option.category}
                  </Typography>
                </Box>
              </Box>
            </li>
          )}
          groupBy={(option) => option.category}
          autoComplete
          openOnFocus
          blurOnSelect={false}
          clearOnBlur={false}
        />

        {routeError && (
          <Typography color="error" sx={{ mt: 1, mb: 1 }}>
            {routeError}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCalculateRoute}
          disabled={!startLocation || !endLocation || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} /> : <DirectionsIcon />
          }
          sx={{ mt: 2 }}
        >
          {isLoading ? "Calcul en cours..." : "Calculer l'itinéraire"}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Services disponibles
      </Typography>

      {locations.length > 0 ? (
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {Object.entries(
            locations.reduce((acc, location) => {
              if (!acc[location.category]) {
                acc[location.category] = [];
              }
              acc[location.category].push(location);
              return acc;
            }, {} as Record<string, Location[]>)
          )
            .sort(([catA], [catB]) => {
              const indexA = CATEGORY_ORDER.indexOf(catA);
              const indexB = CATEGORY_ORDER.indexOf(catB);
              if (indexA === -1 && indexB === -1)
                return catA.localeCompare(catB);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            })
            .map(([category, categoryLocations]) => {
              const categoryColor = CATEGORY_COLORS[category] || {
                main: "#f5f5f5",
                light: "transparent",
              };
              const isHighlighted = CATEGORY_COLORS[category] !== undefined;

              return (
                <Box
                  key={category}
                  sx={{
                    mb: 2,
                    backgroundColor: categoryColor.light,
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      backgroundColor: isHighlighted
                        ? categoryColor.main
                        : "#f5f5f5",
                      color: isHighlighted ? "white" : "text.primary",
                      p: 1,
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: isHighlighted ? 1 : 0,
                    }}
                  >
                    <span>{CATEGORY_DISPLAY_NAMES[category] || category}</span>
                    <span
                      style={{
                        backgroundColor: isHighlighted
                          ? "rgba(255, 255, 255, 0.2)"
                          : "#e0e0e0",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.8em",
                      }}
                    >
                      {categoryLocations.length}
                    </span>
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      pl: 2,
                      mt: 1,
                      listStyle: "none",
                      "& li": {
                        position: "relative",
                        "&::before": {
                          content: '"•"',
                          position: "absolute",
                          left: "-1em",
                          color: isHighlighted
                            ? categoryColor.main
                            : "text.secondary",
                        },
                      },
                    }}
                  >
                    {categoryLocations
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((location) => (
                        <Typography
                          key={location.uniqueId}
                          component="li"
                          variant="body2"
                          sx={{
                            mb: 0.5,
                            cursor: "pointer",
                            "&:hover": {
                              color: categoryColor.main,
                              backgroundColor: categoryColor.light,
                              borderRadius: "4px",
                              pl: 1,
                              ml: -1,
                            },
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => setEndLocation(location)}
                        >
                          {location.name}
                        </Typography>
                      ))}
                  </Box>
                </Box>
              );
            })}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Aucun service disponible
        </Typography>
      )}
    </Box>
  );
};

export default RoutingPanel;
