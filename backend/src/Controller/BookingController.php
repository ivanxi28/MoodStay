<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Repository\BookingRepository;
use App\Repository\ExperienceRepository;
use App\Repository\AccommodationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Uid\Uuid;  // Add this line

class BookingController extends AbstractController
{
    private $entityManager;
    private $bookingRepository;
    private $experienceRepository;
    private $accommodationBookingRepository;
    private $accommodationRepository;
    private $security;

    public function __construct(
        EntityManagerInterface $entityManager,
        BookingRepository $bookingRepository,
        ExperienceRepository $experienceRepository,
        AccommodationRepository $accommodationRepository,
        Security $security
    ) {
        $this->entityManager = $entityManager;
        $this->bookingRepository = $bookingRepository;
        $this->experienceRepository = $experienceRepository;
        $this->accommodationRepository = $accommodationRepository;
        $this->security = $security;
    }

    #[Route('/api/user/bookings', name: 'get_user_bookings', methods: ['GET'])]
    public function getUserBookings(): Response
    {
        // Get the currently logged-in user
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Find all bookings for the current user
        $bookings = $this->bookingRepository->findBy(['user' => $user]);
        
        $bookingsData = [];
        foreach ($bookings as $booking) {
            $experience = $booking->getExperience();
            
            $bookingsData[] = [
                'id' => $booking->getId(),
                'bookingDate' => $booking->getBookingDate()->format('Y-m-d H:i:s'),
                'numberOfParticipants' => $booking->getNumberOfParticipants(),
                'totalPrice' => $booking->getTotalPrice(),
                'status' => $booking->getStatus(),
                'experience' => [
                    'id' => $experience->getId(),
                    'title' => $experience->getTitle(),
                    'description' => $experience->getDescription(),
                    'city' => $experience->getCity(),
                    'country' => $experience->getCountry(),
                    'price' => $experience->getPrice(),
                    'category' => $experience->getCategory(),
                ]
            ];
        }
        
        return $this->json($bookingsData);
    }


    

    #[Route('/api/bookings', name: 'create_booking', methods: ['POST'])]
    public function createBooking(Request $request): Response
    {
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        $data = json_decode($request->getContent(), true);
        
        // Validate required fields for both experience and accommodation bookings
        if (isset($data['experienceId'])) {
            // Experience booking logic
            if (!isset($data['numberOfParticipants']) || !isset($data['bookingDate'])) {
                return $this->json(['error' => 'Missing required fields for experience booking'], Response::HTTP_BAD_REQUEST);
            }
            
            try {
                $experienceId = $this->formatUuid($data['experienceId']);
                $experience = $this->experienceRepository->find($experienceId);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => 'Invalid experience ID format'], Response::HTTP_BAD_REQUEST);
            }
            
            if (!$experience) {
                return $this->json(['error' => 'Experience not found'], Response::HTTP_NOT_FOUND);
            }
            
            if ($data['numberOfParticipants'] <= 0 || $data['numberOfParticipants'] > $experience->getMaxParticipants()) {
                return $this->json([
                    'error' => 'Invalid number of participants',
                    'maxParticipants' => $experience->getMaxParticipants()
                ], Response::HTTP_BAD_REQUEST);
            }
            
