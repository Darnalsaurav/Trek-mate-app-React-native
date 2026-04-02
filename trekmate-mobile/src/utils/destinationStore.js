import { db, auth } from '../config/firebase';
import { TREK_STATUS } from '../config/admin';
import {
    collection,
    addDoc,
    getDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    where,
    doc,
    updateDoc,
    getDocs,
} from 'firebase/firestore';
import {
    createNotification,
    broadcastNotification,
    sendPushToAllUsers,
    sendLocalNotification,
} from './notificationStore';

/**
 * Shared Data Store using Firebase Firestore for persistence.
 * Now includes trek approval workflow.
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

/**
 * Fetch ONLY ACCEPTED destinations for Explore page (public view).
 * Pending and rejected treks are hidden from all users.
 */
export const subscribeToDestinations = (callback) => {
    const q = query(
        collection(db, 'destinations'),
        where('approvalStatus', '==', TREK_STATUS.ACCEPTED)
    );
    return onSnapshot(q, 
        (snapshot) => {
            const firestoreData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
            
            // If firestoreData is empty, it might be due to a missing index or no accepted treks
            // Logging can help identify if it's actually empty
            if (firestoreData.length > 0) {
                console.log(`🗺️ Found ${firestoreData.length} accepted destinations`);
            }
            
            callback([...firestoreData, ...STATIC_DESTINATIONS]);
        },
        (error) => {
            console.error('🔥 subscribeToDestinations Error:', error);
            callback(STATIC_DESTINATIONS); // Fallback to static data
        }
    );
};

/**
 * Fetch ONLY ACCEPTED planned trips for Home screen Upcoming Treks (public view).
 * Only shows accepted treks from ALL users + static suggestions.
 */
export const subscribeToPlannedTrips = (callback) => {
    const q = query(
        collection(db, 'planned_trips'),
        where('approvalStatus', '==', TREK_STATUS.ACCEPTED)
    );
    return onSnapshot(q, 
        (snapshot) => {
            const firestoreData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
            // Merge accepted data at the top, static ones at the bottom
            callback([...firestoreData, ...STATIC_UPCOMING_TRIPS]);
        },
        (error) => {
            console.error('🔥 subscribeToPlannedTrips Error:', error);
            callback(STATIC_UPCOMING_TRIPS); // Fallback to static data
        }
    );
};

/**
 * Fetch STRICTLY current user's personal trips (ALL statuses) for My Trips screen.
 * Users can see their own pending/rejected/accepted treks.
 */
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
    return onSnapshot(q, 
        (snapshot) => {
            const firestoreData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
            callback(firestoreData);
        },
        (error) => {
            console.error('🔥 subscribeToMyTrips Error:', error);
            callback([]);
        }
    );
};

/**
 * Add a trip: Now with default "pending" approval status.
 * Trek will NOT appear publicly until admin approves it.
 */
export const planNewTrek = async (tripData) => {
    const userId = auth.currentUser?.uid;
    const userEmail = auth.currentUser?.email || '';
    const userName = auth.currentUser?.displayName || userEmail.split('@')[0] || 'Unknown';
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
        createdByEmail: userEmail,
        createdByName: userName,
        createdAt: serverTimestamp(),
        // ─── Approval Fields ───
        approvalStatus: TREK_STATUS.PENDING,
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
    };

    try {
        // 1. Add to Public Explore (will be hidden until approved)
        const destRef = await addDoc(collection(db, 'destinations'), { ...trek, isPublic: true });

        // 2. Add to User's Personal Trips (visible to owner with status)
        const tripRef = await addDoc(collection(db, 'planned_trips'), {
            ...trek,
            isPlanned: true,
            linkedDestinationId: destRef.id,
        });

        // 3. Notify the user that their trek is submitted
        await createNotification(userId, {
            title: 'Trek Submitted! 📋',
            message: `Your trek "${trek.name}" has been submitted and is pending admin review.`,
            icon: 'document-text',
            color: '#F59E0B',
            trekName: trek.name,
            type: 'trek_submitted',
        });

        return true;
    } catch (error) {
        console.error('Error saving trip:', error);
        throw error;
    }
};

// ─── Admin Operations ──────────────────────────────────────────────────────

/**
 * Subscribe to ALL pending treks for admin review dashboard.
 */
export const subscribeToPendingTreks = (callback) => {
    // Note: Firestore doesn't support "where field is missing" well.
    // To handle old treks that lack the field, we perform a global fetch 
    // and filter in memory for admin dashboard stability.
    const q = query(collection(db, 'planned_trips'));
    
    return onSnapshot(q, 
        (snapshot) => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(trek => !trek.approvalStatus || trek.approvalStatus === TREK_STATUS.PENDING)
                .sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
            callback(data);
        },
        (error) => {
            console.error('🔥 subscribeToPendingTreks Error:', error);
            callback([]);
        }
    );
};

/**
 * Subscribe to ALL treks (all statuses) for admin — full overview.
 */
