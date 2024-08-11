export const convertTimeInSecondsToHumanReadableFormat = (time: number): string => {
    return time <= 60 ? '1 minute' : `${Math.ceil(time / 60)} minutes`;
  };
  