export const TIMEUNIT_HOURS = 'hours' as const;
export const TIMEUNIT_DAYS = 'days' as const;

// TODO: move to a settings page.
export const HOURS_PER_DAY = Number(import.meta.env.VITE_HOURS_PER_DAY) || 7;
export const SECONDS_PER_DAY = HOURS_PER_DAY * 3600;

// TODO: move to a settings page.
export const EPIC_LABEL_NAME = 'epic';

// TODO: move to a settings page.
export const GITLAB_URL = import.meta.env.VITE_GITLAB_URL;
export const GITLAB_ACCESS_TOKEN = import.meta.env.VITE_GITLAB_ACCESS_TOKEN;

// TODO: move to a filter in the header ??
export const GITLAB_GROUP_NAME = 'dedl';

export const GITLAB_GRAPHQL_URL = GITLAB_URL + '/api/graphql'
export const GITLAB_API = GITLAB_URL + '/api/v4'
