<?php

namespace App\Controller;

use App\Entity\Review;
use App\Entity\Accommodation;
use App\Entity\User;
use App\Repository\ReviewRepository;
use App\Repository\AccommodationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ReviewController extends AbstractController
{
    private $entityManager;
    private $reviewRepository;
    private $accommodationRepository;
    private $userRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        ReviewRepository $reviewRepository,
        AccommodationRepository $accommodationRepository,
        UserRepository $userRepository
    ) {
        $this->entityManager = $entityManager;
        $this->reviewRepository = $reviewRepository;
        $this->accommodationRepository = $accommodationRepository;
        $this->userRepository = $userRepository;
    }

    

    #[Route('/api/accommodations/{accommodationId}/reviews', name: 'get_accommodation_reviews', methods: ['GET'])]
    public function getAccommodationReviews(string $accommodationId): Response
    {
        try {
            // Remove the '0x' prefix if it exists
            if (strpos($accommodationId, '0x') === 0) {
                $accommodationId = substr($accommodationId, 2);
            }
            
            // Format the UUID string with dashes if it's a continuous string
            if (strlen($accommodationId) == 32) {
                $accommodationId = sprintf(
                    '%s-%s-%s-%s-%s',
                    substr($accommodationId, 0, 8),
                    substr($accommodationId, 8, 4),
                    substr($accommodationId, 12, 4),
                    substr($accommodationId, 16, 4),
                    substr($accommodationId, 20, 12)
                );
            }
            
            // Convert the string UUID to a proper Symfony\Component\Uid\Uuid object
            $uuid = \Symfony\Component\Uid\Uuid::fromString($accommodationId);
            $accommodation = $this->accommodationRepository->find($uuid);
            
            if (!$accommodation) {
                return $this->json(['error' => 'Accommodation not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Use direct query instead of repository method
            $reviews = $this->reviewRepository->findBy(['accommodation' => $accommodation]);
            
            // Debug information
            if (empty($reviews)) {
                return $this->json([
                    'message' => 'No reviews found for this accommodation',
                    'accommodationId' => $accommodation->getId()->toRfc4122(),
                    'accommodationTitle' => $accommodation->getTitle()
                ]);
            }
            
            $reviewsData = [];
            foreach ($reviews as $review) {
                $reviewsData[] = [
                    'id' => $review->getId(),
                    'rating' => $review->getRating(),
                    'comment' => $review->getComment(),
                    'user' => [
                        'id' => $review->getUser()->getId(),
                        'firstName' => $review->getUser()->getFirstName(),
                        'lastName' => $review->getUser()->getLastName()
                    ],
                    'createdAt' => $review->getCreatedAt() ? $review->getCreatedAt()->format('Y-m-d H:i:s') : null
                ];
            }
            
            return $this->json($reviewsData);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Invalid accommodation ID format',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/api/experiences/{experienceId}/reviews', name: 'get_experience_reviews', methods: ['GET'])]
    public function getExperienceReviews(string $experienceId): Response
    {
        try {
            $uuid = $this->formatUuid($experienceId);
            $experience = $this->entityManager->getRepository(\App\Entity\Experience::class)->find($uuid);
            
            if (!$experience) {
                return $this->json(['error' => 'Experience not found'], Response::HTTP_NOT_FOUND);
            }
            
            $reviews = $this->reviewRepository->findBy(['experience' => $experience]);
            
            if (empty($reviews)) {
                return $this->json([
                    'message' => 'No reviews found for this experience',
                    'experienceId' => $experience->getId()->toRfc4122(),
                    'experienceTitle' => $experience->getTitle()
                ]);
            }
            
            $reviewsData = [];
            foreach ($reviews as $review) {
                $reviewsData[] = [
                    'id' => $review->getId(),
                    'rating' => $review->getRating(),
                    'comment' => $review->getComment(),
                    'user' => [
                        'id' => $review->getUser()->getId(),
                        'firstName' => $review->getUser()->getFirstName(),
                        'lastName' => $review->getUser()->getLastName()
                    ],
                    'createdAt' => $review->getCreatedAt() ? $review->getCreatedAt()->format('Y-m-d H:i:s') : null
                ];
            }
            
            return $this->json($reviewsData);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Invalid experience ID format',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/api/restaurants/{restaurantId}/reviews', name: 'get_restaurant_reviews', methods: ['GET'])]
    public function getRestaurantReviews(string $restaurantId): Response
    {
        try {
            $uuid = $this->formatUuid($restaurantId);
            $restaurant = $this->entityManager->getRepository(\App\Entity\Restaurant::class)->find($uuid);
            
            if (!$restaurant) {
                return $this->json(['error' => 'Restaurant not found'], Response::HTTP_NOT_FOUND);
            }
            
            $reviews = $this->reviewRepository->findBy(['restaurant' => $restaurant]);
            
            if (empty($reviews)) {
                return $this->json([
                    'message' => 'No reviews found for this restaurant',
                    'restaurantId' => $restaurant->getId()->toRfc4122(),
                    'restaurantName' => $restaurant->getName()
                ]);
            }
            
            $reviewsData = [];
            foreach ($reviews as $review) {
                $reviewsData[] = [
                    'id' => $review->getId(),
                    'rating' => $review->getRating(),
                    'comment' => $review->getComment(),
                    'user' => [
                        'id' => $review->getUser()->getId(),
                        'firstName' => $review->getUser()->getFirstName(),
                        'lastName' => $review->getUser()->getLastName()
                    ],
                    'createdAt' => $review->getCreatedAt() ? $review->getCreatedAt()->format('Y-m-d H:i:s') : null
                ];
            }
            
            return $this->json($reviewsData);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Invalid restaurant ID format',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
    
    #[Route('/api/reviews', name: 'add_review', methods: ['POST'])]
    public function addReview(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        
        // Validate required fields
        if (!isset($data['rating']) || !isset($data['userId'])) {
            return $this->json(['error' => 'Rating and userId are required'], Response::HTTP_BAD_REQUEST);
        }
        
        // Check if at least one review target is provided
        if (!isset($data['accommodationId']) && !isset($data['experienceId']) && !isset($data['restaurantId'])) {
            return $this->json(['error' => 'You must specify accommodationId, experienceId, or restaurantId'], Response::HTTP_BAD_REQUEST);
        }
        
        // Find the user
        $user = $this->userRepository->find($data['userId']);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        
        $review = new Review();
        $review->setUser($user);
        $review->setRating($data['rating']);
        
        if (isset($data['comment'])) {
            $review->setComment($data['comment']);
        }
        
        // Handle accommodation review
        if (isset($data['accommodationId'])) {
            $accommodationId = $this->formatUuid($data['accommodationId']);
            $accommodation = $this->accommodationRepository->find($accommodationId);
            
            if (!$accommodation) {
                return $this->json(['error' => 'Accommodation not found'], Response::HTTP_NOT_FOUND);
            }
            
            $review->setAccommodation($accommodation);
        }
        
        // Handle experience review
        if (isset($data['experienceId'])) {
            $experienceId = $this->formatUuid($data['experienceId']);
            $experience = $this->entityManager->getRepository(\App\Entity\Experience::class)->find($experienceId);
            
            if (!$experience) {
                return $this->json(['error' => 'Experience not found'], Response::HTTP_NOT_FOUND);
            }
            
            $review->setExperience($experience);
        }
        
        // Handle restaurant review
        if (isset($data['restaurantId'])) {
            $restaurantId = $this->formatUuid($data['restaurantId']);
            $restaurant = $this->entityManager->getRepository(\App\Entity\Restaurant::class)->find($restaurantId);
            
            if (!$restaurant) {
                return $this->json(['error' => 'Restaurant not found'], Response::HTTP_NOT_FOUND);
            }
            
            $review->setRestaurant($restaurant);
        }
        
        $this->entityManager->persist($review);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Review added successfully',
            'reviewId' => $review->getId()
        ], Response::HTTP_CREATED);
    }
    
    // Helper method to format UUID strings
    private function formatUuid(string $id): \Symfony\Component\Uid\Uuid
    {
        // Remove the '0x' prefix if it exists
        if (strpos($id, '0x') === 0) {
            $id = substr($id, 2);
        }
        
        // Format the UUID string with dashes if it's a continuous string
        if (strlen($id) == 32) {
            $id = sprintf(
                '%s-%s-%s-%s-%s',
                substr($id, 0, 8),
                substr($id, 8, 4),
                substr($id, 12, 4),
                substr($id, 16, 4),
                substr($id, 20, 12)
            );
        }
        
        // Convert the string UUID to a proper Symfony\Component\Uid\Uuid object
        return \Symfony\Component\Uid\Uuid::fromString($id);
    }
    
    
}