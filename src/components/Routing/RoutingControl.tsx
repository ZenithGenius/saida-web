import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import { DirectionsWalk, AccessTime } from '@mui/icons-material';
import { calculateRoute } from '../../utils/routingService';
import type { Feature } from 'geojson';

interface RoutingControlProps {
  waypoints: [number, number][];
}

interface RouteInfo {
  distance: number;
  duration: number;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

const RoutingControl: React.FC<RoutingControlProps> = ({ waypoints }) => {
  const map = useMap();
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeData, setRouteData] = useState<Feature | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (waypoints.length !== 2) {
      setError("Deux points sont nécessaires pour calculer un itinéraire");
      return;
    }

    const fetchRoute = async () => {
      setIsCalculating(true);
      setError(null);
      setRouteData(null);
      setRouteInfo(null);

      try {
        console.log('RoutingControl: Calculating route between', waypoints[0], 'and', waypoints[1]);
        const result = await calculateRoute(waypoints[0], waypoints[1]);
        
        if (!result || !result.route) {
          throw new Error("Aucune données d'itinéraire reçues");
        }

        setRouteData(result.route);
        
        // Extract route information
        if (result.route.properties) {
          setRouteInfo({
            distance: result.route.properties.distance,
            duration: result.route.properties.duration,
            steps: result.route.properties.steps
          });
        }

        // Fit map to bounds if we have route data
        if (result.route.geometry && 
            result.route.geometry.type === 'LineString' && 
            'coordinates' in result.route.geometry && 
            result.route.geometry.coordinates.length) {
          const bounds = L.geoJSON(result.route).getBounds();
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.error('Error in RoutingControl:', err);
        setError(err instanceof Error ? err.message : "Échec du calcul d'itinéraire");
      } finally {
        setIsCalculating(false);
      }
    };

    fetchRoute();

    return () => {
      // Clean up
    };
  }, [map, waypoints]);

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)} secondes`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} minutes`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return `${hours} h ${minutes} min`;
    }
  };

  if (error) {
    return (
      <Paper 
        elevation={3}
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          padding: 2,
          maxWidth: 300,
          backgroundColor: 'rgba(255, 0, 0, 0.1)'
        }}
      >
        <Typography color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      {routeData && (
        <GeoJSON 
          data={routeData} 
          style={() => ({
            color: '#3388ff',
            weight: 5,
            opacity: 0.7
          })}
        />
      )}
      
      {/* Start marker */}
      {waypoints[0] && (
        <Marker 
          position={[waypoints[0][0], waypoints[0][1]]}
          icon={L.divIcon({
            html: `<div style="background-color: #3388ff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            className: 'custom-div-icon',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        >
          <Popup>Point de départ</Popup>
        </Marker>
      )}
      
      {/* End marker */}
      {waypoints[1] && (
        <Marker 
          position={[waypoints[1][0], waypoints[1][1]]}
          icon={L.divIcon({
            html: `<div style="background-color: #ff3333; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            className: 'custom-div-icon',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        >
          <Popup>Destination</Popup>
        </Marker>
      )}

      {isCalculating ? (
        <Paper 
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            padding: 2,
            maxWidth: 300,
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Calcul de l'itinéraire...</Typography>
          </Box>
        </Paper>
      ) : routeInfo && (
        <Paper 
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            padding: 2,
            maxWidth: 300,
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Informations sur l'itinéraire
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <DirectionsWalk color="primary" />
              <Typography>
                Distance: {formatDistance(routeInfo.distance)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AccessTime color="primary" />
              <Typography>
                Durée estimée: {formatDuration(routeInfo.duration)}
              </Typography>
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Instructions:
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {routeInfo.steps.map((step, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 1,
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      {step.instruction || "Continuer tout droit"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistance(step.distance)} • {formatDuration(step.duration)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default RoutingControl; 