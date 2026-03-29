// core/time.ts

export const parseTimestamp = (input?: number | string) => {
  let date: Date;
  
  if (!input) {
    date = new Date();
  } else if (typeof input === 'number') {
    // Determine if seconds or milliseconds
    date = new Date(input > 1e12 ? input : input * 1000);
  } else {
    const parsed = Number(input);
    if (!isNaN(parsed)) {
      date = new Date(parsed > 1e12 ? parsed : parsed * 1000);
    } else {
      date = new Date(input);
    }
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date/timestamp");
  }

  return {
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    utc: date.toUTCString(),
    iso: date.toISOString(),
  };
};
