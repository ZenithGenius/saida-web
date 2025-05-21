import React, { useState } from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { layerCategories } from "../../utils/geoJsonLoader";
import { getLayerStyle } from "../../utils/geoJsonLoader";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const Legend: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      sx={{
        position: "absolute",
        bottom: 32,
        right: 8,
        zIndex: 1000,
        padding: 2,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 1,
        boxShadow: 1,
        transition: "all 0.3s ease",
        maxHeight: expanded ? "500px" : "50px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expanded ? 1 : 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Légende
        </Typography>
        <IconButton 
          size="small" 
          onClick={toggleExpanded}
          aria-label={expanded ? "Réduire la légende" : "Afficher la légende"}
          sx={{ padding: 0 }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      {expanded && (
        <Box sx={{ mt: 1 }}>
          {Object.values(layerCategories).map((category) => {
            const style = getLayerStyle(category);
            return (
              <Box
                key={category}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 1,
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: style.fillColor,
                    border: `2px solid ${style.color}`,
                    marginRight: 1,
                    borderRadius: 0.5,
                  }}
                />
                <Typography variant="body2">{category}</Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default Legend;
