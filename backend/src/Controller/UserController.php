<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class UserController extends AbstractController
{
    private $entityManager;
    private $userRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ) {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
    }

    #[Route('/api/admin/promote/{id}', name: 'promote_to_admin', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function promoteToAdmin(string $id): Response
    {
        try {
            // Buscar el usuario por ID
            $user = $this->userRepository->find($id);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Obtener roles actuales y añadir ROLE_ADMIN si no lo tiene
            $roles = $user->getRoles();
            if (!in_array('ROLE_ADMIN', $roles)) {
                $roles[] = 'ROLE_ADMIN';
                $user->setRoles($roles);
                
                $this->entityManager->persist($user);
                $this->entityManager->flush();
                
                return $this->json([
                    'message' => 'User promoted to admin successfully',
                    'userId' => $user->getId(),
                    'roles' => $user->getRoles()
                ]);
            }
            
            return $this->json([
                'message' => 'User already has admin role',
                'userId' => $user->getId(),
                'roles' => $user->getRoles()
            ]);
            
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/api/admin/verify', name: 'verify_admin_status', methods: ['GET'])]
    public function verifyAdminStatus(): Response
    {
        // Obtener el usuario actual
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json([
                'isAdmin' => false,
                'message' => 'User not authenticated'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        // Verificar si el usuario tiene rol de administrador
        $isAdmin = in_array('ROLE_ADMIN', $user->getRoles());
        
        return $this->json([
            'isAdmin' => $isAdmin,
            'userId' => $user->getId(),
            'roles' => $user->getRoles()
        ]);
    }
}
