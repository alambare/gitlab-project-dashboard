import { writable } from 'svelte/store';

// Create stores for selected member, selected month-year, sort field, and sort order
export const selectedMemberStore = writable<string>('');
export const selectedMonthYearStore = writable<string>('');
export const sortFieldStore = writable<'member' | 'task'>('member');
export const sortAscendingStore = writable<boolean>(true);
