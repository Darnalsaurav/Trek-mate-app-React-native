/**
 * Stores shared data locally for demo purposes.
 * In a real app, this would be Redux, Context API, or Database fetch.
 */

// Initial destinations data (Explore page)
let destinationsData = [
    {
        id: 1,
        name: 'TILICHO LAKE',
        location: 'Manang district',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: 'Tilicho Lake is one of the highest lakes in the world, situated at an altitude of 4,919 meters in the Annapurna range of the Himalayas. This stunning glacial lake offers breathtaking views and is a popular side trip for trekkers on the Annapurna Circuit.',
        distance: '15km',
        duration: '14hrs',
        elevation: '4919m'
    },
    {
        id: 2,
        name: 'ANNAPURNA CIRCUIT',
        location: 'Manang district',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=80',
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: 'The Annapurna Circuit is one of the most popular long-distance treks in Nepal. This epic journey takes you around the Annapurna massif, crossing the Thorong La pass at 5,411m and experiencing diverse landscapes from subtropical forests to high-altitude deserts.',
        distance: '160-230km',
        duration: '15-21 days',
        elevation: '5411m'
    },
    {
        id: 3,
        name: 'EVEREST BASE CAMP',
        location: 'Solukhumbu district',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: 'The Everest Base Camp (EBC) Trek is a classic high-altitude trek in Nepal that takes you into the heart of the Himalayas to the base of the world\'s highest peak, Mount Everest (8,848 m). Experience Sherpa culture, stunning mountain views, and the thrill of standing at the foot of Everest.',
        distance: '130km',
        duration: '12-14 days',
        elevation: '5364m'
    }
];

// Planned trips data (shown in Upcoming Treks on Home + Explore)
let plannedTripsData = [];

// Listeners
const destinationListeners = [];
const plannedTripListeners = [];

// ─── Destinations (Explore) ──────────────────────────────────────────────────
export const getDestinations = () => destinationsData;

export const addDestination = (destination) => {
    const newDest = {
        id: Date.now(),
        name: destination.name,
        location: destination.location || 'Custom Trek',
        image: destination.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: destination.description || 'An exciting trek adventure awaits!',
        startDate: destination.startDate || null,
        endDate: destination.endDate || null,
    };
    destinationsData = [newDest, ...destinationsData];
    destinationListeners.forEach(l => l(destinationsData));
    return newDest;
};

export const subscribeToDestinations = (listener) => {
    destinationListeners.push(listener);
    return () => {
        const i = destinationListeners.indexOf(listener);
        if (i > -1) destinationListeners.splice(i, 1);
    };
};

// ─── Planned Trips (Upcoming Treks) ─────────────────────────────────────────
export const getPlannedTrips = () => plannedTripsData;

export const addPlannedTrip = (trip) => {
    const newTrip = {
        id: Date.now(),
        name: trip.name,
        location: trip.location || 'Nepal',
        image: trip.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        description: trip.description || 'A planned trek adventure!',
        startDate: trip.startDate || null,
        endDate: trip.endDate || null,
        isPlanned: true,
    };
    plannedTripsData = [newTrip, ...plannedTripsData];
    plannedTripListeners.forEach(l => l(plannedTripsData));
    return newTrip;
};

export const subscribeToPlannedTrips = (listener) => {
    plannedTripListeners.push(listener);
    return () => {
        const i = plannedTripListeners.indexOf(listener);
        if (i > -1) plannedTripListeners.splice(i, 1);
    };
};
