import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabaseClient } from "./createClient";
import Map, { Layer, Source, useMap, MapProvider } from "react-map-gl/maplibre";
import { MapLayerMouseEvent } from "maplibre-gl";
import { Popup } from "react-map-gl";
import stadJson from "./adrar.json";
const camDefault = {
  center: [-121.968438, 37.371627],
  zoom: 15,
  pitch: 0,
  bearing: 0,
};

export default function SeatPicker() {
  const { eventId } = useParams<any>();
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState<any>();
  const [geodata, setGeoData] = useState<any>({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.4, 37.8] },
      },
    ],
  });
  const [cameraPosition, setCamPos] = useState<any>(camDefault);

  async function fetchVenue() {
    const { data } = await supabaseClient
      .from("venues")
      .select("venue_geojson")
      .eq("id", 1);
    if (!data) return;
    setGeoData(data[0].venue_geojson);
  }
  async function fetchVenueAdrar() {
    const data = stadJson;
    setGeoData(data);
  }

  const [currFeatures, setFeatures] = useState<any>();
  const refMap = React.useRef(null);
  useEffect(() => {
    // fetchVenue();
    fetchVenueAdrar();
  }, []);

  const resetHoverFeature = (feature) => {
    if (!selectedFeature) {
      return;
    }
    refMap.current.setFeatureState(
      {
        source: "stadium",
        id: feature.id,
      },
      { hover: false }
    );
  };
  const activeHoverFeature = (feature) => {
    if (!feature) {
      return;
    }
    refMap.current.setFeatureState(
      {
        source: "stadium",
        id: feature.id,
      },
      { hover: true }
    );
  };
  /*
  const fetchSeats = async (tribuneId: any) => {
    if (!tribuneId) {
      return;
    }
    const { data } = await supabaseClient
      .from("seats")
      .select("*")
      .eq("event", eventId)
      .eq("tribuneId", tribuneId);

    if (!data) {
      return;
    }

    setFeatures({
      available_seats: data[0].available_seats,
      price: data[0].price,
    });
  };*/

  const handleClick = (ev: MapLayerMouseEvent) => {
    if (ev.features?.length == 0) {
      return;
    }
    setCamPos({
      center: [ev.lngLat.lng, ev.lngLat.lat],
      bearing: 130,
      zoom: 19,
      pitch: 50,
      duration: 3000,
    });
    if (!ev.features) return;
    console.log("click", ev.features[0]);

    const id = ev.features[0].properties.tribuneId;
    fetchSeats(id);
  };

  function Navigation({ cameraPosition }: any) {
    const { currmap } = useMap();

    useEffect(() => {
      currmap?.flyTo(cameraPosition);
    }, []);

    return <h1 className="hidden">Hack to be able to fly to a position</h1>;
  }

  function Inspector({ features }: any) {
    return (
      <div className="absolute right-10 top-10 max-w-sm p-6 min-w-80 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        {!features && (
          <a href="#">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Cliquer sur une tribune!
            </h5>
          </a>
        )}
        {features && (
          <div className="flex flex-col dark:text-white">
            <p className=" inline">
              <strong className=" font-extrabold">Available Seats : </strong>{" "}
              {features.available_seats}
            </p>
            <p className=" inline">
              <strong className=" font-extrabold">Price : </strong>
              {features.price}
            </p>
            <a
              href="#"
              onClick={() => {
                setCamPos(camDefault);
                setFeatures(undefined);
                handleMouseLeave();
              }}
              className="inline-flex mt-6 items-center w-40 px-3 py-2 text-sm font-medium text-center text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              Go back
              <svg
                className=" w-3.5 h-3.5 ms-2"
                id="2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    );
  }
  const handleMouseHover = useCallback((event: MapLayerMouseEvent) => {
    if (!event.features) {
      return;
    }
    if (event.features?.length == 0) {
      return;
    }
    console.log("hover", event.features[0]);
    setPopupInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      properties: event.features[0].properties,
    });
  }, []);
  const handleMouseEnter = (event: MapLayerMouseEvent) => {
    if (!event.features) {
      return;
    }
    if (event.features?.length == 0) {
      return;
    }
    console.log("prev ", selectedFeature);
    console.log("enter", event.features[0]);

    resetHoverFeature(selectedFeature);

    activeHoverFeature(event.features[0]);
    setSelectedFeature(event.features[0]);
  };

  const handleMouseLeave = () => {
    resetHoverFeature(selectedFeature);
    setHoverInfo(null);
  };

  return (
    /*  <div >
      <MapProvider  >
    
        <Map
        ref={refMap}
          id="currmap"
          initialViewState={{
            longitude: -121.96,
            latitude: 37.35,
            zoom: 15,
            
          }}
          
          style={{ width: "100wh", height: "100vh",backgroundColor:"EDEFF5" }}
          
          interactive={true}
          interactiveLayerIds={["tribune"]}
          onMouseMove={handleMouseHover}
          onMouseDown={handleClick}
          onClick={handleMouseEnter}
          onBoxZoomCancel={handleMouseLeave}
          
        >
          <Source id="stadium" type="geojson" data={geodata}>
            
            <Layer
              id="tribune"
              {...{
                filter: ["==", "type", "tribune"],
                type: "fill",
                paint: {
                    
                    // the fill color will be depends on switch case 
                  "fill-color":  
                  [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    "#B2FFD1",
                    "#e7e6e8"
                  ], 
                 
                },
              }}
            />
            
            <Layer
              beforeId="tribune"
              id="stadium-line"
              {...{
                type: "line",
                paint: {
                  "line-color": ["get", "stroke"],
                  "line-width": ["get", "stroke-width"],

                },
              }}
            />
            <Layer
              beforeId="stadium-line"
              id="stadium-fill"
              {...{
                type: "fill",
                paint: {
                  "fill-color": ["get", "fill"],
                  "fill-opacity": ["get", "fill-opacity"],
                },
              }}
            />

            <Layer beforeId="stadium-fill" 
                type="background"
                paint={{
                    "background-color": "#EDEFF5"
                }}
            />
          </Source>
          {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              {popupInfo.properties.tribuneId} {' '}
            
            </div>
          </Popup>
        )}
        
        </Map>
        <Navigation cameraPosition={cameraPosition} />
        <Inspector features={currFeatures} />
        
      </MapProvider>
    </div>*/

    <div>
      <MapProvider>
        <Map
          ref={refMap}
          id="currmap"
          initialViewState={{
            longitude: -121.96,
            latitude: 37.35,
            zoom: 15,
          }}
          mapStyle=
            'https://api.maptiler.com/maps/streets/style.json?key=iiFeGmvBxqCn4UG9a3K0'
           style={{ width: "100wh", height: "100vh", backgroundColor: "EDEFF5" }}
          interactive={true}
          interactiveLayerIds={["tribune"]}
          onMouseMove={handleMouseHover}
          onMouseDown={handleClick}
          onClick={handleMouseEnter}
          onBoxZoomCancel={handleMouseLeave}
        >
          <Source id="stadium"  type="geojson" data={geodata}>
            <Layer
              id="symbol-layer"
              {...{
                type: 'symbol',
                    source: 'stadium',
                    layout: {

                        "text-field":  ["concat", 'z', ['get', 'tribuneId'] ] ,
                        "text-font": [
                            'Poppins',
                            'Arial Unicode MS Bold'
                        ],
                        "text-size": 12,
                        "text-transform": 'uppercase',
                        "text-letter-spacing": 0.05,
                        "text-offset": [0, 1.5]
                    },
                    paint: {
                        "text-color":"#4D4D4D" ,
                        "text-halo-color": '#fff',
                        "text-halo-width": 2
                    },
                    filter: ['==', 'type', 'tribune']
              }}
            />
            <Layer beforeId="symbol-layer"  
              id="seat"
              {...{
                filter: ["==", "type", "seat"],
                type: "fill",
                paint: {
                  "fill-color": [
                    "case",
                    ["==", ["get", "isAvailable"], 1],
                    "#A9A9A9",
                    ["==", ["get", "isAvailable"], 0],
                    "#3A9012",
                    "#A9A9A9",
                  ],
                },
              }}
            />

            <Layer
              beforeId="seat"
              id="seat-line"
              {...{
                filter: ["==", "type", "seat"],
                type: "line",
                paint: {
                  "line-color": "#FFFFFF",
                  "line-width": 4,
                },
              }}
            />
            <Layer
              beforeId="seat-line"
              id="tribune"
              {...{
                filter: ["==", "type", "tribune"],
                type: "fill",
                paint: {
                  // the fill color will be depends on switch case
                  "fill-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#B2FFD1",
                    "#e7e6e8",
                  ],
                },
              }}
            />

            <Layer
              beforeId="tribune"
              id="tribune-line"
              {...{
                filter: ["==", "type", "tribune"],
                type: "line",
                paint: {
                  "line-color": "#AFAEB0",
                  "line-width": 2,
                },
              }}
            />

            <Layer
              beforeId="tribune-line"
              id="stadium-outline"
              {...{
                filter: ["==", "type", "stadium-outline"],
                type: "line",

                paint: {
                  "line-color": "#FFFFFF",
                  "line-width": 2,
                },
              }}
            />
            <Layer
              beforeId="stadium-outline"
              id="field"
              {...{
                filter: [
                  "in",
                  "type",
                  "stadium-field-light",
                  "stadium-field-dark",
                ],
                type: "fill",
                paint: {
                  // the fill color will be depends on switch case
                  "fill-color": [
                    "case",
                    ["==", ["get", "type"], "stadium-field-light"],
                    "#78924A",
                    ["==", ["get", "type"], "stadium-field-dark"],
                    "#5F783A",
                    "#A9A9A9",
                  ],
                },
              }}
            />

            <Layer
              beforeId="field"
              id="stadium-base"
              {...{
                filter: ["==", "type", "stadium-base"],
                type: "fill",
                paint: {
                  // the fill color will be depends on switch case
                  "fill-color": "#E7E6E8",
                  "fill-opacity": 0.5,
                },
              }}
            />
            <Layer
              beforeId="stadium-base"
              id="stadium-base-line"
              {...{
                filter: ["==", "type", "stadium-base"],
                type: "line",

                paint: {
                  "line-color": "#AFAEB0",
                  "line-width": 2,
                },
              }}
            />
            <Layer
              beforeId="stadium-base-line"
              id="bg-stadium"
              {...{
                filter: ["==", "type", "bg-stadium"],
                type: "fill",
                paint: {
                  "fill-color": "#FFFFFF",
                },
              }}
            />
            <Layer
              beforeId="bg-stadium"
              id="bg-stadium-line"
              {...{
                filter: ["==", "type", "bg-stadium"],
                type: "line",

                paint: {
                  "line-color": "#AFAEB0",
                  "line-width":10 ,
                },
              }}
            />

            <Layer
              beforeId="bg-stadium-line"
              type="background"
              paint={{
                "background-color": "#EDEFF5",
              }}
            />
          </Source>
          {popupInfo && (
            <Popup
              anchor="top"
              longitude={Number(popupInfo.longitude)}
              latitude={Number(popupInfo.latitude)}
              onClose={() => setPopupInfo(null)}
            >
              <div>{popupInfo.properties.tribuneId} </div>
            </Popup>
          )}
        </Map>
        <Navigation cameraPosition={cameraPosition} />
        <Inspector features={currFeatures} />
      </MapProvider>
    </div>
  );
}
