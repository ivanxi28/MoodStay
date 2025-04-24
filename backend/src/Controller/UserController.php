<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile; // Added
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;          // Added
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface; // Added
use Symfony\Component\Uid\Uuid;

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

    private function formatUuid(string $id): Uuid
    {
        if (strpos($id, '0x') === 0) {
            $id = substr($id, 2);
        }
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
        return Uuid::fromString($id);
    }

    #[Route('/api/admin/promote/{id}', name: 'promote_to_admin', methods: ['POST'])]

    public function promoteToAdmin(string $id): Response
    {
        try {
            // Buscar el usuario por ID
           $id = $this->formatUuid($id);
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
    }// Aseguramos que solo los administradores puedan asignar este rol
    #[Route('/api/admin/promote/host/{id}', name: 'promote_to_host', methods: ['POST'])]
    public function promoteToHost(string $id): Response
    {
        try {
            // Formatear el ID utilizando la función formatUuid
            $userId = $this->formatUuid($id);

            // Buscar el usuario por ID formateado
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }

            // Obtener roles actuales y añadir ROLE_HOST si no lo tiene
            $roles = $user->getRoles();
            if (!in_array('ROLE_HOST', $roles)) {
                $roles[] = 'ROLE_HOST';
                $user->setRoles($roles);

                $this->entityManager->persist($user);
                $this->entityManager->flush();

                return $this->json([
                    'message' => 'User promoted to host successfully',
                    'userId' => $user->getId(),
                    'roles' => $user->getRoles()
                ]);
            }

            return $this->json([
                'message' => 'User already has host role',
                'userId' => $user->getId(),
                'roles' => $user->getRoles()
            ]);

        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => 'Invalid user ID format'], Response::HTTP_BAD_REQUEST);
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
    #[Route('/api/host/verify', name: 'verify_host_status', methods: ['GET'])]
    public function checkHostRole(): Response
    {
        // Obtener el usuario actual
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json([
                'isHost' => false,
                'message' => 'User not authenticated'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        // Verificar si el usuario tiene rol de host
        $isHost = in_array('ROLE_HOST', $user->getRoles());
        
        return $this->json([
            'isHost' => $isHost,
            'userId' => $user->getId(),
            'roles' => $user->getRoles()
        ]);
    }

    #[Route('/api/users', name: 'get_all_users', methods: ['GET'])]
    public function getAllUsers(): Response
    {
        // Verificar que el usuario actual sea administrador
        $currentUser = $this->getUser();
        
        if (!$currentUser || !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Access denied. Admin privileges required.'], Response::HTTP_FORBIDDEN);
        }
        
        // Obtener todos los usuarios
        $users = $this->userRepository->findAll();
        
        // Preparar datos para la respuesta
        $usersData = [];
        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $user->getRoles(),
                'avatarFilename' => $user->getAvatarFilename(),
                'phoneNumber' => $user->getPhoneNumber()
            ];
        }
        
        return $this->json($usersData);
    }

    #[Route('/api/users/{userId}/roles', name: 'update_user_roles', methods: ['PUT'])]
    public function updateUserRoles(string $userId, Request $request): Response
    {
        // Verificar que el usuario actual sea administrador
        $currentUser = $this->getUser();
        
        if (!$currentUser || !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Access denied. Admin privileges required.'], Response::HTTP_FORBIDDEN);
        }
        
        try {
            // Decodificar el cuerpo de la solicitud
            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['role']) || !isset($data['action']) || 
                !in_array($data['action'], ['add', 'remove'])) {
                return $this->json([
                    'error' => 'Invalid request. Required fields: role, action (add/remove)'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Formatear el ID y buscar el usuario
            $userUuid = $this->formatUuid($userId);
            $user = $this->userRepository->find($userUuid);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Validar el rol (puedes ajustar esta lista según tus necesidades)
            $validRoles = ['ROLE_ADMIN', 'ROLE_HOST', 'ROLE_USER'];
            $role = $data['role'];
            
            if (!in_array($role, $validRoles)) {
                return $this->json(['error' => 'Invalid role'], Response::HTTP_BAD_REQUEST);
            }
            
            // Obtener roles actuales y asegurarse de que sea un array
            $roles = $user->getRoles();
            if (!is_array($roles)) {
                $roles = [];
            }
            
            // Añadir o eliminar el rol según la acción
            if ($data['action'] === 'add' && !in_array($role, $roles)) {
                $roles[] = $role;
                // Asegurarse de que los roles se guarden como array
                $user->setRoles(array_values($roles));
                $message = 'Role added successfully';
            } elseif ($data['action'] === 'remove' && in_array($role, $roles)) {
                // Asegurarse de que el usuario siempre tenga al menos ROLE_USER
                if ($role === 'ROLE_USER' && count($roles) === 1) {
                    return $this->json([
                        'error' => 'Cannot remove ROLE_USER. User must have at least one role.'
                    ], Response::HTTP_BAD_REQUEST);
                }
                
                $roles = array_diff($roles, [$role]);
                // Asegurarse de que los roles se guarden como array con índices consecutivos
                $user->setRoles(array_values($roles));
                $message = 'Role removed successfully';
            } else {
                // El rol ya existe o no existe (según la acción)
                $message = $data['action'] === 'add' ? 
                    'User already has this role' : 
                    'User does not have this role';
            }
            
            $this->entityManager->persist($user);
            $this->entityManager->flush();
            
            return $this->json([
                'message' => $message,
                'userId' => $user->getId(),
                'roles' => $user->getRoles()
            ]);
            
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => 'Invalid user ID format'], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/users/avatar', name: 'upload_user_avatar', methods: ['POST'])]
    public function uploadAvatar(Request $request, SluggerInterface $slugger): Response
    {
        // 1. Get the current user
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // 2. Get the uploaded file (assuming the form field name is 'avatar')
        /** @var UploadedFile|null $avatarFile */
        $avatarFile = $request->files->get('avatar');

        // 3. Validate the file
        if (!$avatarFile) {
            return $this->json(['error' => 'No avatar file uploaded'], Response::HTTP_BAD_REQUEST);
        }

        // Optional: Add more validation (e.g., file size, MIME type)
        // $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        // if (!in_array($avatarFile->getMimeType(), $allowedMimeTypes)) {
        //     return $this->json(['error' => 'Invalid file type.'], Response::HTTP_BAD_REQUEST);
        // }

        // 4. Define target directory (get from parameters)
        try {
            // Ensure you have 'avatars_directory' defined in your services.yaml or parameters
            $avatarsDirectory = $this->getParameter('avatars_directory');
        } catch (\InvalidArgumentException $e) {
             error_log("Parameter 'avatars_directory' not defined."); // Log the error
             return $this->json(['error' => 'Server configuration error: Avatar directory not set.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }


        // Ensure the directory exists
        if (!file_exists($avatarsDirectory)) {
            try {
                mkdir($avatarsDirectory, 0775, true); // Create recursively with appropriate permissions
            } catch (\Exception $e) {
                 error_log("Failed to create avatar directory: " . $e->getMessage());
                 return $this->json(['error' => 'Failed to create upload directory.'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }


        // 5. Generate a unique filename
        $originalFilename = pathinfo($avatarFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename.'-'.uniqid().'.'.$avatarFile->guessExtension();

        // 6. Move the file to the target directory
        try {
            $avatarFile->move(
                $avatarsDirectory,
                $newFilename
            );
        } catch (FileException $e) {
            // Handle file move exception
             error_log("Could not move avatar file: " . $e->getMessage());
            return $this->json(['error' => 'Could not save avatar file.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        
         $user->setAvatarFilename($newFilename);
         $this->entityManager->persist($user);
         $this->entityManager->flush();


        $avatarUrl = '/uploads/avatars/' . $newFilename; // Adjust path if needed

        return $this->json([
            'message' => 'Avatar uploaded successfully',
            'avatarUrl' => $avatarUrl, // Provide the URL to the frontend
            'filename' => $newFilename // Or just the filename
        ]);
    }
}
