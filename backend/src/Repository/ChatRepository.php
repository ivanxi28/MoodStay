<?php

namespace App\Repository;

use App\Entity\Chat;
use App\Entity\User;
use App\Entity\Restaurant;
use App\Entity\Experience;
use App\Entity\Accommodation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Chat>
 *
 * @method Chat|null find($id, $lockMode = null, $lockVersion = null)
 * @method Chat|null findOneBy(array $criteria, array $orderBy = null)
 * @method Chat[]    findAll()
 * @method Chat[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ChatRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Chat::class);
    }

    /**
     * Finds an existing chat between a customer and an owner, optionally linked to a specific entity.
     *
     * @param User $customer
     * @param User $owner
     * @param Restaurant|null $restaurant
     * @param Experience|null $experience
     * @param Accommodation|null $accommodation
     * @return Chat|null
     */
    public function findExistingChat(
        User $customer,
        User $owner,
        ?Restaurant $restaurant = null,
        ?Experience $experience = null,
        ?Accommodation $accommodation = null
    ): ?Chat {
        $qb = $this->createQueryBuilder('c')
            ->where('c.customer = :customer')
            ->andWhere('c.owner = :owner')
            ->setParameter('customer', $customer)
            ->setParameter('owner', $owner);

        // Add conditions for linked entities only if they are provided
        if ($restaurant) {
            $qb->andWhere('c.restaurant = :restaurant')
               ->setParameter('restaurant', $restaurant);
        } else {
            $qb->andWhere('c.restaurant IS NULL');
        }

        if ($experience) {
            $qb->andWhere('c.experience = :experience')
               ->setParameter('experience', $experience);
        } else {
            $qb->andWhere('c.experience IS NULL');
        }

        if ($accommodation) {
            $qb->andWhere('c.accommodation = :accommodation')
               ->setParameter('accommodation', $accommodation);
        } else {
            $qb->andWhere('c.accommodation IS NULL');
        }

        return $qb->getQuery()->getOneOrNullResult();
    }

    //    /**
    //     * @return Chat[] Returns an array of Chat objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        // ... example code ...
    //    }

    //    public function findOneBySomeField($value): ?Chat
    //    {
    //        // ... example code ...
    //    }
}