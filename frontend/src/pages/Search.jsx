import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { Loader2, ChevronDown, CheckCircle2, Layers, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react';

const LIMIT = 12;

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, count, color }) {
    return (
        <div className="flex items-center gap-2 mb-4 mt-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <h3 className={`font-bold text-sm uppercase tracking-widest ${color}`}>{label}</h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
            <div className="flex-1 h-px bg-slate-200 ml-1" />
        </div>
    );
}

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;   // Requirement 9: hide when only 1 page

    // Build the page number array with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // show 2 pages around current

        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd   = Math.min(totalPages - 1, currentPage + delta);

        pages.push(1);

        if (rangeStart > 2) pages.push('...');

        for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

        if (rangeEnd < totalPages - 1) pages.push('...');

        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    const btnBase = 'min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 select-none';
    const btnActive = `${btnBase} bg-[#0B1E36] text-white shadow-sm`;
    const btnInactive = `${btnBase} border border-gray-300 text-slate-700 hover:bg-slate-50 hover:border-gray-400`;
    const btnDisabled = `${btnBase} border border-gray-200 text-slate-300 cursor-not-allowed`;

    const isFirst = currentPage === 1;
    const isLast  = currentPage === totalPages;

    return (
        <nav aria-label="Search results pagination" className="flex justify-center items-center gap-1.5 mt-10 mb-4">
            {/* Previous button */}
            <button
                id="pagination-prev"
                onClick={() => !isFirst && onPageChange(currentPage - 1)}
                disabled={isFirst}
                aria-label="Previous page"
                className={isFirst ? btnDisabled : `${btnInactive} px-2`}
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="min-w-[36px] h-9 flex items-center justify-center text-slate-400 select-none">
                        &hellip;
                    </span>
                ) : (
                    <button
                        key={p}
                        id={`pagination-page-${p}`}
                        onClick={() => p !== currentPage && onPageChange(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={p === currentPage ? btnActive : btnInactive}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next button */}
            <button
                id="pagination-next"
                onClick={() => !isLast && onPageChange(currentPage + 1)}
                disabled={isLast}
                aria-label="Next page"
                className={isLast ? btnDisabled : `${btnInactive} px-2`}
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </nav>
    );
}

