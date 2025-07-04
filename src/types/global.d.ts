export {}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            container: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'small' | 'medium' | 'large'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}
