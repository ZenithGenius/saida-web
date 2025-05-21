import React, { useState } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import { debounce } from "lodash";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lon: number) => void;
  boundingBox?: [number, number, number, number]; // [sud, nord, ouest, est]
}

const MapSearch: React.FC<MapSearchProps> = ({
  onLocationSelect,
  boundingBox,
}) => {
  const [options, setOptions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const searchLocation = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=10&accept-language=fr`;

      // Ajouter le boundingBox si disponible
      if (boundingBox) {
        url += `&viewbox=${boundingBox[2]},${boundingBox[1]},${boundingBox[3]},${boundingBox[0]}&bounded=1`;
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent": "SAIDA-Application",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const results = await response.json();
      setOptions(results);
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = React.useMemo(
    () => debounce(searchLocation, 300),
    []
  );

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option: SearchResult) => option.display_name}
      filterOptions={(x) => x} // Désactive le filtrage côté client
      loading={loading}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
        debouncedSearch(newInputValue);
      }}
      onChange={(_, newValue) => {
        if (newValue) {
          onLocationSelect(parseFloat(newValue.lat), parseFloat(newValue.lon));
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Rechercher un lieu"
          variant="outlined"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body1">{option.display_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.type}
            </Typography>
          </Box>
        </Box>
      )}
      noOptionsText="Aucun résultat trouvé"
      loadingText="Recherche en cours..."
    />
  );
};

export default MapSearch;
