import React from 'react';
import { Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { Feature, Point, Polygon } from 'geojson';
import type { GeoJsonLayer } from '../../utils/geoJsonLoader';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  geojson?: Feature;
}

interface SearchMarkerProps {
  searchResult: SearchResult;
  layers: GeoJsonLayer[];
}

interface NearbyService {
  name: string;
  category: string;
  distance: number;
}

const SearchMarker: React.FC<SearchMarkerProps> = ({ searchResult, layers }) => {
  const position: [number, number] = [parseFloat(searchResult.lat), parseFloat(searchResult.lon)];

  // Trouver les services à proximité (dans un rayon de 1km)
  const findNearbyServices = (): NearbyService[] => {
    const MAX_DISTANCE = 1000; // 1km en mètres
    const searchPoint = L.latLng(position[0], position[1]);
    
    const nearbyServices = layers.flatMap(layer => {
      return layer.data.features
        .filter(feature => {
          if (!feature.geometry) return false;
          
          let servicePoint: L.LatLng | null = null;
          
          if (feature.geometry.type === 'Point') {
            const pointGeometry = feature.geometry as Point;
            servicePoint = L.latLng(
              pointGeometry.coordinates[1],
              pointGeometry.coordinates[0]
            );
          } else if (feature.geometry.type === 'Polygon') {
            const polygonGeometry = feature.geometry as Polygon;
            // Pour les polygones, utiliser le centre
            const coords = polygonGeometry.coordinates[0];
            const centerLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
            const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
            servicePoint = L.latLng(centerLat, centerLng);
          }
          
          if (!servicePoint) return false;
          
          const distance = searchPoint.distanceTo(servicePoint);
          return distance <= MAX_DISTANCE;
        })
        .map(feature => {
          let featurePoint: L.LatLng;
          
          if (feature.geometry.type === 'Point') {
            const pointGeometry = feature.geometry as Point;
            featurePoint = L.latLng(
              pointGeometry.coordinates[1],
              pointGeometry.coordinates[0]
            );
          } else {
            const polygonGeometry = feature.geometry as Polygon;
            const coords = polygonGeometry.coordinates[0];
            const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
            const centerLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
            featurePoint = L.latLng(centerLat, centerLng);
          }

          return {
            name: feature.properties?.nom || feature.properties?.name || feature.properties?.Noms || 'Sans nom',
            category: layer.category,
            distance: searchPoint.distanceTo(featurePoint)
          };
        });
    }).sort((a, b) => a.distance - b.distance);

    return nearbyServices;
  };

  const nearbyServices = findNearbyServices();

  return (
    <>
      {searchResult.geojson ? (
        <GeoJSON 
          data={searchResult.geojson}
          style={{
            color: '#0066ff',
            weight: 2,
            fillColor: '#0066ff',
            fillOpacity: 0.2,
          }}
        >
          <Popup>
            <div>
              <h4>{searchResult.display_name}</h4>
              <p><strong>Type :</strong> {searchResult.type}</p>
              {nearbyServices.length > 0 && (
                <>
                  <p><strong>Services à proximité :</strong></p>
                  <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 20px' }}>
                    {nearbyServices.map((service, index) => (
                      <li key={index}>
                        {service.name} ({service.category}) - {Math.round(service.distance)}m
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Popup>
        </GeoJSON>
      ) : (
        <Marker position={position}>
          <Popup>
            <div>
              <h4>{searchResult.display_name}</h4>
              <p><strong>Type :</strong> {searchResult.type}</p>
              {nearbyServices.length > 0 && (
                <>
                  <p><strong>Services à proximité :</strong></p>
                  <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 20px' }}>
                    {nearbyServices.map((service, index) => (
                      <li key={index}>
                        {service.name} ({service.category}) - {Math.round(service.distance)}m
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default SearchMarker; 