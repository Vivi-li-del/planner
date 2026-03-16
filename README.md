# Trips & Weekend Planner

Plan trips and weekend activities in one place. Add date ranges, locations, notes, and manage items with edit/delete. Switch between calendar and list views to see everything at a glance.

## Features
- Add activities with start/end dates, type (trip or weekend), location, and notes
- Trip itineraries: hotels, restaurants, attractions (one per line)
- Calendar view with month navigation and date-range rendering
- List view with filters by type (All, Trips, Weekend)
- Edit or delete existing plans inline

## Files
- `planner.html` — UI layout
- `planner.js` — logic (add/edit/delete, filters, calendar rendering)
- `script.js`, `index.html` — original site files (not used for the planner)

## Usage
1) Open `planner.html` locally or host the folder on a static server.
2) Use the form to add items. For ranges, set start and stop dates; single-day items can omit the end date.
3) Add itineraries for trips in the hotels/restaurants/attractions fields (one per line).
4) Toggle Calendar/List view with the buttons. Use filters to show only trips or weekend items.

## Deployment (GitHub Pages)
1) Push to GitHub.
2) Repo Settings → Pages → Source: `main` branch, folder `/ (root)`.
3) Access at `https://<username>.github.io/<repo>/planner.html`.
