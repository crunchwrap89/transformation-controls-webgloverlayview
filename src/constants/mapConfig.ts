export const API_SETTINGS: APITYPE = {
  apiKey: import.meta.env.VITE_GM_K,
  mapIds: [import.meta.env.VITE_GM_MAPIDS],
  region: "US",
  language: "EN",
  version: "weekly",
};

export const MAP_SETTINGS = {
  tilt: 67.5,
  heading: 0,
  zoom: 19,
  center: {
    lat: 51,
    lng: 11,
  },
  restriction: {
    latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
  },
  mapId: import.meta.env.VITE_GM_MAPID,
  disableDefaultUI: true,
  draggable: true,
  zoomControl: false,
  isFractionalZoomEnabled: true,
  gestureHandling: "greedy",
};
