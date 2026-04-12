import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Service to handle trekking trail retrieval from OpenStreetMap (Overpass API)
 * and manage GPX-like data structures.
 */
export const TrailService = {
    /**
     * Fetches trail data for a destination name.
     * First checks Firebase, then fallback to Overpass API.
     */
    async getRouteForLocation(locationName, centerCoords) {
        const trailId = locationName.replace(/\s+/g, '_').toLowerCase();
        
        try {
            // 1. Check Cache (Firestore) - Handle permission errors gracefully
            try {
                const cachedTrail = await getDoc(doc(db, 'trails', trailId));
                if (cachedTrail.exists()) {
                    console.log('Trail loaded from cache');
                    return cachedTrail.data();
                }
            } catch (cacheError) {
                console.warn('Firestore Cache Read Error (likely permissions):', cacheError.message);
                // Continue to fetch from Overpass if cache fails
            }

            // 2. Fetch from Overpass API if no cache or cache failed
            const query = `
                [out:json][timeout:25];
                (
                  way["hiking"="yes"](around:5000, ${centerCoords.latitude}, ${centerCoords.longitude});
                  way["route"="hiking"](around:5000, ${centerCoords.latitude}, ${centerCoords.longitude});
                  way["highway"="footway"](around:5000, ${centerCoords.latitude}, ${centerCoords.longitude});
                  way["highway"="path"](around:5000, ${centerCoords.latitude}, ${centerCoords.longitude});
                );
                out body;
                >;
                out skel qt;
            `;

            const response = await fetch(OVERPASS_URL, {
                method: 'POST',
                body: `data=${encodeURIComponent(query)}`,
            });

            const contentType = response.headers.get("content-type");
            if (!response.ok || !contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.warn('Overpass API returned non-JSON response:', text.substring(0, 100));
                return null;
            }

            const data = await response.json();

            if (!data.elements || data.elements.length === 0) {
                console.log('No trail elements found');
                return null;
            }

            // 3. Process nodes into coordinate paths
            const nodes = {};
            data.elements.filter(e => e.type === 'node').forEach(n => {
                nodes[n.id] = { latitude: n.lat, longitude: n.lon };
            });

            const coordinates = [];
            data.elements.filter(e => e.type === 'way').forEach(w => {
                const segment = w.nodes.map(nodeId => nodes[nodeId]).filter(n => !!n);
                if (segment.length > 0) {
                    coordinates.push(...segment);
                }
            });

            const trailData = {
                id: trailId,
                name: locationName,
                coordinates: coordinates,
                distance: this.calculateDistance(coordinates),
                updatedAt: new Date().toISOString()
            };

            // 4. Cache to Firestore - Handle permission errors gracefully
            try {
                await setDoc(doc(db, 'trails', trailId), trailData);
            } catch (saveError) {
                console.warn('Firestore Cache Write Error (likely permissions):', saveError.message);
                // We still have the trailData in memory, so return it
            }

            return trailData;
        } catch (error) {
            console.error('TrailService Error:', error);
            return null;
        }
    },

    /**
     * Simple Haversine distance calculation for trail length
     */
    calculateDistance(coords) {
        if (coords.length < 2) return 0;
        let total = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            total += this.getDistanceFromLatLonInKm(
                coords[i].latitude, coords[i].longitude,
                coords[i+1].latitude, coords[i+1].longitude
            );
        }
        return total.toFixed(2);
    },

    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
