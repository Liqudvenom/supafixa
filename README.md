# TradeTrust

TradeTrust is a bilingual (Polish and English) marketplace prototype for construction work across Greater London. It brings job listings, tradesperson profiles, company profiles and address-based client notes into one map-led workspace.

## What is included

- Map search with filters for role, trade, borough, distance, start date, rate and urgency.
- Seller, buyer and business demo profiles, with saved listings and session-only application actions.
- A Client Check demo with fictional addresses and reviews, available only to the business profile.
- A paste-and-review flow for turning a public post into a map listing, with original source links from Londynek.net or the Praca w Londynie Facebook group.
- An optional Londynek.net construction feed available only on the local Vite development server.
- Polish and English interface copy.

## Run locally

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

The development server prints the local URL. Other available scripts are `npm run build`, `npm run preview` and `npm run lint`.

## Prototype boundaries

This project has no application backend or user authentication. Marketplace records, client addresses and reviews are sample data. Saves, applications, invitations, enquiries, imported listings and newly written reviews are held in browser memory and are not sent to other people. Some demo preferences are stored in `localStorage`.

The Londynek.net feed route is provided by a Vite development plugin and is not included in the production build. Facebook posts are added by copying and pasting; there is no Facebook API integration. Imported listings are not verified. Do not treat demo reviews or risk indicators as real references, or enter private or sensitive personal information.

## Stack

React 19, TypeScript, Vite, Leaflet and Leaflet.markercluster.
