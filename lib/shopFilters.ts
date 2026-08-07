import type {
  ActiveFilterChip,
  Availability,
  FilterOption,
  FilterState,
  OfferKey,
  PriceRange,
  Product,
  SortKey,
  SortOption,
  ViewMode,
} from "@/types/shop";

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

export const PRICE_BOUNDS: PriceRange = { min: 0, max: 100_000 };

export const CURRENCY = "KES";

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: [],
  brand: [],
  availability: [],
  offers: [],
  priceRange: { ...PRICE_BOUNDS },
  sort: "featured",
  view: "grid",
};

export const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "az", label: "Name: A–Z" },
];

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
];

export const OFFER_OPTIONS: { value: OfferKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "New arrivals" },
  { value: "sale", label: "On sale" },
];

export const PRICE_PRESETS: { label: string; range: PriceRange }[] = [
  { label: "Any price", range: { ...PRICE_BOUNDS } },
  { label: "0 – 1,000", range: { min: 0, max: 1_000 } },
  { label: "1,000 – 5,000", range: { min: 1_000, max: 5_000 } },
  { label: "5,000 – 10,000", range: { min: 5_000, max: 10_000 } },
  { label: "10,000+", range: { min: 10_000, max: PRICE_BOUNDS.max } },
];

/* -------------------------------------------------------------------------- */
/* Formatting                                                                  */
/* -------------------------------------------------------------------------- */

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Math.max(0, Math.round(value)));
}

export function formatPriceRange(range: PriceRange): string {
  const isMax = range.max >= PRICE_BOUNDS.max;
  if (range.min <= PRICE_BOUNDS.min && isMax) return "Any price";
  if (isMax) return `${formatCurrency(range.min)}+`;
  return `${formatCurrency(range.min)} – ${formatCurrency(range.max)}`;
}

export function clampPrice(value: number): number {
  if (!Number.isFinite(value)) return PRICE_BOUNDS.min;
  return Math.min(PRICE_BOUNDS.max, Math.max(PRICE_BOUNDS.min, Math.round(value)));
}

export function isDefaultPriceRange(range: PriceRange): boolean {
  return range.min <= PRICE_BOUNDS.min && range.max >= PRICE_BOUNDS.max;
}

/* -------------------------------------------------------------------------- */
/* URL (de)serialisation                                                       */
/* -------------------------------------------------------------------------- */

const SORT_KEYS = SORT_OPTIONS.map((option) => option.value);
const OFFER_KEYS = OFFER_OPTIONS.map((option) => option.value);

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseFiltersFromParams(
  params: URLSearchParams | Readonly<URLSearchParams>,
): FilterState {
  const sortParam = params.get("sort") as SortKey | null;
  const viewParam = params.get("view");
  const min = Number(params.get("minPrice"));
  const max = Number(params.get("maxPrice"));

  return {
    search: params.get("q") ?? "",
    category: parseCsv(params.get("category")),
    brand: parseCsv(params.get("brand")),
    availability: parseCsv(params.get("availability")).filter(
      (value): value is Availability =>
        value === "in-stock" || value === "out-of-stock",
    ),
    offers: parseCsv(params.get("offers")).filter((value): value is OfferKey =>
      (OFFER_KEYS as string[]).includes(value),
    ),
    priceRange: {
      min: params.get("minPrice") ? clampPrice(min) : PRICE_BOUNDS.min,
      max: params.get("maxPrice") ? clampPrice(max) : PRICE_BOUNDS.max,
    },
    sort: sortParam && SORT_KEYS.includes(sortParam) ? sortParam : "featured",
    view: viewParam === "list" ? "list" : ("grid" as ViewMode),
  };
}

export function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.category.length) params.set("category", filters.category.join(","));
  if (filters.brand.length) params.set("brand", filters.brand.join(","));
  if (filters.availability.length)
    params.set("availability", filters.availability.join(","));
  if (filters.offers.length) params.set("offers", filters.offers.join(","));
  if (filters.priceRange.min > PRICE_BOUNDS.min)
    params.set("minPrice", String(filters.priceRange.min));
  if (filters.priceRange.max < PRICE_BOUNDS.max)
    params.set("maxPrice", String(filters.priceRange.max));
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  if (filters.view !== "grid") params.set("view", filters.view);

  return params;
}

