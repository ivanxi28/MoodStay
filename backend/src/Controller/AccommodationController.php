<?php

namespace App\Controller;

use App\Entity\Accommodation;
use App\Repository\AccommodationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AccommodationController extends AbstractController
{
    private $entityManager;
    private $accommodationRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        AccommodationRepository $accommodationRepository
    ) {
        $this->entityManager = $entityManager;
        $this->accommodationRepository = $accommodationRepository;
    }

    #[Route('/api/accommodations', name: 'get_all_accommodations', methods: ['GET'])]
    public function getAllAccommodations(Request $request): Response
    {
        // Obtener todos los apartamentos
        $accommodations = $this->accommodationRepository->findAll();
        
        // Transformar los datos para la respuesta
        $accommodationsData = [];
        foreach ($accommodations as $accommodation) {
            $accommodationsData[] = [
                'id' => $accommodation->getId(),
                'title' => $accommodation->getTitle(),
                'description' => $accommodation->getDescription(),
                'type' => $accommodation->getType(),
                'pricePerNight' => $accommodation->getPricePerNight(),
                'locationLat' => $accommodation->getLocationLat(),
                'locationLng' => $accommodation->getLocationLng(),
                'address' => $accommodation->getAddress(),
                'city' => $accommodation->getCity(),
                'country' => $accommodation->getCountry(),
                'amenities' => $accommodation->getAmenities(),
                'maxGuest'=>$accommodation->getMaxGuests(),
                'host' => [
                    'id' => $accommodation->getHost()->getId(),
                    'firstName' => $accommodation->getHost()->getFirstName(),
                    'lastName' => $accommodation->getHost()->getLastName()
                ],
                'createdAt' => $accommodation->getCreatedAt() ? $accommodation->getCreatedAt()->format('Y-m-d H:i:s') : null
            ];
        }

        return $this->json($accommodationsData);
    }

    // Add this new method to your AccommodationController

    #[Route('/api/accommodations/{id}', name: 'get_accommodation', methods: ['GET'])]
    public function getAccommodation(string $id): Response
    {
        $accommodation = $this->accommodationRepository->find($id);
        
        if (!$accommodation) {
            return $this->json(['error' => 'Accommodation not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Transform the accommodation data for the response
        $accommodationData = [
            'id' => $accommodation->getId(),
            'title' => $accommodation->getTitle(),
            'description' => $accommodation->getDescription(),
            'type' => $accommodation->getType(),
            'pricePerNight' => $accommodation->getPricePerNight(),
            'locationLat' => $accommodation->getLocationLat(),
            'locationLng' => $accommodation->getLocationLng(),
            'address' => $accommodation->getAddress(),
            'city' => $accommodation->getCity(),
            'country' => $accommodation->getCountry(),
            'amenities' => $accommodation->getAmenities(),
            'maxGuest'=>$accommodation->getMaxGuests(),
            'host' => [
                'id' => $accommodation->getHost()->getId(),
                'firstName' => $accommodation->getHost()->getFirstName(),
                'lastName' => $accommodation->getHost()->getLastName()
            ],
            'createdAt' => $accommodation->getCreatedAt() ? $accommodation->getCreatedAt()->format('Y-m-d H:i:s') : null
        ];
        
        return $this->json($accommodationData);
    }

    
}