export const subscribeToAllTreks = (callback) => {
    const q = query(collection(db, 'planned_trips'));
    return onSnapshot(q, 
        (snapshot) => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
            callback(data);
        },
        (error) => {
            console.error('🔥 subscribeToAllTreks Error:', error);
            callback([]);
        }
    );
};

/**
 * Accept a trek — updates both collections and sends notifications to ALL users.
 */
export const acceptTrek = async (trekId, linkedDestinationId) => {
    const adminId = auth.currentUser?.uid;
    const now = serverTimestamp();

    try {
        console.log(`⏳ Accepting trek: ${trekId}, linkedDest: ${linkedDestinationId}`);
        
        // Get trek data for notification content
        const trekSnap = await getDoc(doc(db, 'planned_trips', trekId));
        if (!trekSnap.exists()) throw new Error('Trek not found');
        
        const trekData = trekSnap.data();
        const trekName = trekData?.name || 'Unknown Trek';
        const trekOwner = trekData?.createdBy;

        // 1. Update planned_trips
        await updateDoc(doc(db, 'planned_trips', trekId), {
            approvalStatus: TREK_STATUS.ACCEPTED,
            rejectionReason: null,
            reviewedAt: now,
            reviewedBy: adminId,
        });

        // 2. Update matching destinations document
        // If linkedDestinationId is missing, try to find it by name as fallback
        let targetDestId = linkedDestinationId;
        if (!targetDestId) {
            console.log('⚠️ Missing linkedDestinationId, searching by name...');
            const destQ = query(collection(db, 'destinations'), where('name', '==', trekName));
            const destSnap = await getDocs(destQ);
            if (!destSnap.empty) {
                targetDestId = destSnap.docs[0].id;
                console.log(`📍 Found matching destination: ${targetDestId}`);
            }
        }

        if (targetDestId) {
            await updateDoc(doc(db, 'destinations', targetDestId), {
                approvalStatus: TREK_STATUS.ACCEPTED,
                rejectionReason: null,
                reviewedAt: now,
                reviewedBy: adminId,
            });
            console.log('✅ Updated destinations collection');
        } else {
            console.log('⚠️ No destination found to update');
        }

        // ─── NOTIFICATIONS ───

        // 1. Notify the trek owner that their trek was accepted
        if (trekOwner) {
            await createNotification(trekOwner, {
                title: 'Trek Approved! 🎉',
                message: `Great news! Your trek "${trekName}" has been approved and is now live for all users to see.`,
                icon: 'checkmark-circle',
                color: '#10B981',
                trekId,
                trekName,
                type: 'trek_accepted',
            });
        }

        // 2. Broadcast to ALL users about the new trek
        await broadcastNotification({
            title: 'New Trek Available! 🏔️',
            message: `"${trekName}" has been added to Explore. Check it out!`,
            icon: 'trail-sign',
            color: '#1C3D3E',
            trekId,
            trekName,
            type: 'trek_approved',
        });

        // 3. Send device push notifications to all users
        await sendPushToAllUsers(
            '🏔️ New Trek Available!',
            `"${trekName}" has been added. Open TrekMate to explore!`,
            { trekId, type: 'trek_approved' }
        );

        return true;
    } catch (error) {
        console.error('Error accepting trek:', error);
        throw error;
    }
};

/**
 * Reject a trek — updates both collections and notifies the trek owner.
 */
export const rejectTrek = async (trekId, linkedDestinationId, reason = '') => {
    const adminId = auth.currentUser?.uid;
    const now = serverTimestamp();

    try {
        // Get trek data for notification
        const trekSnap = await getDoc(doc(db, 'planned_trips', trekId));
        const trekData = trekSnap.data();
        const trekName = trekData?.name || 'Unknown Trek';
        const trekOwner = trekData?.createdBy;

        const finalReason = reason || 'No reason provided';

        // Update planned_trips
        await updateDoc(doc(db, 'planned_trips', trekId), {
            approvalStatus: TREK_STATUS.REJECTED,
            rejectionReason: finalReason,
            reviewedAt: now,
            reviewedBy: adminId,
        });

        // Update matching destinations document
        if (linkedDestinationId) {
            await updateDoc(doc(db, 'destinations', linkedDestinationId), {
                approvalStatus: TREK_STATUS.REJECTED,
                rejectionReason: finalReason,
                reviewedAt: now,
                reviewedBy: adminId,
            });
        }

        // Notify the trek owner about rejection
        if (trekOwner) {
            await createNotification(trekOwner, {
                title: 'Trek Not Approved',
                message: `Your trek "${trekName}" was not approved. Reason: ${finalReason}`,
                icon: 'close-circle',
                color: '#EF4444',
                trekId,
                trekName,
                type: 'trek_rejected',
            });
        }

        return true;
    } catch (error) {
        console.error('Error rejecting trek:', error);
        throw error;
    }
};

// Helper for initial data check
export const getDestinations = () => STATIC_DESTINATIONS;
export const getPlannedTrips = () => STATIC_UPCOMING_TRIPS;
