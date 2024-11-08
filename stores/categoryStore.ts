// stores/useCategoryStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type Category, type CategoryOption } from "@/types/interfaces";

export const useCategoryStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters remain the same
  const getCategoryById = computed(() => {
    return (id: number): Category | undefined =>
      categories.value.find((category) => category.id === id);
  });

  const activeCategories = computed((): Category[] => {
    return categories.value.sort((a, b) => a.name.localeCompare(b.name));
  });

  const categoryOptions = computed(() => {
    return categories.value.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  });

  // Actions - matching taskStore pattern exactly
  const fetchCategories = async () => {
    loading.value = true;
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      categories.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
    } finally {
      loading.value = false;
    }
  };

  const getCategoryByIdFromApi = async (id: number) => {
    loading.value = true;
    try {
      const response = await fetch(`/api/categories?id=${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const category = await response.json();
      const index = categories.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories.value[index] = category;
      } else {
        categories.value.push(category);
      }
      return category;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  interface CreateCategoryData {
    organization_id: number;
    name: string;
    options: CategoryOption[];
  }

  const createCategory = async (categoryData: CreateCategoryData) => {
    loading.value = true;
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...categoryData,
          options: JSON.stringify(categoryData.options),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newCategory = await response.json();
      categories.value.push(newCategory);
      return newCategory;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: number, updates: Partial<Category>) => {
    loading.value = true;
    try {
      const response = await fetch(`/api/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          id,
          options: updates.options
            ? JSON.stringify(updates.options)
            : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedCategory = await response.json();
      const index = categories.value.findIndex(
        (category) => category.id === id
      );
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      return updatedCategory;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    error,
    getCategoryById,
    activeCategories,
    categoryOptions,
    fetchCategories,
    getCategoryByIdFromApi,
    createCategory,
    updateCategory,
  };
});
