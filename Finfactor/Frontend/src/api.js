const API_ROOT = 'http://localhost:5050/api';


export async function searchMeals (name) {
const res = await fetch(`${API_ROOT}/search?name=${encodeURIComponent(name)}`);
return res.json();
}


export async function getCategories () {
const res = await fetch(`${API_ROOT}/categories`);
return res.json();
}


export async function getCategoryMeals (category) {
const res = await fetch(`${API_ROOT}/category/${encodeURIComponent(category)}`);

return res.json();
}


export async function getMeal (id) {
const res = await fetch(`${API_ROOT}/meal/${id}`);
return res.json();
}


export async function getRandom () {
const res = await fetch(`${API_ROOT}/random`);
return res.json();
}