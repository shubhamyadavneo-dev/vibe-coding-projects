const profileService = require('../../service/profile')
const profileRepository = require('../../repository/profile')

jest.mock('../../repository/profile')

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── GET PROFILE ──────────────────────────────────────────
describe('profileService.getProfile', () => {

  test('should return profile if exists', async () => {
    profileRepository.findByUserId.mockResolvedValue({
      id: 1,
      user_id: 1,
      height_cm: 175,
      weight_kg: 70
    })

    const profile = await profileService.getProfile(1)
    expect(profile).toHaveProperty('user_id', 1)
  })

  test('should throw if profile not found', async () => {
    profileRepository.findByUserId.mockResolvedValue(null)

    await expect(profileService.getProfile(1))
      .rejects
      .toThrow('Profile not found')
  })

})

// ─── CREATE PROFILE ───────────────────────────────────────
describe('profileService.createProfile', () => {

  test('should create profile successfully', async () => {
    profileRepository.findByUserId.mockResolvedValue(null)
    profileRepository.createProfile.mockResolvedValue({
      id: 1,
      user_id: 1,
      height_cm: 175,
      weight_kg: 70
    })

    const profile = await profileService.createProfile(1, {
      height_cm: 175,
      weight_kg: 70
    })

    expect(profileRepository.createProfile).toHaveBeenCalledTimes(1)
    expect(profile).toHaveProperty('user_id', 1)
  })

  test('should throw if profile already exists', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 1, user_id: 1 })

    await expect(profileService.createProfile(1, { height_cm: 175 }))
      .rejects
      .toThrow('Profile already exists')
  })

})

// ─── UPDATE PROFILE ───────────────────────────────────────
describe('profileService.updateProfile', () => {

  test('should update profile successfully', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 1, user_id: 1 })
    profileRepository.updateProfile.mockResolvedValue({
      id: 1,
      user_id: 1,
      height_cm: 180,
      weight_kg: 75
    })

    const profile = await profileService.updateProfile(1, {
      height_cm: 180,
      weight_kg: 75
    })

    expect(profileRepository.updateProfile).toHaveBeenCalledWith(1, {
      height_cm: 180,
      weight_kg: 75
    })
    expect(profile.height_cm).toBe(180)
  })

  test('should throw if profile not found', async () => {
    profileRepository.findByUserId.mockResolvedValue(null)

    await expect(profileService.updateProfile(1, { height_cm: 180 }))
      .rejects
      .toThrow('Profile not found')
  })

})
