import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { supabaseClient } from "./createClient";
import Map, { Layer,  Source, useMap,  MapProvider } from 'react-map-gl/maplibre'
import { MapLayerMouseEvent } from "maplibre-gl";

const camDefault = {
    center: [-121.968438, 37.371627],
    zoom: 15,
    pitch: 0,
    bearing: 0
};

export default function SeatPicker() {
    const { eventId } = useParams<any>();
    const [geodata, setGeoData] = useState<any>({
        type: 'FeatureCollection',
        features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.4, 37.8] } }
        ]
    });
    const [cameraPosition, setCamPos] = useState<any>(camDefault);


    async function fetchVenue() {
        const { data } = await supabaseClient.from('venues').select('venue_geojson').eq('id', 1);
        if(!data)
            return;
        setGeoData(data[0].venue_geojson);

    }

    const [currFeatures, setFeatures] = useState<any>();

    useEffect(() => {
        fetchVenue();
    }, []);

    const fetchSeats = async (tribuneId :  any) => {
        if (!tribuneId) {
            return;
        }
        const { data } = await supabaseClient
            .from('seats')
            .select('*')
            .eq('event', eventId)
            .eq('tribuneId', tribuneId);

        if (!data) {
            return;
        }

        setFeatures({ available_seats: data[0].available_seats, price: data[0].price });
    }

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
        })
        if(!ev.features)
            return;
        const id = ev.features[0].properties.tribuneId;
        fetchSeats(id);
    }


    function Navigation({ cameraPosition } : any) {
        const { currmap } = useMap();

        useEffect(() => {
            currmap?.flyTo(cameraPosition);
        }, [])

        return (
            <h1 className="hidden" >Hack to be able to fly to a position</h1>
        )
    }

    function Inspector({ features } : any) {

        return (


            <div className="absolute right-10 top-10 max-w-sm p-6 min-w-80 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                {!features && <a href="#">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Cliquer sur une tribune!</h5>
                </a>}
                {features && <div className="flex flex-col dark:text-white">
                    <p className=" inline"><strong className=" font-extrabold">Available Seats : </strong> {features.available_seats}</p>
                    <p className=" inline"><strong className=" font-extrabold">Price : </strong>{features.price}</p>
                    <a href="#" onClick={() => { setCamPos(camDefault); setFeatures(undefined) }} className="inline-flex mt-6 items-center w-40 px-3 py-2 text-sm font-medium text-center text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-blue-300">
                        Go back
                        <svg className=" w-3.5 h-3.5 ms-2" id="2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </a>

                </div>}

            </div>


        )
    }

    return (
        <>
            <MapProvider>
                <Map
                    id="currmap"
                    initialViewState={{
                        longitude: -121.96,
                        latitude: 37.35,
                        zoom: 15
                    }}
                    style={{ width: "100wh", height: "100vh" }}
                    interactive={true}
                    interactiveLayerIds={["tribune"]}
                    onMouseDown={handleClick}
                >
                    <Source id="stadium" type="geojson" data={geodata}>
                        <Layer id="tribune" {
                            ...{
                                filter: ['==', 'type', 'tribune'],
                                type: 'fill',
                                paint: {
                                    "fill-color": "#e7e6e8"
                                }
                            }
                        } />
                        <Layer beforeId="tribune" id="stadium-line" {
                            ...{
                                type: 'line',
                                paint: {
                                    "line-color": ["get", "stroke"],
                                    "line-width": ["get", "stroke-width"],
                                }
                            }
                        } />
                        <Layer beforeId="stadium-line" id="stadium-fill" {
                            ...{

                                type: 'fill',
                                paint: {
                                    "fill-color": ["get", "fill"],
                                    "fill-opacity": ["get", "fill-opacity"],
                                }
                            }
                        } />
                    </Source>
                    
                </Map>
                <Navigation cameraPosition={cameraPosition} />
                <Inspector features={currFeatures} />
                

            </MapProvider>
        </>
    )
}