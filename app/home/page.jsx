"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "./Home.module.css";
import CharacterCard from "../../Components/CharacterCard";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../Components/Loader";

export default function Home() {
    const [search, setSearch] = useState("");
    const [characters, setCharacters] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const cacheRef = useRef(new Map());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCharacters = async (name = "", pageNumber = 1) => {
        setLoading(true);
        const cache = cacheRef.current;
        const cacheKey = `${name}_${pageNumber}`;
        const nextPageNumber = pageNumber + 1;
        const nextCacheKey = `${name}_${nextPageNumber}`;

        const cleanCacheIfNeeded = () => {
            while (cache.size >= 5) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
                console.log(`🔃 Removido do cache: ${firstKey}`);
            }
        };
        let total = totalPages;

        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            setCharacters(cached.results);
            setTotalPages(cached.totalPages);
            total = cached.totalPages;
            setNotFound(false);
            setLoading(false);
            console.log(`✅ Usando cache: ${cacheKey}`);
        } else {
            try {
                const { data } = await axios.get(
                    `https://rickandmortyapi.com/api/character/?page=${pageNumber}&name=${name}`
                );

                cleanCacheIfNeeded();
                cache.set(cacheKey, {
                    results: data.results,
                    totalPages: data.info.pages,
                });

                setCharacters(data.results);
                setTotalPages(data.info.pages);
                total = data.info.pages;
                setNotFound(false);
                console.log(`💾 Salvo no cache: ${cacheKey}`);
            } catch {
                setCharacters([]);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        if (nextPageNumber <= total && !cache.has(nextCacheKey)) {
            try {
                const res = await axios.get(
                    `https://rickandmortyapi.com/api/character/?page=${nextPageNumber}&name=${name}`
                );
                cleanCacheIfNeeded();
                cache.set(nextCacheKey, {
                    results: res.data.results,
                    totalPages: res.data.info.pages,
                });
                console.log(`📋 Prefetch salvo: ${nextCacheKey}`);
            } catch (err) {
                console.log(`❌ Prefetch falhou: ${nextCacheKey}`, err);
            }
        } else {
            console.log("ℹ️ Prefetch ignorado: já no cache ou fora do limite");
        }

        console.log(`📦 Cache final: ${cache.size} páginas`);
        for (const [key, val] of cache.entries()) {
            console.log(`📦 ${key}: ${val.results.length} personagens`);
        }
        console.log("============== FIM DA BUSCA ==============\n");
    };

    useEffect(() => {
        fetchCharacters(search.trim(), page);
    }, [page]);

    useEffect(() => {
        fetchCharacters(search, page);
    }, [search]);

    const handleSearch = () => {
        const name = search.trim();
        setPage(1);
        fetchCharacters(name, 1);
    };

    const handleReset = () => {
        setSearch("");
        setPage(1);
        fetchCharacters("", 1);
        toast.success("Filtro foi resetado", { position: "top-left" });
    };

    const handleCardClick = (char) => {
        console.log(`Você clicou em ${char}`);
        toast.info(`Você clicou em ${char.name} que está ${char.status}`);
    };
    return (
        <div className={styles.container}>
            <ToastContainer position="top-right" autoClose={7500} theme="light" />
            <h1 className={styles.title}>Personagens de Rick and Morty</h1>
            <div className={styles.controls}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Digite o nome do personagem"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={handleSearch} className={styles.buttonSearch}>
                    Pesquisar
                </button>
                <button onClick={handleReset} className={styles.buttonReset}>
                    Resetar
                </button>
            </div>
            <div className={styles.navControls}>
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={styles.buttonNav}
                >
                    Página Anterior
                </button>
                <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className={styles.buttonNav}
                >
                    Próxima Página
                </button>
            </div>

            {notFound && (
                <h1 className={styles.notFound}>Nenhum personagem encontrado 😢</h1>
            )}

            {loading ? (
                <div className={`${styles.loaderWrapper} ${loading ? "" : styles.hidden}`}>
                    <Loader />
                </div>
            ) : (
                <div className={styles.grid}>
                    {characters.map((char) => (
                        <CharacterCard key={char.id} character={char} onClick={() => handleCardClick(char)} />
                    ))}
                </div>
            )}
        </div>
    );
}
