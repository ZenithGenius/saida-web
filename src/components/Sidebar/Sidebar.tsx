import React, { useState, useMemo } from "react";
import {
  Box,
  Drawer,
  TextField,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Collapse,
  CircularProgress,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import {
  Search as SearchIcon,
  Layers as LayersIcon,
  DirectionsWalk as DirectionsIcon,
  Create as CreateIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import type { GeoJsonLayer } from "../../utils/geoJsonLoader";
import { availableLayers } from "../../utils/layerConfigs";
import RoutingPanel from "../Routing/RoutingPanel";
import DrawingPanel from "./DrawingPanel";
import type { Feature } from "geojson";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface LayerWithLoading extends GeoJsonLayer {
  loading: boolean;
}

interface SearchOption {
  id: string;
  label: string;
  category: string;
}

interface DrawnShape {
  type: string;
  geoJSON: Feature;
  title?: string;
  description?: string;
}

interface SidebarProps {
  layers: LayerWithLoading[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onRouteRequest: (start: [number, number], end: [number, number]) => void;
  onToggleDrawing: (enabled: boolean) => void;
  drawnShapes?: DrawnShape[];
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sidebar-tabpanel-${index}`}
      aria-labelledby={`sidebar-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  layers,
  onLayerToggle,
  onRouteRequest,
  onToggleDrawing,
  drawnShapes = [],
}) => {
  const [value, setValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<SearchOption | null>(
    null
  );

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCategoryClick = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const drawerWidth = 280;

  // Créer les options de recherche
  const searchOptions = useMemo(() => {
    return availableLayers.map((layer) => ({
      id: layer.id,
      label: layer.name,
      category: layer.category,
    }));
  }, []);

  // Filtrer les résultats
  const getFilteredOptions = (inputValue: string) => {
    if (!inputValue) return [];

    const normalizedSearch = inputValue
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return searchOptions.filter((option) => {
      const normalizedLabel = option.label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const normalizedCategory = option.category
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return (
        normalizedLabel.includes(normalizedSearch) ||
        normalizedCategory.includes(normalizedSearch)
      );
    });
  };

  const handleSearchSelect = (option: SearchOption | null) => {
    setSelectedOption(option);
    if (!option) return;
    onLayerToggle(option.id, true);
    setValue(0); // Basculer vers l'onglet des couches
  };

  // Grouper les couches par catégorie pour l'onglet des couches
  const layersByCategory = layers.reduce((acc, layer) => {
    if (!acc[layer.category]) {
      acc[layer.category] = [];
    }
    acc[layer.category].push(layer);
    return acc;
  }, {} as Record<string, LayerWithLoading[]>);

  const renderLayerItem = (layer: LayerWithLoading) => (
    <ListItem
      key={layer.id}
      dense
      button
      sx={{ pl: 4 }}
      onClick={() => !layer.loading && onLayerToggle(layer.id, !layer.visible)}
    >
      <ListItemIcon>
        {layer.loading ? (
          <CircularProgress size={20} />
        ) : (
          <Checkbox
            edge="start"
            checked={layer.visible}
            tabIndex={-1}
            disableRipple
          />
        )}
      </ListItemIcon>
      <ListItemText
        primary={layer.name}
        sx={{ opacity: layer.loading ? 0.5 : 1 }}
      />
    </ListItem>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ overflow: "auto", height: "100%" }}>
        <Box sx={{ p: 2 }}>
          <Autocomplete
            fullWidth
            options={getFilteredOptions(searchTerm)}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Rechercher une infrastructure..."
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body1">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.category}
                  </Typography>
                </Box>
              </li>
            )}
            value={selectedOption}
            onChange={(_, newValue) => handleSearchSelect(newValue)}
            onInputChange={(_, newValue) => setSearchTerm(newValue)}
          />
        </Box>

        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          aria-label="sidebar navigation tabs"
        >
          <Tab icon={<LayersIcon />} aria-label="layers" />
          <Tab icon={<DirectionsIcon />} aria-label="routing" />
          <Tab icon={<CreateIcon />} aria-label="drawing" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <List>
            {Object.entries(layersByCategory).map(
              ([category, categoryLayers]) => (
                <React.Fragment key={category}>
                  <ListItem
                    button
                    onClick={() => handleCategoryClick(category)}
                  >
                    <ListItemText primary={category} />
                    {expandedCategories.includes(category) ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItem>
                  <Collapse
                    in={expandedCategories.includes(category)}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {categoryLayers.map((layer) => renderLayerItem(layer))}
                    </List>
                  </Collapse>
                </React.Fragment>
              )
            )}
          </List>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <RoutingPanel layers={layers} onRouteRequest={onRouteRequest} />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <DrawingPanel 
            onToggleDrawing={onToggleDrawing} 
            shapes={drawnShapes}
          />
        </TabPanel>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
