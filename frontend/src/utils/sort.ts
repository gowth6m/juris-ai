interface TimestampedItem {
  Timestamp: string; // ISO 8601 format date string
}

export function sortByTimestamp<T extends TimestampedItem>(items: T[]): T[] {
  return items?.sort((a, b) => {
    const dateA = new Date(a.Timestamp).getTime();
    const dateB = new Date(b.Timestamp).getTime();

    return dateA - dateB;
  });
}
