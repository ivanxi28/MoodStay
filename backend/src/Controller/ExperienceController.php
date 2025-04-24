<?php

namespace App\Controller;

use App\Entity\Experience;
use App\Entity\Image;
use App\Repository\ExperienceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class ExperienceController extends AbstractController
{
    private $entityManager;
    private $experienceRepository;
    private $security;

    public function __construct(
        EntityManagerInterface $entityManager,
        ExperienceRepository $experienceRepository,
        Security $security
    ) {
        $this->entityManager = $entityManager;
        $this->experienceRepository = $experienceRepository;
        $this->security = $security;
    }

    

    #[Route('/api/experiences', name: 'get_all_experiences', methods: ['GET'])]
public function getAllExperiences(): Response
{
    $experiences = $this->experienceRepository->findAll();

    $experiencesData = [];
    foreach ($experiences as $experience) {
        $imagesData = [];
        foreach ($experience->getImages() as $image) {
            $imagesData[] = [
                'id' => $image->getId(),
                'filename' => $this->getParameter('app.base_url') . '/uploads/experiences/' . $image->getFilename(),
                'alt' => $image->getAlt(),
                'isFeatured' => $image->isFeatured(),
            ];
        }

        $experienceData = [
            'id' => $experience->getId(),
            'title' => $experience->getTitle(),
            'description' => $experience->getDescription(),
            'latitude' => $experience->getLocationLat(),
            'longitude' => $experience->getLocationLng(),
            'city' => $experience->getCity(),
            'country' => $experience->getCountry(),
            'price' => $experience->getPrice(),
            'duration' => $experience->getDurationMinutes(),
            'maxParticipants' => $experience->getMaxParticipants(),
            'category' => $experience->getCategory(),
            'images' => $imagesData, // Incluimos el array de todas las imágenes
        ];

        $experiencesData[] = $experienceData;
    }

    return $this->json($experiencesData);
}

#[Route('/api/experiences/{id}', name: 'get_experience_by_id', methods: ['GET'])]
public function getExperience(string $id): Response
{
    try {
        $experienceId = $this->formatUuid($id);
        $experience = $this->experienceRepository->find($experienceId);

        if (!$experience) {
            return $this->json(['error' => 'Experience not found'], Response::HTTP_NOT_FOUND);
        }

        $imagesData = [];
        foreach ($experience->getImages() as $image) {
            $imagesData[] = [
                'id' => $image->getId(),
                'url' => $this->getParameter('app.base_url') . '/uploads/experiences/' . $image->getFilename(),
                'alt' => $image->getAlt(),
                'isFeatured' => $image->isFeatured()
            ];
        }

        $data = [
            'id' => $experience->getId(),
            'title' => $experience->getTitle(),
            'description' => $experience->getDescription(),
            'latitude' => $experience->getLocationLat(),
            'longitude' => $experience->getLocationLng(),
            'city' => $experience->getCity(),
            'country' => $experience->getCountry(),
            'price' => $experience->getPrice(),
            'duration' => $experience->getDurationMinutes(),
            'maxParticipants' => $experience->getMaxParticipants(),
            'category' => $experience->getCategory(),
            'images' => $imagesData, // Añadimos el array de imágenes
        ];

        // Añadir imagen destacada
        $featuredImage = $experience->getFeaturedImage();
        if ($featuredImage) {
            $data['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/experiences/' . $featuredImage->getFilename();
        }

        return $this->json($data);
    } catch (\Exception $e) {
        return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
    }
}

    #[Route('/api/experiences', name: 'create_experience', methods: ['POST'])]
public function createExperience(Request $request, EntityManagerInterface $entityManager, SluggerInterface $slugger): Response
{
    try {
        $experience = new Experience();
        $experience->setTitle($request->request->get('title'));
        $experience->setDescription($request->request->get('description'));
        $experience->setCity($request->request->get('city'));
        $experience->setCountry($request->request->get('country'));
        $experience->setPrice($request->request->get('price'));
        $experience->setDurationMinutes($request->request->get('duration'));
        $experience->setMaxParticipants($request->request->get('maxParticipants'));
        $experience->setLocationLat($request->request->get('latitude'));
        $experience->setLocationLng($request->request->get('longitude'));
        $experience->setCategory($request->request->get('category'));
        $experience->setCreatedAtValue(new \DateTimeImmutable());
        $experience->setHost($this->security->getUser());

        $imageFiles = $request->files->get('images');
        $uploadsDir = $this->getParameter('experiences_directory');

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

                        $image = new Image();
                        $image->setExperience($experience);
                        $image->setFilename($newFilename);
                        $image->setAlt($request->request->get("alt_" . $originalFilename) ?? '');
                        $image->setIsFeatured($request->request->getBoolean("isFeatured_" . $originalFilename) ?? false);

                        if (count($experience->getImages()) === 0 || $image->isFeatured()) {
                            $image->setIsFeatured(true);
                            foreach ($experience->getImages() as $existingImage) {
                                $existingImage->setIsFeatured(false);
                            }
                        }

                        $entityManager->persist($image);
                        $experience->addImage($image);
                    } catch (FileException $e) {
                        return $this->json(['error' => 'Error uploading image: ' . $e->getMessage()], Response::HTTP_BAD_REQUEST);
                    }
                }
            }
        }

        $entityManager->persist($experience);
        $entityManager->flush();

        $imagesData = [];
        foreach ($experience->getImages() as $image) {
            $imagesData[] = [
                'id' => $image->getId(),
                'filename' => $image->getFilename(),
                'alt' => $image->getAlt(),
                'isFeatured' => $image->isFeatured(),
                // Puedes añadir más información de la imagen si es necesario
            ];
        }

        return $this->json([
            'id' => $experience->getId(),
            'title' => $experience->getTitle(),
            'description' => $experience->getDescription(),
            'city' => $experience->getCity(),
            'country' => $experience->getCountry(),
            'price' => $experience->getPrice(),
            'duration' => $experience->getDurationMinutes(),
            'maxParticipants' => $experience->getMaxParticipants(),
            'latitude' => $experience->getLocationLat(),
            'longitude' => $experience->getLocationLng(),
            'category' => $experience->getCategory(),
            'createdAt' => $experience->getCreatedAt(),
            'images' => $imagesData, // Aquí devolvemos la información de las imágenes
        ], Response::HTTP_CREATED);

    } catch (\Exception $e) {
        return $this->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], Response::HTTP_BAD_REQUEST);
    }
}
    // Añade este método helper para formatear UUIDs si no lo tienes ya
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