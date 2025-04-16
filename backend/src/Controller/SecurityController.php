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

class SecurityController extends AbstractController
{
    private $entityManager;
    private $passwordHasher;
    private $jwtManager;
    private $tokenStorage;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager,
        TokenStorageInterface $tokenStorage
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->jwtManager = $jwtManager;
        $this->tokenStorage = $tokenStorage;
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

        return $this->json([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $user->getRoles(),
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
}