import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const UNIT_CONVERSIONS = [
  // Weight
  { fromUnit: 'kg', toUnit: 'g', factor: 1000 },
  { fromUnit: 'g', toUnit: 'kg', factor: 0.001 },
  { fromUnit: 'kg', toUnit: 'mg', factor: 1_000_000 },
  { fromUnit: 'mg', toUnit: 'kg', factor: 0.000001 },
  { fromUnit: 'g', toUnit: 'mg', factor: 1000 },
  { fromUnit: 'mg', toUnit: 'g', factor: 0.001 },

  // Volume
  { fromUnit: 'liter', toUnit: 'ml', factor: 1000 },
  { fromUnit: 'ml', toUnit: 'liter', factor: 0.001 },
  { fromUnit: 'liter', toUnit: 'cl', factor: 100 },
  { fromUnit: 'cl', toUnit: 'liter', factor: 0.01 },
  { fromUnit: 'cl', toUnit: 'ml', factor: 10 },
  { fromUnit: 'ml', toUnit: 'cl', factor: 0.1 },

  // Culinary volume
  { fromUnit: 'cup', toUnit: 'ml', factor: 240 },
  { fromUnit: 'ml', toUnit: 'cup', factor: 1 / 240 },
  { fromUnit: 'tbsp', toUnit: 'ml', factor: 15 },
  { fromUnit: 'ml', toUnit: 'tbsp', factor: 1 / 15 },
  { fromUnit: 'tsp', toUnit: 'ml', factor: 5 },
  { fromUnit: 'ml', toUnit: 'tsp', factor: 0.2 },
  { fromUnit: 'tbsp', toUnit: 'tsp', factor: 3 },
  { fromUnit: 'tsp', toUnit: 'tbsp', factor: 1 / 3 },
  { fromUnit: 'cup', toUnit: 'tbsp', factor: 16 },
  { fromUnit: 'tbsp', toUnit: 'cup', factor: 1 / 16 },
]

async function main() {
  console.log('🌱 Seeding unit conversions...')

  for (const conv of UNIT_CONVERSIONS) {
    await prisma.unitConversion.upsert({
      where: { fromUnit_toUnit: { fromUnit: conv.fromUnit, toUnit: conv.toUnit } },
      update: { factor: conv.factor },
      create: conv,
    })
  }

  console.log(`✅ Seeded ${UNIT_CONVERSIONS.length} unit conversions.`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
