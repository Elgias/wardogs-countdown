# Відлік до Wardogs

Сайт-таймер зворотного відліку до виходу [WARDOGS](https://store.steampowered.com/app/1867240/WARDOGS/)
(BULKHEAD / Team17) у Steam Early Access.

**Живий сайт:** https://elgias.github.io/wardogs-countdown/

## Що всередині

Один статичний файл без збірки і без залежностей. Уся сторінка — це `index.html`:
CSS, JS і графіка фону лежать у ньому. Ззовні тягнуться тільки шрифти з Google Fonts.

| Файл | Призначення |
|---|---|
| `index.html` | вся сторінка |
| `favicon.svg` | іконка вкладки |
| `og.png` | картинка для превʼю посилання (1200×630) |

## Дата релізу

Ціль зашита в `index.html`, в обʼєкті `TARGETS`:

```js
var TARGETS = {
  t16: { at: Date.UTC(2026, 8, 10, 16, 0, 0), label: "10 вересня 2026 · 16:00 UTC" },
  t00: { at: Date.UTC(2026, 8, 10,  0, 0, 0), label: "10 вересня 2026 · 00:00 UTC" }
};
```

У `Date.UTC` місяці рахуються з нуля, тому `8` — це вересень.

Дата **10 вересня 2026** підтверджена сторінкою в Steam. Точний час розблокування — ні.
Game8 пише про 16:00 UTC, Steam офіційно час не називав. Тому на сторінці є перемикач
між двома варіантами, а внизу стоїть попередження. Коли Steam оголосить точний час,
замініть число і приберіть перемикач.

## Локальний запуск

Просто відкрийте `index.html` у браузері. Сервер не потрібен.

## Розгортання

GitHub Pages збирає гілку `main` з кореня. Кожен `git push` оновлює сайт за хвилину-дві.

## Джерела

- [Сторінка гри в Steam](https://store.steampowered.com/app/1867240/WARDOGS/)
- [Game8 — дата і час релізу](https://game8.co/articles/release-dates/wardogs-release-date-and-time)
- [Wikipedia — Wardogs](https://en.wikipedia.org/wiki/Wardogs_(video_game))
