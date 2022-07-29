import type { Getters, State } from './types'
import { computed } from '#imports'

export function useGlobalGetters(state: State): Getters {
  /** Verify that a user is signed in by checking if token exists and is not expired */
  const signedIn: Getters['signedIn'] = computed(
    () =>
      !!(
        !!state.token &&
        state.token.value !== '' &&
        state.jwtPayload.value &&
        state.jwtPayload.value.exp &&
        state.jwtPayload.value.exp > state.timestamp.value / 1000
      ),
  )

  /** global loading state */
  let loading = $ref(false)
  const isLoading = computed({
    get: () => state.runningRequests.value.length > 0 || loading,
    set: (_loading) => (loading = !_loading),
  })

  return { signedIn, isLoading }
}
