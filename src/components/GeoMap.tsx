import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';
import {useMap, useMapEvent} from "react-leaflet";

// Fix for default marker icon issue in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapModeHandler: React.FC<{ isAddMarkerMode: boolean }> = ({ isAddMarkerMode }) => {
    const map = useMap();

    React.useEffect(() => {
        if (isAddMarkerMode) {
            map.dragging.disable();
        } else {
            map.dragging.enable();
        }
    }, [isAddMarkerMode, map]);

    return null;
};

const GeoMap: React.FC = () => {
    const [markers, setMarkers] = useState<{ position: [number, number]; name: string }[]>([
        { position: [46.772397, 23.603139], name: 'Dorobantilor' },
        { position: [46.770578, 23.597259], name: 'Teatrul National Cluj-Napoca' },
        { position: [46.752730, 23.531464], name: 'Vivo Mall Cluj-Napoca' },
    ]);
    const [editingMarker, setEditingMarker] = useState<number | null>(null);
    const [editedName, setEditedName] = useState<string>('');
    const [editedPosition, setEditedPosition] = useState<[number, number] | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [isAddMarkerMode, setIsAddMarkerMode] = useState<boolean>(false);
    const [newMarkerPosition, setNewMarkerPosition] = useState<[number, number] | null>(null);
    const [newMarkerName, setNewMarkerName] = useState<string>('');


    const MapClickHandler: React.FC = () => {
        useMapEvent('click', (e) => {
            if (isAddMarkerMode) {
                setNewMarkerPosition([e.latlng.lat, e.latlng.lng]);
            }
        });
        return null;
    };


    // Add a new marker
    const addMarker = () => {
        if (newMarkerPosition && newMarkerName.trim()) {
            setMarkers([...markers, { position: newMarkerPosition, name: newMarkerName }]);
            setNewMarkerPosition(null);
            setNewMarkerName('');
            setIsAddMarkerMode(false);
        }
    };

    // Load markers from localStorage on component mount
    useEffect(() => {
        const savedMarkers = localStorage.getItem('markers');
        if (savedMarkers) {
            setMarkers(JSON.parse(savedMarkers));
        }
    }, []);

    // Save markers to localStorage
    const saveMarkers = () => {
        localStorage.setItem('markers', JSON.stringify(markers));
        alert('Markers saved successfully!');
    };

    // Start editing a marker
    const startEditing = (index: number) => {
        setEditingMarker(index);
        setEditedName(markers[index].name);
        setEditedPosition(markers[index].position);
    };

    // Save the edited marker
    const saveEditedMarker = () => {
        if (editingMarker !== null && editedPosition) {
            const updatedMarkers = [...markers];
            updatedMarkers[editingMarker] = {
                name: editedName,
                position: editedPosition,
            };
            setMarkers(updatedMarkers);
            setEditingMarker(null);
            setEditedName('');
            setEditedPosition(null);
        }
    };

    // Function to delete a marker
    const deleteMarker = (index: number) => {
        const updatedMarkers = markers.filter((_, i) => i !== index);
        setMarkers(updatedMarkers);
    };

    // Filter markers based on the search query
    const filteredMarkers = markers.filter((marker) =>
        marker.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Search markers by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '5px', width: '300px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={saveMarkers}>Save Markers</button>
            </div>
            <button onClick={() => setIsAddMarkerMode(!isAddMarkerMode)}>
                {isAddMarkerMode ? 'Switch to Move Mode' : 'Switch to Add Marker Mode'}
            </button>
            {isAddMarkerMode && (
                <div style={{ marginBottom: '10px' }}>
                    {newMarkerPosition ? (
                        <p>New marker selected. Fill in the popup form to add.</p>
                    ) : (
                        <p style={{color: 'black'}}>Click on the map to select a position for the new marker.</p>
                    )}
                </div>
            )}
            <MapContainer
                center={[46.772397, 23.603139]}
                zoom={13}
                style={{ height: '800px', width: '1400px' }}
            >
                <MapClickHandler/>
                // Disable dragging in add marker mode
                <MapModeHandler isAddMarkerMode={isAddMarkerMode} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />


                <MarkerClusterGroup>
                    {filteredMarkers.map((marker, index) => (
                        <Marker key={index} position={marker.position}>
                            <Popup>
                                {editingMarker === index ? (
                                    <div>
                                        <label>
                                            Name:
                                            <input
                                                type="text"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Latitude:
                                            <input
                                                type="number"
                                                value={editedPosition ? editedPosition[0] : ''}
                                                onChange={(e) =>
                                                    setEditedPosition([
                                                        parseFloat(e.target.value),
                                                        editedPosition ? editedPosition[1] : 0,
                                                    ])
                                                }
                                            />
                                        </label>
                                        <label>
                                            Longitude:
                                            <input
                                                type="number"
                                                value={editedPosition ? editedPosition[1] : ''}
                                                onChange={(e) =>
                                                    setEditedPosition([
                                                        editedPosition ? editedPosition[0] : 0,
                                                        parseFloat(e.target.value),
                                                    ])
                                                }
                                            />
                                        </label>
                                        <button onClick={saveEditedMarker}>Save</button>
                                    </div>
                                ) : (
                                    <div>
                                        <p>{marker.name}</p>
                                        <p>
                                            {marker.position[0].toFixed(6)}, {marker.position[1].toFixed(6)}
                                        </p>
                                        <button onClick={() => startEditing(index)}>Edit</button>
                                        <button onClick={() => deleteMarker(index)}>Delete</button>
                                    </div>
                                )}
                            </Popup>

                        </Marker>
                    ))}
                </MarkerClusterGroup>
                {isAddMarkerMode && newMarkerPosition && (
                    <Marker position={newMarkerPosition}>
                        <Popup>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter marker name..."
                                    value={newMarkerName}
                                    onChange={(e) => setNewMarkerName(e.target.value)}
                                    style={{ padding: '5px', width: '200px' }}
                                />
                                <button onClick={addMarker} style={{ marginLeft: '10px' }}>
                                    Add Marker
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default GeoMap;