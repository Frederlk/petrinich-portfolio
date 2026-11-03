export const ROUTES = {
  CV: "/cv",
  HOME: "/",
  STACK: "/stack",
  WORK: "/work",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
