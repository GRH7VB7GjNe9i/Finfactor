const express = require('express');
const fetch = require('node-fetch');
const { createCache } = require('./cache');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5050;
const API_KEY = '1'; // test key
const BASE = `https://www.themealdb.com/api/json/v1/${API_KEY}`;


// Configure cache: max entries and ttl (ms)
const cache = createCache({ max: 1000, ttl: 1000 * 60 * 10 }); // 10 min


async function cachedFetch (cacheKey, url, ttl) {
const cached = cache.get(cacheKey);
if (cached) return cached;


const res = await fetch(url);
if (!res.ok) throw new Error(`Remote API error: ${res.status}`);
const data = await res.json();
cache.set(cacheKey, data, ttl);
return data;
}


// RESTful endpoints

// Search meals by name
app.get('/api/search', async (req, res) => {
const name = (req.query.name || '').trim();
if (!name) return res.status(400).json({ error: 'Missing query parameter: name' });


try {
const key = `search:name:${name.toLowerCase()}`;
const url = `${BASE}/search.php?s=${encodeURIComponent(name)}`;
const data = await cachedFetch(key, url);
return res.json({ results: data.meals || [] });
} catch (err) {
console.error(err);
return res.status(502).json({ error: 'Failed to fetch from upstream' });
}
});


// List categories
app.get('/api/categories', async (req, res) => {
try {
const key = `categories:list`;
const url = `${BASE}/categories.php`;
const data = await cachedFetch(key, url);
return res.json({ categories: data.categories || [] });
} catch (err) {
console.error(err);
return res.status(502).json({ error: 'Failed to fetch categories' });
}
});


// Meals in a category
app.get('/api/category/:name', async (req, res) => {
const name = req.params.name;
try {
const key = `category:${name.toLowerCase()}`;
const url = `${BASE}/filter.php?c=${encodeURIComponent(name)}`;
const data = await cachedFetch(key, url);
return res.json({ meals: data.meals || [] });
} catch (err) {
console.error(err);
return res.status(502).json({ error: 'Failed to fetch category' });
}
});


// Meal details by id
app.get('/api/meal/:id', async (req, res) => {
const id = req.params.id;
try {
const key = `meal:${id}`;
const url = `${BASE}/lookup.php?i=${encodeURIComponent(id)}`;
const data = await cachedFetch(key, url);
return res.json({ meal: (data.meals && data.meals[0]) || null });
} catch (err) {
console.error(err);
return res.status(502).json({ error: 'Failed to fetch meal' });
}
});


// Random meal
app.get('/api/random', async (req, res) => {
try {
const key = `random:meal`;

// random changes often; keep short ttl
const url = `${BASE}/random.php`;
const data = await cachedFetch(key, url, 1000 * 60); // 1 minute
return res.json({ meal: (data.meals && data.meals[0]) || null });
} catch (err) {
console.error(err);
return res.status(502).json({ error: 'Failed to fetch random meal' });
}
});


// Start server
app.listen(PORT, () => {
console.log(`TheMealDB Explorer backend listening on http://localhost:${PORT}`);
});