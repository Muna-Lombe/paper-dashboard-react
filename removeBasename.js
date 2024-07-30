// script.js
const fs = require('fs')
const path = require('path')

const srcFolder = path.join(__dirname, 'src')
const indexPath = path.join(srcFolder, 'index.js')


const removeBaseName = () => {
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    
    if(data.match(/<BrowserRouter\s?>/g)?.[0].length) return console.log("basename already removed");


    const browserRouterRegex = /<BrowserRouter\s+basename="[^"]*">/g
    const replacement = '<BrowserRouter>'

    const updatedData = data.replace(browserRouterRegex, replacement)

    fs.writeFile(indexPath, updatedData, 'utf8', err => {
      if (err) {
        console.error(err)
        return
      }

      console.log(`Removed basename from BrowserRouter in ${indexPath}`)
    })
  })
}


removeBaseName()

module.exports = { removeBaseName}
