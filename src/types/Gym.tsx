export interface Gym {
  _type: 'gym'
  name: string
  owner: string
  BOULDER_HEIGHT: string
  LEAD_HEIGHT: string
  TOP_ROPE_HEIGHT: string
  location?: string
}

export type FirebaseGym = Partial<Gym>

export const defaultGym = (part: FirebaseGym): Gym => ({
  _type: 'gym',
  name: '',
  owner: '',
  BOULDER_HEIGHT: '',
  LEAD_HEIGHT: '',
  TOP_ROPE_HEIGHT: '',
  ...part,
})
