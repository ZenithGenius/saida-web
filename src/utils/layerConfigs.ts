import { layerCategories } from './geoJsonLoader';

export interface LayerConfig {
  id: string;
  name: string;
  category: string;
  filename: string;
}

export const availableLayers: LayerConfig[] = [
  // Infrastructures académiques
  { id: 'lieux_cours', name: 'Lieux de cours', category: layerCategories.ACADEMIQUE, filename: './geojson_data/Infrastructures_académiques/Lieux_de_cours.geojson' },
  { id: 'etablissements_sup', name: 'Établissements supérieurs', category: layerCategories.ACADEMIQUE, filename: './geojson_data/Infrastructures_académiques/Etablissements_supérieurs.geojson' },
  { id: 'secretariats', name: 'Secrétariats', category: layerCategories.ACADEMIQUE, filename: './geojson_data/Infrastructures_académiques/Sécrétariats.geojson' },
  { id: 'autres_academique', name: 'Autres', category: layerCategories.ACADEMIQUE, filename: './geojson_data/Infrastructures_académiques/Autres_(Infrastructures_académiques).geojson' },

  // Infrastructures administratives
  { id: 'rectorat', name: 'Rectorat', category: layerCategories.ADMINISTRATIF, filename: './geojson_data/Infrastructures_administratives/Rectorat.geojson' },
  { id: 'mairie', name: 'Mairie', category: layerCategories.ADMINISTRATIF, filename: './geojson_data/Infrastructures_administratives/Mairie.geojson' },
  { id: 'prefecture', name: 'Préfecture', category: layerCategories.ADMINISTRATIF, filename: './geojson_data/Infrastructures_administratives/Préfecture.geojson' },
  { id: 'sous_prefecture', name: 'Sous-préfecture', category: layerCategories.ADMINISTRATIF, filename: './geojson_data/Infrastructures_administratives/Sous_préfecture.geojson' },
  { id: 'communaute_urbaine', name: 'Communauté urbaine', category: layerCategories.ADMINISTRATIF, filename: './geojson_data/Infrastructures_administratives/Communauté_urbaine.geojson' },
  { id: 'delegations', name: 'Délégations', category: layerCategories.ADMINISTRATIF, filename: './geojson_data/Infrastructures_administratives/Délégations.geojson' },
  { id: 'autres_admin', name: 'Autres', category: layerCategories.ADMINISTRATIF, filename: './geojson_data/Infrastructures_administratives/Autres_(Infrastructures_administratives).geojson' },

  // Infrastructures de sécurité
  { id: 'commissariat', name: 'Commissariat', category: layerCategories.SECURITE, filename: './geojson_data/Infrastructures_de_sécurité/Commissariats.geojson' },
  // { id: 'gendarmerie', name: 'Gendarmerie', category: layerCategories.SECURITE, filename: './geojson_data/Infrastructures_de_sécurité/Gendarmerie.geojson' },
  { id: 'sapeurs_pompiers', name: 'Sapeurs pompiers', category: layerCategories.SECURITE, filename: './geojson_data/Infrastructures_de_sécurité/Sapeurs_pompiers.geojson' },
  { id: 'autres_securite', name: 'Autres', category: layerCategories.SECURITE, filename: './geojson_data/Infrastructures_de_sécurité/Autres_(Infrastructures_de_sécurité).geojson' },

  // Infrastructures de logement
  { id: 'hotels', name: 'Hôtels', category: layerCategories.LOGEMENT, filename: './geojson_data/Infrastructures_de_logement/Hôtels.geojson' },
  { id: 'motels', name: 'Motels', category: layerCategories.LOGEMENT, filename: './geojson_data/Infrastructures_de_logement/Motels.geojson' },
  { id: 'cites', name: 'Cités', category: layerCategories.LOGEMENT, filename: './geojson_data/Infrastructures_de_logement/Cités.geojson' },

  // Infrastructures de transport
  { id: 'agences_voyage', name: 'Agences de voyage', category: layerCategories.TRANSPORT, filename: './geojson_data/Infrastructures_de_transport/Agences_de_voyage.geojson' },
  { id: 'gares_routieres', name: 'Gares routières', category: layerCategories.TRANSPORT, filename: './geojson_data/Infrastructures_de_transport/Gares_routières.geojson' },

  // Infrastructures marchandes
  { id: 'marches', name: 'Marchés', category: layerCategories.COMMERCIAL, filename: './geojson_data/Infrastructures_marchandes/Marchés.geojson' },
  { id: 'boulangeries', name: 'Boulangeries', category: layerCategories.COMMERCIAL, filename: './geojson_data/Infrastructures_marchandes/Boulangeries.geojson' },
  { id: 'banques', name: 'Banques', category: layerCategories.COMMERCIAL, filename: './geojson_data/Infrastructures_marchandes/Banques.geojson' },
  { id: 'stations_service', name: 'Stations service', category: layerCategories.COMMERCIAL, filename: './geojson_data/Infrastructures_marchandes/Stations_services.geojson' },
  // { id: 'autres_marchands', name: 'Autres', category: layerCategories.COMMERCIAL, filename: './geojson_data/Infrastructures_marchandes/Autres_(Infrastructures_marchandes).geojson' },

  // Infrastructures sanitaires
  { id: 'hopitaux', name: 'Hôpitaux', category: layerCategories.SANITAIRE, filename: './geojson_data/Infrastructures_de_santé/Hôpitaux.geojson' },
  { id: 'centres_sante', name: 'Centres de santé', category: layerCategories.SANITAIRE, filename: './geojson_data/Infrastructures_de_santé/Centres_de_santé.geojson' },
  { id: 'cliniques', name: 'Cliniques', category: layerCategories.SANITAIRE, filename: './geojson_data/Infrastructures_de_santé/Cliniques.geojson' },
  { id: 'pharmacies', name: 'Pharmacies', category: layerCategories.SANITAIRE, filename: './geojson_data/Infrastructures_de_santé/Pharmacies.geojson' },

  // Infrastructures religieuses
  { id: 'eglises', name: 'Églises', category: layerCategories.RELIGIEUX, filename: './geojson_data/Infrastructures_religieuses/Eglises.geojson' },
  { id: 'mosquees', name: 'Mosquées', category: layerCategories.RELIGIEUX, filename: './geojson_data/Infrastructures_religieuses/Mosquées.geojson' },

  // Infrastructures de loisirs
  { id: 'restaurants', name: 'Restaurants', category: layerCategories.LOISIRS, filename: './geojson_data/Infrastructures_de_loisirs/Restaurants.geojson' },
  { id: 'sports', name: "Lieux de sports et d'activités physiques", category: layerCategories.LOISIRS, filename: "./geojson_data/Infrastructures_de_loisirs/Lieux_de_sports_et_d'activités_physiques.geojson" },
  { id: 'espaces_verts', name: 'Espaces verts', category: layerCategories.LOISIRS, filename: './geojson_data/Infrastructures_de_loisirs/Espaces_verts.geojson' },
  { id: 'autres_loisirs', name: 'Autres', category: layerCategories.LOISIRS, filename: './geojson_data/Infrastructures_de_loisirs/Autres_(Infrastructures_de_loisirs).geojson' }
]; 