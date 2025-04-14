import { NextResponse } from 'next/server';

// Private API URL for server-to-server communication
// This is not exposed to the client and can use Railway's private networking
const PRIVATE_API_URL = process.env.PRIVATE_API_URL || 'http://web.railway.internal';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the private API
    const response = await fetch(`${PRIVATE_API_URL}/create_learning_path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in create_learning_path API route:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path' },
      { status: 500 }
    );
  }
} 