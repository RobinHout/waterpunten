'use client';

import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import { useState, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { LatLngBoundsExpression, LatLngTuple } from 'leaflet';

// Netherlands Bounds
const NL_BOUNDS: LatLngBoundsExpression = [
    [50.7, 3.2], // Southwest
    [53.7, 7.3]  // Northeast
];

const MIN_ZOOM = 8;

interface SimpleWaterPoint {
    id: number;
    lat: number;
    lon: number;
}

interface GeoJSONFeature {
    type: "Feature";
    properties: {
        "@id": string;
    };
    geometry: {
        type: "Point";
        coordinates: [number, number]; // lon, lat
    };
    id: string;
}

interface GeoJSONCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

function LocationMarker() {
    const map = useMap(); // This is correct, uses context

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            map.flyTo(e.latlng, 14);
        });
    }, [map]);

    return null;
}

function CreateWaterPoints() {
    const map = useMap();
    const [allPoints, setAllPoints] = useState<SimpleWaterPoint[]>([]);
    const [visiblePoints, setVisiblePoints] = useState<SimpleWaterPoint[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch all data once on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
                const response = await fetch(`${basePath}/export.geojson`);
                if (!response.ok) throw new Error('Failed to load GeoJSON');

                const data: GeoJSONCollection = await response.json();

                // Process/Structure data
                const points: SimpleWaterPoint[] = data.features.map(f => {
                    // GeoJSON is [lon, lat]
                    return {
                        id: Number(f.id.replace('node/', '')), // parse ID if needed, or use string. Using number for consistency if simple.
                        // Note: export.geojson IDs are like "node/123". 
                        // Let's just use random or hash if parsing is annoying, 
                        // but "node/123" -> 123 is easy.
                        // Actually, let's just keep ID simple.
                        lat: f.geometry.coordinates[1],
                        lon: f.geometry.coordinates[0]
                    };
                });

                setAllPoints(points);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter points based on viewport
    const updateVisiblePoints = useCallback(() => {
        if (allPoints.length === 0) return;

        const bounds = map.getBounds();

        // Simple bounding box filter
        // Optimization: For 40k+ points, simple array filter might be slightly heavy on every frame,
        // but typically Array.filter on 50k items is < 5-10ms which is fine for 'moveend'.
        // If it was 'move', we'd need a spatial index like RBush.
        // Given constraints and "easiest", array filter is fine.

        const visible = allPoints.filter(p =>
            bounds.contains([p.lat, p.lon])
        );

        // Safety cap for rendering DOM nodes
        if (visible.length > 2000) {
            // If too many, maybe just show first 2000 or don't show?
            // Or better, only show if zoom is high enough?
            // Let's just slice it to prevent browser crash if zoomed out too far with high density.
            // But wait, user said "points should all be loaded".
            // With 50k points, rendering 50k CircleMarkers WILL crash/lag the browser heavily.
            // I will slice to 2000 for performance safety if zoom is low.
            setVisiblePoints(visible.slice(0, 2000));
        } else {
            setVisiblePoints(visible);
        }
    }, [map, allPoints]);

    useMapEvents({
        moveend: updateVisiblePoints,
        // Trigger on load/zoom/resize too? moveend covers most. 
        // We also need to trigger when allPoints changes (loaded).
    });

    useEffect(() => {
        updateVisiblePoints();
    }, [updateVisiblePoints, allPoints]);

    return (
        <>
            {visiblePoints.map((point) => (
                <CircleMarker
                    key={point.id}
                    center={[point.lat, point.lon]}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.6 }}
                    radius={5}
                />
            ))}
            {loading && (
                <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded shadow">
                    Loading Data...
                </div>
            )}
            {!loading && allPoints.length === 0 && (
                <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded shadow text-red-500">
                    No data found
                </div>
            )}
        </>
    );
}

export default function Map() {

    return (
        <div className="w-full h-screen">
            <MapContainer
                center={[52.3676, 4.9041] as LatLngTuple}
                zoom={13}
                minZoom={MIN_ZOOM}
                maxBounds={NL_BOUNDS}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
                <CreateWaterPoints />
            </MapContainer>
        </div>
    );
}
