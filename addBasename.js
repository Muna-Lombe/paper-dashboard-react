// script.js
const fs = require('fs')
const path = require('path')


const srcFolder = path.join(__dirname, 'src')
const indexPath = path.join(srcFolder, 'index.js')

// const basename = 'paper-dashboard-react/'

const addBaseName = () => {
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
      
    if(data.match(/<BrowserRouter\s+basename="[^"]*">/g)?.[0].length) {
      return console.log("basename already added");
    }


    const browserRouterRegex = /<BrowserRouter\s?>/g;
    const storeDispatchRegex = /^\/\/store\.dispatch\(addBasename\(basename\)\);$/gm;

    const replacement1 = "<BrowserRouter basename={basename}>"
    const replacement2 = "store.dispatch(addBasename(basename));"

    const updatedData = data.replace(storeDispatchRegex, replacement2).replace(browserRouterRegex, replacement1)
   
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
