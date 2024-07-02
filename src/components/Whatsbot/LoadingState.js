import React, { useEffect } from 'react'
import style from './Whatsbot.module.css'


const LoadingState = () => {
  useEffect(() => {
    try {
        var systemThemeDark,
          theme = window.localStorage.getItem('theme'),
          systemThemeMode = window.localStorage.getItem('system-theme-mode')
        if (('true' === systemThemeMode || !theme) && window.matchMedia) {
          var systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          systemThemeDark = systemTheme && systemTheme.matches
        }
        var darkTheme = '"dark"' === theme || Boolean(systemThemeDark)
        darkTheme && document.body.classList.add('dark')
      } catch (e) {}
  
    return () => {
      // "secondary" === document.getElementById("initial_startup").className && (document.getElementById("initial_startup").className = "initial_startup")
    }
  }, [])
  
  return (
    <div className={style["loading-state"]+" card"} style={{width:"377px", aspectRatio:"1/1"}}>
      <div id={style["container"]}></div>
      <div id="hard_expire_time" data-time="1716704879.84"></div>
      <div id={style["initial_startup"]}>
        <div class={style["graphic"]}>
          <span>
            <svg width="250" height="52" xmlns="http://www.w3.org/2000/svg">
              <path
                class={style["resume-logo"]}
                d="M37.7 31.2c-.6-.4-3.8-2-4.4-2.1-.6-.2-1-.4-1.4.3l-2 2.5c-.4.4-.8.5-1.5.2-.6-.3-2.7-1-5.1-3.2-2-1.7-3.2-3.8-3.6-4.5-.4-.6 0-1 .3-1.3l1-1.1.6-1.1c.2-.4 0-.8 0-1.1l-2-4.8c-.6-1.3-1.1-1-1.5-1.1h-1.2c-.5 0-1.2.1-1.8.8-.5.6-2.2 2.2-2.2 5.3 0 3.2 2.3 6.3 2.6 6.7.3.4 4.6 7 11 9.7l3.7 1.4c1.5.5 3 .4 4 .2 1.3-.1 3.9-1.5 4.4-3 .5-1.5.5-2.8.4-3-.2-.4-.6-.5-1.3-.8M26 47.2c-3.9 0-7.6-1-11-3l-.7-.4-8.1 2L8.4 38l-.6-.8A21.4 21.4 0 0126 4.4a21.3 21.3 0 0121.4 21.4c0 11.8-9.6 21.4-21.4 21.4M44.2 7.6a25.8 25.8 0 00-40.6 31L0 52l13.7-3.6A25.8 25.8 0 0044.3 7.5"
                fill="currentColor"
              ></path>
            </svg>
          </span>
        </div>
        <div class={style["progress"]}>
          <progress value="0" max="100" dir="ltr"></progress>
        </div>
        <div class={style["main"]}>WhatsApp</div>
        <div class={style["secondary"]}>
          <span>
            <svg width="10" height="12" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 1.6c1.4 0 2.5 1 2.6 2.4v1.5h.2c.5 0 1 .4 1 1V10c0 .6-.5 1-1 1H2.3a1 1 0 01-1.1-1V6.5c0-.6.5-1 1-1h.2V4.2c0-1.4 1-2.5 2.4-2.6H5zm0 1.2c-.7 0-1.3.6-1.3 1.3v1.4h2.6V4.2c0-.7-.4-1.2-1-1.3H5z"
                fill="currentColor"
              >

              </path>
            </svg> 
          </span>
            &nbsp;End-to-end encrypted
        </div>
      </div>
    </div>
  )
}

export default LoadingState