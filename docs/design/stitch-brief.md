# Бриф для Stitch: портфолио Sergey Petrinich

Тикет: `private/history/cv-site-rebuild/issues/10-stitch-directions.md`. Основа: исследования `private/job-search/portfolio-site-practices-2026.md`, `motion-portfolio-2026.md`, `design-tooling-2026.md`, структура сайта из тикета 09, твои регуляторы от 2026-10-24. Бриф прошёл одно ревью (12 замечаний, все учтены).

Инструкции здесь на русском. Всё, что нужно вставлять в Stitch, — на английском, в блоках с пометкой **Промпт**: копируй как есть.

## Что решено тобой

- Только тёмная тема. Контент только на английском.
- Регуляторы: Variance 7, Motion 6, Density 5 (архив и страница стека плотнее, около 7).
- Первый экран: в центре типографика и цифры (имя, заголовок, строка реальных фактов); фото маленькое или только на About.
- Аудитория: нанимающие менеджеры и рекрутеры, которые пролистывают сайт на позднем этапе, и ИИ-агенты, читающие HTML. Сайт должен считываться за 20 секунд.
- Референсы: alba.swiss (темп и сдержанность анимаций), brittanychiang.com/archive (короткая главная, полная таблица за ней), zachleat.com/projects (панель фильтров на большом каталоге), rauno.me (тихая, точная типографика).

## Чего не должно быть ни в одном направлении

Фиолетовые градиенты, неоновый или циан на тёмном, кремовый фон, градиентный текст, «стекло», свечение, размытые пятна, сетка на фоне, маленькие подписи или чипы над заголовками, нумерация секций, иконки над заголовками, три одинаковые карточки в ряд, цветная полоса сбоку карточки, карточки внутри карточек, кнопки-таблетки, шкалы навыков и проценты, заголовок-предложение на весь экран, нарисованные скриншоты интерфейса, выдуманные цифры, полосы логотипов, отзывы, стоковые фото, подсказки «скролльте вниз», шрифты Inter, Roboto, Geist, Space Grotesk, Fraunces, Plus Jakarta Sans. Каждый промпт дизайн-системы ниже заканчивается одной и той же фразой «Avoid: …», чтобы Stitch это видел.

## Как работать в Stitch

1. Для каждого направления (A, B, C) создай в Stitch новый проект.
2. Вставь **промпт дизайн-системы** этого направления.
3. Вставь **Home, шаг 1** — первый экран. Если результат устраивает, в том же проекте отправь **шаг 2** (список проектов), затем **шаг 3** (опыт и футер). Если есть модель Pro или Experimental — выбери её.
4. Лучший вариант главной выгрузи (PNG и DESIGN.md) в папку `docs/design/stitch/A`, `B` или `C`.
5. Правь короткими дополнительными сообщениями, по одной-две правки за раз, называя элемент: например, `make the facts numbers larger`. Делай скриншот после каждого удачного шага.
6. Остальные страницы генерируем после выбора направления (тикет 11): промпты для них в конце файла, перед ними импортируй DESIGN.md выбранного направления.

## Направление A: Index (нейтральный чёрный, vermilion)

**Промпт дизайн-системы:**

> A dark, exact, editorial design system for a senior developer's portfolio. Mood: precise, calm, confident, Swiss. Background a neutral near-black (#101010), surfaces one step lighter, text a soft white, muted text neutral grey. One sharp accent: vermilion (#FF4F1A), used sparingly for links, the active filter and key numbers. Typography: Archivo for everything, its expanded width for large display headings and normal width for body; JetBrains Mono only for years, counts and technology names. Hairline 1px rules instead of cards. Square corners. Large numerals. Avoid: gradients, glow, shadows, glassmorphism, rounded pill buttons, small labels or chips above headings, numbered section labels, icons above headings, nested cards, logo strips, testimonials, stock photos, scroll cues, drawn app screenshots, invented numbers, em-dashes and italic words in headlines, grid or line patterns in backgrounds.

**Промпт Home, шаг 1 (первый экран):**

