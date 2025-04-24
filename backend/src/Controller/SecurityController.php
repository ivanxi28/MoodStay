<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface; // Import UrlGeneratorInterface

class SecurityController extends AbstractController
{
    private $entityManager;
    private $passwordHasher;
    private $jwtManager;
    private $tokenStorage;
    private $urlGenerator; // Add urlGenerator property

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager,
        TokenStorageInterface $tokenStorage,
        UrlGeneratorInterface $urlGenerator // Inject UrlGeneratorInterface
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->jwtManager = $jwtManager;
        $this->tokenStorage = $tokenStorage;
        $this->urlGenerator = $urlGenerator; // Assign injected service
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->json([
                'error' => 'Email y contraseña son requeridos'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user) {
            return $this->json([
                'error' => 'Usuario no encontrado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json([
                'error' => 'Contraseña incorrecta'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Generar token JWT
        $token = $this->jwtManager->create($user);

        // Construct avatar URL if filename exists
        $avatarUrl = null;
        //$avatarFilename = $user->getAvatarFilename();
        // if ($avatarFilename) {
        //     // Assuming avatars are stored in 'public/uploads/avatars/'
        //     // Adjust the path '/uploads/avatars/' if your storage location is different

        //     // Use Request context to build the base URL
        //     $baseUrl = $request->getSchemeAndHttpHost(); // Gets http://localhost:8000 (or similar)
        //     $avatarUrl = $baseUrl . '/uploads/avatars/' . $avatarFilename; // Append the correct public path

        //      // Remove or keep the UrlGenerator method commented out
        //     $avatarUrl = $this->urlGenerator->generate(
        //         'app_dummy_route', // Use a dummy route or create one if needed for base URL context
        //         [],
        //         UrlGeneratorInterface::ABSOLUTE_URL // Generate absolute URL
        //     );
            
        //     $avatarUrl = rtrim($avatarUrl, '/') . '/uploads/avatars/' . $avatarFilename;
            
        // }


        return $this->json([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $user->getRoles(),
                // 'avatarFilename' => $avatarFilename, // Keep filename if needed, or remove
                //'avatarUrl' => $avatarUrl, // Use the correctly generated avatar URL
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null
            ]
        ]);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): Response
    {
        // En una API con JWT, el logout se maneja del lado del cliente
        // eliminando el token almacenado
        return $this->json([
            'message' => 'Logout exitoso'
        ]);
    }

    // Dummy route needed for UrlGenerator context if not using Request context
    // #[Route('/_dummy', name: 'app_dummy_route', methods: ['GET'])]
    // public function dummyRoute() { return new Response(); }
}