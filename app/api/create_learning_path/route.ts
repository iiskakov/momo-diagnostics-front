import { NextResponse } from 'next/server';

// Private API URL for server-to-server communication
// This is not exposed to the client and can use Railway's private networking
const PRIVATE_API_URL = process.env.PRIVATE_API_URL || 'http://web.railway.internal';

// Increase the timeout for the create_learning_path route
export const maxDuration = 120; // Set to 120 seconds (2 minutes)

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the private API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 115000); // Slightly less than maxDuration
    
    const response = await fetch(`${PRIVATE_API_URL}/create_learning_path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in create_learning_path API route:', error);
    
    // Type guard for AbortError
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. The backend is taking too long to respond.' },
        { status: 504 }
      );
    }
    
    // Handle general errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to create learning path: ${errorMessage}` },
      { status: 500 }
    );
  }
} 