



export default function fetchWithProxy(url, params){
  return fetch(`https://proxy.cors.sh/${url}`, 
  { 
    ...params,
    headers: 
    { 
      ...params.headers,
      'x-cors-api-key': 'live_da7f46c885a84f04acb9c87ccbf6571bd04dfb10c8f29100aad80021f620038e'
    }
  });
};