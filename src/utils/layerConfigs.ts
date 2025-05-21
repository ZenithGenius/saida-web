import { layerCategories } from './geoJsonLoader';

export interface LayerConfig {
  id: string;
  name: string;
  category: string;
  filename: string;
}

export const availableLayers: LayerConfig[] = [
  // Infrastructures académiques
  { id: 'universite', name: 'Universités', category: layerCategories.ACADEMIQUE, filename: 'univrsite.geojson' },
  { id: 'secretariat', name: 'Secrétariats', category: layerCategories.ACADEMIQUE, filename: 'Sécrétariats.geojson' },
  { id: 'lycee_college', name: 'Lycées/Collèges', category: layerCategories.ACADEMIQUE, filename: 'college.geojson' },
  { id: 'ecole_primaire', name: 'Écoles primaires', category: layerCategories.ACADEMIQUE, filename: 'ecole.geojson' },
  { id: 'creche', name: 'Crèches', category: layerCategories.ACADEMIQUE, filename: 'creche.geojson' },

  // Infrastructures administratives
  { id: 'admin', name: 'Bureaux administratifs', category: layerCategories.ADMINISTRATIF, filename: 'offices_gov.geojson' },
  { id: 'justice', name: 'Palais de justice', category: layerCategories.ADMINISTRATIF, filename: 'palais_justice.geojson' },

  // Infrastructures sanitaires
  { id: 'hopital', name: 'Hôpitaux', category: layerCategories.SANITAIRE, filename: 'hopital.geojson' },
  { id: 'pharmacie', name: 'Pharmacies', category: layerCategories.SANITAIRE, filename: 'pharmacie.geojson' },
  { id: 'clinique', name: 'Cliniques', category: layerCategories.SANITAIRE, filename: 'clinique.geojson' },
  { id: 'centre_sante', name: 'Centres de santé', category: layerCategories.SANITAIRE, filename: 'centre_sante.geojson' },

  // Infrastructures commerciales
  { id: 'marche', name: 'Marchés', category: layerCategories.COMMERCIAL, filename: 'marches.geojson' },
  { id: 'supermarche', name: 'Supermarchés', category: layerCategories.COMMERCIAL, filename: 'supermarche.geojson' },
  { id: 'boutique', name: 'Boutiques', category: layerCategories.COMMERCIAL, filename: 'boutique.geojson' },
  { id: 'banque', name: 'Banques', category: layerCategories.COMMERCIAL, filename: 'banques.geojson' },

  // Infrastructures de sécurité
  { id: 'commissariat', name: 'Police', category: layerCategories.SECURITE, filename: 'commissariat.geojson' },
  { id: 'caserne', name: 'Sapeurs pompiers', category: layerCategories.SECURITE, filename: 'caserne.geojson' },

  // Infrastructures de transport
  { id: 'gare', name: 'Gares routières', category: layerCategories.TRANSPORT, filename: 'gare_routiere.geojson' },
  { id: 'station_service', name: 'Stations service', category: layerCategories.TRANSPORT, filename: 'station_service.geojson' },

  // Infrastructures religieuses
  { id: 'eglise', name: 'Églises', category: layerCategories.RELIGIEUX, filename: 'eglise.geojson' },
  { id: 'mosquee', name: 'Mosquées', category: layerCategories.RELIGIEUX, filename: 'mosquee.geojson' },

  // Infrastructures de loisirs
  { id: 'loisirs', name: 'Espaces de loisirs', category: layerCategories.LOISIRS, filename: 'loisirs.geojson' },
  { id: 'monument', name: 'Monuments', category: layerCategories.LOISIRS, filename: 'monument.geojson' },

  // Couches de base
  { id: 'batiments', name: 'Bâtiments', category: layerCategories.BASE, filename: 'buildings.geojson' },
  { id: 'routes', name: 'Routes', category: layerCategories.BASE, filename: 'highway.geojson' },
  { id: 'ruisseaux', name: 'Ruisseaux', category: layerCategories.BASE, filename: 'ruisseau.geojson' },
  { id: 'lacs', name: 'Lacs', category: layerCategories.BASE, filename: 'lacs.geojson' },
  { id: 'perimetre', name: 'Périmètre urbain', category: layerCategories.BASE, filename: 'Périmètre urbain.geojson' },
  { id: 'localites', name: 'Localités', category: layerCategories.BASE, filename: 'Localités.geojson' },
]; 