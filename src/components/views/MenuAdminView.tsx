import React, { useState, useMemo } from "react";
import { DISPLAY_CATEGORIES, matchCategory, FALLBACK_FOOD_IMAGE } from "../../data/menuData";
import { CategoryName, MenuItem } from "../../types";
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Image as ImageIcon
} from "lucide-react";
import { useRestaurant } from "../../context/RestaurantContext";

export const MenuAdminView: React.FC = () => {
  const { showToast, menuItems: itemsList, setMenuItems } = useRestaurant();
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // Modal for Add/Edit item
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    category: "Coffee",
    price: 120,
    costPrice: 45,
    isVeg: true,
    desc: "",
    prepTime: "8 mins",
    image: FALLBACK_FOOD_IMAGE,
    isAvailable: true
  });

  const filtered = useMemo(() => {
    return itemsList.filter((i) => {
      const matchCat = selectedCat === "All" || matchCategory(i.category, selectedCat);
      const matchSearch =
        search.trim() === "" ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [itemsList, selectedCat, search]);

  const toggleAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
    showToast("Dish availability updated");
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "Coffee",
      price: 120,
      costPrice: 45,
      isVeg: true,
      desc: "",
      prepTime: "8 mins",
      image: FALLBACK_FOOD_IMAGE,
      isAvailable: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast("Dish name is required");
      return;
    }

    if (editingItem) {
      // Update
      setMenuItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...formData } as MenuItem : i))
      );
      showToast(`Updated "${formData.name}"`);
    } else {
      // Add
      const newId = `CUSTOM-${Date.now().toString().slice(-4)}`;
      const newItem: MenuItem = {
        id: newId,
        name: formData.name || "Special Dish",
        category: (formData.category as CategoryName) || "Coffee",
        price: Number(formData.price) || 100,
        costPrice: Number(formData.costPrice) || 35,
        isVeg: formData.isVeg ?? true,
        desc: formData.desc || "Prepared fresh with artisanal ingredients.",
        prepTime: formData.prepTime || "10 mins",
        image: formData.image || FALLBACK_FOOD_IMAGE,
        isAvailable: true,
        rating: 4.9
      };
      setMenuItems((prev) => [newItem, ...prev]);
      showToast(`Added new dish "${newItem.name}" to menu!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the menu catalog?`)) {
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`Removed "${name}"`);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6 font-sans">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Food Menu Master Catalog
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {itemsList.length} Dishes
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Accurate food photography, pricing, cost calculations, recipes & availability controls
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter Ribbon & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search dishes by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-700"
            />
          </div>
        </div>

        {/* 23 Categories */}
        <div className="overflow-x-auto flex items-center gap-1.5 pt-1 pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCat("All")}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCat === "All"
                ? "bg-amber-900 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            All Categories ({itemsList.length})
          </button>
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCat === cat
                  ? "bg-amber-900 text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const isAvail = item.isAvailable;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-3.5 flex flex-col justify-between shadow-xs transition-all ${
                isAvail ? "border-stone-200" : "border-red-200 opacity-60 bg-stone-50"
              }`}
            >
              <div>
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-stone-100">
                  <img
                    src={item.image || FALLBACK_FOOD_IMAGE}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span
                    className={`absolute top-2 left-2 w-4 h-4 rounded-sm border bg-white/90 backdrop-blur-xs flex items-center justify-center ${
                      item.isVeg ? "border-emerald-600" : "border-red-600"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                  </span>

                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                    {item.prepTime}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-stone-900 leading-tight">{item.name}</h4>
                    <span className="font-mono font-extrabold text-sm text-amber-950 shrink-0">
                      ₹{item.price}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                    {item.category}
                  </span>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.desc}</p>
                </div>
              </div>

              {/* Actions & Availability Toggle */}
              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isAvail
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                      : "bg-red-50 text-red-800 hover:bg-red-100 border border-red-200"
                  }`}
                >
                  {isAvail ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                  <span>{isAvail ? "In Stock" : "Sold Out"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-500 hover:text-amber-800 rounded-lg hover:bg-stone-100 transition-colors"
                    title="Edit dish details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                    title="Delete dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {editingItem ? `Edit Product: ${editingItem.name}` : "Add New Dish to Shru's Cafe Menu"}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-white/20 text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-medium"
                    placeholder="e.g. Hazelnut Cold Brew, Paneer Tikka Burger"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryName })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-medium"
                  >
                    {DISPLAY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dietary Type *</label>
                  <select
                    value={formData.isVeg ? "veg" : "nonveg"}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === "veg" })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-medium"
                  >
                    <option value="veg">Vegetarian (Green badge)</option>
                    <option value="nonveg">Non-Vegetarian (Red badge)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Food Photography Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs font-mono"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg"
                    placeholder="Ingredients, flavors, and serving style..."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Dish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
