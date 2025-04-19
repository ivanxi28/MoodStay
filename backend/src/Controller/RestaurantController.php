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

    // Move the generate route before the {id} route
    #[Route('/api/restaurants/generate', name: 'generate_restaurants', methods: ['GET'])]
    public function generateRestaurants(): Response
    {
        // Sample cuisine types
        $cuisineTypes = ['Italian', 'Spanish', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'French', 'American', 'Greek', 'Thai'];
        
        // Sample cities
        $cities = ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Malaga'];
        
        // Create 10 sample restaurants
        for ($i = 0; $i < 10; $i++) {
            $restaurant = new Restaurant();
            $restaurant->setName('Restaurant ' . ($i + 1) . ' ' . $cuisineTypes[$i]);
            $restaurant->setDescription('This is a sample ' . $cuisineTypes[$i] . ' restaurant with delicious food and great atmosphere.');
            $restaurant->setAddress('Calle Principal ' . ($i + 10));
            $restaurant->setCity($cities[array_rand($cities)]);
            $restaurant->setCountry('Spain');
            $restaurant->setPostalCode('28' . str_pad($i, 3, '0', STR_PAD_LEFT));
            $restaurant->setPhone('+34 91' . rand(1000000, 9999999));
            $restaurant->setEmail('contact@restaurant' . ($i + 1) . '.com');
            $restaurant->setWebsite('https://restaurant' . ($i + 1) . '.com');
            $restaurant->setLatitude((40 + ($i * 0.01)) . '');
            $restaurant->setLongitude((-3 - ($i * 0.01)) . '');
            $restaurant->setCuisine($cuisineTypes[$i]);
            $restaurant->setRating((rand(30, 50) / 10) . '');
            $restaurant->setPriceRange((rand(15, 50)) . '');
            
            // Sample opening hours
            $restaurant->setOpeningHours([
                'monday' => ['12:00-16:00', '20:00-23:30'],
                'tuesday' => ['12:00-16:00', '20:00-23:30'],
                'wednesday' => ['12:00-16:00', '20:00-23:30'],
                'thursday' => ['12:00-16:00', '20:00-23:30'],
                'friday' => ['12:00-16:00', '20:00-00:30'],
                'saturday' => ['12:00-16:00', '20:00-00:30'],
                'sunday' => ['12:00-16:00', '20:00-23:00'],
            ]);
            
            // Sample images
            $restaurant->setImages([
                'https://example.com/restaurants/restaurant' . ($i + 1) . '/image1.jpg',
                'https://example.com/restaurants/restaurant' . ($i + 1) . '/image2.jpg',
                'https://example.com/restaurants/restaurant' . ($i + 1) . '/image3.jpg',
            ]);
            
            $restaurant->setIsActive(true);
            
            $this->entityManager->persist($restaurant);
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'message' => '10 sample restaurants have been created successfully',
            'count' => 10
        ]);
    }

    #[Route('/api/restaurants', name: 'get_all_restaurants', methods: ['GET'])]
    public function getAllRestaurants(): Response
    {
        $restaurants = $this->restaurantRepository->findBy(['isActive' => true]);
        
        $restaurantsData = [];
        foreach ($restaurants as $restaurant) {
            $restaurantData = [
                'id' => $restaurant->getId(),
                'name' => $restaurant->getName(),
                'description' => $restaurant->getDescription(),
                'address' => $restaurant->getAddress(),
                'city' => $restaurant->getCity(),
                'country' => $restaurant->getCountry(),
                'cuisine' => $restaurant->getCuisine(),
                'priceRange' => $restaurant->getPriceRange(),
            ];
            
            // Añadir imagen destacada si está disponible
            $featuredImage = $restaurant->getFeaturedImage();
            if ($featuredImage) {
                $restaurantData['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/restaurants/' . $featuredImage->getFilename();
            }
            
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

            if (empty($name) || empty($cuisine)) {
                return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
            }

            $restaurant = new Restaurant();
            // ... configuración básica del restaurante ...

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

                            if (count($restaurant->getImages()) === 0 || $image->isFeatured()) {
                                $image->setIsFeatured(true);
                                foreach ($restaurant->getImages() as $existingImage) {
                                    $existingImage->setIsFeatured(false);
                                }
                            }

                            $entityManager->persist($image);
                            $restaurant->addImage($image);
                        } catch (FileException $e) {
                            return $this->json(['error' => 'Error uploading image: ' . $e->getMessage()], Response::HTTP_BAD_REQUEST);
                        }
                    }
                }
            }

            $entityManager->persist($restaurant);
            $entityManager->flush();

            // ... resto del código de respuesta ...
        } catch (\Exception $e) {
            return $this->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}