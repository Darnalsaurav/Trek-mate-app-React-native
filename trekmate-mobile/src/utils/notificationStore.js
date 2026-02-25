import React from 'react';

let unreadCount = 0;
let listeners = [];

export const getUnreadCount = () => unreadCount;

export const setUnreadCount = (count) => {
    unreadCount = count;
    listeners.forEach(listener => listener(unreadCount));
};

export const subscribeToNotifications = (listener) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};
