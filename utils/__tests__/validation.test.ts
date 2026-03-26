import { validateTimerDuration, formatTime } from '../validation'

// Simple test functions (would normally use Jest or similar)

function testValidation() {
  console.log('Testing validation...')

  // Test valid inputs
  const validTests = [
    { input: '25', expected: true },
    { input: '30', expected: true },
    { input: '10', expected: true },
    { input: '1', expected: true },
    { input: '99', expected: true },
  ]

  validTests.forEach(({ input, expected }) => {
    const result = validateTimerDuration(input, 'Work duration')
    console.log(`Input: ${input}, Valid: ${result.isValid === expected ? 'PASS' : 'FAIL'}`)
  })

  // Test invalid inputs
  const invalidTests = [
    { input: '', expected: false },
    { input: '0', expected: false },
    { input: '100', expected: false },
    { input: 'abc', expected: false },
    { input: '25.5', expected: false },
  ]

  invalidTests.forEach(({ input, expected }) => {
    const result = validateTimerDuration(input, 'Work duration')
    console.log(`Input: "${input}", Invalid: ${result.isValid === expected ? 'PASS' : 'FAIL'}`)
  })
}

function testTimeFormatting() {
  console.log('\nTesting time formatting...')

  const tests = [
    { input: 1500, expected: '25:00' }, // 25 minutes
    { input: 300, expected: '05:00' },  // 5 minutes
    { input: 65, expected: '01:05' },   // 1 minute 5 seconds
    { input: 0, expected: '00:00' },    // 0 seconds
  ]

  tests.forEach(({ input, expected }) => {
    const result = formatTime(input)
    console.log(`${input}s -> ${result} (${result === expected ? 'PASS' : 'FAIL'})`)
  })
}

if (typeof window === 'undefined') {
  testValidation()
  testTimeFormatting()
}