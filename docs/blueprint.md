# **App Name**: CineAssist

## Core Features:

- Dual Panel UI: Two-panel interface: one to submit requests for movies/series and another to check if the content exists in the system.
- m3u Auto-Update: Background process to periodically update the m3u playlist from `http://dnscine.top:80/playlist/Vodsm3u789DS/w5NwV8dPXE/m3u_plus` every 10 minutes.
- TV Channel Filter: Filter out TV channels from the m3u playlist, only process movies and series. TV channels are identified by `group-title="Canais`. Regular expressions can identify this and exclude this information from being displayed to users.
- Content Display: Display search results with movie/series cover, and category (extracted from m3u playlist's group-title).
- TMDB Integration: Utilize the TMDB API (key: 279e039eafd4ccc7c289a589c9b613e3) tool to fetch and display concise synopsis for existing movies and series.
- Not Found Message: If the requested content is not found, display a message like "Ainda nao esta no sistema" to the user. Dynamically respond depending on whether or not the requested content is present.
- Search Box with Filtering: Add a search box at the top to allow users to type a query to filter content, providing real-time results that update as they type, with each item showing its cover, category, and synopsis.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to inspire trust and a sense of digital entertainment. 
- Background color: Very light desaturated blue (#E8EAF6), providing a calm backdrop to focus attention on content. 
- Accent color: Vivid Yellow (#FFEB3B) to draw the eye to actionable items.
- Body and headline font: 'Inter' sans-serif font providing clarity and straightforward communication. 
- Use minimalist line icons for categories and interactive elements. 
- Use a grid layout for content display, optimized for various screen sizes.
- Use subtle transitions for loading content and search results. 