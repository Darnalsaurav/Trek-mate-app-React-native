/**
 * Stores shared data locally for demo purposes.
 * In a real app, this would be Redux, Context API, or Database fetch.
 */

// Initial destinations data
let destinationsData = [
    {
        id: 1,
        name: 'TILICHO LAKE',
        location: 'Solukhumbu district',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: 'Tilicho Lake is one of the highest lakes in the world, situated at an altitude of 4,919 meters in the Annapurna range of the Himalayas. This stunning glacial lake offers breathtaking views and is a popular side trip for trekkers on the Annapurna Circuit.'
    },
    {
        id: 2,
        name: 'ANNAPURNA CIRCUIT',
        location: 'Manang district',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: 'The Annapurna Circuit is one of the most popular long-distance treks in Nepal. This epic journey takes you around the Annapurna massif, crossing the Thorong La pass at 5,416m and experiencing diverse landscapes from subtropical forests to high-altitude deserts.'
    },
    {
        id: 3,
        name: 'EVEREST BASE CAMP',
        location: 'Solukhumbu district',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: 'The Everest Base Camp (EBC) Trek is a classic high-altitude trek in Nepal that takes you into the heart of the Himalayas to the base of the world\'s highest peak, Mount Everest (8,848 m). Experience Sherpa culture, stunning mountain views, and the thrill of standing at the foot of Everest.'
    }
];

// subscribers to notify when data changes
const listeners = [];

export const getDestinations = () => {
    return destinationsData;
};

export const addDestination = (destination) => {
    // Add new destination to beginning of list
    const newDest = {
        id: Date.now(), // Generate unique ID
        name: destination.name,
        location: destination.location || 'Custom Trek', // Default location if missing
        image: destination.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Default image
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
        description: destination.description || 'An exciting trek adventure awaits!'
    };

    destinationsData = [newDest, ...destinationsData];

    // Notify listeners
    listeners.forEach(listener => listener(destinationsData));

    return newDest;
};

export const subscribeToDestinations = (listener) => {
    listeners.push(listener);
    // Return unsubscribe function
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
};