> Home page for Sergey Petrinich, Lead Full-Stack Developer. Top navigation: name on the left; Work, Stack, About, CV on the right; a solid accent button 'Hire me'. Hero set like the first page of an index: the name in very large expanded display type across most of the width, the headline 'I build web products end to end: API, admin, interface and the infrastructure behind them.' below it in a narrower column, offset to the right. A facts row of three large numbers with small labels under hairline rules: 64 projects, 179 technologies, 6+ years. Two actions: 'Start a project' (outlined) and 'Book a call' (text link).

**Промпт Home, шаг 2 (избранные проекты):**

> Add a 'Selected work' section as a ledger: six full-width rows separated by hairlines, each with year, name, one-line description, role and three technology names in mono: NoaSpot (2026, place-discovery API and admin with semantic search on Gemini, sole), OhBirdie (2026, SaaS for mahjong tournaments, lead), Swiftbeauty (2026, beauty marketplace moved from PHP to Next.js and Sanity, team), Noble Code (2026, jewelry blueprint licensing site, sole), World of Walker (2025, music artist fandom platform, team), BASC (2025, aviation rules portal, lead). A link 'All 64 projects' under the rows.

**Промпт Home, шаг 3 (опыт и футер)** — общий для всех трёх направлений:

> Add a short experience block: UX MIND, Lead Full-Stack Developer, 2024 to present; Ceviant and Tapston, Front-End Developer, 2022 to 2023. Footer: 'Hire me' and 'Start a project' buttons, email, Telegram, GitHub, LinkedIn, 'Download CV (PDF)'.

## Направление B: Modules (холодный чернильный, лайм)

**Промпт дизайн-системы:**

> A dark, engineered, modular design system for a full-stack developer's portfolio. Mood: rigorous, quiet, modern, exact. Background a cool blue-black ink (#0C1015), surfaces slightly lighter, text a cool off-white, muted text slate grey. One accent: a soft lime (#C9F06B) for links, active states and key numbers, flat, never glowing. Typography: Familjen Grotesk for headings and UI; Martian Mono only for years, counts and technology names. Content sits in flat, single-level modules with a 1px outline and square corners, on an 8px spacing scale. Avoid: gradients, glow, shadows, glassmorphism, rounded pill buttons, small labels or chips above headings, numbered section labels, icons above headings, nested cards, logo strips, testimonials, stock photos, scroll cues, drawn app screenshots, invented numbers, em-dashes and italic words in headlines, grid or line patterns in backgrounds.

**Промпт Home, шаг 1 (первый экран):**

> Home page for Sergey Petrinich, Lead Full-Stack Developer. Top navigation: name on the left; Work, Stack, About, CV on the right; a solid accent button 'Hire me'. Hero as an asymmetric arrangement of modules: one large module holding the name and the headline 'I build web products end to end: API, admin, interface and the infrastructure behind them.', and beside it a narrow stack of three small modules, each with one large number and a label: 64 projects, 179 technologies, 6+ years. Two actions under the large module: 'Start a project' (outlined) and 'Book a call' (text link).

**Промпт Home, шаг 2 (избранные проекты):**

> Add 'Selected work' as a two-column mosaic of modules of different heights, one module per project, each with name, year, one-line description, role and three technology names in mono, and an empty image slot with a neutral placeholder frame: NoaSpot (2026, place-discovery API and admin with semantic search on Gemini, sole), OhBirdie (2026, SaaS for mahjong tournaments, lead), Swiftbeauty (2026, beauty marketplace moved from PHP to Next.js and Sanity, team), Noble Code (2026, jewelry blueprint licensing site, sole), World of Walker (2025, music artist fandom platform, team), BASC (2025, aviation rules portal, lead). A link 'All 64 projects'.

**Home, шаг 3:** тот же промпт, что в направлении A.

## Направление C: Studio (тёплый коричнево-чёрный, янтарь)

**Промпт дизайн-системы:**

