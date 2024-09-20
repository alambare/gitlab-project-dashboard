export const TIMEUNIT_HOURS = 'hours' as const;
export const TIMEUNIT_DAYS = 'days' as const;

export const HOURS_PER_DAY = Number(import.meta.env.VITE_HOURS_PER_DAY) || 7;
export const SECONDS_PER_DAY = HOURS_PER_DAY * 3600;

export const EPIC_LABEL_NAME = 'epic';

export const GITLAB_URL = import.meta.env.VITE_GITLAB_URL;
export const GITLAB_ACCESS_TOKEN = import.meta.env.VITE_GITLAB_ACCESS_TOKEN;

export const GITLAB_GROUP_NAME = 'dedl';

export const GITLAB_GRAPHQL_URL = GITLAB_URL + '/api/graphql'
export const GITLAB_API = GITLAB_URL + '/api/v4'
