import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken, queryParams } = req.body

  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' })
  }

  if (!queryParams || typeof queryParams !== 'string') {
    return res.status(400).json({ error: 'Query parameters are required' })
  }

  try {
    // First, get user's country for market parameter
    let market = 'US' // default
    try {
      const meResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (meResponse.ok) {
        const meData = await meResponse.json()
        market = meData.country || 'US'
      }
    } catch (e) {
      console.log('Could not fetch user country, using US as default')
    }
    
    // Build URL - try without market first (as per curl example)
    // Market parameter is optional according to docs
    const params = new URLSearchParams(queryParams)
    // Don't add market by default - let Spotify use user's market from token
    
    const apiUrl = `https://api.spotify.com/v1/recommendations?${params.toString()}`

    console.log('Proxying Recommendations API request:', {
      url: apiUrl,
      hasToken: !!accessToken,
      tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none',
      market: market,
      queryParams: params.toString(),
    })
    
    // Make the request to Spotify Recommendations API
    // According to docs: https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    // The endpoint requires at least one seed (genre, artist, or track)
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    console.log('Spotify API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      let errorText = ''
      let errorData: any = {}
      
      try {
        errorText = await response.text()
        console.log('Raw error response text:', errorText)
        if (errorText) {
          try {
            errorData = JSON.parse(errorText)
          } catch (parseError) {
            console.error('Failed to parse error as JSON:', parseError)
            errorData = { raw: errorText }
          }
        }
      } catch (e) {
        console.error('Failed to get error response text:', e)
        errorData = { error: 'Could not read error response' }
      }
      
      const errorMessage = errorData.error?.message || errorData.message || response.statusText
      
      console.error('=== Spotify API Error Details ===')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Error Text:', errorText)
      console.error('Error Data:', JSON.stringify(errorData, null, 2))
      console.error('URL:', apiUrl)
      console.error('Response Headers:', Object.fromEntries(response.headers.entries()))
      console.error('================================')
      
      // If 404, test different variations of the recommendations endpoint
      if (response.status === 404) {
        console.log('Testing different endpoint variations...')
        
        // Test 1: Get user's country for market parameter
        try {
          const meResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const meData = await meResponse.json().catch(() => ({}))
          const market = meData.country || 'US'
          console.log('User country/market:', market)
          
          // Test 2: Try with market parameter
          const withMarketUrl = `${apiUrl.split('?')[0]}?${queryParams}&market=${market}`
          console.log('Testing with market parameter:', withMarketUrl)
          const marketResponse = await fetch(withMarketUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          console.log('Market test result:', {
            status: marketResponse.status,
            ok: marketResponse.ok,
            text: (await marketResponse.text()).substring(0, 200),
          })
          
          // Test 3: Try absolute minimal request matching curl example format
          const absoluteMinimal = `https://api.spotify.com/v1/recommendations?seed_genres=pop&limit=10`
          console.log('Testing absolute minimal (no market):', absoluteMinimal)
          const absResponse = await fetch(absoluteMinimal, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const absText = await absResponse.text()
          console.log('Absolute minimal result:', {
            status: absResponse.status,
            ok: absResponse.ok,
            text: absText.substring(0, 500),
          })
          
          // Test 4: Try with exact format from curl example (classical,country genres)
          const exampleFormat = `https://api.spotify.com/v1/recommendations?seed_genres=classical%2Ccountry&limit=10`
          console.log('Testing with example format:', exampleFormat)
          const exampleResponse = await fetch(exampleFormat, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const exampleText = await exampleResponse.text()
          console.log('Example format result:', {
            status: exampleResponse.status,
            ok: exampleResponse.ok,
            text: exampleText.substring(0, 500),
          })
        } catch (e) {
          console.error('Endpoint testing failed:', e)
        }
      }
      
      return res.status(response.status).json({
        error: errorMessage || 'Unknown error',
        details: errorData,
        status: response.status,
        url: apiUrl,
      })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error in recommendations API route:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

