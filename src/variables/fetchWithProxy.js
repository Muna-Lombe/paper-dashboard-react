import axios from "axios";




export default function fetchWithProxy(url, params){
  // 'https://corsproxy.io/?' + encodeURIComponent(url);//
  const proxyUrl = `https://proxy.cors.sh/${url}`;
  const cloudflareProxyUrl = `https://cold-pine-f170.lombemuna.workers.dev?url=${url}`
  try {
    
    const fetchResult =  fetch(cloudflareProxyUrl, 
      { 
        ...params,
        headers: 
        { 
          ...params.headers,
          // 'x-cors-api-key': 'temp_f7a52f64d6cea7f1b19826882415d502'//'live_da7f46c885a84f04acb9c87ccbf6571bd04dfb10c8f29100aad80021f620038e'
        }
      }
    );
     
    return fetchResult;
  } catch (error) {
    console.log("Error proxy fetching", error.message);
    
  }
};