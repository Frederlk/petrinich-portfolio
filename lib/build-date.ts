// The deploy date, evaluated once when the module loads during the build. Used for ProfilePage `dateModified` and sitemap `lastModified`.
export const buildDate = new Date().toISOString().slice(0, 10);
