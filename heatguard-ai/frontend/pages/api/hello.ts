// ============================================================================
// API Route Example for Next.js
// This file demonstrates how to create API routes in Next.js
// ============================================================================

import type { NextApiRequest, NextApiResponse } from 'next';

// Define the response type
type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'HeatGuard AI API' });
}
