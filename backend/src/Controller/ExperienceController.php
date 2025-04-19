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

    #[Route('/api/experiences/seed', name: 'seed_experiences', methods: ['GET'])]
    public function seedExperiences(): Response
    {
        // Verificar si ya existen experiencias para evitar duplicados
        $existingCount = $this->experienceRepository->count([]);
        if ($existingCount > 0) {
            return $this->json(['message' => 'Experiences already exist', 'count' => $existingCount], Response::HTTP_OK);
        }

        // Datos de ejemplo para 10 experiencias
        $experiencesData = [
            [
                'title' => 'Tour gastronómico por Barcelona',
                'description' => 'Descubre los sabores auténticos de Barcelona en este recorrido por los mejores restaurantes y mercados locales.',
                'city' => 'Barcelona, España',
                'country'=>'España',
                'latitude' => 41.3851,
                'longitude' => 2.1734,
                'price' => 65.00,
                'duration' => 3, // horas
                'maxParticipants' => 8,
                'category' => 'Gastronomía',
                'imageUrl' => 'https://example.com/images/barcelona-food-tour.jpg',
            ],
            [
                'title' => 'Clase de flamenco en Sevilla',
                'description' => 'Aprende los pasos básicos del flamenco con bailarines profesionales en el corazón de Sevilla.',
                'city' => 'Sevilla, España',
                'country'=>'España',
                'latitude' => 37.3891,
                'longitude' => -5.9845,
                'price' => 45.00,
                'duration' => 2,
                'maxParticipants' => 12,
                'category' => 'Cultura',
                'imageUrl' => 'https://example.com/images/flamenco-class.jpg',
            ],
            [
                'title' => 'Senderismo por Picos de Europa',
                'description' => 'Disfruta de un día de senderismo por los impresionantes paisajes de los Picos de Europa con un guía experto.',
                'city' => 'Asturias, España',
                'country'=>'España',
                'latitude' => 43.1969,
                'longitude' => -4.8352,
                'price' => 55.00,
                'duration' => 6,
                'maxParticipants' => 10,
                'category' => 'Aventura',
                'imageUrl' => 'https://example.com/images/picos-europa.jpg',
            ],
            [
                'title' => 'Taller de cerámica tradicional',
                'description' => 'Aprende técnicas tradicionales de cerámica española y crea tu propia pieza para llevar a casa.',
                'city' => 'Valencia, España',
                'country'=>'España',
                'latitude' => 39.4699,
                'longitude' => -0.3763,
                'price' => 40.00,
                'duration' => 3,
                'maxParticipants' => 6,
                'category' => 'Artesanía',
                'imageUrl' => 'https://example.com/images/ceramics-workshop.jpg',
            ],
            [
                'title' => 'Tour en bicicleta por Madrid',
                'description' => 'Recorre los principales monumentos y parques de Madrid en un agradable paseo en bicicleta.',
                'city' => 'Madrid, España',
                'country'=>'España',
                'latitude' => 40.4168,
                'longitude' => -3.7038,
                'price' => 30.00,
                'duration' => 4,
                'maxParticipants' => 15,
                'category' => 'Turismo',
                'imageUrl' => 'https://example.com/images/madrid-bike-tour.jpg',
            ],
            [
                'title' => 'Cata de vinos en La Rioja',
                'description' => 'Visita bodegas centenarias y degusta los mejores vinos de La Rioja con un sommelier profesional.',
                'city' => 'La Rioja, España',
                'country'=>'España',
                'latitude' => 42.2871,
                'longitude' => -2.5396,
                'price' => 75.00,
                'duration' => 5,
                'maxParticipants' => 8,
                'category' => 'Gastronomía',
                'imageUrl' => 'https://example.com/images/rioja-wine.jpg',
            ],
            [
                'title' => 'Paseo en kayak por la Costa Brava',
                'description' => 'Explora las calas y cuevas de la Costa Brava en un emocionante recorrido en kayak.',
                'city' => 'Girona, España',
                'country'=>'España',
                'latitude' => 41.9794,
                'longitude' => 3.2175,
                'price' => 50.00,
                'duration' => 3,
                'maxParticipants' => 10,
                'category' => 'Aventura',
                'imageUrl' => 'https://example.com/images/kayak-costa-brava.jpg',
            ],
            [
                'title' => 'Clase de paella valenciana',
                'description' => 'Aprende a cocinar una auténtica paella valenciana con ingredientes frescos del mercado local.',
                'city' => 'Valencia, España',
                'country'=>'España',
                'latitude' => 39.4699,
                'longitude' => -0.3763,
                'price' => 60.00,
                'duration' => 4,
                'maxParticipants' => 8,
                'category' => 'Gastronomía',
                'imageUrl' => 'https://example.com/images/paella-class.jpg',
            ],
            [
                'title' => 'Observación de estrellas en Sierra Nevada',
                'description' => 'Disfruta de una noche mágica observando estrellas y constelaciones en uno de los mejores cielos nocturnos de Europa.',
                'city' => 'Granada, España',
                'country'=>'España',
                'latitude' => 37.0963,
                'longitude' => -3.4142,
                'price' => 40.00,
                'duration' => 3,
                'maxParticipants' => 12,
                'category' => 'Naturaleza',
                'imageUrl' => 'https://example.com/images/stargazing.jpg',
            ],
            [
                'title' => 'Tour de tapas en San Sebastián',
                'description' => 'Descubre los mejores pintxos de San Sebastián en un recorrido por sus bares más emblemáticos.',
                'city' => 'San Sebastián, España',
                'country'=>'España',
                'latitude' => 43.3183,
                'longitude' => -1.9812,
                'price' => 70.00,
                'duration' => 3,
                'maxParticipants' => 10,
                'category' => 'Gastronomía',
                'imageUrl' => 'https://example.com/images/san-sebastian-tapas.jpg',
            ],
        ];

        // Crear y guardar las experiencias
        $createdExperiences = [];
        foreach ($experiencesData as $data) {
            $experience = new Experience();
            $experience->setTitle($data['title']);
            $experience->setDescription($data['description']);
            // Cambiamos la línea problemática para usar latitud y longitud
            $experience->setLocationLat($data['latitude']);
            $experience->setLocationLng($data['longitude']);
            $experience->setCity($data['city']); 
            $experience->setCountry($data['country']);           
            $experience->setPrice($data['price']);
            $experience->setDurationMinutes($data['duration']);
            $experience->setMaxParticipants($data['maxParticipants']);
            $experience->setCategory($data['category']);
            
            // Si la entidad Experience tiene un campo host, podríamos asignar un host aquí
            // $experience->setHost($this->security->getUser());
            
            $this->entityManager->persist($experience);
            $createdExperiences[] = $experience;
        }
        
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Successfully created 10 experiences',
            'count' => count($createdExperiences)
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/experiences', name: 'get_all_experiences', methods: ['GET'])]
    public function getAllExperiences(): Response
    {
        $experiences = $this->experienceRepository->findAll();
        
        $experiencesData = [];
        foreach ($experiences as $experience) {
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
            ];
            
            // Añadir imagen destacada si está disponible
            $featuredImage = $experience->getFeaturedImage();
            if ($featuredImage) {
                $experienceData['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/experiences/' . $featuredImage->getFilename();
            }
            
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
            ];
            
            // Añadir imágenes si están disponibles
            $images = $experience->getImages();
            if ($images && count($images) > 0) {
                $data['images'] = [];
                foreach ($images as $image) {
                    $data['images'][] = [
                        'id' => $image->getId(),
                        'url' => $this->getParameter('app.base_url') . '/uploads/experiences/' . $image->getFilename(),
                        'alt' => $image->getAlt(),
                        'isFeatured' => $image->isFeatured()
                    ];
                }
                
                // Añadir imagen destacada
                $featuredImage = $experience->getFeaturedImage();
                if ($featuredImage) {
                    $data['featuredImage'] = $this->getParameter('app.base_url') . '/uploads/experiences/' . $featuredImage->getFilename();
                }
            }
            
            return $this->json($data);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/api/experiences', name: 'create_experience', methods: ['POST'])]
public function createExperience(Request $request, SluggerInterface $slugger, EntityManagerInterface $entityManager): Response
{
    try {
        $title = $request->request->get('title');
        $price = $request->request->get('price');

        // Validar datos requeridos
        if (empty($title) || empty($price)) {
            return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $experience = new Experience();
        $experience->setTitle($title);
        $experience->setDescription($request->request->get('description') ?? '');
        $experience->setLocationLat($request->request->get('latitude') ?? null);
        $experience->setLocationLng($request->request->get('longitude') ?? null);
        $experience->setCity($request->request->get('city') ?? '');
        $experience->setCountry($request->request->get('country') ?? '');
        $experience->setPrice($price);
        $experience->setDurationMinutes($request->request->get('duration') ?? 180);
        $experience->setMaxParticipants($request->request->get('maxParticipants') ?? 12);
        $experience->setCategory($request->request->get('category') ?? 'Cultura');

        // Establecer el usuario actual como host
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        $experience->setHost($user);

        // Establecer fecha de creación
        $experience->setCreatedAtValue(new \DateTimeImmutable());

        // Procesar la imagen subida
        $imageFile = $request->files->get('images'); // Asegúrate de que el frontend envíe el archivo con el nombre 'image'
        $uploadsDir = $this->getParameter('experiences_directory');

        if (!file_exists($uploadsDir)) {
            mkdir($uploadsDir, 0777, true);
        }

        if ($imageFile instanceof UploadedFile) {
            $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $imageFile->guessExtension();

            try {
                $imageFile->move($uploadsDir, $newFilename);

                $image = new Image();
                $image->setExperience($experience);
                $image->setFilename($newFilename);
                $image->setAlt($request->request->get("alt") ?? ''); // Puedes enviar un campo 'alt' para la descripción de la imagen
                $image->setIsFeatured(true); // Por defecto, la primera imagen subida será la destacada

                $entityManager->persist($image);
                $experience->addImage($image); // Asocia la imagen con la experiencia

            } catch (FileException $e) {
                return $this->json(['error' => 'Error al guardar la imagen'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($experience);
        $entityManager->flush();

        // Construir la respuesta con la información de la experiencia y la imagen
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
            'images' => array_map(function (Image $image) {
                return [
                    'filename' => $image->getFilename(),
                    'alt' => $image->getAlt(),
                    'isFeatured' => $image->isFeatured(),
                ];
            }, $experience->getImages()->toArray()),
            'host' => [
                'id' => $experience->getHost()->getId(),
                'firstName' => $experience->getHost()->getFirstName(),
                'lastName' => $experience->getHost()->getLastName()
            ],
            'createdAt' => $experience->getCreatedAt()->format('Y-m-d H:i:s')
        ];

        return $this->json([
            'message' => 'Experience created successfully',
            'experience' => $experienceData
        ], Response::HTTP_CREATED);

    } catch (\Exception $e) {
        return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
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