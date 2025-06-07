
import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Plus } from 'lucide-react';

interface FavoritesProps {
  onCitySelect: (cityName: string) => void;
}

interface FavoriteCity {
  id: string;
  name: string;
  addedAt: string;
}

const Favorites: React.FC<FavoritesProps> = ({ onCitySelect }) => {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const stored = localStorage.getItem('weatherFavorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const saveFavorites = (newFavorites: FavoriteCity[]) => {
    localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addFavorite = () => {
    if (!newCity.trim()) return;
    
    const newFavorite: FavoriteCity = {
      id: Date.now().toString(),
      name: newCity.trim(),
      addedAt: new Date().toISOString(),
    };

    const updated = [...favorites, newFavorite];
    saveFavorites(updated);
    setNewCity('');
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(fav => fav.id !== id);
    saveFavorites(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Heart className="w-6 h-6 text-red-500 mr-2" />
        Favorite Cities
      </h2>

      {/* Add New City */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Add a city to favorites..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addFavorite()}
          />
          <button
            onClick={addFavorite}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add
          </button>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No favorite cities yet</p>
          <p className="text-sm">Add cities above to quickly access their weather</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((city) => (
            <div key={city.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onCitySelect(city.name)}
                  className="flex-1 text-left"
                >
                  <h3 className="font-semibold text-lg hover:text-blue-600">{city.name}</h3>
                  <p className="text-sm text-gray-500">
                    Added {new Date(city.addedAt).toLocaleDateString()}
                  </p>
                </button>
                <button
                  onClick={() => removeFavorite(city.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
