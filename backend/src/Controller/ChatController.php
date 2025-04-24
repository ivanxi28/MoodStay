<?php

namespace App\Controller;

use App\Entity\Chat;
use App\Entity\User;
use App\Entity\Restaurant;
use App\Entity\Experience;
use App\Entity\Accommodation;
use App\Entity\Message;
use App\Repository\ChatRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Uid\Uuid;

#[Route('/api/chats')]
class ChatController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private Security $security;
    private ChatRepository $chatRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        Security $security,
        ChatRepository $chatRepository
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->security = $security;
        $this->chatRepository = $chatRepository;
    }

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

    // --- Method to explicitly create a chat (without initial message) ---
    #[Route('/create', name: 'api_chat_create', methods: ['POST'])]
    public function createChat(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON body');
        }

        // --- Input Validation ---
        if (!isset($data['restaurantId']) && !isset($data['experienceId']) && !isset($data['accommodationId'])) {
            throw new BadRequestHttpException('Missing required field: one of restaurantId, experienceId, or accommodationId.');
        }

        // --- Determine Customer (Initiator) ---
        $customer = $this->security->getUser();
        if (!$customer instanceof User) {
            throw new AccessDeniedException('User must be authenticated to create chats.');
        }

        // --- Find Linked Entity and its Owner ---
        $owner = null;
        $restaurant = null;
        $experience = null;
        $accommodation = null;

        if (isset($data['restaurantId'])) {
            try {
                $restaurantId = $this->formatUuid($data['restaurantId']);
                $restaurant = $this->entityManager->getRepository(Restaurant::class)->find($restaurantId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid restaurantId format.');
            }
            if (!$restaurant) throw new NotFoundHttpException('Restaurant not found.');
            $owner = $restaurant->getOwner();
        } elseif (isset($data['experienceId'])) {
            try {
                $experienceId = $this->formatUuid($data['experienceId']);
                $experience = $this->entityManager->getRepository(Experience::class)->find($experienceId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid experienceId format.');
            }
            if (!$experience) throw new NotFoundHttpException('Experience not found.');
            $owner = $experience->getHost();
        } elseif (isset($data['accommodationId'])) {
            try {
                $accommodationId = $this->formatUuid($data['accommodationId']);
                $accommodation = $this->entityManager->getRepository(Accommodation::class)->find($accommodationId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid accommodationId format.');
            }
            if (!$accommodation) throw new NotFoundHttpException('Accommodation not found.');
            $owner = $accommodation->getHost();
        }

        if (!$owner instanceof User) {
            throw new BadRequestHttpException('Could not determine the owner for the provided entity.');
        }
        if ($owner === $customer) {
            throw new BadRequestHttpException('You cannot create a chat with yourself.');
        }

        // --- Find Existing Chat ---
        $chat = $this->chatRepository->findExistingChat(
            $customer, $owner, $restaurant, $experience, $accommodation
        );

        $statusCode = JsonResponse::HTTP_OK; // Default to OK if chat already exists

        // --- Create Chat if Not Found ---
        if (!$chat) {
            $chat = new Chat();
            $chat->setCustomer($customer);
            $chat->setOwner($owner);
            if ($restaurant) $chat->setRestaurant($restaurant);
            if ($experience) $chat->setExperience($experience);
            if ($accommodation) $chat->setAccommodation($accommodation);

            $this->entityManager->persist($chat);
            $this->entityManager->flush();
            $statusCode = JsonResponse::HTTP_CREATED; // Set to Created if new chat was made
        }

        // --- Serialize and Respond ---
        $jsonChat = $this->serializer->serialize(
            $chat, 'json', ['groups' => ['chat:read', 'user:read']] // Only need chat and user info
        );
        return new JsonResponse($jsonChat, $statusCode, [], true);
    }


    // --- Method to find/create chat and add message ---
    #[Route('/find-or-create', name: 'api_chat_find_or_create_with_message', methods: ['POST'])]
    public function findOrCreateChatWithMessage(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $isNewChat = false; // Flag to indicate if a new chat was created

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON body');
        }

        // --- Input Validation ---
        // Require message and one of the entity IDs
        if (empty(trim($data['message'])) || (!isset($data['restaurantId']) && !isset($data['experienceId']) && !isset($data['accommodationId']))) {
            throw new BadRequestHttpException('Missing required fields: message and one of restaurantId, experienceId, or accommodationId.');
        }
        $messageContent = trim($data['message']);

        // --- Determine Customer (Sender) ---
        $customer = $this->security->getUser();
        if (!$customer instanceof User) {
            throw new AccessDeniedException('User must be authenticated to send messages.');
        }

        // --- Find Linked Entity and its Owner ---
        $owner = null;
        $restaurant = null;
        $experience = null;
        $accommodation = null;

        if (isset($data['restaurantId'])) {
            try {
                $restaurantId = $this->formatUuid($data['restaurantId']);
                $restaurant = $this->entityManager->getRepository(Restaurant::class)->find($restaurantId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid restaurantId format.');
            }
            if (!$restaurant) throw new BadRequestHttpException('Restaurant not found.');
            $owner = $restaurant->getOwner();
        } elseif (isset($data['experienceId'])) {
            try {
                $experienceId = $this->formatUuid($data['experienceId']);
                $experience = $this->entityManager->getRepository(Experience::class)->find($experienceId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid experienceId format.');
            }
            if (!$experience) throw new BadRequestHttpException('Experience not found.');
            $owner = $experience->getHost();
        } elseif (isset($data['accommodationId'])) {
            try {
                $accommodationId = $this->formatUuid($data['accommodationId']);
                $accommodation = $this->entityManager->getRepository(Accommodation::class)->find($accommodationId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid accommodationId format.');
            }
            if (!$accommodation) throw new BadRequestHttpException('Accommodation not found.');
            $owner = $accommodation->getHost();
        }

        // Validate that an owner was found
        if (!$owner instanceof User) {
            throw new BadRequestHttpException('Could not determine the owner for the provided entity.');
        }

        // Prevent users from starting a chat with themselves
        if ($owner === $customer) {
            throw new BadRequestHttpException('You cannot start a chat with yourself.');
        }


        // --- Find Existing Chat ---
        $chat = $this->chatRepository->findExistingChat(
            $customer,
            $owner,
            $restaurant, // Pass the fetched entities (or null)
            $experience,
            $accommodation
        );

        // --- Create Chat if Not Found ---
        if (!$chat) {
            $chat = new Chat();
            $chat->setCustomer($customer);
            $chat->setOwner($owner); // Use the owner derived from the entity
            if ($restaurant) $chat->setRestaurant($restaurant);
            if ($experience) $chat->setExperience($experience);
            if ($accommodation) $chat->setAccommodation($accommodation);
            $isNewChat = true;
        } else {
            // --- Authorization Check for existing chat ---
            if ($chat->getCustomer() !== $customer && $chat->getOwner() !== $customer) {
                // This check ensures the sender is part of the existing chat
                throw new AccessDeniedException('You are not authorized to send messages in this chat.');
            }
        }

        // --- Create and Add Message ---
        $message = new Message();
        $message->setChat($chat);
        $message->setSender($customer); // The authenticated user sends the message
        $message->setContent($messageContent);
        $chat->addMessage($message);


        // --- Persist ---
        if ($isNewChat) {
            $this->entityManager->persist($chat);
        } else {
            $this->entityManager->persist($message);
        }
        $this->entityManager->flush();


        // --- Serialize and Respond ---
        // Decide what to return: the whole chat, just the messages, or just the new message?
        // Returning the whole chat for now:
        $jsonChat = $this->serializer->serialize(
            $chat,
            'json',
            ['groups' => ['chat:read', 'message:read', 'user:read']]
        );
        $statusCode = $isNewChat ? JsonResponse::HTTP_CREATED : JsonResponse::HTTP_OK;
        return new JsonResponse($jsonChat, $statusCode, [], true);
    }

    // --- Method for OWNER to get messages for a chat identified by entity and customer ---
    #[Route('/owner/messages', name: 'api_owner_chat_get_messages_by_entity', methods: ['POST'])]
    public function getOwnerChatMessagesByEntity(Request $request): JsonResponse
    {
        // --- Determine Owner (Authenticated User) ---
        $owner = $this->security->getUser();
        if (!$owner instanceof User) {
            throw new AccessDeniedException('User must be authenticated as an owner to view these messages.');
        }

        // --- Decode JSON Body ---
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON body');
        }

        // --- Input Validation ---
        if (!isset($data['customerId']) || (!isset($data['restaurantId']) && !isset($data['experienceId']) && !isset($data['accommodationId']))) {
            throw new BadRequestHttpException('Missing required fields: customerId and one of restaurantId, experienceId, or accommodationId.');
        }
        $customerId = $data['customerId'];

        // --- Find Customer ---
        $customer = $this->entityManager->getRepository(User::class)->find($customerId);
        if (!$customer) {
            throw new NotFoundHttpException('Customer user not found.');
        }

        // --- Identify Linked Entity and Verify Ownership ---
        $restaurant = null;
        $experience = null;
        $accommodation = null;
        $entityOwner = null; // To store the actual owner of the found entity

        if (isset($data['restaurantId'])) {
            try {
                $restaurantId = $this->formatUuid($data['restaurantId']);
                $restaurant = $this->entityManager->getRepository(Restaurant::class)->find($restaurantId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid restaurantId format.');
            }
            if (!$restaurant) throw new NotFoundHttpException('Restaurant not found.');
            $entityOwner = $restaurant->getOwner();
        } elseif (isset($data['experienceId'])) {
            try {
                $experienceId = $this->formatUuid($data['experienceId']);
                $experience = $this->entityManager->getRepository(Experience::class)->find($experienceId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid experienceId format.');
            }
            if (!$experience) throw new NotFoundHttpException('Experience not found.');
            $entityOwner = $experience->getHost();
        } elseif (isset($data['accommodationId'])) {
            try {
                $accommodationId = $this->formatUuid($data['accommodationId']);
                $accommodation = $this->entityManager->getRepository(Accommodation::class)->find($accommodationId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid accommodationId format.');
            }
            if (!$accommodation) throw new NotFoundHttpException('Accommodation not found.');
            $entityOwner = $accommodation->getHost();
        }

        // --- Authorization Check: Ensure authenticated user owns the entity ---
        if (!$entityOwner instanceof User || $entityOwner !== $owner) {
            throw new AccessDeniedException('You are not authorized to view messages for this entity.');
        }

        // --- Find the Specific Chat ---
        // Note: We use the authenticated user ($owner) and the $customer from the request
        $chat = $this->chatRepository->findExistingChat(
            $customer, // Customer from request
            $owner,   // Owner (authenticated user)
            $restaurant,
            $experience,
            $accommodation
        );

        // --- Handle Chat Not Found ---
        if (!$chat) {
            return new JsonResponse('[]', JsonResponse::HTTP_OK, [], true); // Return empty array
        }

        // --- Get Messages ---
        $messages = $chat->getMessages();

        // --- Serialize and Respond ---
        $jsonMessages = $this->serializer->serialize(
            $messages, 'json', ['groups' => ['message:read', 'user:read']]
        );
        return new JsonResponse($jsonMessages, JsonResponse::HTTP_OK, [], true);
    }


    // --- Method for CUSTOMER to get messages for a chat identified by linked entity ---
    #[Route('/messages', name: 'api_chat_get_messages_by_entity', methods: ['POST'])]
    public function getChatMessagesByEntity(Request $request): JsonResponse
    {
        // --- Determine Customer (Authenticated User) ---
        $customer = $this->security->getUser();
        if (!$customer instanceof User) {
            throw new AccessDeniedException('User must be authenticated to view messages.');
        }

        // --- Decode JSON Body ---
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON body');
        }

        // --- Identify Linked Entity and Find Owner (from JSON body) ---
        $owner = null;
        $restaurant = null;
        $experience = null;
        $accommodation = null;

        // Read IDs from the decoded JSON data
        $restaurantId = $data['restaurantId'] ?? null;
        $experienceId = $data['experienceId'] ?? null;
        $accommodationId = $data['accommodationId'] ?? null;

        // Ensure exactly one entity ID is provided in the JSON body
        $providedIds = array_filter([$restaurantId, $experienceId, $accommodationId]);
        if (count($providedIds) !== 1) {
            // Updated error message to reflect JSON body requirement
            throw new BadRequestHttpException('Exactly one of restaurantId, experienceId, or accommodationId must be provided in the JSON body.');
        }

        // --- Find Entity and Owner (logic remains the same) ---
        if ($restaurantId) {
            try {
                $restaurantId = $this->formatUuid($restaurantId);
                $restaurant = $this->entityManager->getRepository(Restaurant::class)->find($restaurantId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid restaurantId format.');
            }
            if (!$restaurant) throw new NotFoundHttpException('Restaurant not found.');
            $owner = $restaurant->getOwner();
        } elseif ($experienceId) {
            try {
                $experienceId = $this->formatUuid($experienceId);
                $experience = $this->entityManager->getRepository(Experience::class)->find($experienceId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid experienceId format.');
            }
            if (!$experience) throw new NotFoundHttpException('Experience not found.');
            $owner = $experience->getHost(); // Assuming getHost() returns the owner User
        } elseif ($accommodationId) {
            try {
                $accommodationId = $this->formatUuid($accommodationId);
                $accommodation = $this->entityManager->getRepository(Accommodation::class)->find($accommodationId);
            } catch (\Throwable $e) {
                throw new BadRequestHttpException('Invalid accommodationId format.');
            }
            if (!$accommodation) throw new NotFoundHttpException('Accommodation not found.');
            $owner = $accommodation->getHost(); // Assuming getHost() returns the owner User
        }

        // Validate owner (logic remains the same)
        if (!$owner instanceof User) {
            throw new BadRequestHttpException('Could not determine the owner for the provided entity.');
        }

        // --- Find the Specific Chat (logic remains the same) ---
        $chat = $this->chatRepository->findExistingChat(
            $customer,
            $owner,
            $restaurant,
            $experience,
            $accommodation
        );

        // --- Handle Chat Not Found (logic remains the same) ---
        if (!$chat) {
            return new JsonResponse('[]', JsonResponse::HTTP_OK, [], true);
        }

        // --- Get Messages (logic remains the same) ---
        $messages = $chat->getMessages();

        // --- Serialize and Respond (logic remains the same) ---
        $jsonMessages = $this->serializer->serialize(
            $messages,
            'json',
            ['groups' => ['message:read', 'user:read']] // Use appropriate groups
        );

        return new JsonResponse($jsonMessages, JsonResponse::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_chat_get_by_id', methods: ['GET'])]
    public function getChatById(int $id): JsonResponse
    {
        // --- Get Authenticated User ---
        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            // Or handle anonymous access differently if applicable
            throw new AccessDeniedException('Authentication required to view chats.');
        }

        // --- Find Chat ---
        $chat = $this->entityManager->getRepository(Chat::class)->find($id);

        if (!$chat) {
            throw new NotFoundHttpException('Chat not found.');
        }

        // --- Authorization Check ---
        // Ensure the current user is part of this chat
        if ($chat->getCustomer() !== $currentUser && $chat->getOwner() !== $currentUser) {
            throw new AccessDeniedException('You are not authorized to view this chat.');
        }

        // --- Serialize and Respond ---
        $jsonChat = $this->serializer->serialize(
            $chat,
            'json',
            ['groups' => ['chat:read', 'message:read', 'user:read']] // Adjust groups as needed
        );

        return new JsonResponse($jsonChat, JsonResponse::HTTP_OK, [], true);
    }

    // --- Method to get messages for a specific chat by ID ---
    #[Route('/{id}/messages', name: 'api_chat_get_messages', methods: ['GET'])]
    public function getChatMessages(int $id): JsonResponse
    {
        // --- Get Authenticated User ---
        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new AccessDeniedException('Authentication required to view chat messages.');
        }

        // --- Find Chat ---
        $chat = $this->entityManager->getRepository(Chat::class)->find($id);

        if (!$chat) {
            throw new NotFoundHttpException('Chat not found.');
        }

        // --- Authorization Check ---
        // Ensure the current user is part of this chat
        if ($chat->getCustomer() !== $currentUser && $chat->getOwner() !== $currentUser) {
            throw new AccessDeniedException('You are not authorized to view messages in this chat.');
        }

        // --- Get Messages ---
        $messages = $chat->getMessages(); // Assuming getMessages() returns the collection

        // --- Serialize and Respond ---
        $jsonMessages = $this->serializer->serialize(
            $messages,
            'json',
            ['groups' => ['message:read', 'user:read']] // Adjust groups as needed
        );

        return new JsonResponse($jsonMessages, JsonResponse::HTTP_OK, [], true);
    }

    // --- Method to add a new message to an existing chat ---
    #[Route('/{id}/messages', name: 'api_chat_add_message', methods: ['POST'])]
    public function addMessage(int $id, Request $request): JsonResponse
    {
        // --- Get Authenticated User (Sender) ---
        $sender = $this->security->getUser();
        if (!$sender instanceof User) {
            throw new AccessDeniedException('User must be authenticated to send messages.');
        }

        // --- Find Chat ---
        $chat = $this->entityManager->getRepository(Chat::class)->find($id);
        if (!$chat) {
            throw new NotFoundHttpException('Chat not found.');
        }

        // --- Authorization Check ---
        // Ensure the current user is part of this chat
        if ($chat->getCustomer() !== $sender && $chat->getOwner() !== $sender) {
            throw new AccessDeniedException('You are not authorized to send messages in this chat.');
        }

        // --- Decode JSON Body ---
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BadRequestHttpException('Invalid JSON body');
        }

        // --- Input Validation ---
        if (empty(trim($data['content']))) {
            throw new BadRequestHttpException('Missing required field: content.');
        }
        $messageContent = trim($data['content']);

        // --- Create and Persist Message ---
        $message = new Message();
        $message->setChat($chat);
        $message->setSender($sender);
        $message->setContent($messageContent);
        $chat->addMessage($message); // Update the chat's messages collection

        $this->entityManager->persist($message);
        $this->entityManager->flush();

        // --- Serialize and Respond with the new message ---
        $jsonMessage = $this->serializer->serialize(
            $message,
            'json',
            ['groups' => ['message:read', 'user:read']]
        );

        return new JsonResponse($jsonMessage, JsonResponse::HTTP_CREATED, [], true);
    }
}