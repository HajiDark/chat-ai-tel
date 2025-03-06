import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, width, height } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const imageWidth = Math.max(256, Math.min(Number(width) || 1024, 1440));
    const imageHeight = Math.max(256, Math.min(Number(height) || 768, 1440));

    const roundedWidth = Math.round(imageWidth / 16) * 16;
    const roundedHeight = Math.round(imageHeight / 16) * 16;

    // Get API key from environment variable
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell-Free',
        prompt,
        width: roundedWidth,
        height: roundedHeight,
        steps: 1,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.data?.[0]?.b64_json) {
      console.error('Invalid API response format:', data);
      return NextResponse.json(
        { error: 'Invalid API response format' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageData: data.data[0].b64_json,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}