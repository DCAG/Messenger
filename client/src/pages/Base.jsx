import ChatsList from '../components/ChatsList'
import { Outlet } from 'react-router-dom'
import ProfileMenu from '../components/ProfileMenu'
import useSocket from '../utils/useSocket'
import Toast from '../components/Toast'
import { useState } from 'react'
function Base() {
  const { toast } = useSocket()
  const [hideMain, setHideMain] = useState(true)

  return (
    <div className={'app-base' + (hideMain ? '' : ' show-main')}>
      <div className='mobile-controls'>
        <button title="back" onClick={() => setHideMain(true)}>{"\u2B9C"}</button>
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
      />
    </div>
  )
}

export default Base