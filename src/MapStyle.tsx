import type { FillLayer, LineLayer } from "react-map-gl";

export const tribuneFill: FillLayer = {
  id: "tribune",
  filter: ["==", "type", "tribune"],
  "source-layer": "tribune",
  type: "fill",
  paint: {
    "fill-color": "#e7e6e8",
  },
};
export const tribuneStroke: LineLayer = {
  id: "tribune",
  source: "stadium",
  type: "line",
  paint: {
    "line-color": ["get", "stroke"],
    "line-width": ["get", "stroke-width"],
  },
};

export const stadiumFill: FillLayer = {
  id: "stadium-fill",
  source: "stadium",
  type: "fill",
  paint: {
    "fill-color": ["get", "fill"],
    "fill-opacity": ["get", "fill-opacity"],
  },
};
