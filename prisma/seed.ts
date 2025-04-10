import { prisma } from "../src/config/db"
async function main() {
  // Create sample restaurants
  const restaurants = [
    {
      name: "The Italian Kitchen",
      location: "New York, NY",
      cuisine: "Italian",
      capacity: 50
    },
    {
      name: "Sushi Palace",
      location: "Los Angeles, CA",
      cuisine: "Japanese",
      capacity: 40
    },
    {
      name: "La Petite Bistro",
      location: "Paris, France",
      cuisine: "French",
      capacity: 30
    },
    {
      name: "Spice Garden",
      location: "Mumbai, India",
      cuisine: "Indian",
      capacity: 60
    },
    {
      name: "The Steakhouse",
      location: "Chicago, IL",
      cuisine: "American",
      capacity: 70
    }
  ]

  // Create each restaurant
  for (const restaurant of restaurants) {
    await prisma.restaurant.create({
      data: restaurant
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })