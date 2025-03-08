export type EventDetails = {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end?: {
    dateTime: string;
    timeZone?: string;
  };
};
