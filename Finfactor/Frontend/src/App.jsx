import React, { useEffect, useState } from "react";
import {
  searchMeals,
  getCategories,
  getCategoryMeals,
  getMeal,
  getRandom,
} from "./api";
import { motion, AnimatePresence } from "framer-motion";

function IngredientList({ meal }) {
  if (!meal) return null;

  const items = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) items.push(`${ing} — ${measure || ""}`);
  }

  return (
    <ul className="space-y-1 text-sm text-gray-700">
      {items.map((it, idx) => (
        <motion.li
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
        >
          {it}
        </motion.li>
      ))}
    </ul>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.categories || []));
  }, []);

  async function doSearch(e) {
    e && e.preventDefault();
    if (!query) return;
    setLoading(true);

    const r = await searchMeals(query);
    setResults(r.results || []);
    setMeal(null);
    setSelectedCategory(null);
    setLoading(false);
  }

  async function openCategory(cat) {
    setLoading(true);
    setSelectedCategory(cat);

    const r = await getCategoryMeals(cat);
    setResults(r.meals || []);
    setMeal(null);
    setLoading(false);
  }

  async function openMeal(id) {
    setLoading(true);
    const r = await getMeal(id);
    setMeal(r.meal || null);
    setLoading(false);
  }

  async function randomMeal() {
    setLoading(true);
    const r = await getRandom();
    setMeal(r.meal || null);
    setResults([]);
    setSelectedCategory(null);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100">

      {/* HEADER */}
      <header className="sticky top-0 backdrop-blur bg-white/70 shadow-sm z-20">
        <div className="max-w-6xl mx-auto p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-orange-600"
          >
            🍽️ TheMealDB Explorer
          </motion.h1>

          <form
            onSubmit={doSearch}
            className="flex gap-2 w-full md:w-auto"
          >
            <motion.input
              type="text"
              placeholder="Search meals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none"
              whileFocus={{ scale: 1.02 }}
            />

            <motion.button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
          </form>

          <motion.button
            onClick={randomMeal}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            I'm Feeling Hungry 😋
          </motion.button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">

        <aside className="bg-white p-4 rounded-xl shadow-md border border-orange-200 h-fit">
          <h3 classname="text-lg font-semibold text-orange-700 mb-3">
            Categories
          </h3>

          <div className="space-y-2">
            {categories.map((c) => (
              <motion.button
                key={c.idCategory}
                onClick={() => openCategory(c.strCategory)}
                className={`w-full text-left px-3 py-2 rounded-lg shadow-sm border 
                  ${selectedCategory === c.strCategory
                    ? "bg-orange-500 text-white"
                    : "bg-orange-100 hover:bg-orange-200 text-orange-800"
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {c.strCategory}
              </motion.button>
            ))}
          </div>
        </aside>

        <section>
          {loading && (
            <div className="text-center text-orange-600 text-xl font-semibold">
              Loading…
            </div>
          )}

          <AnimatePresence mode="wait">
            {meal ? (
              // MEAL DETAILS PAGE
              <motion.div
                key="mealDetails"
                className="bg-white p-6 rounded-xl shadow-md border border-orange-200"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <h2 className="text-3xl font-bold flex justify-center -ml-5 text-orange-700 mb-7">
                  {meal.strMeal}
                </h2>
                <div className="flex justify-between">
                 <div>
                <h3 className="text-xl font-semibold text-orange-700 mb-2">
                  Ingredients
                </h3>
                <IngredientList meal={meal} />              
                </div>
                
                <div>
                <motion.img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="rounded-xl shadow-md mb-6 w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                </div>
                </div>
                  <h3 className="text-xl font-semibold text-orange-700 mt-6 mb-2">
                  Instructions
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {meal.strInstructions}
                </p>
               
                {meal.strYoutube && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-2">
                      Tutorial Video
                    </h3>
                    <iframe
                      className="w-full rounded-xl shadow"
                      height="315"
                      src={`https://www.youtube.com/embed/${
                        meal.strYoutube.split("v=")[1]
                      }`}
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </motion.div>
            ) : (
              // MEALS GRID
              <motion.div
                key="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                {results.map((m) => (
                  <motion.div
                    key={m.idMeal}
                    className="bg-white rounded-xl border border-orange-200 shadow hover:shadow-lg cursor-pointer overflow-hidden"
                    onClick={() => openMeal(m.idMeal)}
                    whileHover={{ scale: 1.03 }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <img
                      src={m.strMealThumb}
                      alt={m.strMeal}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-orange-700">
                        {m.strMeal}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
