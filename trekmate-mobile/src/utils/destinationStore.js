import { db, auth } from '../config/firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    where
} from 'firebase/firestore';

/**
 * Shared Data Store using Firebase Firestore for persistence.
 */

// ─── Master Trek Data Library ──────────────────────────────────────────────
const TREK_MASTER_LIBRARY = {
    'ANNAPURNA BASE CAMP': {
        description: 'A spectacular journey to the heart of the Annapurna range.',
        distance: '67km',
        duration: '7-11 days',
        elevation: '4,130m',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200'
    },
    'EVEREST BASE CAMP': {
        description: 'The world\'s most famous trek. Stand at the foot of Mount Everest.',
        distance: '130km',
        duration: '12-14 days',
        elevation: '5,364m',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200'
    },
    'MARDI HIMAL': {
        description: 'A close-up view of Mount Machhapuchhre (Fishtail).',
        distance: '42km',
        duration: '5-6 days',
        elevation: '4,500m',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
    }
};

const findMasterData = (name = '') => {
    const cleanName = name.toUpperCase().trim();
    if (TREK_MASTER_LIBRARY[cleanName]) return TREK_MASTER_LIBRARY[cleanName];
    for (const key in TREK_MASTER_LIBRARY) {
        if (key.includes(cleanName) || cleanName.includes(key)) return TREK_MASTER_LIBRARY[key];
    }
    return {
        description: `Explore the hidden trails of ${name}.`,
        distance: 'TBD',
        duration: 'Flexible',
        elevation: '3,500m+',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
    };
};

// ─── Static Inbuilt Destinations ──────────────────────────────────────────
const STATIC_DESTINATIONS = [
    {
        id: 's1',
        name: 'TILICHO LAKE',
        location: 'Manang District',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        ...TREK_MASTER_LIBRARY['TILICHO LAKE']
    },
    {
        id: 's2',
        name: 'EVEREST BASE CAMP',
        location: 'Solukhumbu District',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200',
        ...TREK_MASTER_LIBRARY['EVEREST BASE CAMP']
    },
    {
        id: 's3',
        name: 'ANNAPURNA BASE CAMP',
        location: 'Kaski District',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200',
        ...TREK_MASTER_LIBRARY['ANNAPURNA BASE CAMP']
    },
    {
        id: 's4',
        name: 'MARDI HIMAL',
        location: 'Kaski District',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        ...TREK_MASTER_LIBRARY['MARDI HIMAL']
    }
];

// ─── Static Inbuilt Upcoming Treks ────────────────────────────────────────
const STATIC_UPCOMING_TRIPS = [
    {
        id: 'u1',
        name: 'KHUMAI DADA',
        location: 'Pokhara District',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200',
        description: 'Khumai Dada is a hidden gem in the Annapurna region, offering stunning views of Machhapuchhre.',
        startDate: '12 March',
        endDate: '15 March',
        isPlanned: true,
    },
    {
        id: 'u2',
        name: 'LANGTANG VALLEY',
        location: 'Rasuwa District',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        startDate: '20 April',
        endDate: '28 April',
        isPlanned: true,
        ...TREK_MASTER_LIBRARY['LANGTANG VALLEY']
    },
    {
        id: 'u3',
        name: 'ANNAPURNA BASE CAMP',
        location: 'Kaski District',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200',
        startDate: '05 May',
        endDate: '15 May',
        isPlanned: true,
        ...TREK_MASTER_LIBRARY['ANNAPURNA BASE CAMP']
    },
    {
        id: 'u4',
        name: 'MANASLU CIRCUIT',
        location: 'Gorkha District',
        image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200',
        startDate: '10 June',
        endDate: '25 June',
        isPlanned: true,
        ...TREK_MASTER_LIBRARY['MANASLU CIRCUIT']
    }
];

// ─── Firestore Operations ──────────────────────────────────────────────────

// Fetch ALL destinations for Explore page
export const subscribeToDestinations = (callback) => {
    const q = query(collection(db, 'destinations'));
    return onSnapshot(q, (snapshot) => {
        const firestoreData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
        callback([...firestoreData, ...STATIC_DESTINATIONS]);
    });
};

// Fetch ONLY current user's planned trips for Home screen (includes suggestions)
export const subscribeToPlannedTrips = (callback) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        callback(STATIC_UPCOMING_TRIPS);
        return () => { };
    }

    const q = query(
        collection(db, 'planned_trips'),
        where('createdBy', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
        const firestoreData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
        // Merge user's data at the top, static ones at the bottom
        callback([...firestoreData, ...STATIC_UPCOMING_TRIPS]);
    });
};

// Fetch STRICTLY current user's personal trips (no suggestions) for My Trips screen
export const subscribeToMyTrips = (callback) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        callback([]);
        return () => { };
    }

    const q = query(
        collection(db, 'planned_trips'),
        where('createdBy', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
        const firestoreData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
        callback(firestoreData);
    });
};

// Add a trip: Visible to everyone (destinations) AND stored for user (planned_trips)
export const planNewTrek = async (tripData) => {
    const userId = auth.currentUser?.uid;
    const masterInfo = findMasterData(tripData.name);

    const trek = {
        name: tripData.name.toUpperCase(),
        location: tripData.location || 'Nepal',
        image: tripData.image || masterInfo.image,
        description: masterInfo.description,
        distance: masterInfo.distance,
        duration: masterInfo.duration,
        elevation: masterInfo.elevation,
        startDate: tripData.startDate || null,
        endDate: tripData.endDate || null,
        createdBy: userId,
        createdAt: serverTimestamp(),
    };

    try {
        // 1. Add to Public Explore (Visible to all)
        await addDoc(collection(db, 'destinations'), { ...trek, isPublic: true });

        // 2. Add to User's Personal Trips
        await addDoc(collection(db, 'planned_trips'), { ...trek, isPlanned: true });

        return true;
    } catch (error) {
        console.error('Error saving trip:', error);
        throw error;
    }
};

// Helper for initial data check
export const getDestinations = () => STATIC_DESTINATIONS;
export const getPlannedTrips = () => STATIC_UPCOMING_TRIPS;