/* -------------------------------------------------------------------------- */
/* Option builders                                                             */
/* -------------------------------------------------------------------------- */

function countBy(products: Product[], pick: (p: Product) => string | undefined) {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = pick(product);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function toOptions(counts: Map<string, number>): FilterOption[] {
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: value, count }));
}

export function buildCategoryOptions(products: Product[]): FilterOption[] {
  return toOptions(countBy(products, (p) => p.category));
}

export function buildBrandOptions(products: Product[]): FilterOption[] {
  return toOptions(countBy(products, (p) => p.brand));
}

/* -------------------------------------------------------------------------- */
/* Filtering + sorting                                                         */
/* -------------------------------------------------------------------------- */

export function isOnSale(product: Product): boolean {
  return (
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price
  );
}

function matchesSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [product.name, product.brand, product.sku, product.category].some(
    (field) => field?.toLowerCase().includes(q),
  );
}

export function filterProducts(
  products: Product[],
  filters: FilterState,
): Product[] {
  return products.filter((product) => {
    if (!matchesSearch(product, filters.search)) return false;
    if (filters.category.length && !filters.category.includes(product.category))
      return false;
    if (
      filters.brand.length &&
      (!product.brand || !filters.brand.includes(product.brand))
    )
      return false;

    if (filters.availability.length) {
      const inStock = product.stock > 0;
      const wantsInStock = filters.availability.includes("in-stock");
      const wantsOutOfStock = filters.availability.includes("out-of-stock");
      if (!((wantsInStock && inStock) || (wantsOutOfStock && !inStock)))
        return false;
    }

    if (filters.offers.includes("featured") && !product.featured) return false;
    if (filters.offers.includes("new") && !product.isNewArrival) return false;
    if (filters.offers.includes("sale") && !isOnSale(product)) return false;

    return (
      product.price >= filters.priceRange.min &&
      product.price <= filters.priceRange.max
    );
  });
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const result = [...products];
  switch (sort) {
    case "newest":
      return result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "az":
      return result.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return result.sort((a, b) => {
        if (Boolean(b.featured) !== Boolean(a.featured))
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });
  }
}

/** Single entry point used by the page: filter, then sort. */
export function applyFilters(
  products: Product[],
  filters: FilterState,
): Product[] {
  return sortProducts(filterProducts(products, filters), filters.sort);
}

/* -------------------------------------------------------------------------- */
/* Active filter derivation                                                    */
/* -------------------------------------------------------------------------- */

export function countActiveFilters(filters: FilterState): number {
  return (
    filters.category.length +
    filters.brand.length +
    filters.availability.length +
    filters.offers.length +
    (filters.search ? 1 : 0) +
    (isDefaultPriceRange(filters.priceRange) ? 0 : 1)
  );
}

/** Per-section counts used for the badges on each accordion header. */
export function sectionCounts(filters: FilterState) {
  return {
    category: filters.category.length,
    brand: filters.brand.length,
    price: isDefaultPriceRange(filters.priceRange) ? 0 : 1,
    availability: filters.availability.length,
    offers: filters.offers.length,
  };
}

interface ChipActions {
  toggleArrayFilter: (key: "category" | "brand" | "availability" | "offers", value: string) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

const LABELS: Record<string, string> = {
  ...Object.fromEntries(AVAILABILITY_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(OFFER_OPTIONS.map((o) => [o.value, o.label])),
};

/** Builds the removable chips shown above the product grid. */
export function buildActiveChips(
  filters: FilterState,
  { toggleArrayFilter, updateFilter }: ChipActions,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.search) {
    chips.push({
      id: `search:${filters.search}`,
      label: `“${filters.search}”`,
      remove: () => updateFilter("search", ""),
    });
  }

  (["category", "brand", "availability", "offers"] as const).forEach((key) => {
    for (const value of filters[key]) {
      chips.push({
        id: `${key}:${value}`,
        label: LABELS[value] ?? value,
        remove: () => toggleArrayFilter(key, value),
      });
    }
  });

  if (!isDefaultPriceRange(filters.priceRange)) {
    chips.push({
      id: "price",
      label: formatPriceRange(filters.priceRange),
      remove: () => updateFilter("priceRange", { ...PRICE_BOUNDS }),
    });
  }

  return chips;
}
