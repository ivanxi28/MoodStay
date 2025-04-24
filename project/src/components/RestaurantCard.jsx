import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function RestaurantCard({ restaurant }) {
    const { fetchRestaurantReviews } = useAppContext();
    const [averageRating, setAverageRating] = useState(restaurant?.rating || 0);
    const [reviewCount, setReviewCount] = useState(restaurant?.reviewCount || 0);

    const { id, name, address, city, country, cuisine, priceRange, openingHours, images, image } = restaurant;

    // Fetch reviews and calculate average rating
    useEffect(() => {
        const getReviewsAndCalculateAverage = async () => {
            try {
                if (!id) return;

                const reviews = await fetchRestaurantReviews(id);

                // Calculate number of reviews
                const count = reviews.length;

                // Calculate average rating
                let sum = 0;
                if (count > 0) {
                    sum = reviews.reduce((acc, review) => acc + review.rating, 0);
                    setAverageRating((sum / count).toFixed(1));
                    setReviewCount(count);
                } else {
                    setReviewCount(0);
                }

            } catch (error) {
                console.error('Error getting restaurant reviews:', error);
                // Keep default values in case of error
                setReviewCount(0);
            }
        };

        getReviewsAndCalculateAverage();
    }, [id, fetchRestaurantReviews]);

    // Use the first image from images array if available, otherwise use image property
    const displayImage = (images && images.length > 0) ? images[0].filename : image;

    // Determine location from address, city and country
    const location = address ? `${address}, ${city || ''}` : (city ? `${city}, ${country || ''}` : country || 'Location');

    // Determine price level from priceRange if available
    const determinePriceLevel = () => {
        if (!priceRange) return restaurant?.priceLevel; // Use restaurant?.priceLevel as fallback

        const price = parseFloat(priceRange);
        if (price <= 25) return '€';
        if (price <= 50) return '€€';
        return '€€€';
    };

    const displayPriceLevel = determinePriceLevel();

    // Function to render price level indicators
    const renderPriceLevel = (level) => {
        switch(level) {
            case '€':
                return <span className="text-gray-600">€ <span className="text-gray-300">€€</span></span>;
            case '€€':
                return <span className="text-gray-600">€€ <span className="text-gray-300">€</span></span>;
            case '€€€':
                return <span className="text-gray-600">€€€</span>;
            default:
                return <span className="text-gray-600">€€</span>;
        }
    };

    return (
        <Link
            to={`/restaurants/${id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
        >
            <div className="h-48 bg-gray-200 relative">
                <img
                    src={displayImage}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                {displayPriceLevel && (
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-sm font-medium">
                        {renderPriceLevel(displayPriceLevel)}
                    </div>
                )}
            </div>

            <div className="p-4 flex-grow flex flex-col">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>

                <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate">{location}</span>
                </div>

                <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 flex-shrink-0" />
                    <span>{averageRating}</span>
                    <span className="text-gray-500 text-sm ml-1">({reviewCount} reseñas)</span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">{openingHours}</span>
                </div>

                <div className="mt-auto pt-2 border-t border-gray-100">
                    <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                        {cuisine}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default RestaurantCard;