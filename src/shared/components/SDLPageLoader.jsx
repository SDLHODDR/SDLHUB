import '../assets/css/sdlPageLoader.css'

/*
 * The one loader for pages, tables and task modals: the orange whirly loader of the route
 * transition, centred on the page.
 */
const SDLPageLoader = ({ label = 'Loading' }) => (
  <div className='sdl-page-loader' role='status' aria-live='polite'>
    <div className='sdl-page-loader-size'>
      <div className='whirly-loader'>{label}</div>
    </div>
  </div>
)

export default SDLPageLoader
