<?php

namespace App\Controller;

use App\Entity\Image;
use App\Entity\Restaurant;
use App\Repository\RestaurantRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Uid\Uuid;

class RestaurantController extends AbstractController
{
    private $restaurantRepository;
    private $entityManager;

    public function __construct(
        RestaurantRepository $restaurantRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->restaurantRepository = $restaurantRepository;
        $this->entityManager = $entityManager;
    }

    
    #[Route('/api/restaurants', name: 'get_all_restaurants', methods: ['GET'])]
    public function getAllRestaurants(): Response
    {
        $restaurants = $this->restaurantRepository->findBy(['isActive' => true]);
    
        $restaurantsData = [];
        foreach ($restaurants as $restaurant) {
            $imagesData = [];
            foreach ($restaurant->getImages() as $image) {
                $imagesData[] = [
                    'id' => $image->getId(),
                    'filename' => $this->getParameter('app.base_url') . '/uploads/restaurants/' . $image->getFilename(),
                    'alt' => $image->getAlt(),
                    'isFeatured' => $image->isFeatured(),
                ];
            }
    
            $restaurantData = [
                'id' => $restaurant->getId(),
                'name' => $restaurant->getName(),
                'description' => $restaurant->getDescription(),
                'address' => $restaurant->getAddress(),
                'city' => $restaurant->getCity(),
                'country' => $restaurant->getCountry(),
                'cuisine' => $restaurant->getCuisine(),
                'priceRange' => $restaurant->getPriceRange(),
                'images' => $imagesData, // Añademos el array de imágenes
            ];
    
            $restaurantsData[] = $restaurantData;
        }
    
        return $this->json($restaurantsData);
    }
    // This route should come after the more specific routes
    #[Route('/api/restaurants/{id}', name: 'get_restaurant', methods: ['GET'])]
public function getRestaurant(string $id): Response
{
    try {
        // Handle UUID conversion
        $restaurantId = str_replace('0x', '', $id);

        // If it's a raw hex string (32 chars), format it as a proper UUID
        if (strlen($restaurantId) === 32) {
            $restaurantId = substr($restaurantId, 0, 8) . '-' .
                substr($restaurantId, 8, 4) . '-' .
                substr($restaurantId, 12, 4) . '-' .
                substr($restaurantId, 16, 4) . '-' .
                substr($restaurantId, 20, 12);
        }

        $restaurantId = Uuid::fromString($restaurantId);
        $restaurant = $this->restaurantRepository->find($restaurantId);

        if (!$restaurant) {
            return $this->json(['error' => 'Restaurant not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$restaurant->isIsActive()) {
            return $this->json(['error' => 'Restaurant is not active'], Response::HTTP_NOT_FOUND);
        }

        $imagesData = [];
        foreach ($restaurant->getImages() as $image) {
            $imagesData[] = [
                'id' => $image->getId(),
                'url' => $this->getParameter('app.base_url') . '/uploads/restaurants/' . $image->getFilename(),
                'alt' => $image->getAlt(),
                'isFeatured' => $image->isFeatured()
            ];
        }

        $restaurantData = [
            'id' => $restaurant->getId(),
            'name' => $restaurant->getName(),
            'description' => $restaurant->getDescription(),
            'address' => $restaurant->getAddress(),
            'city' => $restaurant->getCity(),
            'country' => $restaurant->getCountry(),
            'postalCode' => $restaurant->getPostalCode(),
            'phone' => $restaurant->getPhone(),
            'email' => $restaurant->getEmail(),
            'website' => $restaurant->getWebsite(),
            'latitude' => $restaurant->getLatitude(),
            'longitude' => $restaurant->getLongitude(),
            'cuisine' => $restaurant->getCuisine(),
            'priceRange' => $restaurant->getPriceRange(),
            'openingHours' => $restaurant->getOpeningHours(),
            'createdAt' => $restaurant->getCreatedAt()->format('Y-m-d H:i:s'),
            'images' => $imagesData, // Añadimos el array de imágenes
        ];

        // Añadir imagen destacada
        $featuredImage = $restaurant->getFeaturedImage();
        if ($featuredImage) {
            $restaurantData['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/restaurants/' . $featuredImage->getFilename();
        }

        return $this->json($restaurantData);

    } catch (\InvalidArgumentException $e) {
        return $this->json(['error' => 'Invalid restaurant ID format'], Response::HTTP_BAD_REQUEST);
    }
}

    #[Route('/api/restaurants', name: 'create_restaurant', methods: ['POST'])]
    public function createRestaurant(Request $request, EntityManagerInterface $entityManager, SluggerInterface $slugger): Response
    {
        try {
            // Validar datos requeridos del formulario
            $name = $request->request->get('name');
            $cuisine = $request->request->get('cuisine');
            // Add more required fields if necessary
            $address = $request->request->get('address');
            $city = $request->request->get('city');
            $country = $request->request->get('country');

            if (empty($name) || empty($cuisine) || empty($address) || empty($city) || empty($country)) {
                return $this->json(['error' => 'Missing required fields: name, cuisine, address, city, country are required.'], Response::HTTP_BAD_REQUEST);
            }

            $restaurant = new Restaurant();
            // Set basic restaurant properties from the request
            $restaurant->setName($name);
            $restaurant->setDescription($request->request->get('description', '')); // Provide default if optional
            $restaurant->setAddress($address);
            $restaurant->setCity($city);
            $restaurant->setCountry($country);
            $restaurant->setPostalCode($request->request->get('postalCode', '')); // Provide default if optional
            $restaurant->setPhone($request->request->get('phone', '')); // Provide default if optional
            $restaurant->setEmail($request->request->get('email', '')); // Provide default if optional
            $restaurant->setWebsite($request->request->get('website', '')); // Provide default if optional
            $restaurant->setLatitude((float)$request->request->get('latitude', 0.0)); // Cast to float, provide default
            $restaurant->setLongitude((float)$request->request->get('longitude', 0.0)); // Cast to float, provide default
            $restaurant->setCuisine($cuisine);
            $restaurant->setPriceRange($request->request->get('priceRange', '')); // Provide default if optional

            // Handle openingHours (assuming it's sent as a JSON string)
            $openingHoursJson = $request->request->get('openingHours');
            if ($openingHoursJson) {
                $openingHours = json_decode($openingHoursJson, true); // Decode JSON into an associative array
                if (json_last_error() === JSON_ERROR_NONE) {
                    $restaurant->setOpeningHours($openingHours);
                } else {
                    // Optionally handle JSON decoding errors
                    // return $this->json(['error' => 'Invalid openingHours format'], Response::HTTP_BAD_REQUEST);
                }
            }

            // Set default values or handle logic for createdAt, updatedAt, isActive
            $restaurant->setCreatedAtValue(new \DateTimeImmutable());
            $restaurant->setUpdatedAtValue(new \DateTimeImmutable());
            $restaurant->setIsActive(true); // Assuming new restaurants are active by default

            // Procesar imágenes subidas
            $imageFiles = $request->files->get('images');
            $uploadsDir = $this->getParameter('restaurants_directory'); // Cambiado a restaurants_directory

            if (!file_exists($uploadsDir)) {
                mkdir($uploadsDir, 0777, true);
            }

            if ($imageFiles && is_array($imageFiles)) {
                foreach ($imageFiles as $imageFile) {
                    if ($imageFile instanceof UploadedFile) {
                        $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
                        $safeFilename = $slugger->slug($originalFilename);
                        $newFilename = $safeFilename . '-' . uniqid() . '.' . $imageFile->guessExtension();

                        try {
                            $imageFile->move($uploadsDir, $newFilename);

                            $image = new Image(); // Asegúrate de importar la clase correcta
                            $image->setRestaurant($restaurant);
                            $image->setFilename($newFilename);
                            $image->setAlt($request->request->get("alt_" . $originalFilename) ?? '');
                            $image->setIsFeatured($request->request->getBoolean("isFeatured_" . $originalFilename) ?? false);

                            // Ensure only one image is featured, the first one or the explicitly marked one
                            if ($restaurant->getImages()->isEmpty() || $image->isFeatured()) {
                                foreach ($restaurant->getImages() as $existingImage) {
                                    $existingImage->setIsFeatured(false);
                                }
                                $image->setIsFeatured(true);
                            } elseif (!$restaurant->getFeaturedImage()) {
                                // If no image is featured yet and this isn't the first, make the first one featured
                                if (!$restaurant->getImages()->isEmpty()) {
                                     $restaurant->getImages()->first()->setIsFeatured(true);
                                }
                            }


                            $entityManager->persist($image);
                            $restaurant->addImage($image);
                        } catch (FileException $e) {
                            // Log the error details for debugging
                            error_log('Image upload error: ' . $e->getMessage());
                            return $this->json(['error' => 'Error uploading image.'], Response::HTTP_INTERNAL_SERVER_ERROR); // Use 500 for server errors
                        }
                    }
                }
                 // Ensure at least one image is featured if images were uploaded
                if (!$restaurant->getImages()->isEmpty() && !$restaurant->getFeaturedImage()) {
                    $restaurant->getImages()->first()->setIsFeatured(true);
                }
            }

            $entityManager->persist($restaurant);
            $entityManager->flush();

            // Return the created restaurant data (similar to getRestaurant)
             $restaurantData = [
                'id' => $restaurant->getId(),
                'name' => $restaurant->getName(),
                'description' => $restaurant->getDescription(),
                'address' => $restaurant->getAddress(),
                'city' => $restaurant->getCity(),
                'country' => $restaurant->getCountry(),
                'postalCode' => $restaurant->getPostalCode(),
                'phone' => $restaurant->getPhone(),
                'email' => $restaurant->getEmail(),
                'website' => $restaurant->getWebsite(),
                'latitude' => $restaurant->getLatitude(),
                'longitude' => $restaurant->getLongitude(),
                'cuisine' => $restaurant->getCuisine(),
                'priceRange' => $restaurant->getPriceRange(),
                'openingHours' => $restaurant->getOpeningHours(),
                'createdAt' => $restaurant->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
            
            // Añadir todas las imágenes si están disponibles
            $images = $restaurant->getImages();
            if ($images && count($images) > 0) {
                $restaurantData['images'] = [];
                foreach ($images as $image) {
                    $restaurantData['images'][] = [
                        'id' => $image->getId(),
                        'url' => $this->getParameter('app.base_url') . '/uploads/restaurants/' . $image->getFilename(),
                        'alt' => $image->getAlt(),
                        'isFeatured' => $image->isFeatured()
                    ];
                }
                
                // Añadir imagen destacada
                $featuredImage = $restaurant->getFeaturedImage();
                if ($featuredImage) {
                    $restaurantData['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/restaurants/' . $featuredImage->getFilename();
                }
            }
            
            return $this->json($restaurantData);
            
        } catch (\Exception $e) {
             // Log the exception for debugging purposes
            error_log('Error creating restaurant: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json([
                'error' => 'An unexpected error occurred while creating the restaurant.',
                // Optionally include more details in development environment
                // 'details' => $e->getMessage(),
                // 'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR); // Use 500 for general server errors
        }
    }
}