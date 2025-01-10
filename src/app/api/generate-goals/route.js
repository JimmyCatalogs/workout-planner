import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { fitnessGoal, currentGoals } = await request.json();

    // Construct the prompt for Claude
    const prompt = `Given this fitness goal: "${fitnessGoal}"

Please provide workout goals in this JSON structure:
{
  "setsPerDay": number,  // Daily sets target (10=light, 15=moderate, 20=intense)
  "Chest": number,       // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Back": number,        // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Shoulders": number,   // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Biceps": number,      // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Triceps": number,     // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Quadriceps": number,  // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Hamstrings": number,  // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Glutes": number,      // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Calves": number,      // Weekly activation score (20=light, 40=moderate, 60=intense)
  "Abs": number         // Weekly activation score (20=light, 40=moderate, 60=intense)
}

For reference:
- setsPerDay: 10 is light, 15 is moderate, 20 is intense
- Muscle activation scores: 20 is light, 40 is moderate, 60 is intense
Choose values based on these reference points - do not exceed 60 or go below 20.

Return only valid JSON matching the structure above, with no additional explanation.`;

    // Make the API call to Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse the response as JSON
    const updatedGoals = JSON.parse(message.content[0].text);
    
    return new Response(JSON.stringify(updatedGoals), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
