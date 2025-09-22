import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PaperClipIcon, PencilIcon, TrashIcon, HeartIcon } from "@heroicons/react/24/solid";
import toast from 'react-hot-toast';

function ResourceOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteResources')) || [];
    setIsFavorite(favorites.includes(id));

    const fetchResource = async () => {
      try {
const response = await axios.get(`http://localhost:5000/api/resources/${id}`);
const foundResource = response.data;
        if (foundResource) {
          setResource(foundResource);
        } else {
          setError("Resource not found.");
        }
      } catch (err) {
        setError("Failed to fetch resource details.");
        console.error("Error fetching resource:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteResources')) || [];
    let updatedFavorites;

    if (favorites.includes(id)) {
      updatedFavorites = favorites.filter(favId => favId !== id);
    } else {
      updatedFavorites = [...favorites, id];
    }
    
    localStorage.setItem('favoriteResources', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${resource.name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/resources/${id}`);
        toast.success("Resource deleted successfully!");
        navigate('/dashboard/resources'); 
      } catch (err) {
        toast.error("Failed to delete resource. Please try again.");
        console.error("Error deleting resource:", err);
      }
    }
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading resource details...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 font-second">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-main text-gray-800">{resource.name}</h1>
        <div className="flex items-center space-x-2">
          <button onClick={handleToggleFavorite} title="Add to Favorites" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <HeartIcon className={`h-6 w-6 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
          </button>
          <button onClick={handleDelete} title="Delete Resource" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <TrashIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><PaperClipIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Files</h2>
        <ul className="space-y-2">
          {resource.files.map((file) => (
            <li key={file._id} className="flex items-center text-blue-500 hover:underline">
              <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
                {file.fileName}
              </a>
              <span className="ml-auto text-sm text-gray-500">{file.fileType}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ResourceOverview;