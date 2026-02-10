/**
 * Generates a consistent Chat ID for two users regardless of who initiates the chat.
 * sort the UIDs alphabetically to ensure userA + userB always = chatID(userA, userB) = chatID(userB, userA)
 */
export const getChatId = (uid1, uid2) => {
    if (!uid1 || !uid2) return null;
    return [uid1, uid2].sort().join('_');
};
