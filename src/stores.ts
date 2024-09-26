import { writable } from 'svelte/store';
import { DEFAULT_GITLAB_URL } from './constant';
import type { Container } from '$lib/types';

// Load settings from localStorage only if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Create stores for selected member, selected month-year, sort field, and sort order
export const selectedMemberStore = writable<string>('');
export const selectedMonthYearStore = writable<string>('');
export const sortFieldStore = writable<'member' | 'task'>('member');
export const sortAscendingStore = writable<boolean>(true);

const savedGitlabUrl = isBrowser ? localStorage.getItem('gitlab_url') || DEFAULT_GITLAB_URL : '';
const savedAccessToken = isBrowser ? localStorage.getItem('gitlab_access_token') || '' : '';

export const gitlabUrl = writable(savedGitlabUrl);
export const accessToken = writable(savedAccessToken);

export const gitlabGraphQLUrl = writable(`${savedGitlabUrl}/api/graphql`);
export const gitlabApiUrl = writable(`${savedGitlabUrl}/api/v4`);

export function updateGitLabSettings(url: string, token: string) {
    gitlabUrl.set(url);
    accessToken.set(token);
    gitlabGraphQLUrl.set(`${url}/api/graphql`);
    gitlabApiUrl.set(`${url}/api/v4`);

    localStorage.setItem('gitlab_url', url);
    localStorage.setItem('gitlab_access_token', token);
}

const savedCurrentContainer = isBrowser
  ? localStorage.getItem('current_container') 
    ? JSON.parse(localStorage.getItem('current_container') as string) as Container
    : null
  : null;

export const currentContainerStore = writable<Container | null>(savedCurrentContainer);

export function updateCurrentContainer(container: Container | null) {
    currentContainerStore.set(container);

    if (container) {
        localStorage.setItem('current_container', JSON.stringify(container));
    } else {
        localStorage.removeItem('current_container');
    }
}
