import type { Feature } from "geojson";

interface OSRMResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    legs: Array<{
      steps: Array<{
        maneuver: {
          location: [number, number];
          type: string;
        };
        name: string;
        distance: number;
        duration: number;
      }>;
      distance: number;
      duration: number;
    }>;
    distance: number;
    duration: number;
  }>;
  waypoints: Array<{
    location: [number, number];
    name: string;
  }>;
}

export async function calculateRoute(
  start: [number, number],
  end: [number, number]
): Promise<{ route: Feature }> {
  console.log("Calculating route from", start, "to", end);

  // OSRM expects coordinates in format: longitude,latitude
  // Convert from [latitude, longitude] to [longitude, latitude]
  const startCoord = `${start[1]},${start[0]}`;
  const endCoord = `${end[1]},${end[0]}`;

  // Using 'foot' profile instead of 'driving' which is more appropriate for pedestrian routing
  const url = `https://router.project-osrm.org/route/v1/foot/${startCoord};${endCoord}?overview=full&geometries=geojson&steps=true`;

  try {
    console.log("Fetching route from URL:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OSRM API error:", response.status, errorText);
      throw new Error(`Échec du calcul de route: ${response.statusText}`);
    }

    const data: OSRMResponse = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.error("No routes found in OSRM response:", data);
      throw new Error("Aucun itinéraire trouvé entre ces points");
    }

    const route = data.routes[0];
    console.log("Route found:", {
      distance: route.distance,
      duration: route.duration,
      steps: route.legs[0].steps.length,
      coordinates: route.geometry.coordinates.length,
    });

    // Convert OSRM response to GeoJSON Feature
    const routeFeature: Feature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route.geometry.coordinates,
      },
      properties: {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        steps: route.legs[0].steps.map((step) => ({
          instruction: step.name,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
        })),
      },
    };

    return { route: routeFeature };
  } catch (error) {
    console.error("Error calculating route:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossible de calculer l'itinéraire"
    );
  }
}
