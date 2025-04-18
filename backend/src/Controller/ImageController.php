<?php

namespace App\Controller;

use App\Entity\Image;
use App\Entity\Accommodation;
use App\Entity\Experience;
use App\Entity\Restaurant;
use App\Repository\AccommodationRepository;
use App\Repository\ExperienceRepository;
use App\Repository\RestaurantRepository;
use App\Repository\ImageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Uid\Uuid;

class ImageController extends AbstractController
{
    private $entityManager;
    private $imageRepository;
    private $accommodationRepository;
    private $experienceRepository;
    private $restaurantRepository;
    private $slugger;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        ImageRepository $imageRepository,
        AccommodationRepository $accommodationRepository,
        ExperienceRepository $experienceRepository,
        RestaurantRepository $restaurantRepository,
        SluggerInterface $slugger
    ) {
        $this->entityManager = $entityManager;
        $this->imageRepository = $imageRepository;
        $this->accommodationRepository = $accommodationRepository;
        $this->experienceRepository = $experienceRepository;
        $this->restaurantRepository = $restaurantRepository;
        $this->slugger = $slugger;
    }
    
    #[Route('/api/accommodations/{id}/images', name: 'upload_accommodation_image', methods: ['POST'])]
    public function uploadAccommodationImage(Request $request, string $id): Response
    {
        try {
            $accommodationId = Uuid::fromString($id);
            $accommodation = $this->accommodationRepository->find($accommodationId);
            
            if (!$accommodation) {
                return $this->json(['error' => 'Accommodation not found'], Response::HTTP_NOT_FOUND);
            }
            
            return $this->handleImageUpload($request, $accommodation, null, null);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    
    #[Route('/api/experiences/{id}/images', name: 'upload_experience_image', methods: ['POST'])]
    public function uploadExperienceImage(Request $request, string $id): Response
    {
        try {
            $experienceId = Uuid::fromString($id);
            $experience = $this->experienceRepository->find($experienceId);
            
            if (!$experience) {
                return $this->json(['error' => 'Experience not found'], Response::HTTP_NOT_FOUND);
            }
            
            return $this->handleImageUpload($request, null, $experience, null);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    
    #[Route('/api/restaurants/{id}/images', name: 'upload_restaurant_image', methods: ['POST'])]
    public function uploadRestaurantImage(Request $request, string $id): Response
    {
        try {
            $restaurantId = Uuid::fromString($id);
            $restaurant = $this->restaurantRepository->find($restaurantId);
            
            if (!$restaurant) {
                return $this->json(['error' => 'Restaurant not found'], Response::HTTP_NOT_FOUND);
            }
            
            return $this->handleImageUpload($request, null, null, $restaurant);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    
    private function handleImageUpload(
        Request $request, 
        ?Accommodation $accommodation = null, 
        ?Experience $experience = null, 
        ?Restaurant $restaurant = null
    ): Response {
        $uploadedFile = $request->files->get('image');
        
        if (!$uploadedFile) {
            return $this->json(['error' => 'No image file uploaded'], Response::HTTP_BAD_REQUEST);
        }
        
        $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $newFilename = $safeFilename.'-'.uniqid().'.'.$uploadedFile->guessExtension();
        
        // Determine the upload directory based on entity type
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/';
        if ($accommodation) {
            $uploadDir .= 'accommodations/';
            $entityType = 'accommodation';
        } elseif ($experience) {
            $uploadDir .= 'experiences/';
            $entityType = 'experience';
        } elseif ($restaurant) {
            $uploadDir .= 'restaurants/';
            $entityType = 'restaurant';
        }
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Move the file to the directory
        try {
            $uploadedFile->move($uploadDir, $newFilename);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to upload image: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        
        // Create new image entity
        $image = new Image();
        $image->setFilename($newFilename);
        $image->setAlt($request->request->get('alt', $originalFilename));
        $image->setIsFeatured($request->request->get('isFeatured', false));
        
        // Associate with the correct entity
        if ($accommodation) {
            $image->setAccommodation($accommodation);
            $accommodation->addImage($image);
        } elseif ($experience) {
            $image->setExperience($experience);
            $experience->addImage($image);
        } elseif ($restaurant) {
            $image->setRestaurant($restaurant);
            $restaurant->addImage($image);
        }
        
        $this->entityManager->persist($image);
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'image' => [
                'id' => $image->getId(),
                'filename' => $image->getFilename(),
                'alt' => $image->getAlt(),
                'isFeatured' => $image->isFeatured(),
                'url' => '/uploads/' . $entityType . 's/' . $image->getFilename()
            ]
        ], Response::HTTP_CREATED);
    }
    
    #[Route('/api/images/{id}/featured', name: 'set_image_featured', methods: ['PATCH'])]
    public function setImageFeatured(string $id): Response
    {
        try {
            $imageId = Uuid::fromString($id);
            $image = $this->imageRepository->find($imageId);
            
            if (!$image) {
                return $this->json(['error' => 'Image not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Determine which entity this image belongs to
            $entity = null;
            $images = null;
            
            if ($image->getAccommodation()) {
                $entity = $image->getAccommodation();
                $images = $entity->getImages();
            } elseif ($image->getExperience()) {
                $entity = $image->getExperience();
                $images = $entity->getImages();
            } elseif ($image->getRestaurant()) {
                $entity = $image->getRestaurant();
                $images = $entity->getImages();
            }
            
            if (!$entity) {
                return $this->json(['error' => 'Image is not associated with any entity'], Response::HTTP_BAD_REQUEST);
            }
            
            // Unset featured flag for all other images
            foreach ($images as $otherImage) {
                if ($otherImage->getId() != $image->getId()) {
                    $otherImage->setIsFeatured(false);
                }
            }
            
            // Set this image as featured
            $image->setIsFeatured(true);
            
            $this->entityManager->flush();
            
            return $this->json([
                'success' => true,
                'message' => 'Image set as featured successfully'
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    
    #[Route('/api/images/{id}', name: 'delete_image', methods: ['DELETE'])]
    public function deleteImage(string $id): Response
    {
        try {
            $imageId = Uuid::fromString($id);
            $image = $this->imageRepository->find($imageId);
            
            if (!$image) {
                return $this->json(['error' => 'Image not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Determine the upload directory based on entity type
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/';
            if ($image->getAccommodation()) {
                $uploadDir .= 'accommodations/';
            } elseif ($image->getExperience()) {
                $uploadDir .= 'experiences/';
            } elseif ($image->getRestaurant()) {
                $uploadDir .= 'restaurants/';
            }
            
            // Delete the file from the filesystem
            $filePath = $uploadDir . $image->getFilename();
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            // Remove the image from the database
            $this->entityManager->remove($image);
            $this->entityManager->flush();
            
            return $this->json([
                'success' => true,
                'message' => 'Image deleted successfully'
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}