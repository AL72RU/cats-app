import React, { useCallback, useEffect, useState } from 'react';
import './App.css';

function App() {
    const [catList, setCatList] = useState<{ url: string }[]>([]);
    const [favoriteList, setFavoriteList] = useState<{ url: string }[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"all" | "favorites">("all");
    const [error, setError] = useState<string>();

    const fetchCats = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const response = await fetch(`https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=${pageNum}&limit=10`);
            const result = await response.json();
            setCatList(prev => [...prev, ...result]);
        } catch (event) {
            setCatList([]);
            setError("No cats found");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const storedFavorites = localStorage.getItem("favoriteCats");
        if (storedFavorites) {
            setFavoriteList(JSON.parse(storedFavorites));
        }
        fetchCats(0);
    }, [fetchCats]);

    useEffect(() => {
        localStorage.setItem("favoriteCats", JSON.stringify(favoriteList));
    }, [favoriteList]);

    const toggleFavorite = useCallback((url: string) => {
        setFavoriteList(prevState => {
            const isFavorite = prevState.some(cat => cat.url === url);
            if (isFavorite) {
                return prevState.filter(cat => cat.url !== url);
            } else {
                const catToAdd = catList.find(cat => cat.url === url);
                return catToAdd ? [...prevState, catToAdd] : prevState;
            }
        });
    }, [catList]);

    const isFavorite = useCallback((url: string) => {
        return favoriteList.some(cat => cat.url === url)
    }, [favoriteList]);

    useEffect(() => {
        const handleScroll = () => {
            if (view === "all") {
                const scrollPosition = window.innerHeight + window.scrollY;
                const threshold = document.documentElement.offsetHeight - 300;
                if (scrollPosition >= threshold && !loading) {
                    setPage(prevPage => prevPage + 1);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, view]);

    useEffect(() => {
        if (page !== 0) {
            fetchCats(page);
        }
    }, [page, fetchCats]);

    useEffect(() => {
        if (!loading && view === "all") {
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            if (scrollHeight <= clientHeight) {
                setPage(prevPage => prevPage + 1);
            }
        }
    }, [catList, loading, view]);

    return (
        <div className="app">
            <div className="app-header">
                <button
                    onClick={() => setView("all")}
                    className={`button${view === "all" ? "-active" : ""}`}
                >
                    {"All cats"}
                </button>
                <button
                    onClick={() => setView("favorites")}
                    className={`button${view === "favorites" ? "-active" : ""}`}
                >
                    {"Favorite"}
                </button>
            </div>
            <div className="app-body">
                <div className="container">
                    {(view === "all" ? catList : favoriteList).map(({ url }, index) => (
                        <div
                            key={index}
                            className={"app-body__item"}
                            onClick={() => toggleFavorite(url)}
                        >
                            <img className="app-body__item-image" src={url} alt="" />
                            <div className={`app-body__favorites-button${isFavorite(url) ? " active" : ""}`}/>
                        </div>
                    ))}
                </div>
                {loading && view === "all" && (
                    <p>{"Loading..."}</p>
                )}
                {!favoriteList.length && (
                    <p>{"You don't have any favorite cats"}</p>
                )}
                {error && (
                    <p>{error}</p>
                )}
            </div>
        </div>
    );
}

export default App;
