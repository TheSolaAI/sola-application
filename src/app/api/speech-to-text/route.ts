import { NextRequest, NextResponse } from 'next/server';
import { extractUserPrivyId } from '@/lib/server/userSession';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authToken = req.headers.get('Authorization')?.split(' ')[1];
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token not provided' },
        { status: 401 }
      );
    }

    // Validate user
    let privyId;
    try {
      privyId = await extractUserPrivyId(authToken);
    } catch (error) {
      console.error('Error validating token:', error);
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    // Process the form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert the File to a Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Send to OpenAI's speech-to-text API
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], audioFile.name, { type: audioFile.type }),
      model: 'whisper-1',
      response_format: 'text',
    });

    // Return the transcribed text
    return NextResponse.json({
      success: true,
      text: transcription,
    });
  } catch (error) {
    console.error('Error in speech-to-text API:', error);
    return NextResponse.json(
      { error: 'Failed to process audio', details: String(error) },
      { status: 500 }
    );
  }
}