            $booking = new Booking();
            $booking->setUser($user);
            $booking->setExperience($experience);
            $booking->setGuestCount($data['numberOfParticipants']);
            // Set both check-in and check-out dates for experience bookings
            $booking->setCheckInDate(new \DateTime($data['bookingDate']));
            $booking->setCheckOutDate(new \DateTime($data['bookingDate'])); // Same day for experiences
            $booking->setRooms(0); // Default value for experiences
            $booking->setTotalPrice($experience->getPrice() * $data['numberOfParticipants']);
            $booking->setStatus('confirmed');
            $booking->setPaymentStatus('paid');
            $booking->setNotes(null); // Add this line
        } elseif (isset($data['accommodationId'])) {
            // Accommodation booking logic
            if (!isset($data['checkInDate']) || !isset($data['checkOutDate']) || !isset($data['totalGuestCount'])) {
                return $this->json(['error' => 'Missing required fields for accommodation booking'], Response::HTTP_BAD_REQUEST);
            }
            
            try {
                $accommodationId = $this->formatUuid($data['accommodationId']);
                $accommodation = $this->accommodationRepository->find($accommodationId);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => 'Invalid accommodation ID format'], Response::HTTP_BAD_REQUEST);
            }
            
            if (!$accommodation) {
                return $this->json(['error' => 'Accommodation not found'], Response::HTTP_NOT_FOUND);
            }
            
            $booking = new Booking();
            $booking->setUser($user);
            $booking->setAccommodation($accommodation);
            $booking->setCheckInDate(new \DateTime($data['checkInDate']));
            $booking->setCheckOutDate(new \DateTime($data['checkOutDate']));
            $booking->setRooms($data['rooms']);
            $booking->setGuestCount($data['totalGuestCount']);
            $booking->setPaymentStatus('paid');
            $booking->setNotes($data['notes']); 
            
            // Use the total price from frontend instead of calculating it
            if (isset($data['totalPrice'])) {
                $booking->setTotalPrice($data['totalPrice']);
            } else {
                // Fallback calculation if totalPrice is not provided
                $nights = (new \DateTime($data['checkInDate']))->diff(new \DateTime($data['checkOutDate']))->days;
                $totalPrice = $accommodation->getPricePerNight() * $nights * $data['rooms'];
                $booking->setTotalPrice($totalPrice);
            }
            
            $booking->setStatus('confirmed');
        } elseif (isset($data['restaurantId'])) {
            // Restaurant booking logic
            if (!isset($data['reservationDate']) || !isset($data['reservationTime']) || !isset($data['guestCount'])) {
                return $this->json(['error' => 'Missing required fields for restaurant booking'], Response::HTTP_BAD_REQUEST);
            }
            
            try {
                $restaurantId = $this->formatUuid($data['restaurantId']);
                $restaurant = $this->entityManager->getRepository(\App\Entity\Restaurant::class)->find($restaurantId);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => 'Invalid restaurant ID format'], Response::HTTP_BAD_REQUEST);
            }
            
            if (!$restaurant) {
                return $this->json(['error' => 'Restaurant not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Create a datetime from the date and time
            $reservationDateTime = new \DateTime($data['reservationDate'] . ' ' . $data['reservationTime']);
            
            $booking = new Booking();
            $booking->setUser($user);
            $booking->setRestaurant($restaurant);
            $booking->setCheckInDate($reservationDateTime);
            $booking->setCheckOutDate($reservationDateTime); // Same datetime for restaurants
            $booking->setGuestCount($data['guestCount']);
            $booking->setPaymentStatus('paid');
            $booking->setRooms(0);
            $booking->setNotes($data['notes']); // Default value for restaurants (table count)
            
            // Set price if available or use a default calculation
            if (isset($data['totalPrice'])) {
                $booking->setTotalPrice($data['totalPrice']);
            } else {
                // You might want to calculate based on restaurant's average price per person
                $pricePerPerson = $restaurant->getAveragePrice() ?? 25; // Default if not available
                $booking->setTotalPrice($pricePerPerson * $data['guestCount']);
            }
            
            $booking->setStatus('confirmed');
            $booking->setPaymentStatus('paid'); // Usually paid at the restaurant
        } else {
            return $this->json(['error' => 'Must specify either experienceId, accommodationId, or restaurantId'], Response::HTTP_BAD_REQUEST);
        }
        
        $this->entityManager->persist($booking);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Booking created successfully',
            'bookingId' => $booking->getId(),
            'totalPrice' => $booking->getTotalPrice()
        ], Response::HTTP_CREATED);
    }

    

    #[Route('/api/bookings/{id}', name: 'cancel_booking', methods: ['DELETE'])]
    public function cancelBooking(string $id): Response
    {
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Check if the booking belongs to the current user
        if ($booking->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }
        
        // Instead of deleting, set status to cancelled
        $booking->setStatus('cancelled');
        $this->entityManager->flush();
        
        return $this->json(['message' => 'Booking cancelled successfully']);
    }

    #[Route('/api/bookings/payment-status/update', name: 'update_booking_payment_status', methods: ['PATCH'])]
    public function updateBookingPaymentStatus(Request $request): Response
    {
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['paymentStatus'])) {
            return $this->json(['error' => 'Payment status is required'], Response::HTTP_BAD_REQUEST);
        }
        
        // Validate payment status
        $validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!in_array($data['paymentStatus'], $validStatuses)) {
            return $this->json([
                'error' => 'Invalid payment status',
                'validStatuses' => $validStatuses
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Find booking by accommodation, experience, or restaurant ID
        $booking = null;
        
        if (isset($data['accommodationId'])) {
            try {
                $accommodationId = $this->formatUuid($data['accommodationId']);
                $accommodation = $this->accommodationRepository->find($accommodationId);
                
                if (!$accommodation) {
                    return $this->json(['error' => 'Accommodation not found'], Response::HTTP_NOT_FOUND);
                }
                
                $booking = $this->bookingRepository->findOneBy([
                    'user' => $user,
                    'accommodation' => $accommodation
                ]);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => 'Invalid accommodation ID format'], Response::HTTP_BAD_REQUEST);
            }
        } elseif (isset($data['experienceId'])) {
            try {
                $experienceId = $this->formatUuid($data['experienceId']);
                $experience = $this->experienceRepository->find($experienceId);
                
                if (!$experience) {
                    return $this->json(['error' => 'Experience not found'], Response::HTTP_NOT_FOUND);
                }
                
                $booking = $this->bookingRepository->findOneBy([
                    'user' => $user,
                    'experience' => $experience
                ]);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => 'Invalid experience ID format'], Response::HTTP_BAD_REQUEST);
            }
        } elseif (isset($data['restaurantId'])) {
            try {
                $restaurantId = $this->formatUuid($data['restaurantId']);
                $restaurant = $this->entityManager->getRepository(\App\Entity\Restaurant::class)->find($restaurantId);
                
                if (!$restaurant) {
                    return $this->json(['error' => 'Restaurant not found'], Response::HTTP_NOT_FOUND);
                }
                
                $booking = $this->bookingRepository->findOneBy([
                    'user' => $user,
                    'restaurant' => $restaurant
                ]);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => 'Invalid restaurant ID format'], Response::HTTP_BAD_REQUEST);
            }
        } else {
            return $this->json(['error' => 'Must specify either accommodationId, experienceId, or restaurantId'], Response::HTTP_BAD_REQUEST);
        }
        
        if (!$booking) {
            return $this->json(['error' => 'No booking found for this user and accommodation/experience/restaurant'], Response::HTTP_NOT_FOUND);
        }
        
        // Update payment status
        $booking->setPaymentStatus($data['paymentStatus']);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Payment status updated successfully',
            'bookingId' => $booking->getId(),
            'paymentStatus' => $booking->getPaymentStatus()
        ]);
    }

    #[Route('/api/users/{userId}/bookings', name: 'get_specific_user_bookings', methods: ['GET'])]
    public function getUserBookingsById(string $userId): Response
    {
        // Check if current user is admin or the requested user
        $currentUser = $this->security->getUser();
        
        if (!$currentUser) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Format UUID
        try {
            $userUuid = $this->formatUuid($userId);
            
            // Get user repository and find the user
            $userRepository = $this->entityManager->getRepository(\App\Entity\User::class);
            $user = $userRepository->find($userUuid);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Check permissions - only allow if current user is the requested user or has ROLE_ADMIN
            if ($currentUser->getId() != $user->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
                return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }
            
            // Find all bookings for the specified user
            $bookings = $this->bookingRepository->findBy(['user' => $user]);
            
            $bookingsData = [];
            foreach ($bookings as $booking) {
                $bookingData = [
                    'id' => $booking->getId(),
                    'checkInDate' => $booking->getCheckInDate()->format('Y-m-d'),
                    'checkOutDate' => $booking->getCheckOutDate()->format('Y-m-d'),
                    'guestCount' => $booking->getGuestCount(),
                    'rooms' => $booking->getRooms(),
                    'totalPrice' => $booking->getTotalPrice(),
                    'status' => $booking->getStatus(),
                    'paymentStatus' => $booking->getPaymentStatus(),
                    'notes' => $booking->getNotes(),
                ];
                
                // En el método getUserBookingsById, modifica las secciones donde se añaden los datos de accommodation, experience y restaurant:
                
                // Add accommodation data if present
                if ($booking->getAccommodation()) {
                    $accommodation = $booking->getAccommodation();
                    $bookingData['accommodation'] = [
                        'id' => $accommodation->getId(),
                        'title' => $accommodation->getTitle(),
                        'description' => $accommodation->getDescription(),
                        'city' => $accommodation->getCity(),
                        'country' => $accommodation->getCountry(),
                        'pricePerNight' => $accommodation->getPricePerNight(),
                        
                    ];
                    
                    // Add featured image if available
                    $featuredImage = $accommodation->getFeaturedImage();
                    if ($featuredImage) {
                        $bookingData['accommodation']['featuredImage'] = '/uploads/accommodations/' . $featuredImage->getFilename();
                    }
                }
                
                // Add experience data if present
                if ($booking->getExperience()) {
                    $experience = $booking->getExperience();
                    $bookingData['experience'] = [
                        'id' => $experience->getId(),
                        'title' => $experience->getTitle(),
                        'description' => $experience->getDescription(),
                        'city' => $experience->getCity(),
                        'country' => $experience->getCountry(),
                        'price' => $experience->getPrice(),
                        'category' => $experience->getCategory(),
                    ];
                    
                    // Add featured image if available
                    $featuredImage = $experience->getFeaturedImage();
                    if ($featuredImage) {
                        $bookingData['experience']['featuredImage'] = '/uploads/experiences/' . $featuredImage->getFilename();
                    }
                }
                
                // Add restaurant data if present
                if ($booking->getRestaurant()) {
                    $restaurant = $booking->getRestaurant();
                    $bookingData['restaurant'] = [
                        'id' => $restaurant->getId(),
                        'name' => $restaurant->getName(),
                        'description' => $restaurant->getDescription(),
                        'city' => $restaurant->getCity(),
                        'country' => $restaurant->getCountry(),
                        'averagePrice' => $restaurant->getPriceRange(),
                        'cuisine' => $restaurant->getCuisine(),
                        
                    ];
                    
                    // Add featured image if available
                    $featuredImage = $restaurant->getFeaturedImage();
                    if ($featuredImage) {
                        $bookingData['restaurant']['featuredImage'] = '/uploads/restaurants/' . $featuredImage->getFilename();
                    }
                }
                
                $bookingsData[] = $bookingData;
            }
            
            return $this->json($bookingsData);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Invalid user ID format',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
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
