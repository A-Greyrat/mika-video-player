export const generateUniqueID = (length: number = 8): string => {
    return Math.random().toString(36).substring(2, 2 + length);
};

export const isMobile = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
