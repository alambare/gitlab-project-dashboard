export const TIMEUNIT_HOURS = 'hours' as const;
export const TIMEUNIT_DAYS = 'days' as const;

// TODO: move to a settings page.
export const HOURS_PER_DAY = Number(import.meta.env.VITE_HOURS_PER_DAY) || 7;
export const SECONDS_PER_DAY = HOURS_PER_DAY * 3600;

export const DEFAULT_GITLAB_URL = "https://gitlab.com"

// TODO: move to a settings page.
export const EPIC_LABEL_NAME = 'epic';

