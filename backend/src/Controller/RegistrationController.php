<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class RegistrationController extends AbstractController
{
    private $passwordEncoder;
    private $entityManager;
    private $jwtManager;

    public function __construct(
        UserPasswordHasherInterface $passwordEncoder, 
        EntityManagerInterface $entityManager,
        JWTTokenManagerInterface $jwtManager
    ) {
        $this->passwordEncoder = $passwordEncoder;
        $this->entityManager = $entityManager;
        $this->jwtManager = $jwtManager;
    }

    #[Route('/api/register', methods: ['POST'])]
    public function register(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        // Validar que todos los campos requeridos estén presentes
        // Phone number is optional here based on entity definition
        if (empty($data['email']) || empty($data['password']) ||
            empty($data['firstName']) || empty($data['lastName'])) {
            throw new BadRequestHttpException('Email, password, firstName, and lastName are required.');
        }

        // Verificar si el usuario ya existe
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json(['error' => 'User already exists'], Response::HTTP_BAD_REQUEST);
        }

        // Crear un nuevo usuario
        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword($this->passwordEncoder->hashPassword($user, $data['password']));
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        // Set phone number if provided in the request data
        if (!empty($data['phoneNumber'])) {
            $user->setPhoneNumber($data['phoneNumber']);
        }
        $user->setRoles(['ROLE_USER']);
        // Note: setCreatedAtValue is handled by PrePersist lifecycle callback in User entity
        // $user->setCreatedAtValue(new \DateTimeImmutable()); // This line is likely redundant

        // Guardar el usuario en la base de datos
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Generar token JWT
        $token = $this->jwtManager->create($user);

        // Devolver respuesta con token y datos del usuario
        return $this->json([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'phoneNumber' => $user->getPhoneNumber(), // Include phone number in response
                'roles' => $user->getRoles(),
            ]
        ], Response::HTTP_CREATED);
    }
}
?>
