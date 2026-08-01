import { apiRequest } from "@/lib/http";
import type { AdminCategory, CategoryInput, CategoryWithCount } from "@/types/category";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";

export const categoryService = {
  async list(): Promise<CategoryWithCount[]> {
    const payload = await apiRequest<{ items: CategoryWithCount[]; pagination: unknown }>('/api/categories');
    return payload.items.map((item) => ({
      ...item,
      image: item.image || FALLBACK_IMAGE,
    }));
  },

  async getById(id: string): Promise<AdminCategory> {
    return apiRequest<AdminCategory>(`/api/categories/${id}`);
  },

  async create(input: CategoryInput): Promise<AdminCategory> {
    return apiRequest<AdminCategory>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: CategoryInput): Promise<AdminCategory> {
    return apiRequest<AdminCategory>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/api/categories/${id}`, { method: "DELETE" });
  },
};
