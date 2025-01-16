export function isOlderThanOneDay(date: Date) {
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
  const timeDifference = new Date().getTime() - date.getTime();

  return timeDifference > twentyFourHoursInMs;
}
