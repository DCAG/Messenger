import ChatsList from '../components/ChatsList'
import { Outlet, useLocation } from 'react-router-dom'
import ProfileMenu from '../components/ProfileMenu'
import useSocket from '../utils/useSocket'
import Toast from '../components/Toast'
import { useEffect, useState } from 'react'
function Base() {
  const { toast } = useSocket()
  const [hideMain, setHideMain] = useState(true)
  const location = useLocation()

  useEffect(() => {
    //when using the back button on the device or browser go to main menu
    if (location.pathname === '/chats') {
      setHideMain(true)
    }
  }, [location.pathname])

  return (
    <div className={'app-base' + (hideMain ? '' : ' show-main')}>
      <div className='mobile-controls'>
        <button title="back" onClick={() => setHideMain(true)}>{"\u2190"}</button>
      </div>
      <div className={'side-panel'}>
        <ChatsList onNavigation={() => setHideMain(false)} />
        <ProfileMenu onNavigation={() => setHideMain(false)} />
      </div>
      <Outlet />
      <Toast
        payload={toast.payload}
        show={toast.show}
        type={toast.type}
        onNavigation={() => setHideMain(false)}
      />
    </div>
  )
}

export default Base