// ── Main Search page ──────────────────────────────────────────────────────────
export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const query       = searchParams.get('q') || '';
    // Read page from URL (Requirement 4 — works on refresh too)
    const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    // Sectioned results
    const [exactMatches,    setExactMatches]    = useState([]);
    const [similar,         setSimilar]          = useState([]);
    const [related,         setRelated]          = useState([]);
    const [allProducts,     setAllProducts]      = useState([]);

    const [filteredExact,   setFilteredExact]    = useState([]);
    const [filteredSimilar, setFilteredSimilar]  = useState([]);
    const [filteredRelated, setFilteredRelated]  = useState([]);

    // Pagination state
    const [currentPage,  setCurrentPage]  = useState(pageFromUrl);
    const [totalPages,   setTotalPages]   = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [didYouMean, setDidYouMean] = useState(null);
    const [filters,    setFilters]    = useState({
        stores:   [],
        minPrice: '',
        maxPrice: '',
        sortBy:   'Recommended',
    });

    // Fetch when query OR page changes
    useEffect(() => {
        if (query) {
            const p = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
            setCurrentPage(p);
            fetchProducts(query, p);
        }
    }, [query, searchParams.get('page')]); // eslint-disable-line

    useEffect(() => { applyFilters(); }, [exactMatches, similar, related, filters]); // eslint-disable-line

    const fetchProducts = async (q, page = 1) => {
        setLoading(true);
        setError(null);
        setDidYouMean(null);
        try {
            // Requirement 11: fetch with page & limit params
            const response = await api.get(
                `/api/products/search?q=${encodeURIComponent(q)}&page=${page}&limit=${LIMIT}`
            );
            const data = response.data;

            // Sectioned results
            const exact = Array.isArray(data.exactMatches) ? data.exactMatches : [];
            const sim   = Array.isArray(data.similar)      ? data.similar      : [];
            const rel   = Array.isArray(data.related)      ? data.related      : [];

            // Fallback: older API only returns `results`
            const hasSections = exact.length + sim.length + rel.length > 0;
            const flatFallback = Array.isArray(data.results) ? data.results
                               : Array.isArray(data)         ? data
                               : [];

            const finalExact  = hasSections ? exact : flatFallback;
            const finalSim    = hasSections ? sim   : [];
            const finalRel    = hasSections ? rel   : [];

            setExactMatches(finalExact);
            setSimilar(finalSim);
            setRelated(finalRel);
            setAllProducts([...finalExact, ...finalSim, ...finalRel]);

            // Pagination metadata (Requirement 1)
            setTotalPages(data.totalPages   ?? 1);
            setTotalResults(data.totalResults ?? finalExact.length + finalSim.length + finalRel.length);
            setCurrentPage(data.page ?? page);

            // Debug log
            const amzCt = Array.isArray(data.amazon)   ? data.amazon.length   : finalExact.concat(finalSim, finalRel).filter(p => p.source === 'Amazon').length;
            const fkCt  = Array.isArray(data.flipkart) ? data.flipkart.length : finalExact.concat(finalSim, finalRel).filter(p => p.source === 'Flipkart').length;
            console.log(`[Search] Page ${page}/${data.totalPages} | Exact:${finalExact.length} Similar:${finalSim.length} Related:${finalRel.length} | Amazon:${amzCt} Flipkart:${fkCt}`);

            if (data.didYouMean) setDidYouMean(data.didYouMean);
        } catch (err) {
            console.error('Search API Error:', err);
            setError(`Failed to fetch products: ${err.message}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // Requirement 3 + 4: page click → update URL → useEffect re-fetches
    const handlePageChange = useCallback((newPage) => {
        if (newPage === currentPage) return;
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Update URL (Requirement 4) — this triggers the useEffect above
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(newPage));
            return next;
        });
    }, [currentPage, setSearchParams]);

    const applySection = (arr) => {
        let out = [...arr];
        if (filters.stores.length > 0) out = out.filter(p => filters.stores.includes(p.source));
        if (filters.minPrice) out = out.filter(p => (p.currentPrice || 0) >= parseFloat(filters.minPrice));
        if (filters.maxPrice) out = out.filter(p => (p.currentPrice || 0) <= parseFloat(filters.maxPrice));
        if      (filters.sortBy === 'Price: Low to High')  out.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
        else if (filters.sortBy === 'Price: High to Low')  out.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
        else if (filters.sortBy === 'Top Rated')           out.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return out;
    };

    const applyFilters = () => {
        setFilteredExact(applySection(exactMatches));
        setFilteredSimilar(applySection(similar));
        setFilteredRelated(applySection(related));
    };

    // When filters change, reset to page 1 and re-fetch (Requirement 7)
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        // Filter changes reset to page 1
        if (currentPage !== 1) {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.set('page', '1');
                return next;
            });
        }
    };

    const toggleStore = (store) => {
        handleFilterChange({
            ...filters,
            stores: filters.stores.includes(store)
                ? filters.stores.filter(s => s !== store)
                : [...filters.stores, store],
        });
    };

    const totalVisible = filteredExact.length + filteredSimilar.length + filteredRelated.length;

    const ResultGrid = ({ products }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {products.map((product, idx) => (
                <ProductCard key={product.url ? `${product.url}-${idx}` : idx} product={product} />
            ))}
        </div>
    );

    // Retailer breakdown for the heading
    const visibleAll = [...filteredExact, ...filteredSimilar, ...filteredRelated];
    const amzVisible = visibleAll.filter(p => p.source === 'Amazon').length;
    const fkVisible  = visibleAll.filter(p => p.source === 'Flipkart').length;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* ── Sidebar Filters ───────────────────────────────────── */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[#0B1E36]">Filters</h3>
                            <button
                                className="text-sm font-semibold text-blue-600 hover:underline"
                                onClick={() => handleFilterChange({ stores: [], minPrice: '', maxPrice: '', sortBy: 'Recommended' })}
                            >Clear all</button>
                        </div>

                        <div className="space-y-6">
                            {/* Retailer */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Retailer</h4>
                                <div className="space-y-3">
                                    {['Amazon', 'Flipkart'].map(store => (
                                        <label key={store} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.stores.includes(store)}
                                                onChange={() => toggleStore(store)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#0B1E36] focus:ring-[#0B1E36]"
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{store}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Price</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input type="number" placeholder="Min" value={filters.minPrice}
                                            onChange={(e) => handleFilterChange({ ...filters, minPrice: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-lg text-sm text-slate-900 p-2 pl-6 outline-none focus:border-[#0B1E36]" />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input type="number" placeholder="Max" value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange({ ...filters, maxPrice: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-lg text-sm text-slate-900 p-2 pl-6 outline-none focus:border-[#0B1E36]" />
                                    </div>
                                </div>
                            </div>

                            {/* Brand */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Brand</h4>
                                <div className="space-y-3">
                                    {['Apple', 'Sony', 'Bose', 'Samsung', 'JBL'].map(brand => (
                                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Condition */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Condition</h4>
                                <div className="space-y-3">
                                    {['New', 'Renewed', 'Used'].map(cond => (
                                        <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{cond}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── Results Area ──────────────────────────────────────── */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <SearchBar initialValue={query} />
                        </div>

                        {/* Header row */}
                        <div className="flex justify-between items-center mb-6 py-2 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-slate-900">
                                {loading ? 'Searching...' : (
                                    <>
                                        {totalResults > 0
                                            ? `${totalResults} Results for \u201c${query}\u201d`
                                            : `${totalVisible} Results for \u201c${query}\u201d`
                                        }
                                        {totalPages > 1 && (
                                            <span className="ml-2 text-sm font-normal text-slate-500">
                                                (Page {currentPage} of {totalPages})
                                            </span>
                                        )}
                                        {!loading && allProducts.length > 0 && (
                                            amzVisible > 0 && fkVisible > 0
                                                ? <span className="ml-2 text-sm font-medium text-slate-500">({amzVisible} Amazon · {fkVisible} Flipkart)</span>
                                                : amzVisible > 0
                                                    ? <span className="ml-2 text-sm font-medium text-orange-500">({amzVisible} Amazon)</span>
                                                    : fkVisible > 0
                                                        ? <span className="ml-2 text-sm font-medium text-blue-500">({fkVisible} Flipkart)</span>
                                                        : null
                                        )}
                                    </>
                                )}
                            </h2>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <div className="relative">
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                                        className="appearance-none bg-white border border-gray-300 text-sm font-semibold text-slate-900 rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer hover:border-gray-400"
                                    >
                                        <option value="Recommended">Recommended</option>
                                        <option value="Price: Low to High">Price: Low to High</option>
                                        <option value="Price: High to Low">Price: High to Low</option>
                                        <option value="Top Rated">Top Rated</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Did You Mean */}
                        {didYouMean && didYouMean.length > 0 && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-blue-700">Did you mean:</span>
                                {didYouMean.map((s, i) => (
                                    <button key={i}
                                        onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                                        className="text-sm text-blue-600 underline hover:text-blue-800 font-medium"
                                    >{s}</button>
                                ))}
                            </div>
                        )}

                        {/* States */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-[#0B1E36] animate-spin mb-4" />
                                <p className="text-slate-500">Scraping multiple stores. Please wait...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : totalVisible === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                                <p className="text-slate-500 mb-2">No products match your current filters.</p>
                            </div>
                        ) : (
                            <>
                                {/* SECTION 1 — Exact Matches */}
                                {filteredExact.length > 0 && (
                                    <div className="mb-2">
                                        <SectionHeader icon={CheckCircle2} label="Exact Matches" count={filteredExact.length} color="text-green-600" />
                                        <ResultGrid products={filteredExact} />
                                    </div>
                                )}

                                {/* SECTION 2 — Similar Variants */}
                                {filteredSimilar.length > 0 && (
                                    <div className="mb-2">
                                        <SectionHeader icon={Layers} label="Similar Variants" count={filteredSimilar.length} color="text-blue-600" />
                                        <ResultGrid products={filteredSimilar} />
                                    </div>
                                )}

                                {/* SECTION 3 — Related Products */}
                                {filteredRelated.length > 0 && (
                                    <div className="mb-2">
                                        <SectionHeader icon={GitBranch} label="Related Products" count={filteredRelated.length} color="text-slate-500" />
                                        <ResultGrid products={filteredRelated} />
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── Pagination (Requirement 9: hidden when totalPages === 1) ── */}
                        {!loading && !error && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
