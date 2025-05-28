import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  LineStyle,
  Square,
  Circle,
  Room,
  Create,
  Delete,
  Download,
  Edit,
  DeleteOutline,
} from "@mui/icons-material";
import type { Feature } from "geojson";

interface DrawingShape {
  type: string;
  geoJSON: Feature;
  title?: string;
  description?: string;
}

interface DrawingPanelProps {
  onToggleDrawing: (enabled: boolean) => void;
  shapes?: DrawingShape[];
  onShapeUpdate?: (shapes: DrawingShape[]) => void;
  onShapeDelete?: (index: number) => void;
  onClearAllShapes?: () => void;
}

const DrawingPanel: React.FC<DrawingPanelProps> = ({
  onToggleDrawing,
  shapes = [],
  onShapeUpdate,
  onShapeDelete,
  onClearAllShapes,
}) => {
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [selectedShape, setSelectedShape] = useState<DrawingShape | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previousShapesLength, setPreviousShapesLength] = useState(0);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Synchroniser les nouvelles formes - seulement quand une nouvelle forme est ajoutée
  useEffect(() => {
    // Vérifier si une nouvelle forme a été ajoutée (et non pas modifiée)
    if (shapes.length > previousShapesLength) {
      const lastShape = shapes[shapes.length - 1];
      if (lastShape && !lastShape.title) {
        setSelectedShape(lastShape);
        setSelectedIndex(shapes.length - 1);
        setTitle("");
        setDescription("");
        setOpenDialog(true);
      }
    }
    // Mettre à jour la longueur précédente
    setPreviousShapesLength(shapes.length);
  }, [shapes, previousShapesLength]);

  // Réinitialiser le compteur si toutes les formes sont supprimées
  useEffect(() => {
    if (shapes.length === 0) {
      setPreviousShapesLength(0);
    }
  }, [shapes.length]);

  const handleToggleDrawing = () => {
    const newState = !drawingEnabled;
    setDrawingEnabled(newState);
    onToggleDrawing(newState);
  };

  const handleEditShape = (shape: DrawingShape, index: number) => {
    setSelectedShape(shape);
    setSelectedIndex(index);
    setTitle(shape.title || "");
    setDescription(shape.description || "");
    setOpenDialog(true);
  };

  const handleSaveShape = () => {
    if (selectedShape && selectedIndex !== null && onShapeUpdate) {
      const updatedShapes = [...shapes];
      updatedShapes[selectedIndex] = {
        ...selectedShape,
        title,
        description,
      };
      onShapeUpdate(updatedShapes);
      
      setOpenDialog(false);
      setSelectedShape(null);
      setSelectedIndex(null);
      setTitle("");
      setDescription("");
      setSaveMessage({
        type: "success",
        text: "Forme mise à jour avec succès",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleDeleteShape = (index: number) => {
    if (onShapeDelete) {
      onShapeDelete(index);
      setSaveMessage({
        type: "success",
        text: "Forme supprimée",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleExportGeoJSON = () => {
    try {
      const geoJSON = {
        type: "FeatureCollection",
        features: shapes.map((shape) => ({
          ...shape.geoJSON,
          properties: {
            ...shape.geoJSON.properties,
            title: shape.title,
            description: shape.description,
          },
        })),
      };

      const blob = new Blob([JSON.stringify(geoJSON, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dessin_cartographique.geojson";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveMessage({ type: "success", text: "Export réussi!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error("Erreur lors de l'export:", e);
      setSaveMessage({ type: "error", text: "Erreur lors de l'export" });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleClearAll = () => {
    if (onClearAllShapes) {
      onClearAllShapes();
    setSaveMessage({
      type: "success",
      text: "Toutes les formes ont été supprimées",
    });
    setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Outils de Dessin
      </Typography>

      <Button
        variant={drawingEnabled ? "contained" : "outlined"}
        color={drawingEnabled ? "primary" : "inherit"}
        fullWidth
        startIcon={<Create />}
        onClick={handleToggleDrawing}
        sx={{ mb: 2 }}
      >
        {drawingEnabled ? "Désactiver le dessin" : "Activer le dessin"}
      </Button>

      {drawingEnabled && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Utilisez les outils sur la carte pour dessiner. Les contrôles sont
          visibles à gauche de la carte.
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Instructions
      </Typography>

      <List dense>
        <ListItem>
          <ListItemIcon>
            <Room fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Marqueur"
            secondary="Placez un marqueur sur la carte"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LineStyle fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Ligne"
            secondary="Dessinez une ligne en cliquant plusieurs fois"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Square fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Polygone/Rectangle"
            secondary="Dessinez une forme fermée"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Circle fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Cercle"
            secondary="Dessinez un cercle en définissant le centre et le rayon"
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Formes Enregistrées ({shapes.length})
      </Typography>

      {shapes.length > 0 ? (
        <>
          <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
            {shapes.map((shape, index) => (
              <ListItem key={index} sx={{ pr: 10 }}>
                <ListItemIcon>
                  {shape.type === "marker" ? (
                    <Room fontSize="small" />
                  ) : shape.type === "polyline" ? (
                    <LineStyle fontSize="small" />
                  ) : shape.type === "polygon" || shape.type === "rectangle" ? (
                    <Square fontSize="small" />
                  ) : (
                    <Circle fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={shape.title || `Forme ${index + 1}`}
                  secondary={
                    shape.description
                      ? shape.description.length > 25
                        ? `${shape.description.substring(0, 25)}...`
                        : shape.description
                      : `Type: ${shape.type}`
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    size="small"
                    onClick={() => handleEditShape(shape, index)}
                    sx={{ mr: 0.5 }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    size="small"
                    onClick={() => handleDeleteShape(index)}
                    color="error"
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              color="error"
              size="small"
              onClick={handleClearAll}
              disabled={!onClearAllShapes}
            >
              Tout Supprimer
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              color="primary"
              size="small"
              onClick={handleExportGeoJSON}
            >
              Exporter
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Aucune forme enregistrée. Activez le dessin et créez des formes sur la
          carte.
        </Typography>
      )}

      {saveMessage && (
        <Alert severity={saveMessage.type} sx={{ mt: 2 }}>
          {saveMessage.text}
        </Alert>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedShape?.title ? "Modifier la Forme" : "Enregistrer la Forme"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Forme ${selectedIndex !== null ? selectedIndex + 1 : ""}`}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description optionnelle de la forme..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSaveShape} variant="contained">
            {selectedShape?.title ? "Modifier" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DrawingPanel;
