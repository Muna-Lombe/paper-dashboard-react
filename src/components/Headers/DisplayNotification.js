/*!

=========================================================
* Paper Dashboard React - v1.3.2
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
/*eslint-disable*/
import React, { useEffect } from 'react'
// react plugin for creating notifications over the dashboard
import NotificationAlert from 'react-notification-alert'
import { useSelector, useDispatch } from 'react-redux'

// reactstrap components
import {
  UncontrolledAlert,
  Alert,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col
} from 'reactstrap'
import { removeError } from '../../variables/slices/errorSlice'
 import { removeToast } from '../../variables/slices/toastSlice'

function DisplayNotification({binderFn=()=>"",children}) {
  const notificationAlert = React.useRef()
  const {toasts} = useSelector(state => (state.toasts))
  const {errors} = useSelector(state => (state.errors))
  const dispatch = useDispatch()

  const handleRemoveError = error => {
    dispatch(removeError(error))
  }

  const handleRemoveToast = toast => {
    dispatch(removeToast(toast))
  }

  const notifyType={
    main: 'primary',
    error: 'danger',
    warning: 'warning',
    info: 'info',
    success: 'success',

  }
  const notify = (place="tr", elem=()=>(<div>
  Welcome to <b>Paper Dashboard React</b> - a beautiful freebie for every web
  developer.
</div>
), color )=> {
    if(!color){

      color = Math.floor(Math.random() * 5 + 1)
      var type
      switch (color) {
        case 1:
          type = 'primary'
          break
        case 2:
          type = 'success'
          break
        case 3:
          type = 'danger'
          break
        case 4:
          type = 'warning'
          break
        case 5:
          type = 'info'
          break
        default:
          break
      }
    }

    var options = {}
    options = {
      place:place||"tr",
      message: (
        <div>
          {elem()}
        </div>
      ),
      type: type||color,
      icon: 'nc-icon nc-bell-55',
      autoDismiss: 7
    }
    notificationAlert.current.notificationAlert(options)
  }
  const errorfy=()=>{
    console.log("errors", errors)
    
    notify("tr", ()=>(<span> { errors.at(-1)}</span>), notifyType.error)
    
    return () => {
      if(errors.length){
        setTimeout(() => {
          handleRemoveError(errors?.at(-1))
        }, 300);

      }
    }
  };

  const toastify = () => {
    console.log('toasts', toasts)
    
    notify('tr', () => <span> {toasts.at(-1)}</span>, notifyType.info)
    
    return () => {
      if (toasts.length) {
        setTimeout(() => {
          handleRemoveToast(toasts?.at(-1))
        }, 300)
      }
    }
  }

  useEffect(() => {
    // first
    if (errors.length) {
      return errorfy();
    }
    
    if (toasts?.length) {
      return toastify()
    }


  }, [errors, toasts])

  return (
    <>
      <div className='content notification-wrapper'>
        <NotificationAlert ref={notificationAlert} />
        {children}

      </div>
    </>
  )
}

export default DisplayNotification;