> A dark, warm, editorial design system for a developer's portfolio that reads like a well-set magazine. Mood: warm, assured, human, unhurried. Background a deep brown-black (#17130E), surfaces a little lighter, text warm ivory, muted text warm taupe. One accent: amber (#F2A13A) for links, the active filter and highlighted numbers. Typography: Newsreader upright (never italic) for large display headings and numerals, Hanken Grotesk for body and UI, IBM Plex Mono only for years and technology names. Thin rules between entries. Square corners. Avoid: gradients, glow, shadows, glassmorphism, rounded pill buttons, small labels or chips above headings, numbered section labels, icons above headings, nested cards, logo strips, testimonials, stock photos, scroll cues, drawn app screenshots, invented numbers, em-dashes and italic words in headlines, grid or line patterns in backgrounds.

**Промпт Home, шаг 1 (первый экран):**

> Home page for Sergey Petrinich, Lead Full-Stack Developer. Top navigation: name on the left; Work, Stack, About, CV on the right; a solid accent button 'Hire me'. A two-column magazine layout: a narrow left column holding the three facts as large serif numerals with small labels (64 projects, 179 technologies, 6+ years), a wide right column holding the name in large serif display and the headline 'I build web products end to end: API, admin, interface and the infrastructure behind them.' Two actions in the right column: 'Start a project' (outlined) and 'Book a call' (text link).

**Промпт Home, шаг 2 (избранные проекты):**

> Add 'Selected work' in the same two columns: the year in the left column, and in the right column the project name in serif, a one-line description, role and three technology names in mono, separated by thin rules: NoaSpot (2026, place-discovery API and admin with semantic search on Gemini, sole), OhBirdie (2026, SaaS for mahjong tournaments, lead), Swiftbeauty (2026, beauty marketplace moved from PHP to Next.js and Sanity, team), Noble Code (2026, jewelry blueprint licensing site, sole), World of Walker (2025, music artist fandom platform, team), BASC (2025, aviation rules portal, lead). A link 'All 64 projects'.

**Home, шаг 3:** тот же промпт, что в направлении A.

## Промпты остальных страниц (после выбора направления)

Сначала импортируй DESIGN.md выбранного направления. Одна страница — один промпт. Футер на каждой странице содержит кнопки «Hire me» и «Start a project».

**Промпт Work (архив проектов):**

> Work page: title 'Work' with the sentence '64 projects, 2022 to 2026'. A filter bar: technology select, year select, role select (sole, lead, team, fixes, advisor, estimate-only), type tabs (All, Client, Freelance, Personal and internal), an 'AI' toggle and a search field. Below, a full-width table, one project per row: year, project name, one-line description, role, up to four technology names in mono, a small arrow link. Rows grouped by year with the year as a heading. A link at the end to 'Early work 2020 to 2022'.

**Промпт страницы проекта (полный кейс):**

> Project page for NoaSpot: back link to Work; name, one-line summary, a meta row (2026, sole, client, live link noaspot.com); an empty image slot with a neutral placeholder frame, no drawn interface; sections Problem, My role, Decisions, Outcome as short paragraphs; a features list; the full stack as a wrapped list of mono technology names, each a link; next and previous project at the bottom.

**Промпт страницы проекта (короткая запись):**

> Short project page for Datalumina: name, one-paragraph summary, meta row (2025, sole, client, live link), an empty image slot with a neutral placeholder frame, stack list, next and previous links. No case-study sections.

**Промпт Stack:**

> Stack page: title 'Stack' with '179 technologies'. Technologies grouped by category under plain headings. Each technology is one compact row: name, 'N projects, M built', the year range in mono, and is a link to the filtered Work page. No logos, no bars, no ratings.

**Промпт About:**

> About page: a short bio of four sentences beside a portrait photo slot; an experience timeline (UX MIND 2024 to present, Ceviant 2022 to 2023, Tapston 2022 to 2023, self-taught 2020 to 2022) with the bullets from the CV, no filler; education (Belarusian State University, Bachelor of Marketing, 2018 to 2022); languages (English C1, Russian native); interests: Dungeon Master for 500+ weekly Dungeons and Dragons games since 2021, guitar and piano.

**Промпт CV:**

> CV page: a plain, highly readable single-column résumé on the dark theme with a 'Download PDF' button at the top: header with name, title, location 'Remote, worldwide, Central European Time' and contacts; summary; experience; selected projects; skills as grouped lists; education. No decoration.
