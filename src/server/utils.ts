export const  addFrequencyToDate = (date: Date, frequency: string): Date => {
  const newDate = new Date(date);

  switch (frequency) {
    case 'daily':
      newDate.setDate(newDate.getDate() + 1);
      break;
    case 'weekly':
      newDate.setDate(newDate.getDate() + 7);
      break;
    case 'biweekly':
      newDate.setDate(newDate.getDate() + 14);
      break;
    case 'monthly':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'quarterly':
      newDate.setMonth(newDate.getMonth() + 3);
      break;
    case 'yearly':
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }

  return newDate;
}