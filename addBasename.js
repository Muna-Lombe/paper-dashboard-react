// script.js
const fs = require('fs')
const path = require('path')


const srcFolder = path.join(__dirname, 'src')
const indexPath = path.join(srcFolder, 'index.js')

const basename = '/'

const addBaseName = () => {
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
      
    if(data.match(/<BrowserRouter\s+basename="[^"]*">/g)?.[0].length) return console.log("basename already added");


    const browserRouterRegex = /<BrowserRouter\s?>/g
    const replacement = `<BrowserRouter basename="${basename}">`

    const updatedData = data.replace(browserRouterRegex, replacement)
   
    // console.log('browserRouterTag replaced?: ', updatedData.includes(replacement))

    fs.writeFile(indexPath, updatedData, 'utf8', err => {
      if (err) {
        console.error(err)
        return
      }

      console.log(`Added basename to BrowserRouter in ${indexPath}`)
    })
  })
}




addBaseName()

module.exports = {addBaseName}
