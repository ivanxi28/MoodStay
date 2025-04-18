<?php

namespace App\Controller;

use App\Entity\Accommodation;
use App\Repository\AccommodationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use App\Repository\UserRepository;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use App\Entity\AccommodationImage;
use Symfony\Component\Uid\Uuid;

class AccommodationController extends AbstractController
{
    private $entityManager;
    private $accommodationRepository;
    private $security;
    private $userRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        AccommodationRepository $accommodationRepository,
        Security $security,
        UserRepository $userRepository,
    ) {
        $this->entityManager = $entityManager;
        $this->accommodationRepository = $accommodationRepository;
        $this->security = $security;
        $this->userRepository = $userRepository;
    }

    #[Route('/api/accommodations', name: 'get_all_accommodations', methods: ['GET'])]
    public function getAllAccommodations(Request $request): Response
    {
        // Obtener todos los apartamentos
        $accommodations = $this->accommodationRepository->findAll();
        
        // Transformar los datos para la respuesta
        $accommodationsData = [];
        foreach ($accommodations as $accommodation) {
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
            
            // Añadir imagen destacada si está disponible
            $featuredImage = $accommodation->getFeaturedImage();
            if ($featuredImage) {
                $accommodationData['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/accommodations/' . $featuredImage->getFilename();
            }
            
            $accommodationsData[] = $accommodationData;
        }

        return $this->json($accommodationsData);
    }

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
        
        // Añadir todas las imágenes si están disponibles
        $images = $accommodation->getImages();
        if ($images && count($images) > 0) {
            $accommodationData['images'] = [];
            foreach ($images as $image) {
                $accommodationData['images'][] = [
                    'id' => $image->getId(),
                    'url' => $this->getParameter('app.base_url') . '/uploads/accommodations/' . $image->getFilename(),
                    'alt' => $image->getAlt(),
                    'isFeatured' => $image->isFeatured()
                ];
            }
            
            // Añadir imagen destacada
            $featuredImage = $accommodation->getFeaturedImage();
            if ($featuredImage) {
                $accommodationData['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/accommodations/' . $featuredImage->getFilename();
            }
        }
        
        return $this->json($accommodationData);
    }

    #[Route('/api/accommodations/{id}/images', name: 'upload_accommodation_image', methods: ['POST'])]
    public function uploadImage(string $id, Request $request): Response
    {
        try {
            // Formatear y validar el UUID
            $accommodationId = $this->formatUuid($id);
            $accommodation = $this->accommodationRepository->find($accommodationId);
            
            if (!$accommodation) {
                return $this->json(['error' => 'Accommodation not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Verificar si se ha subido un archivo
            $imageFile = $request->files->get('image');
            if (!$imageFile) {
                return $this->json(['error' => 'No image file uploaded'], Response::HTTP_BAD_REQUEST);
            }
            
            // Validar el tipo de archivo
            $mimeType = $imageFile->getMimeType();
            if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
                return $this->json(['error' => 'Invalid image format. Allowed formats: JPG, PNG, GIF, WEBP'], Response::HTTP_BAD_REQUEST);
            }
            
            // Generar un nombre único para el archivo
            $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = transliterator_transliterate('Any-Latin; Latin-ASCII; [^A-Za-z0-9_] remove; Lower()', $originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $imageFile->guessExtension();
            
            // Mover el archivo al directorio de uploads
            try {
                $imageFile->move(
                    $this->getParameter('kernel.project_dir') . '/public/uploads/accommodations',
                    $newFilename
                );
            } catch (FileException $e) {
                return $this->json(['error' => 'Failed to upload image: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
            
            // Crear una nueva entidad de imagen
            $image = new AccommodationImage();
            $image->setAccommodation($accommodation);
            $image->setFilename($newFilename);
            $image->setAlt($request->request->get('alt', $originalFilename));
            
            // Establecer como imagen destacada si se solicita o si es la primera imagen
            $isFeatured = $request->request->get('isFeatured') === 'true' || count($accommodation->getImages()) === 0;
            $image->setIsFeatured($isFeatured);
            
            // Si esta imagen es destacada, desmarcar las demás
            if ($isFeatured) {
                foreach ($accommodation->getImages() as $existingImage) {
                    if ($existingImage->isFeatured()) {
                        $existingImage->setIsFeatured(false);
                    }
                }
            }
            
            $this->entityManager->persist($image);
            $this->entityManager->flush();
            
            return $this->json([
                'message' => 'Image uploaded successfully',
                'image' => [
                    'id' => $image->getId(),
                    'filename' => $image->getFilename(),
                    'url' => $this->getParameter('app.base_url') . '/uploads/accommodations/' . $image->getFilename(),
                    'alt' => $image->getAlt(),
                    'isFeatured' => $image->isFeatured()
                ]
            ], Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
    #[Route('/api/accommodations', name: 'create_accommodation', methods: ['POST'])]
    
public function createAccommodation(Request $request): Response
{
    $userRepository = $this->entityManager->getRepository(\App\Entity\User::class);
    try {
        // Decodificar los datos JSON del request
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON data'], Response::HTTP_BAD_REQUEST);
        }
        
        // Validar datos requeridos
        $requiredFields = ['title', 'description', 'type', 'pricePerNight', 'address', 'city', 'country'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['error' => "Missing required field: {$field}"], Response::HTTP_BAD_REQUEST);
            }
        }
        
        // Crear nueva instancia de Accommodation
        $accommodation = new Accommodation();
        $accommodation->setTitle($data['title']);
        $accommodation->setDescription($data['description']);
        $accommodation->setType($data['type']);
        $accommodation->setPricePerNight((float) $data['pricePerNight']);
        $accommodation->setAddress($data['address']);
        $accommodation->setCity($data['city']);
        $accommodation->setCountry($data['country']);
        
        // Campos opcionales
        if (isset($data['locationLat'])) {
            $accommodation->setLocationLat((float) $data['locationLat']);
        }
        
        if (isset($data['locationLng'])) {
            $accommodation->setLocationLng((float) $data['locationLng']);
        }
        
        if (isset($data['amenities']) && is_array($data['amenities'])) {
            $accommodation->setAmenities($data['amenities']);
        }
        
        if (isset($data['maxGuests'])) {
            $accommodation->setMaxGuests((int) $data['maxGuests']);
        }
        
        
        // Establecer fecha de creación
        $accommodation->setCreatedAtValue(new \DateTime());
        $host = $userRepository->find($data['hostId']);
        $accommodation->setHost($host);
        
        // Persistir el alojamiento
        $this->entityManager->persist($accommodation);
        $this->entityManager->flush();
        
        // Preparar respuesta
        $responseData = [
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
            'maxGuests' => $accommodation->getMaxGuests(),
            'host' => [
                'id' => $accommodation->getHost()->getId(),
                'firstName' => $accommodation->getHost()->getFirstName(),
                'lastName' => $accommodation->getHost()->getLastName()
            ],
            'createdAt' => $accommodation->getCreatedAt()->format('Y-m-d H:i:s')
        ];
        
        return $this->json($responseData, Response::HTTP_CREATED);
        
    } catch (\Exception $e) {
        return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}

    

    // Método helper para formatear UUIDs
    private function formatUuid(string $id): Uuid
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
        return Uuid::fromString($id);
    }
}