#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'
import { initializeTotalCounter } from '../src/lib/counter'

async function main() {
  console.log('Initializing total counter...')

  try {
    await initializeTotalCounter()
    console.log('✅ Total counter initialized successfully!')
  } catch (error) {
    console.error('❌ Failed to initialize total counter:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
