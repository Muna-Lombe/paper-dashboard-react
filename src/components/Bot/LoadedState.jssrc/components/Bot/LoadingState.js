import React, { useEffect } from 'react'
 
 
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
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg w-[377px] aspect-square flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="text-center text-lg font-semibold mt-4">Loading...</p>
    </div>
   )
}
 
export default LoadingState
