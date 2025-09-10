import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ message: 'Address parameter is required' });
    }

    // Usar a API de Geocoding do Google Maps
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address as string)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return res.status(400).json({ 
        message: 'Não foi possível encontrar o endereço',
        status: data.status 
      });
    }
    
    // Retornar o primeiro resultado
    const result = data.results[0];
    const location = result.geometry.location;
    
    res.status(200).json({
      formatted_address: result.formatted_address,
      location: {
        lat: location.lat,
        lng: location.lng
      },
      place_id: result.place_id
    });
  } catch (error) {
    console.error('Error in geocoding:', error);
    res.status(500).json({ message: (error as Error).message });
  }
}